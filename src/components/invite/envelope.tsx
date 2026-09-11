"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/mascots";
import { Sparkles } from "@/components/sparkles";
import { EASE_SOFT } from "@/lib/motion";
import type { Mascot as MascotKind } from "@/lib/options";

const OPEN_MS = 2600;

export function Envelope({
  recipientName,
  senderName,
  mascot,
  onOpened,
}: {
  recipientName: string;
  senderName: string;
  mascot: MascotKind;
  onOpened: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const open = () => {
    if (opening) return;
    setOpening(true);
    timer.current = setTimeout(onOpened, OPEN_MS);
  };

  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/70">A letter arrived</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">For {recipientName}</h1>
      </motion.div>

      <motion.button
        type="button"
        onClick={open}
        aria-label="Open the letter"
        className="relative mt-8 h-60 w-[22rem] max-w-[92vw] select-none focus-visible:outline-none sm:h-[17rem] sm:w-[26rem]"
        animate={opening ? { y: 30, opacity: 0, scale: 0.92 } : { y: [0, -7, 0] }}
        transition={
          opening
            ? { delay: 1.9, duration: 0.7, ease: EASE_SOFT }
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ perspective: 1100 }}
      >
        <Sparkles className="-inset-6" count={7} />

        <motion.div
          className="pointer-events-none absolute left-1/2 top-0 z-0 -translate-x-1/2"
          initial={{ y: -80 }}
          animate={opening ? { y: -218, scale: 1.1 } : { y: -80 }}
          transition={{ duration: 1, ease: EASE_SOFT, delay: opening ? 0.7 : 0 }}
        >
          <Mascot kind={mascot} mood={opening ? "happy" : "shy"} className="h-32 w-32 sm:h-36 sm:w-36" />
        </motion.div>

        <div className="absolute inset-0 z-10 rounded-[1.6rem] bg-[radial-gradient(120%_120%_at_20%_0%,#ffe1e9_0%,#ffcfdc_60%,#ffc3d3_100%)] shadow-[0_34px_70px_-30px_oklch(0.7_0.18_5/0.55),0_2px_0_0_#fff_inset] ring-1 ring-primary/15" />

        {/* Clipped at the envelope's bottom edge only, so the letter can rise above it but never hang below. */}
        <div className="pointer-events-none absolute inset-x-0 -top-[400px] bottom-0 z-20 overflow-hidden rounded-b-[1.6rem]">
          <motion.div
            className="absolute inset-x-6 top-[420px] rounded-2xl bg-white px-6 pb-5 pt-6 text-left shadow-[0_18px_40px_-24px_oklch(0.4_0.1_350/0.5)] ring-1 ring-primary/10"
            initial={{ y: 88 }}
            animate={opening ? { y: -128 } : { y: 88 }}
            transition={{ delay: opening ? 0.6 : 0, duration: 1, ease: EASE_SOFT }}
          >
            <p className="font-hand text-2xl leading-none text-foreground">Dear {recipientName},</p>
            <div className="mt-3 space-y-2">
              <div className="h-2 w-full rounded-full bg-blush/80" />
              <div className="h-2 w-11/12 rounded-full bg-blush/80" />
              <div className="h-2 w-2/3 rounded-full bg-blush/80" />
            </div>
            <p className="mt-3 text-right font-hand text-xl text-primary">♡ {senderName}</p>
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 h-[64%] overflow-hidden rounded-b-[1.6rem]">
          <div className="absolute -left-[28%] bottom-0 h-[130%] w-[78%] origin-bottom -skew-x-[32deg] bg-[#ffd0dc] shadow-[8px_0_18px_-10px_rgba(120,40,70,0.25)]" />
          <div className="absolute -right-[28%] bottom-0 h-[130%] w-[78%] origin-bottom skew-x-[32deg] bg-[#ffd0dc] shadow-[-8px_0_18px_-10px_rgba(120,40,70,0.25)]" />
          <div className="absolute inset-x-0 bottom-0 h-[74%] bg-[linear-gradient(180deg,#ffd8e2_0%,#ffcfdb_100%)] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />

          <div className="absolute bottom-5 left-7 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">to</p>
            <p className="font-hand text-3xl leading-none text-foreground sm:text-4xl">{recipientName}</p>
            <p className="mt-1 font-hand text-lg leading-none text-muted-foreground">from {senderName}</p>
          </div>

          <div className="absolute bottom-4 right-5 flex items-end gap-2">
          <div className="grid size-11 place-items-center rounded-full border-2 border-dashed border-primary/40 text-primary/70 sm:size-12">
            <span className="font-display text-[9px] font-bold uppercase leading-none tracking-wide">
              yes
              <br />
              bird
            </span>
          </div>
          <div className="h-16 w-14 rotate-3 rounded-[6px] bg-white p-1 shadow-sm sm:h-[4.5rem] sm:w-16">
            <div className="flex h-full w-full flex-col items-center justify-end rounded-[4px] border-2 border-dashed border-white bg-lavender/90 pb-0.5 shadow-[inset_0_0_0_1px_oklch(0.75_0.1_305)]">
              <Mascot kind={mascot} mood="idle" className="h-10 w-10" />
            </div>
          </div>
        </div>

        </div>

        <motion.div
          className="absolute inset-x-0 top-0 z-40 h-[58%] origin-top bg-[linear-gradient(180deg,#ffb9cc_0%,#ffadc3_100%)] shadow-[0_10px_20px_-14px_rgba(120,40,70,0.5)] [clip-path:polygon(0_0,100%_0,50%_100%)]"
          initial={{ rotateX: 0 }}
          animate={opening ? { rotateX: 180 } : { rotateX: 0 }}
          transition={{ delay: opening ? 0.3 : 0, duration: 0.8, ease: EASE_SOFT }}
          style={{ transformStyle: "preserve-3d", zIndex: opening ? 15 : 40 }}
        />

        <motion.div
          className="absolute left-1/2 top-[58%] z-50 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff7fa3_0%,#e94d78_55%,#c93a62_100%)] text-3xl text-white shadow-[0_10px_24px_-8px_rgba(201,58,98,0.7),inset_0_-3px_6px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.45)]"
          animate={opening ? { scale: [1, 1.2, 0], rotate: [0, 12, 40], opacity: [1, 1, 0] } : { scale: [1, 1.06, 1] }}
          transition={opening ? { duration: 0.5 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="drop-shadow-sm">♥</span>
        </motion.div>
      </motion.button>

      <motion.p
        animate={{ opacity: opening ? 0 : [0.55, 1, 0.55] }}
        transition={{ duration: 2.2, repeat: opening ? 0 : Infinity }}
        className="text-sm font-semibold text-muted-foreground"
      >
        Tap the seal to open
      </motion.p>
    </div>
  );
}
