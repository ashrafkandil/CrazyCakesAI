"use client";

import { Languages, Mic, RotateCcw, Send, Square, Volume2, VolumeX, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { AvatarFace, type AvatarMood } from "@/app/assistant/avatar-face";
import { Button } from "@/components/ui/button";
import {
  ASSISTANT_NAME,
  SITE_PAGES,
  writeQuoteDraft,
  type AssistantAction,
  type AssistantReply,
  type ChatTurn,
} from "@/lib/assistant/shared";
import { cn } from "@/lib/utils";

type Lang = "en" | "ar";
type ChatMessage = ChatTurn & { id: string; notes?: string[] };
type SavedChat = { messages: ChatMessage[]; lang: Lang; voiceOn: boolean };

// Minimal typings for the browser Web Speech API (Chrome/Edge expose it as webkitSpeechRecognition).
type RecognitionResult = {
  isFinal: boolean;
  length: number;
  readonly [index: number]: { transcript: string } | undefined;
};
type RecognitionEvent = {
  results: { length: number; readonly [index: number]: RecognitionResult | undefined };
};
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type RecognitionCtor = new () => Recognition;

const CHAT_KEY = "crazycakes:assistant-chat";

const COPY = {
  en: {
    greeting: `Hi! I'm ${ASSISTANT_NAME}, the Marwa Crazy Cakes assistant. Ask me about our cakes and prices, or say "show me wedding cakes".`,
    starters: ["Show me wedding cakes", "How much is a custom cake?", "I need a birthday cake"],
    placeholder: "Type or tap the mic…",
    teaser: "Hi! Need help choosing a cake?",
    disclaimer: "AI assistant. It can make mistakes; final prices are confirmed by quote.",
    status: {
      idle: "Online · ask me anything about cakes",
      listening: "Listening…",
      thinking: "Thinking…",
      speaking: "Speaking…",
    },
    failed: "Sorry, something went wrong. Please try again.",
    micBlocked: "Microphone access is blocked. Allow it in your browser to talk to me.",
    noMic: "Voice input works in Chrome or Edge.",
  },
  ar: {
    greeting: `مرحباً! أنا ${ASSISTANT_NAME}، مساعدة Marwa Crazy Cakes. اسألني عن الكعك والأسعار، أو قل "أرني كعكات الزفاف".`,
    starters: ["أرني كعكات الزفاف", "كم سعر الكعكة المخصصة؟", "أحتاج كعكة عيد ميلاد"],
    placeholder: "اكتب أو اضغط على الميكروفون…",
    teaser: "مرحباً! هل تحتاج مساعدة في اختيار كعكة؟",
    disclaimer: "مساعد ذكي وقد يخطئ؛ السعر النهائي يُؤكَّد عبر عرض السعر.",
    status: {
      idle: "متصلة · اسألني عن الكعك",
      listening: "أستمع…",
      thinking: "أفكر…",
      speaking: "أتحدث…",
    },
    failed: "عذراً، حدث خطأ. حاول مرة أخرى.",
    micBlocked: "تم حظر الميكروفون. اسمح به في المتصفح للتحدث معي.",
    noMic: "الإدخال الصوتي يعمل في Chrome أو Edge.",
  },
} as const;

function getRecognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const speechWindow = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang) {
  const prefix = lang === "ar" ? "ar" : "en";
  const matching = voices.filter((voice) => voice.lang.toLowerCase().startsWith(prefix));
  return (
    matching.find((voice) =>
      /natural|aria|jenny|samantha|zira|female|google us english/i.test(voice.name),
    ) ??
    matching.find((voice) => voice.lang.toLowerCase() === "en-us") ??
    matching[0]
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function AvatarWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [voiceOn, setVoiceOn] = useState(true);
  const [micSupported, setMicSupported] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);

  const messagesRef = useRef<ChatMessage[]>([]);
  const recognitionRef = useRef<Recognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const copy = COPY[lang];

  // Restore the conversation after reloads (the layout keeps the widget alive between pages).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHAT_KEY) ?? "null") as SavedChat | null;
      if (saved) {
        if (Array.isArray(saved.messages)) setMessages(saved.messages);
        if (saved.lang === "ar" || saved.lang === "en") setLang(saved.lang);
        if (typeof saved.voiceOn === "boolean") setVoiceOn(saved.voiceOn);
      }
    } catch {
      // ignore corrupt storage
    }
    setMicSupported(Boolean(getRecognitionCtor()));
    setHydrated(true);
    return () => {
      recognitionRef.current?.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    if (hydrated) {
      const saved: SavedChat = { messages: messages.slice(-40), lang, voiceOn };
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(saved));
    }
  }, [hydrated, messages, lang, voiceOn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setMood((current) => (current === "speaking" ? "idle" : current));
  }

  function speak(text: string) {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\p{Extended_Pictographic}/gu, ""));
    utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
    const voice = pickVoice(synth.getVoices(), lang);
    if (voice) utterance.voice = voice;
    utterance.rate = 1.03;
    utterance.pitch = 1.1;
    utterance.onstart = () => setMood("speaking");
    utterance.onend = () => setMood((current) => (current === "speaking" ? "idle" : current));
    utterance.onerror = () => setMood((current) => (current === "speaking" ? "idle" : current));
    synth.speak(utterance);
  }

  function runActions(actions: AssistantAction[]): string[] {
    const notes: string[] = [];
    let destination: string | null = null;
    for (const action of actions) {
      if (action.type === "navigate") {
        destination = action.path;
        const label = SITE_PAGES.find((page) => page.path === action.path)?.label ?? action.path;
        notes.push(`Opened ${label}`);
      } else if (action.type === "show_gallery_category") {
        destination = `/gallery?cat=${encodeURIComponent(action.category)}`;
        notes.push(`Showing ${action.title}`);
      } else {
        writeQuoteDraft(action.quote);
        destination = "/contact";
        notes.push("Filled in your quote request. Please review it");
      }
    }
    const current = `${window.location.pathname}${window.location.search}`;
    if (destination && destination !== current) {
      router.push(destination);
      // On phones the panel covers the page, so step aside to let the visitor see it.
      if (window.innerWidth < 640) setOpen(false);
    }
    return notes;
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    stopSpeaking();
    setNotice(null);
    setSuggestions([]);
    const history = [...messagesRef.current, { id: uid(), role: "user" as const, text }];
    messagesRef.current = history;
    setMessages(history);
    setInput("");
    setBusy(true);
    setMood("thinking");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(-12).map(({ role, text: body }) => ({ role, text: body })),
          page: pathname,
          lang,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as Partial<AssistantReply> & {
        error?: string;
      };
      if (!response.ok || !data.reply) throw new Error(data.error ?? copy.failed);

      const notes = runActions(data.actions ?? []);
      const reply: ChatMessage = {
        id: uid(),
        role: "assistant",
        text: data.reply,
        ...(notes.length > 0 ? { notes } : {}),
      };
      setMessages((current) => [...current, reply]);
      setSuggestions(data.suggestions ?? []);
      speak(data.reply);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : copy.failed);
    } finally {
      setBusy(false);
      setMood((current) => (current === "thinking" ? "idle" : current));
    }
  }

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setNotice(copy.noMic);
      return;
    }
    stopSpeaking();
    setNotice(null);
    const recognition = new Ctor();
    recognition.lang = lang === "ar" ? "ar-EG" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalText = "";
    recognition.onresult = (event) => {
      let interim = "";
      finalText = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? "";
        if (result?.isFinal) finalText += transcript;
        else interim += transcript;
      }
      setInput(finalText + interim);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setNotice(copy.micBlocked);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setMood((current) => (current === "listening" ? "idle" : current));
      if (finalText.trim()) void send(finalText);
    };
    recognitionRef.current = recognition;
    setListening(true);
    setMood("listening");
    recognition.start();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  }

  function resetChat() {
    stopSpeaking();
    recognitionRef.current?.stop();
    setMessages([]);
    setSuggestions([]);
    setNotice(null);
    setInput("");
  }

  const chips = messages.length === 0 ? [...copy.starters] : suggestions;
  const shown: ChatMessage[] =
    messages.length === 0 ? [{ id: "greeting", role: "assistant", text: copy.greeting }] : messages;
  const showTeaser = hydrated && !open && !teaserDismissed && messages.length === 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 print:hidden">
      {open ? (
        <section
          role="dialog"
          aria-label={`${ASSISTANT_NAME} chat`}
          className="flex h-[min(620px,calc(100dvh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        >
          <header className="flex items-center gap-3 border-b border-border bg-blush px-4 py-3">
            <div
              className={cn(
                "h-16 w-16 shrink-0 rounded-full transition-shadow",
                mood === "listening" && "animate-pulse ring-4 ring-primary/50",
                mood === "speaking" && "ring-2 ring-primary/40",
              )}
            >
              <AvatarFace mood={mood} className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg font-semibold leading-tight text-primary">
                {ASSISTANT_NAME}
              </p>
              <p className="truncate text-xs text-muted-foreground" aria-live="polite">
                {copy.status[mood]}
              </p>
            </div>
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLang((current) => (current === "en" ? "ar" : "en"))}
                aria-label="Switch language"
                title={lang === "en" ? "العربية" : "English"}
              >
                <Languages className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (voiceOn) stopSpeaking();
                  setVoiceOn((current) => !current);
                }}
                aria-label={voiceOn ? "Mute voice" : "Turn voice on"}
                title={voiceOn ? "Mute voice" : "Turn voice on"}
              >
                {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={resetChat}
                aria-label="Start over"
                title="Start over"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {shown.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  dir="auto"
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-6",
                    message.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {message.text}
                  {message.notes?.map((note) => (
                    <span key={note} className="mt-1.5 block text-xs font-medium text-primary">
                      ✓ {note}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {busy ? (
              <div className="flex justify-start" aria-label={copy.status.thinking}>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <span className="avatar-dot h-2 w-2 rounded-full bg-primary" />
                  <span className="avatar-dot avatar-dot-2 h-2 w-2 rounded-full bg-primary" />
                  <span className="avatar-dot avatar-dot-3 h-2 w-2 rounded-full bg-primary" />
                </div>
              </div>
            ) : null}
            {notice ? (
              <p className="rounded-lg border border-border bg-blush px-3 py-2 text-xs text-muted-foreground">
                {notice}
              </p>
            ) : null}
          </div>

          {chips.length > 0 && !busy ? (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  dir="auto"
                  onClick={() => void send(chip)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-secondary-foreground transition-colors hover:bg-secondary"
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border p-3">
            <Button
              type="button"
              variant={listening ? "default" : "secondary"}
              size="icon"
              onClick={toggleMic}
              disabled={busy || !micSupported}
              aria-label={listening ? "Stop listening" : "Talk"}
              title={micSupported ? (listening ? "Stop listening" : "Talk") : copy.noMic}
              className={cn("shrink-0", listening && "animate-pulse")}
            >
              {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <textarea
              ref={inputRef}
              dir="auto"
              rows={1}
              value={input}
              maxLength={1000}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={copy.placeholder}
              aria-label="Message"
              className="form-field max-h-28 min-h-9 flex-1 resize-none py-2 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="px-3 pb-2 text-center text-[11px] leading-4 text-muted-foreground">
            {copy.disclaimer}
          </p>
        </section>
      ) : null}

      <div className="flex items-center gap-3">
        {showTeaser ? (
          <button
            type="button"
            onClick={() => {
              setTeaserDismissed(true);
              setOpen(true);
            }}
            className="hidden rounded-2xl rounded-br-sm border border-border bg-background px-4 py-2 text-sm shadow-lg sm:block"
          >
            {copy.teaser}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setTeaserDismissed(true);
            setOpen((current) => !current);
          }}
          aria-label={open ? "Close assistant" : `Chat with ${ASSISTANT_NAME}`}
          aria-expanded={open}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-xl ring-2 ring-primary transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4"
        >
          {open ? (
            <X className="h-7 w-7 text-primary" />
          ) : (
            <AvatarFace mood={mood} className="h-full w-full" />
          )}
        </button>
      </div>
    </div>
  );
}
