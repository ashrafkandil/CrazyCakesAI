"use client";

import {
  Keyboard,
  Languages,
  Mic,
  RotateCcw,
  Send,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { AvatarFace, type AvatarMood } from "@/app/assistant/avatar-face";
import {
  isVoiceSupported,
  useVoiceRecorder,
  type VoiceClip,
  type VoiceError,
} from "@/app/assistant/use-voice-recorder";
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
type ChatMessage = ChatTurn & { id: string; notes?: string[]; pending?: boolean };
type SavedChat = { messages: ChatMessage[]; lang: Lang; voiceOn: boolean };
type ServerReply = Partial<AssistantReply> & { error?: string; detail?: string };
type SpeakHooks = { onStart?: () => void; onBlocked?: () => void };

const CHAT_KEY = "crazycakes:assistant-chat";
const ARABIC = /[\u0600-\u06FF]/;

const COPY = {
  en: {
    greeting: "Hi! Welcome to Marwa Crazy Cakes. How can I help you today?",
    starters: ["Show me wedding cakes", "How much is a custom cake?", "I need a birthday cake"],
    placeholder: "Type a message…",
    talk: "Talk",
    type: "Type",
    disclaimer: "AI assistant. It can make mistakes; final prices are confirmed by quote.",
    status: {
      idle: "Online · tap the mic and just talk",
      listening: "Listening…",
      thinking: "Thinking…",
      speaking: "Speaking…",
    },
    speakNow: "Listening… speak now",
    hearing: "I hear you! I'll answer when you pause",
    voicePending: "🎤 Voice message…",
    voiceUnclear: "🎤 (voice message)",
    failed: "Sorry, something went wrong. Please try again.",
    voiceErrors: {
      denied:
        "Microphone access is blocked. Click the icon at the left of the address bar, allow Microphone, then tap the mic again.",
      "no-mic": "I couldn't find a microphone. Plug one in or check your sound settings.",
      unsupported:
        "Voice isn't available here. Open the site at http://localhost:3000 in Chrome, Edge or Safari, or just type.",
      "no-speech":
        "I didn't hear anything. Check that your mic isn't muted, then tap the mic and speak.",
    },
  },
  ar: {
    greeting: "مرحباً! أهلاً بك في Marwa Crazy Cakes. كيف يمكنني مساعدتك اليوم؟",
    starters: ["أرني كعكات الزفاف", "كم سعر الكعكة المخصصة؟", "أحتاج كعكة عيد ميلاد"],
    placeholder: "اكتب رسالة…",
    talk: "تحدث",
    type: "اكتب",
    disclaimer: "مساعد ذكي وقد يخطئ؛ السعر النهائي يُؤكَّد عبر عرض السعر.",
    status: {
      idle: "متصلة · اضغط على الميكروفون وتحدث",
      listening: "أستمع…",
      thinking: "أفكر…",
      speaking: "أتحدث…",
    },
    speakNow: "أستمع… تحدث الآن",
    hearing: "أسمعك! سأجيب عندما تتوقف",
    voicePending: "🎤 رسالة صوتية…",
    voiceUnclear: "🎤 (رسالة صوتية)",
    failed: "عذراً، حدث خطأ. حاول مرة أخرى.",
    voiceErrors: {
      denied: "تم حظر الميكروفون. اسمح به من أيقونة شريط العنوان ثم اضغط على الميكروفون مرة أخرى.",
      "no-mic": "لم أجد ميكروفوناً. تحقق من إعدادات الصوت.",
      unsupported: "الصوت غير متاح هنا. افتح الموقع في Chrome أو Edge أو Safari، أو اكتب رسالتك.",
      "no-speech": "لم أسمع شيئاً. تأكد أن الميكروفون غير مكتوم ثم حاول مرة أخرى.",
    },
  },
} as const;

function pickVoice(voices: SpeechSynthesisVoice[], arabic: boolean) {
  const prefix = arabic ? "ar" : "en";
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

function LevelBars({ level }: { level: number }) {
  return (
    <span className="flex h-6 items-center gap-0.5" aria-hidden="true">
      {[0.5, 0.8, 1, 0.8, 0.5].map((weight, index) => (
        <span
          key={index}
          className="w-1 rounded-full bg-primary transition-[height] duration-75"
          style={{ height: `${4 + Math.round(level * weight * 20)}px` }}
        />
      ))}
    </span>
  );
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
  const [lang, setLang] = useState<Lang>("en");
  const [voiceOn, setVoiceOn] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  const messagesRef = useRef<ChatMessage[]>([]);
  const langRef = useRef<Lang>("en");
  const voiceOnRef = useRef(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakRef = useRef<(text: string, hooks?: SpeakHooks) => void>(() => undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const copy = COPY[lang];

  const recorder = useVoiceRecorder({
    onClip: (clip) => void send({ clip }),
    onError: (code: VoiceError) => setNotice(COPY[langRef.current].voiceErrors[code]),
  });

  // Restore the conversation after reloads, load voices, decide whether to greet.
  useEffect(() => {
    let hasHistory = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHAT_KEY) ?? "null") as SavedChat | null;
      if (saved) {
        if (Array.isArray(saved.messages)) {
          const restored = saved.messages.filter((message) => !message.pending);
          hasHistory = restored.length > 0;
          setMessages(restored);
        }
        if (saved.lang === "ar" || saved.lang === "en") setLang(saved.lang);
        if (typeof saved.voiceOn === "boolean") setVoiceOn(saved.voiceOn);
      }
    } catch {
      // ignore corrupt storage
    }
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const loadVoices = () => {
        voicesRef.current = synth.getVoices();
      };
      loadVoices();
      synth.addEventListener("voiceschanged", loadVoices);
    }
    setWelcomeVisible(!hasHistory);
    setHydrated(true);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    langRef.current = lang;
    voiceOnRef.current = voiceOn;
    if (hydrated) {
      const saved: SavedChat = {
        messages: messages.filter((message) => !message.pending).slice(-40),
        lang,
        voiceOn,
      };
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(saved));
    }
  }, [hydrated, messages, lang, voiceOn]);

  useEffect(() => {
    speakRef.current = speak;
  });

  // Spoken welcome. Browsers only allow speech after the visitor's first click, tap or key press,
  // so we try right away and otherwise greet on that first interaction.
  useEffect(() => {
    if (!welcomeVisible) return;
    let greeted = false;
    const detach = () => {
      window.removeEventListener("pointerdown", greet, true);
      window.removeEventListener("keydown", greet, true);
    };
    function greet() {
      if (greeted) return;
      speakRef.current(COPY[langRef.current].greeting, {
        onStart: () => {
          greeted = true;
          detach();
        },
      });
    }
    window.addEventListener("pointerdown", greet, true);
    window.addEventListener("keydown", greet, true);
    const timer = window.setTimeout(greet, 700);
    return () => {
      window.clearTimeout(timer);
      detach();
    };
  }, [welcomeVisible]);

  useEffect(() => {
    if (recorder.recording) setMood("listening");
    else setMood((current) => (current === "listening" ? "idle" : current));
  }, [recorder.recording]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open, notice]);

  useEffect(() => {
    if (!open) return;
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

  function speak(text: string, hooks?: SpeakHooks) {
    if (!voiceOnRef.current || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const arabic = ARABIC.test(text);
    const utterance = new SpeechSynthesisUtterance(text.replace(/\p{Extended_Pictographic}/gu, ""));
    utterance.lang = arabic ? "ar-SA" : "en-US";
    const voice = pickVoice(
      voicesRef.current.length ? voicesRef.current : synth.getVoices(),
      arabic,
    );
    if (voice) utterance.voice = voice;
    utterance.rate = 1.03;
    utterance.pitch = 1.1;
    utterance.onstart = () => {
      setMood("speaking");
      hooks?.onStart?.();
    };
    utterance.onend = () => setMood((current) => (current === "speaking" ? "idle" : current));
    utterance.onerror = (event) => {
      setMood((current) => (current === "speaking" ? "idle" : current));
      if (event.error === "not-allowed") hooks?.onBlocked?.();
    };
    utteranceRef.current = utterance; // keeps Chrome from garbage-collecting it mid-sentence
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

  async function send(payload: { text: string } | { clip: VoiceClip }) {
    if (busy) return;
    const clip = "clip" in payload ? payload.clip : null;
    const text = "text" in payload ? payload.text.trim() : "";
    if (!clip && !text) return;
    const words = COPY[langRef.current];

    stopSpeaking();
    setNotice(null);
    setSuggestions([]);
    setWelcomeVisible(false);
    const history = messagesRef.current.filter((message) => !message.pending);
    const userMessage: ChatMessage = clip
      ? { id: uid(), role: "user", text: words.voicePending, pending: true }
      : { id: uid(), role: "user", text };
    const shown = [...history, userMessage];
    messagesRef.current = shown;
    setMessages(shown);
    setInput("");
    setBusy(true);
    setMood("thinking");

    const dropPending = () =>
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));

    try {
      const turns = (clip ? history : shown).slice(-12).map(({ role, text: body }) => ({
        role,
        text: body,
      }));
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: turns,
          ...(clip ? { audio: clip } : {}),
          page: pathname,
          lang: langRef.current,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as ServerReply;
      if (!response.ok || !data.reply) {
        if (clip) dropPending();
        setNotice([data.error ?? words.failed, data.detail].filter(Boolean).join(" — "));
        return;
      }

      if (clip) {
        const heard = data.heard?.trim() || words.voiceUnclear;
        setMessages((current) =>
          current.map((message) =>
            message.id === userMessage.id ? { id: message.id, role: "user", text: heard } : message,
          ),
        );
      }
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
    } catch {
      if (clip) dropPending();
      setNotice(words.failed);
    } finally {
      setBusy(false);
      setMood((current) => (current === "thinking" ? "idle" : current));
    }
  }

  function openChat() {
    setWelcomeVisible(false);
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }

  function startListening() {
    stopSpeaking();
    setNotice(null);
    setWelcomeVisible(false);
    setOpen(true);
    if (!isVoiceSupported()) {
      setNotice(copy.voiceErrors.unsupported);
      return;
    }
    void recorder.start();
  }

  function toggleMic() {
    if (recorder.recording) recorder.stop();
    else startListening();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send({ text: input });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send({ text: input });
    }
  }

  function resetChat() {
    stopSpeaking();
    recorder.cancel();
    setMessages([]);
    setSuggestions([]);
    setNotice(null);
    setInput("");
  }

  const chips = messages.length === 0 ? [...copy.starters] : suggestions;
  const shownMessages: ChatMessage[] =
    messages.length === 0 ? [{ id: "greeting", role: "assistant", text: copy.greeting }] : messages;

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
                mood === "listening" && "ring-4 ring-primary/60",
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
            {shownMessages.map((message) => (
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
                    message.pending && "opacity-70",
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
              <p
                role="alert"
                dir="auto"
                className="rounded-lg border border-border bg-blush px-3 py-2 text-xs text-secondary-foreground"
              >
                {notice}
              </p>
            ) : null}
          </div>

          {chips.length > 0 && !busy && !recorder.recording ? (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  dir="auto"
                  onClick={() => void send({ text: chip })}
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
              variant={recorder.recording ? "default" : "secondary"}
              size="icon"
              onClick={toggleMic}
              disabled={busy}
              aria-label={recorder.recording ? "Stop and send" : "Talk"}
              title={recorder.recording ? "Stop and send" : "Talk"}
              className="shrink-0"
            >
              {recorder.recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            {recorder.recording ? (
              <div
                className="flex min-h-9 flex-1 items-center gap-3 rounded-md border border-primary bg-blush px-3"
                aria-live="polite"
              >
                <LevelBars level={recorder.level} />
                <span className="flex-1 text-xs font-medium text-secondary-foreground">
                  {recorder.hearingVoice ? copy.hearing : copy.speakNow}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {recorder.seconds}s
                </span>
              </div>
            ) : (
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
            )}
            {recorder.recording ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={recorder.cancel}
                aria-label="Cancel recording"
                title="Cancel"
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
          <p className="px-3 pb-2 text-center text-[11px] leading-4 text-muted-foreground">
            {copy.disclaimer}
          </p>
        </section>
      ) : null}

      <div className="flex items-end gap-3">
        {welcomeVisible && !open ? (
          <div
            role="status"
            className="w-[min(280px,calc(100vw-7rem))] rounded-2xl rounded-br-sm border border-border bg-background p-3 shadow-lg"
          >
            <div className="flex items-start gap-2">
              <p dir="auto" className="flex-1 text-sm leading-5">
                {copy.greeting}
              </p>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setWelcomeVisible(false);
                }}
                aria-label="Dismiss"
                className="rounded p-0.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button type="button" size="sm" onClick={startListening} className="flex-1">
                <Mic className="h-4 w-4" /> {copy.talk}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={openChat}
                className="flex-1"
              >
                <Keyboard className="h-4 w-4" /> {copy.type}
              </Button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label={open ? "Close assistant" : `Chat with ${ASSISTANT_NAME}`}
          aria-expanded={open}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-background shadow-xl ring-2 ring-primary transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4"
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
