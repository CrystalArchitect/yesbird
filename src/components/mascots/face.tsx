export type Mood = "idle" | "shy" | "sad" | "cry" | "happy" | "love";

const INK = "#3b2233";
const TEAR = "#8fd0ff";

export function Tears({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g>
      <path
        d={`M ${x} ${y} q -4 7 0 12 q 4 -5 0 -12z`}
        fill={TEAR}
        className="animate-tear"
        style={{ animationDelay: `${delay}s` }}
      />
      <path
        d={`M ${x} ${y} q -3 5 0 9 q 3 -4 0 -9z`}
        fill={TEAR}
        className="animate-tear"
        style={{ animationDelay: `${delay + 0.55}s` }}
      />
    </g>
  );
}

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
  if (mood === "cry") {
    // Big glossy eyes, brows knit upward, a stream of tears under each.
    const R = r * 1.25;
    return (
      <g>
        <path
          d={
            side === "left"
              ? `M ${x - 9} ${y - 12} Q ${x} ${y - 17} ${x + 7} ${y - 13}`
              : `M ${x + 9} ${y - 12} Q ${x} ${y - 17} ${x - 7} ${y - 13}`
          }
          stroke={INK}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={x} cy={y} r={R} fill={INK} />
        <circle cx={x - R * 0.3} cy={y - R * 0.35} r={R * 0.38} fill="#fff" />
        <circle cx={x + R * 0.35} cy={y + R * 0.3} r={R * 0.18} fill="#fff" opacity={0.9} />
        <ellipse cx={x} cy={y + R + 1} rx={R * 0.9} ry={2.2} fill={TEAR} opacity={0.8} />
        <Tears x={x - R * 0.45} y={y + R} delay={side === "left" ? 0 : 0.3} />
        <Tears x={x + R * 0.45} y={y + R} delay={side === "left" ? 0.4 : 0.15} />
      </g>
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
  if (mood === "cry") {
    // Wobbly lip.
    return (
      <path
        d={`M ${x - 8} ${y + 3} q 2.7 -4 5.3 0 q 2.7 4 5.4 0 q 2.6 -4 5.3 0`}
        stroke={INK}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
        className="animate-wobble"
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
  const strong = mood === "shy" || mood === "love" || mood === "happy" || mood === "cry";
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
