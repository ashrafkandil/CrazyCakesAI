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
 * Sends the conversation (text or a short voice clip) to Google Gemini and returns a spoken
 * reply plus safe, validated website actions. The API key never leaves the server.
 *
 * GET /api/assistant (dev only) — health check that tells you whether your key and models work.
 */

export const dynamic = "force-dynamic";

/** Tried in order. Google retires model versions over time, so we fall back automatically. */
const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
];
const MAX_TURNS = 12;
const NONE = "none";
const IS_DEV = process.env["NODE_ENV"] !== "production";
const VOICE_PROMPT =
  'This is a voice message from the visitor. Write exactly what they said in "heard" (in the language they spoke), then reply to it. If it is silent or unclear, set "heard" to "" and kindly ask them to repeat.';

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
    .max(60)
    .default([]),
  audio: z
    .object({
      mimeType: z.literal("audio/wav"),
      data: z
        .string()
        .min(100)
        .max(2_500_000)
        .regex(/^[A-Za-z0-9+/=]+$/),
    })
    .optional(),
  page: z.string().max(200).optional(),
  lang: z.enum(["en", "ar"]).optional(),
});

const optionalText = z.string().nullish();
const modelOutputSchema = z.object({
  heard: optionalText,
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

// --- Model selection ----------------------------------------------------------------------
let preferredModel: string | undefined;
const unavailableModels = new Set<string>();

function modelChain(): string[] {
  const configured = [
    process.env["GEMINI_MODEL"],
    process.env["GEMINI_FALLBACK_MODEL"],
    ...DEFAULT_MODELS,
  ]
    .map((model) => model?.trim())
    .filter((model): model is string => Boolean(model));
  const models = [...new Set(configured)].filter((model) => !unavailableModels.has(model));
  if (preferredModel && models.includes(preferredModel)) {
    return [preferredModel, ...models.filter((model) => model !== preferredModel)];
  }
  return models.length ? models : [...new Set(configured)];
}

/** Keep replies fast: 2.5 models take a thinking budget, newer ones a thinking level. */
function thinkingConfig(model: string) {
  if (model.includes("2.5")) return { thinkingBudget: 0 };
  if (/^gemini-(\d|flash|pro)/.test(model)) return { thinkingLevel: "low" };
  return undefined;
}

function isKeyProblem(status: number, message: string) {
  return status === 401 || status === 403 || (status === 400 && /api[ _]?key/i.test(message));
}

// --- Gemini -------------------------------------------------------------------------------
/** A flat schema: nested objects made small models loop, so every field is top-level. */
function responseSchema(categorySlugs: string[], eventTypes: string[]) {
  const text = { type: "STRING" };
  const properties: Record<string, unknown> = {
    heard: { type: "STRING", description: "Transcript of a voice message, otherwise empty" },
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
      signal: AbortSignal.timeout(30_000),
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
    const cause = error instanceof Error ? error.message : "network error";
    return { ok: false, status: 504, message: `Could not reach Gemini: ${cause}` };
  }
}

async function generate(
  model: string,
  apiKey: string,
  payload: Record<string, unknown>,
  generationConfig: Record<string, unknown>,
): Promise<GeminiResult> {
  const thinking = thinkingConfig(model);
  const first = await callGemini(model, apiKey, {
    ...payload,
    generationConfig: thinking
      ? { ...generationConfig, thinkingConfig: thinking }
      : generationConfig,
  });
  // Some models reject a thinking setting; retry once without it.
  if (!first.ok && first.status === 400 && thinking && !isKeyProblem(400, first.message)) {
    return callGemini(model, apiKey, { ...payload, generationConfig });
  }
  return first;
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
  withAudio: boolean,
): AssistantReply | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(
      raw
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```$/, ""),
    );
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

  const heard = withAudio ? (output.heard ?? "").trim().slice(0, 500) : "";
  return {
    reply: output.reply.trim().slice(0, 600),
    actions,
    suggestions: (output.suggestions ?? [])
      .map((item) => item.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 3),
    ...(heard ? { heard } : {}),
  };
}

function errorResponse(status: number, error: string, failures: string[] = []) {
  const detail = IS_DEV && failures.length ? { detail: failures.join(" | ") } : {};
  return Response.json({ error, ...detail }, { status });
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
  const { audio } = parsed.data;

  const turns = parsed.data.messages.slice(-MAX_TURNS);
  while (turns[0]?.role === "assistant") turns.shift();
  if (!audio && turns.at(-1)?.role !== "user") return errorResponse(400, "Invalid request.");

  const contents: { role: "user" | "model"; parts: Record<string, unknown>[] }[] = turns.map(
    (turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.text }],
    }),
  );
  if (audio) {
    contents.push({
      role: "user",
      parts: [
        { inlineData: { mimeType: audio.mimeType, data: audio.data } },
        { text: VOICE_PROMPT },
      ],
    });
  }

  const categories = getAssistantCategories();
  const eventTypes = getAssistantEventTypes();
  const categoryTitles = new Map(categories.map((item) => [item.slug, item.title]));
  const generationConfig = {
    temperature: 0.5,
    maxOutputTokens: 1000,
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
    contents,
  };

  const forced = IS_DEV ? new URL(request.url).searchParams.get("model") : null;
  const failures: string[] = [];
  let sawRateLimit = false;

  for (const model of forced ? [forced] : modelChain()) {
    const result = await generate(model, apiKey, payload, generationConfig);
    if (result.ok) {
      const reply = normalize(result.text, categoryTitles, eventTypes, Boolean(audio));
      if (reply) {
        preferredModel = model;
        return Response.json(reply);
      }
      failures.push(`${model}: unusable output`);
      console.warn(`[assistant] ${model} returned unusable output: ${result.text.slice(0, 200)}`);
      continue;
    }
    failures.push(`${model}: ${result.status} ${result.message.slice(0, 160)}`);
    console.warn(`[assistant] ${model} failed (${result.status}): ${result.message}`);
    if (isKeyProblem(result.status, result.message)) {
      return errorResponse(
        502,
        "Gemini rejected the API key. Check GEMINI_API_KEY in .env.local and restart the dev server.",
        failures,
      );
    }
    if (result.status === 404) unavailableModels.add(model);
    if (result.status === 429) sawRateLimit = true;
  }

  if (sawRateLimit) {
    return errorResponse(
      429,
      "I'm a little busy right now (free-tier limit). Please try again in a minute.",
      failures,
    );
  }
  return errorResponse(
    502,
    "Sorry, I couldn't get an answer just now. Please try again.",
    failures,
  );
}

type HealthResult =
  { model: string; ok: true } | { model: string; ok: false; status: number; error: string };

export async function GET(request: Request) {
  if (!IS_DEV) return errorResponse(404, "Not found.");
  const apiKey = process.env["GEMINI_API_KEY"]?.trim();
  if (!apiKey) {
    return Response.json({
      ok: false,
      keyConfigured: false,
      hint: "Add GEMINI_API_KEY=your-key to .env.local, then stop and restart `bun run dev`.",
    });
  }
  const forced = new URL(request.url).searchParams.get("model");
  const results: HealthResult[] = [];
  for (const model of forced ? [forced] : modelChain()) {
    const result = await generate(
      model,
      apiKey,
      { contents: [{ role: "user", parts: [{ text: "Reply with just: OK" }] }] },
      { maxOutputTokens: 200 },
    );
    results.push(
      result.ok
        ? { model, ok: true }
        : { model, ok: false, status: result.status, error: result.message.slice(0, 300) },
    );
  }
  return Response.json({ ok: results.some((item) => item.ok), keyConfigured: true, results });
}
