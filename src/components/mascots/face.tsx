export type Mood = "idle" | "shy" | "sad" | "happy" | "love";

const INK = "#3b2233";

export function Eye({
  x,
  y,
  mood,
  side,
  r = 5.5,
}: {
  x: number;
  y: number;
  mood: Mood;
  side: "left" | "right";
  r?: number;
}) {
  if (mood === "happy") {
    return (
      <path
        d={`M ${x - 7} ${y + 1} Q ${x} ${y - 8} ${x + 7} ${y + 1}`}
        stroke={INK}
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (mood === "love") {
    return (
      <path
        transform={`translate(${x - 8} ${y - 8}) scale(0.66)`}
        d="M12 21s-7.5-4.8-9.6-9.1C.7 8.3 2.6 4 6.6 4c2.1 0 3.6 1.2 5.4 3.1C13.8 5.2 15.3 4 17.4 4c4 0 5.9 4.3 4.2 7.9C19.5 16.2 12 21 12 21z"
        fill="#f0668a"
      />
    );
  }
  const dx = mood === "shy" ? (side === "left" ? 2 : 2) : 0;
  return (
    <g>
      {mood === "sad" && (
        <path
          d={
            side === "left"
              ? `M ${x - 8} ${y - 10} L ${x + 5} ${y - 13}`
              : `M ${x + 8} ${y - 10} L ${x - 5} ${y - 13}`
          }
          stroke={INK}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      )}
      <circle cx={x + dx} cy={y} r={r} fill={INK} />
      <circle cx={x + dx + r * 0.35} cy={y - r * 0.4} r={r * 0.32} fill="#fff" />
      {mood === "sad" && side === "right" && (
        <path
          d={`M ${x + 2} ${y + 8} q -4 6 0 10 q 4 -4 0 -10z`}
          fill="#8fd0ff"
          className="animate-bounce"
        />
      )}
    </g>
  );
}

export function Mouth({ x, y, mood }: { x: number; y: number; mood: Mood }) {
  if (mood === "happy" || mood === "love") {
    return (
      <path
        d={`M ${x - 7} ${y - 1} Q ${x} ${y + 10} ${x + 7} ${y - 1} Z`}
        fill="#c94b6b"
      />
    );
  }
  if (mood === "sad") {
    return (
      <path
        d={`M ${x - 5} ${y + 4} Q ${x} ${y - 2} ${x + 5} ${y + 4}`}
        stroke={INK}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  return (
    <path
      d={`M ${x - 6} ${y} Q ${x - 3} ${y + 5} ${x} ${y} Q ${x + 3} ${y + 5} ${x + 6} ${y}`}
      stroke={INK}
      strokeWidth={2.4}
      strokeLinecap="round"
      fill="none"
    />
  );
}

export function Blush({
  x,
  y,
  mood,
  spread = 34,
}: {
  x: number;
  y: number;
  mood: Mood;
  spread?: number;
}) {
  const strong = mood === "shy" || mood === "love" || mood === "happy";
  const opacity = mood === "sad" ? 0.35 : strong ? 0.85 : 0.6;
  const rx = strong ? 9 : 7;
  return (
    <g fill="#ff9db4" opacity={opacity}>
      <ellipse cx={x - spread} cy={y} rx={rx} ry={rx * 0.6} />
      <ellipse cx={x + spread} cy={y} rx={rx} ry={rx * 0.6} />
    </g>
  );
}

export function Heart({
  x,
  y,
  size = 1,
  color = "#f0668a",
  broken = false,
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
  broken?: boolean;
}) {
  return (
    <g transform={`translate(${x - 12 * size} ${y - 11 * size}) scale(${size})`}>
      <path
        d="M12 21s-7.5-4.8-9.6-9.1C.7 8.3 2.6 4 6.6 4c2.1 0 3.6 1.2 5.4 3.1C13.8 5.2 15.3 4 17.4 4c4 0 5.9 4.3 4.2 7.9C19.5 16.2 12 21 12 21z"
        fill={color}
      />
      {broken && (
        <path
          d="M12 7.5 L10 11 L13 13.5 L10.5 17 L12 21"
          stroke="#fff"
          strokeWidth={1.4}
          fill="none"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}
