"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = ["#ffb3c7", "#c9b8ff", "#ffd27a", "#f0668a", "#9be7c9"];

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 41.7 + salt * 13.3) * 10000;
  return Math.round((x - Math.floor(x)) * 100) / 100;
}

/** Twinkling four-point sparkles scattered inside the parent. Purely decorative. */
export function Sparkles({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const left = 5 + seeded(i, 1) * 90;
        const top = 5 + seeded(i, 2) * 90;
        const size = 8 + Math.round(seeded(i, 3) * 10);
        const delay = seeded(i, 4) * 2.4;
        const duration = 1.8 + seeded(i, 5) * 1.6;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
            initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 45, 90] }}
            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M12 0 C12.8 6.5 17.5 11.2 24 12 C17.5 12.8 12.8 17.5 12 24 C11.2 17.5 6.5 12.8 0 12 C6.5 11.2 11.2 6.5 12 0 Z"
              fill={COLORS[i % COLORS.length]}
            />
          </motion.svg>
        );
      })}
    </div>
  );
}
