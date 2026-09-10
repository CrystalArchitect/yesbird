"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function Envelope({
  recipientName,
  senderName,
  onOpened,
}: {
  recipientName: string;
  senderName: string;
  onOpened: () => void;
}) {
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpened, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">A letter arrived</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">For {recipientName}</h1>
        <p className="mt-1 text-muted-foreground">from {senderName}</p>
      </div>

      <motion.button
        type="button"
        onClick={open}
        aria-label="Open the letter"
        className="relative h-56 w-80 max-w-full select-none focus-visible:outline-none sm:h-64 sm:w-96"
        animate={opening ? { y: 40, opacity: 0, scale: 0.9 } : { y: [0, -6, 0] }}
        transition={
          opening
            ? { delay: 1.1, duration: 0.5 }
            : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ perspective: 900 }}
      >
        <div className="absolute inset-0 rounded-3xl bg-[#ffd6e0] shadow-[0_30px_60px_-30px_oklch(0.7_0.18_5/0.6)] ring-1 ring-primary/20" />

        <motion.div
          className="absolute inset-x-5 top-4 z-10 rounded-2xl bg-white p-5 text-left shadow-md ring-1 ring-primary/10"
          initial={{ y: 40, height: "60%" }}
          animate={opening ? { y: -150, height: "88%" } : { y: 40 }}
          transition={{ delay: opening ? 0.45 : 0, duration: 0.8, ease: "easeOut" }}
        >
          <div className="h-2.5 w-2/3 rounded-full bg-blush" />
          <div className="mt-3 h-2 w-full rounded-full bg-blush/70" />
          <div className="mt-2 h-2 w-11/12 rounded-full bg-blush/70" />
          <div className="mt-2 h-2 w-3/4 rounded-full bg-blush/70" />
          <div className="mt-4 font-display text-2xl text-primary">♡</div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 z-20 h-[62%] overflow-hidden rounded-b-3xl">
          <div className="absolute -left-1/4 bottom-0 h-full w-3/4 origin-bottom-right -skew-x-[30deg] bg-[#ffc4d4]" />
          <div className="absolute -right-1/4 bottom-0 h-full w-3/4 origin-bottom-left skew-x-[30deg] bg-[#ffc4d4]" />
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[#ffcdd9] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
        </div>

        <motion.div
          className="absolute inset-x-0 top-0 z-30 h-[55%] origin-top bg-[#ffb8cb] [clip-path:polygon(0_0,100%_0,50%_100%)]"
          initial={{ rotateX: 0 }}
          animate={opening ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "visible" }}
        />

        <motion.div
          className="absolute left-1/2 top-[50%] z-40 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-2xl text-white shadow-lg"
          animate={opening ? { scale: 0, rotate: 90 } : { scale: [1, 1.08, 1] }}
          transition={opening ? { duration: 0.3 } : { duration: 1.4, repeat: Infinity }}
        >
          ♥
        </motion.div>
      </motion.button>

      <motion.p
        animate={{ opacity: opening ? 0 : [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="text-sm font-semibold text-muted-foreground"
      >
        Tap the seal to open
      </motion.p>
    </div>
  );
}
