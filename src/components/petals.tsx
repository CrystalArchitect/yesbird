"use client";

import { useMemo } from "react";

const COLORS = ["#ffc7d6", "#ffd9c2", "#e6d6ff", "#ffe3ea", "#fff0c9"];

// Deterministic "randomness" keeps render pure and server/client markup identical.
function noise(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Petals({ count = 18, className = "" }: { count?: number; className?: string }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: noise(i, 1) * 100,
        delay: -noise(i, 2) * 16,
        duration: 12 + noise(i, 3) * 10,
        size: 10 + noise(i, 4) * 10,
        drift: (noise(i, 5) - 0.5) * 160,
        color: COLORS[i % COLORS.length],
        rotate: noise(i, 6) * 360,
      })),
    [count],
  );

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block animate-petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            background: p.color,
            borderRadius: "100% 0 100% 0",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--drift" as string]: `${p.drift}px`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
