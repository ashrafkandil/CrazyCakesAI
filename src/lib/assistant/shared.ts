/**
 * Types and helpers shared by the AI assistant's server route and browser widget.
 * Keep this file free of Node-only imports so it can be bundled for the client.
 */

export const ASSISTANT_NAME = "Sprinkles";

export const SITE_PAGES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About Us" },
  { path: "/gallery", label: "Gallery" },
  { path: "/reviews", label: "Reviews" },
  { path: "/pricing", label: "Pricing" },
  { path: "/contact", label: "Quote request form" },
] as const;

export type SitePath = (typeof SITE_PAGES)[number]["path"];

export const QUOTE_FIELDS = [
  "name",
  "email",
  "phone",
  "eventType",
  "eventDate",
  "servings",
  "location",
  "theme",
] as const;

export type QuoteField = (typeof QUOTE_FIELDS)[number];
export type QuoteDraft = Partial<Record<QuoteField, string>>;

export type AssistantAction =
  | { type: "navigate"; path: SitePath }
  | { type: "show_gallery_category"; category: string; title: string }
  | { type: "prefill_quote"; quote: QuoteDraft };

export type AssistantReply = {
  reply: string;
  actions: AssistantAction[];
  suggestions: string[];
};

export type ChatTurn = { role: "user" | "assistant"; text: string };

export const QUOTE_DRAFT_KEY = "crazycakes:quote-draft";
export const QUOTE_DRAFT_EVENT = "crazycakes:quote-draft";

export function readQuoteDraft(): QuoteDraft {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(QUOTE_DRAFT_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object") return {};
    const draft: QuoteDraft = {};
    for (const field of QUOTE_FIELDS) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string" && value.trim()) draft[field] = value;
    }
    return draft;
  } catch {
    return {};
  }
}

/** Merge new details into the saved quote draft and notify an open contact form. */
export function writeQuoteDraft(patch: QuoteDraft) {
  if (typeof window === "undefined") return;
  const next = { ...readQuoteDraft(), ...patch };
  window.sessionStorage.setItem(QUOTE_DRAFT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(QUOTE_DRAFT_EVENT));
}

export function clearQuoteDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(QUOTE_DRAFT_KEY);
}
