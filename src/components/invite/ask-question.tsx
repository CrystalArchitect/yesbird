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
  "Oh no. Okay. The tears have started.",
  "Look how big Yes is now. It's a sign.",
  "There's a tiny rain cloud now. You did that.",
  "Okay this is basically bullying.",
  "A tiny heart just cracked a little.",
  "This is the last one, promise. Sniff.",
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
  const yesRef = useRef<HTMLButtonElement>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDodge = useRef(0);

  useEffect(() => () => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
  }, []);

  const dodge = useCallback(() => {
    if (attempts >= MAX_DODGES) return;
    // A single tap fires pointerenter and click back to back; count it once.
    const now = Date.now();
    if (now - lastDodge.current < 350) return;
    lastDodge.current = now;
    const area = areaRef.current?.getBoundingClientRect();
    const btn = noRef.current?.getBoundingClientRect();
    const yes = yesRef.current?.getBoundingClientRect();
    if (area && btn) {
      // Jump somewhere else inside the play area: not where it just was, and never hiding behind Yes.
      const maxX = Math.max(0, (area.width - btn.width) / 2 - 8);
      const maxY = Math.max(0, (area.height - btn.height) / 2 - 8);
      const baseCx = btn.left + btn.width / 2 - offset.x;
      const baseCy = btn.top + btn.height / 2 - offset.y;
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 12; tries++) {
        x = (Math.random() * 2 - 1) * maxX;
        y = (Math.random() * 2 - 1) * maxY;
        const tooClose = Math.abs(x - offset.x) < 70 && Math.abs(y - offset.y) < 40;
        const overYes =
          yes &&
          Math.abs(baseCx + x - (yes.left + yes.width / 2)) < (yes.width + btn.width) / 2 + 6 &&
          Math.abs(baseCy + y - (yes.top + yes.height / 2)) < (yes.height + btn.height) / 2 + 6;
        if (!tooClose && !overYes) break;
      }
      setOffset({ x, y });
    }
    const next = attempts + 1;
    setAttempts(next);
    // First couple of times: a pout. Keep going and the tears start, and stay a while.
    const heartbroken = next >= 3;
    setMood(heartbroken ? "cry" : "sad");
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood("shy"), heartbroken ? 3200 : 1400);
  }, [attempts, offset]);

  const yesScale = Math.min(1 + attempts * 0.14, 2.1);
  const noScale = Math.max(1 - attempts * 0.085, 0.4);
  const surrendered = attempts >= MAX_DODGES;

  const cheerUp = () => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setMood("love");
  };
  const settle = () => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setMood("shy");
  };

  const handleYes = () => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
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
          ref={yesRef}
          type="button"
          onClick={handleYes}
          onPointerEnter={cheerUp}
          onPointerLeave={settle}
          onFocus={cheerUp}
          onBlur={settle}
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
