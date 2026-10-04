import { z } from "zod";

import {
  buildSystemPrompt,
  getAssistantCategories,
  getAssistantEventTypes,
} from "@/lib/assistant/knowledge";
import {
  SITE_PAGES,
  type AssistantAction,
  type AssistantReply,
  type QuoteDraft,
  type QuoteField,
} from "@/lib/assistant/shared";

/**
 * POST /api/assistant — the AI avatar's brain.
 * Sends the conversation to Google Gemini (free tier friendly) and returns a spoken reply
 * plus safe, validated website actions. The API key never leaves the server.
 */

export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";
const MAX_TURNS = 12;
const NONE = "none";
const RETRYABLE = new Set([404, 429, 500, 502, 503, 504]);

/** Flat output fields from the model → quote form fields. */
const QUOTE_OUTPUT_FIELDS = {
  quote_name: "name",
  quote_email: "email",
  quote_phone: "phone",
  quote_event_type: "eventType",
  quote_event_date: "eventDate",
  quote_servings: "servings",
  quote_location: "location",
  quote_theme: "theme",
} as const satisfies Record<string, QuoteField>;

type QuoteOutputKey = keyof typeof QUOTE_OUTPUT_FIELDS;
const QUOTE_OUTPUT_KEYS = Object.keys(QUOTE_OUTPUT_FIELDS) as QuoteOutputKey[];

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(60),
  page: z.string().max(200).optional(),
  lang: z.enum(["en", "ar"]).optional(),
});

const optionalText = z.string().nullish();
const modelOutputSchema = z.object({
  reply: z.string().min(1),
  navigate_to: optionalText,
  gallery_category: optionalText,
  update_quote: z.boolean().nullish(),
  quote_name: optionalText,
  quote_email: optionalText,
  quote_phone: optionalText,
  quote_event_type: optionalText,
  quote_event_date: optionalText,
  quote_servings: optionalText,
  quote_location: optionalText,
  quote_theme: optionalText,
  suggestions: z.array(z.string()).nullish(),
});
type ModelOutput = z.infer<typeof modelOutputSchema>;

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

type GeminiResult = { ok: true; text: string } | { ok: false; status: number; message: string };

// --- Simple in-memory rate limit (per IP) to protect the free-tier quota -------------------
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const limit = Number(process.env["ASSISTANT_RATE_LIMIT_PER_MINUTE"]) || 15;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < 60_000);
  const limited = recent.length >= limit;
  if (!limited) recent.push(now);
  if (hits.size > 5000) hits.clear();
  hits.set(key, recent);
  return limited;
}

// --- Gemini -------------------------------------------------------------------------------
/** A flat schema: nested objects made small models loop, so every field is top-level. */
function responseSchema(categorySlugs: string[], eventTypes: string[]) {
  const text = { type: "STRING" };
  const properties: Record<string, unknown> = {
    reply: { type: "STRING", description: "Spoken reply, 1-3 short sentences" },
    navigate_to: { type: "STRING", enum: [NONE, ...SITE_PAGES.map((page) => page.path)] },
    gallery_category: { type: "STRING", enum: [NONE, ...categorySlugs] },
    update_quote: { type: "BOOLEAN" },
    quote_name: text,
    quote_email: text,
    quote_phone: text,
    quote_event_type: { type: "STRING", enum: [NONE, ...eventTypes] },
    quote_event_date: { type: "STRING", description: "YYYY-MM-DD or empty" },
    quote_servings: { type: "STRING", description: "Digits only or empty" },
    quote_location: text,
    quote_theme: { type: "STRING", description: "Design idea only, max 2 sentences, or empty" },
    suggestions: { type: "ARRAY", items: text },
  };
  const order = Object.keys(properties);
  return { type: "OBJECT", properties, required: order, propertyOrdering: order };
}

async function callGemini(model: string, apiKey: string, payload: unknown): Promise<GeminiResult> {
  const base = (
    process.env["GEMINI_API_BASE_URL"] || "https://generativelanguage.googleapis.com"
  ).replace(/\/+$/, "");
  try {
    const response = await fetch(`${base}/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as GeminiResponse;
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: data.error?.message ?? response.statusText,
      };
    }
    const candidate = data.candidates?.[0];
    const text =
      candidate?.content?.parts
        ?.filter((part) => !part.thought)
        .map((part) => part.text ?? "")
        .join("") ?? "";
    if (!text.trim()) {
      const reason = candidate?.finishReason ?? data.promptFeedback?.blockReason ?? "unknown";
      return { ok: false, status: 502, message: `Empty response (${reason})` };
    }
    return { ok: true, text };
  } catch (error) {
    return { ok: false, status: 504, message: error instanceof Error ? error.message : "timeout" };
  }
}

// --- Validation of what the model asked us to do ---------------------------------------
const PLACEHOLDER = /^(none|n\/?a|null|unknown|not (provided|given|specified)|-)$/i;

function cleanQuote(output: ModelOutput, eventTypes: string[]): QuoteDraft {
  const draft: QuoteDraft = {};
  for (const key of QUOTE_OUTPUT_KEYS) {
    const field = QUOTE_OUTPUT_FIELDS[key];
    const text = (output[key] ?? "").trim().slice(0, field === "theme" ? 600 : 200);
    if (!text || PLACEHOLDER.test(text)) continue;
    if (field === "eventType" && !eventTypes.includes(text)) continue;
    if (field === "eventDate" && !/^\d{4}-\d{2}-\d{2}$/.test(text)) continue;
    if (field === "servings" && !/^\d{1,4}$/.test(text)) continue;
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) continue;
    draft[field] = text;
  }
  return draft;
}

/** Returns null when the model output is unusable (truncated, wrong shape). */
function normalize(
  raw: string,
  categories: Map<string, string>,
  eventTypes: string[],
): AssistantReply | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = modelOutputSchema.safeParse(parsed);
  if (!result.success) return null;
  const output = result.data;

  const actions: AssistantAction[] = [];
  const quote = output.update_quote ? cleanQuote(output, eventTypes) : {};
  const categoryTitle = output.gallery_category
    ? categories.get(output.gallery_category)
    : undefined;
  const page = SITE_PAGES.find((item) => item.path === output.navigate_to);

  if (Object.keys(quote).length > 0) {
    actions.push({ type: "prefill_quote", quote });
  } else if (categoryTitle && output.gallery_category) {
    actions.push({
      type: "show_gallery_category",
      category: output.gallery_category,
      title: categoryTitle,
    });
  } else if (page) {
    actions.push({ type: "navigate", path: page.path });
  }

  return {
    reply: output.reply.trim().slice(0, 600),
    actions,
    suggestions: (output.suggestions ?? [])
      .map((item) => item.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 3),
  };
}

function errorResponse(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env["GEMINI_API_KEY"]?.trim();
  if (!apiKey) {
    return errorResponse(
      503,
      "The assistant isn't set up yet. Add GEMINI_API_KEY to .env.local and restart the dev server.",
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) {
    return errorResponse(
      429,
      "You're sending messages quickly. Please wait a moment and try again.",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Invalid request.");
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse(400, "Invalid request.");

  const turns = parsed.data.messages.slice(-MAX_TURNS);
  while (turns[0]?.role === "assistant") turns.shift();
  if (turns.at(-1)?.role !== "user") return errorResponse(400, "Invalid request.");

  const categories = getAssistantCategories();
  const eventTypes = getAssistantEventTypes();
  const categoryTitles = new Map(categories.map((item) => [item.slug, item.title]));
  const generationConfig = {
    temperature: 0.5,
    maxOutputTokens: 800,
    responseMimeType: "application/json",
    responseSchema: responseSchema(
      categories.map((category) => category.slug),
      eventTypes,
    ),
  };
  const payload = {
    systemInstruction: {
      parts: [
        {
          text: buildSystemPrompt({
            page: parsed.data.page ?? "/",
            lang: parsed.data.lang ?? "en",
          }),
        },
      ],
    },
    contents: turns.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.text }],
    })),
  };

  const models = [
    ...new Set([
      process.env["GEMINI_MODEL"] || DEFAULT_MODEL,
      process.env["GEMINI_FALLBACK_MODEL"] || FALLBACK_MODEL,
    ]),
  ];

  let lastStatus = 502;
  for (const model of models) {
    // Gemini 2.5 models "think" by default; turning it off keeps replies fast and cheap.
    const config = model.startsWith("gemini-2.5")
      ? { ...generationConfig, thinkingConfig: { thinkingBudget: 0 } }
      : generationConfig;
    const result = await callGemini(model, apiKey, { ...payload, generationConfig: config });
    if (result.ok) {
      const reply = normalize(result.text, categoryTitles, eventTypes);
      if (reply) return Response.json(reply);
      console.warn(`[assistant] ${model} returned unusable output: ${result.text.slice(0, 200)}`);
      lastStatus = 502;
      continue;
    }
    lastStatus = result.status;
    console.warn(`[assistant] ${model} failed (${result.status}): ${result.message}`);
    if (!RETRYABLE.has(result.status)) break;
  }

  if (lastStatus === 429) {
    return errorResponse(
      429,
      "I'm a little busy right now (free-tier limit). Please try again in a minute.",
    );
  }
  if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) {
    return errorResponse(502, "Gemini rejected the request. Check that GEMINI_API_KEY is valid.");
  }
  return errorResponse(502, "Sorry, I got a little muddled. Could you say that again?");
}
