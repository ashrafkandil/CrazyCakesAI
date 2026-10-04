export type AvatarMood = "idle" | "listening" | "thinking" | "speaking";

/**
 * A lightweight 2D baker avatar drawn in SVG (no downloads, no GPU, free).
 * Eyes blink, and the mouth animates while the assistant is speaking.
 */
export function AvatarFace({ mood, className }: { mood: AvatarMood; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Sprinkles, the Crazy Cakes assistant"
    >
      <circle cx="60" cy="60" r="57" fill="var(--color-blush)" />
      <circle cx="60" cy="60" r="57" fill="none" stroke="var(--color-primary)" strokeWidth="3" />

      {/* Hair */}
      <path
        d="M30 70c0-24 13-38 30-38s30 14 30 38v16c-6-4-9-14-9-24-11 6-31 7-42 0 0 10-3 20-9 24z"
        fill="#6b4130"
      />
      {/* Face */}
      <ellipse cx="60" cy="70" rx="25" ry="27" fill="#f7d5bd" />
      {/* Chef hat */}
      <path
        d="M37 44c-9-1-12-13-4-18 3-9 15-10 19-3 5-7 16-7 20 0 7-4 16 1 15 9 7 4 3 14-5 13v7H37z"
        fill="#ffffff"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      <rect
        x="36"
        y="44"
        width="48"
        height="8"
        rx="2.5"
        fill="#ffffff"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="48" r="2" fill="var(--color-primary)" />

      {/* Eyes */}
      <g className="avatar-eye">
        <ellipse cx="50" cy={mood === "thinking" ? 64 : 67} rx="3.3" ry="4" fill="#3b2a22" />
        <ellipse cx="70" cy={mood === "thinking" ? 64 : 67} rx="3.3" ry="4" fill="#3b2a22" />
        <circle cx="51.2" cy={mood === "thinking" ? 62.6 : 65.6} r="1.1" fill="#ffffff" />
        <circle cx="71.2" cy={mood === "thinking" ? 62.6 : 65.6} r="1.1" fill="#ffffff" />
      </g>
      {/* Brows */}
      <path
        d={
          mood === "listening" ? "M44 58q6-4 11 0M65 58q5-4 11 0" : "M45 59q5-3 10 0M65 59q5-3 10 0"
        }
        stroke="#6b4130"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cheeks */}
      <circle cx="44" cy="78" r="4.5" fill="var(--color-primary)" opacity="0.35" />
      <circle cx="76" cy="78" r="4.5" fill="var(--color-primary)" opacity="0.35" />

      {/* Mouth */}
      {mood === "speaking" ? (
        <ellipse className="avatar-mouth-talking" cx="60" cy="85" rx="6" ry="5" fill="#a23e4a" />
      ) : mood === "listening" ? (
        <ellipse cx="60" cy="85" rx="3.5" ry="3" fill="#a23e4a" />
      ) : (
        <path
          d="M51 83q9 8 18 0"
          stroke="#a23e4a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Thinking dots */}
      {mood === "thinking" ? (
        <g fill="var(--color-primary)">
          <circle className="avatar-dot" cx="88" cy="30" r="3" />
          <circle className="avatar-dot avatar-dot-2" cx="97" cy="24" r="3.5" />
          <circle className="avatar-dot avatar-dot-3" cx="107" cy="17" r="4" />
        </g>
      ) : null}
    </svg>
  );
}
