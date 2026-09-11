"use client";

import { motion } from "framer-motion";

const HEARTS = ["💗", "💕", "💖", "🩷", "💘", "🌸"];

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 17.9 + salt * 29.1) * 10000;
  return Math.round((x - Math.floor(x)) * 100) / 100;
}

/** Slow, dreamy hearts drifting up from the bottom of the screen. */
export function FloatingHearts({ count = 14 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-10%] select-none"
          style={{ left: `${5 + seeded(i, 1) * 90}%`, fontSize: 18 + Math.round(seeded(i, 2) * 26) }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-120vh", opacity: [0, 0.9, 0.9, 0], x: [0, (seeded(i, 3) - 0.5) * 120, 0] }}
          transition={{
            duration: 9 + seeded(i, 4) * 8,
            delay: seeded(i, 5) * 6,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {HEARTS[i % HEARTS.length]}
        </motion.span>
      ))}
    </div>
  );
}
