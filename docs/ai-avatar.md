# AI Avatar Assistant ("Sprinkles") — Plan A

A talking, animated assistant that lives in the corner of every page. Visitors can type or speak,
and it answers out loud, opens the right gallery category or page, and pre-fills the quote form.

**Cost: $0/month** on Google Gemini's free tier. Voice and the avatar run in the visitor's browser.

## Quick start (local dev)

1. Get a free API key at <https://aistudio.google.com/apikey> (sign in with a Google account).
2. Copy the example env file and paste your key:
   ```sh
   cp .env.example .env.local
   # edit .env.local → GEMINI_API_KEY=your-key
   ```
3. Seed the database and start the site:
   ```sh
   bun install
   bun run db:seed
   bun run dev
   ```
4. Open <http://localhost:3000> in **Chrome or Edge** and click the avatar in the bottom-right corner.
   Allow microphone access when you tap 🎤.

## What it can do

| Visitor says                                     | Assistant does                                           |
| ------------------------------------------------ | -------------------------------------------------------- |
| "Show me wedding cakes"                          | Opens Gallery → Wedding and answers out loud             |
| "How much is a sculpted cake?"                   | Gives the starting price ($300 & up) and explains quotes |
| "I need a birthday cake for 30 people on Nov 14" | Asks for missing details, then pre-fills the quote form  |
| "Where are you located?"                         | Answers from the site's own contact info                 |
| Arabic (toggle 🌐)                               | Listens and replies in Arabic                            |

All answers come from the site's SQLite content (`content`, `categories`, `event_types`,
`testimonials`). Update the site's content and the assistant updates with it.

## How it works

```
Browser (free)                                   Server (Next.js)                Google (free tier)
┌──────────────────────────────┐   POST          ┌─────────────────────────┐     ┌──────────────┐
│ avatar-widget.tsx            │ /api/assistant  │ api/assistant/route.ts  │ ──▶ │ Gemini 2.5   │
│  • SVG avatar (avatar-face)  │ ──────────────▶ │  • knowledge from DB    │     │ Flash / Lite │
│  • Mic: records a WAV clip   │                 │  • JSON-schema output   │ ◀── │              │
│  • Voice: speechSynthesis    │ ◀────────────── │  • validates actions    │     └──────────────┘
│  • Runs actions (navigate,   │ reply+actions   │  • rate limit, fallback │
│    gallery, prefill quote)   │                 └─────────────────────────┘
└──────────────────────────────┘
```

| File                                  | Purpose                                                         |
| ------------------------------------- | --------------------------------------------------------------- |
| `src/app/assistant/avatar-widget.tsx` | Floating chat panel, mic, voice, action runner                  |
| `src/app/assistant/avatar-face.tsx`   | 2D SVG avatar with blink/talk/listen/think states               |
| `src/app/api/assistant/route.ts`      | Calls Gemini, validates output, rate-limits                     |
| `src/lib/assistant/knowledge.ts`      | Builds the system prompt from the site database                 |
| `src/lib/assistant/shared.ts`         | Shared types, page list, quote-draft helpers                    |
| `src/app/contact/contact-form.tsx`    | Accepts the assistant's pre-filled details; Send opens an email |

The API key stays on the server. The model can only trigger actions in an allow-list (known pages,
real gallery categories, known quote fields), and every value is validated before it reaches the
browser.

## Voice and welcome

- **Welcome:** on the first visit, a bubble appears saying "Hi! Welcome to Marwa Crazy Cakes. How can I
  help you today?" with **Talk** and **Type** buttons. It is spoken aloud. Browsers block sound until the
  visitor's first click, tap or key press, so if it can't speak right away it greets on that first click.
- **Talking:** tap 🎤 (or **Talk**). A level meter shows the mic is working ("Listening… speak now" →
  "I hear you!"). It sends automatically after you pause, or tap ■ to send now. The audio goes to Gemini,
  which transcribes and answers in one call. This works in Chrome, Edge, Safari and Firefox, with no
  Google speech service needed. What it heard appears as your chat bubble.
- The page must be opened at `http://localhost:3000` (or HTTPS) for the browser to allow the mic.

## Troubleshooting

Open <http://localhost:3000/api/assistant> while `bun run dev` is running. It reports whether
`GEMINI_API_KEY` is loaded and which Gemini models work with your key. In dev, chat errors also show
the exact reason from Gemini.

| Problem                | Fix                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------ |
| "isn't set up yet"     | Add `GEMINI_API_KEY` to `.env.local`, then **stop and restart** `bun run dev`        |
| "rejected the API key" | Create a new key at aistudio.google.com/apikey                                       |
| "free-tier limit"      | Wait a minute; the free tier limits requests per minute and day                      |
| Mic does nothing       | Allow the microphone (icon left of the address bar) and check the OS mic isn't muted |
| No voice               | Check the 🔊 button in the chat header and your device volume                        |

Google retires model versions over time. The route tries `gemini-2.5-flash`, `gemini-flash-latest`,
`gemini-flash-lite-latest` and `gemini-3.5-flash-lite` in order, and remembers the first one that works.
Set `GEMINI_MODEL` to pin a model.

## Contact form change

Previously, "Send Inquiry" didn't send anything. It now opens the visitor's email app with a
pre-written inquiry to the studio's email address (free, no backend). Since email links can't
carry attachments, visitors attach inspiration photos in their email app. When the site is hosted,
this can be upgraded to a server-side email (e.g. Resend's free tier) or WhatsApp.

## Costs and limits

- **Gemini free tier:** enough for a small business site. Limits are per minute and per day and
  change over time; see <https://ai.google.dev/gemini-api/docs/rate-limits>. When the primary model
  is busy, the route automatically falls back to other Flash models.
- **Privacy note:** on the free tier, Google may use prompts to improve its products. Don't ask
  visitors for sensitive data beyond what the quote form needs. Turning on billing for the same key
  (pay-as-you-go, typically a few dollars a month at this traffic) removes that.
- **Browser voice:** the spoken reply uses the device's built-in voices, so quality varies by device.

## Customizing

- **Name/personality:** `ASSISTANT_NAME` in `src/lib/assistant/shared.ts`, rules in
  `src/lib/assistant/knowledge.ts`.
- **Look:** colors come from the site theme (`--primary`, `--blush`); edit the SVG in
  `avatar-face.tsx`.
- **Model:** set `GEMINI_MODEL` in `.env.local`.

## Next phases (not built yet)

1. 3D avatar with lip-sync (TalkingHead + Ready Player Me / VRM), still free.
2. Natural neural voice (Kokoro or Piper running in the browser).
3. Optional local model through Ollama for fully offline development.
4. Server-side inquiry delivery (email/WhatsApp) once the site is hosted.
