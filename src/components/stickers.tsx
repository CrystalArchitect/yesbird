"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mascot, type Accessory, type Mood } from "@/components/mascots";
import { bouncy } from "@/lib/motion";
import { MASCOTS, type Mascot as MascotKind } from "@/lib/options";
import { cn } from "@/lib/utils";

/** A chat-sticker style speech bubble that pops in whenever its text changes. */
export function SpeechBubble({
  text,
  tone = "soft",
  tail = "left",
  className,
}: {
  text: string;
  tone?: "soft" | "loud";
  tail?: "left" | "bottom";
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={text}
          initial={{ opacity: 0, scale: 0.7, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -6, transition: { duration: 0.18 } }}
          transition={bouncy}
          className={cn(
            "relative inline-block rounded-2xl px-3 py-1.5 text-sm leading-snug",
            tone === "loud"
              ? "bg-primary font-display font-semibold text-primary-foreground shadow-[0_10px_24px_-12px_oklch(0.7_0.18_5)]"
              : "bg-white font-semibold text-foreground ring-1 ring-primary/15",
            "before:absolute before:size-3 before:rotate-45 before:rounded-[2px]",
            tail === "left"
              ? "before:-left-1.5 before:top-1/2 before:-translate-y-1/2"
              : "before:-bottom-1.5 before:left-1/2 before:-translate-x-1/2",
            tone === "loud" ? "before:bg-primary" : "before:bg-white before:ring-1 before:ring-primary/15",
          )}
        >
          <span className="relative">{text}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

type Burst = {
  kind: MascotKind;
  mood: Mood;
  accessory: Accessory;
  line: string;
  className: string;
  delay: number;
  tilt: number;
};

const LINES = ["YESSS!!", "knew it", "omg omg omg", "told you so", "ok breathe", "fireworks. now."];
const ACCESSORIES: Accessory[] = ["partyhat", "sunglasses", "partyhat", "none"];
// Around the big mascot (224px tall on phones, 256px on larger screens), never over the headline.
const SPOTS = [
  { className: "-left-2 top-0 sm:-left-16 sm:top-4", tilt: -10 },
  { className: "-right-2 top-4 sm:-right-16 sm:top-0", tilt: 9 },
  { className: "-left-1 top-32 sm:-left-24 sm:top-32", tilt: 6 },
  { className: "-right-1 top-36 sm:-right-24 sm:top-36", tilt: -7 },
];

/** The other mascots crash the celebration as little stickers, each with something to shout. */
export function StickerBurst({ except, className }: { except: MascotKind; className?: string }) {
  const bursts: Burst[] = MASCOTS.filter((m) => m !== except)
    .slice(0, 4)
    .map((kind, i) => ({
      kind,
      mood: i % 2 ? "love" : "happy",
      accessory: ACCESSORIES[i],
      line: LINES[i % LINES.length],
      className: SPOTS[i].className,
      delay: 0.5 + i * 0.28,
      tilt: SPOTS[i].tilt,
    }));

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {bursts.map((b) => (
        <motion.div
          key={b.kind}
          className={cn("absolute flex flex-col items-center", b.className)}
          initial={{ opacity: 0, scale: 0.3, rotate: b.tilt * 2, y: 30 }}
          animate={{ opacity: 1, scale: 1, rotate: b.tilt, y: 0 }}
          transition={{ ...bouncy, delay: b.delay }}
        >
          <SpeechBubble text={b.line} tone="loud" tail="bottom" className="mb-1.5" />
          <Mascot kind={b.kind} mood={b.mood} accessory={b.accessory} className="h-16 w-16 sm:h-24 sm:w-24" />
        </motion.div>
      ))}
    </div>
  );
}
