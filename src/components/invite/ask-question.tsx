"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mascot, type Mood } from "@/components/mascots";
import type { Mascot as MascotKind } from "@/lib/options";
import { NO_BUTTON_LINES } from "@/lib/options";
import { cn } from "@/lib/utils";

const MAX_DODGES = NO_BUTTON_LINES.length - 1;

const PLEAS = [
  "",
  "Hm? Let's pretend that didn't happen.",
  "The button moved. Weird. Anyway—",
  "Eyes are getting watery over here.",
  "Look how big Yes is now. It's a sign.",
  "Someone is getting nervous.",
  "Okay this is basically bullying.",
  "A tiny heart just cracked a little.",
  "This is the last one, promise.",
  "...fine. We both know the answer.",
];

export function AskQuestion({
  recipientName,
  senderName,
  message,
  mascot,
  onYes,
  compact = false,
}: {
  recipientName: string;
  senderName: string;
  message?: string;
  mascot: MascotKind;
  onYes: (noAttempts: number) => void;
  compact?: boolean;
}) {
  const [attempts, setAttempts] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mood, setMood] = useState<Mood>("shy");
  const areaRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
  }, []);

  const dodge = useCallback(() => {
    if (attempts >= MAX_DODGES) return;
    const area = areaRef.current?.getBoundingClientRect();
    const btn = noRef.current?.getBoundingClientRect();
    if (area && btn) {
      // Jump somewhere else inside the play area, but never right on top of Yes.
      const maxX = Math.max(0, (area.width - btn.width) / 2 - 8);
      const maxY = Math.max(0, (area.height - btn.height) / 2 - 8);
      let x = (Math.random() * 2 - 1) * maxX;
      let y = (Math.random() * 2 - 1) * maxY;
      if (Math.abs(x - offset.x) < 60 && Math.abs(y - offset.y) < 40) {
        x = -x;
        y = -y;
      }
      setOffset({ x, y });
    }
    setAttempts((a) => a + 1);
    setMood("sad");
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood("shy"), 900);
  }, [attempts, offset]);

  const yesScale = Math.min(1 + attempts * 0.14, 2.1);
  const noScale = Math.max(1 - attempts * 0.085, 0.4);
  const surrendered = attempts >= MAX_DODGES;

  const handleYes = () => {
    setMood("happy");
    onYes(attempts);
  };

  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "gap-3" : "gap-5")}>
      <Mascot kind={mascot} mood={mood} className={compact ? "h-32 w-32" : "h-44 w-44 sm:h-52 sm:w-52"} />

      <div className="space-y-2 px-2">
        <h1 className={cn("font-display font-semibold text-balance leading-tight", compact ? "text-2xl" : "text-3xl sm:text-4xl")}>
          {recipientName}, will you go on a date with {senderName}?
        </h1>
        {message && (
          <p className="mx-auto max-w-md text-balance text-muted-foreground">“{message}”</p>
        )}
      </div>

      <div
        ref={areaRef}
        className={cn(
          "relative flex w-full items-center justify-center gap-6",
          compact ? "h-40" : "h-56 sm:h-64",
        )}
      >
        <motion.button
          type="button"
          onClick={handleYes}
          animate={{ scale: yesScale }}
          whileHover={{ scale: yesScale * 1.06 }}
          whileTap={{ scale: yesScale * 0.94 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="relative z-10 rounded-full bg-primary px-9 py-3.5 font-display text-xl font-semibold text-primary-foreground shadow-[0_16px_40px_-12px_oklch(0.7_0.18_5/0.7)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          Yes
          <span className="absolute -right-2 -top-2 animate-heartbeat text-2xl" aria-hidden>
            💗
          </span>
        </motion.button>

        <motion.button
          ref={noRef}
          type="button"
          onPointerEnter={surrendered ? undefined : dodge}
          onClick={surrendered ? handleYes : dodge}
          onTouchStart={surrendered ? undefined : dodge}
          animate={{ x: offset.x, y: offset.y, scale: noScale }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          className={cn(
            "rounded-full border-2 px-7 py-3 font-display text-lg font-semibold transition-colors focus-visible:outline-none",
            surrendered
              ? "border-primary bg-primary text-primary-foreground"
              : "border-foreground/15 bg-white/80 text-muted-foreground hover:border-foreground/30",
          )}
        >
          {NO_BUTTON_LINES[Math.min(attempts, MAX_DODGES)]}
        </motion.button>
      </div>

      <div className="h-6">
        <AnimatePresence mode="wait">
          {attempts > 0 && (
            <motion.p
              key={attempts}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm font-semibold text-primary"
            >
              {PLEAS[Math.min(attempts, PLEAS.length - 1)]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
