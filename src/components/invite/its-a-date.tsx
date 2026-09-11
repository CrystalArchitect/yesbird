"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mascot } from "@/components/mascots";
import { formatDayLong } from "@/lib/dates";
import { TIME_BY_ID, type Mascot as MascotKind } from "@/lib/options";
import type { Slot } from "@/lib/schemas";

export function ItsADate({
  mascot,
  recipientName,
  senderName,
  chosenSlots,
  alreadyAnswered = false,
}: {
  mascot: MascotKind;
  recipientName: string;
  senderName: string;
  chosenSlots: Slot[];
  alreadyAnswered?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="card-cute w-full max-w-lg overflow-hidden text-center"
    >
      <div className="bg-gradient-to-b from-blush/70 to-transparent px-6 pt-8">
        <Mascot kind={mascot} mood="love" className="mx-auto h-40 w-40" />
      </div>
      <div className="px-6 pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
          {alreadyAnswered ? "You already said yes" : "It's a date"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-balance sm:text-4xl">
          {recipientName} <span className="text-primary">♥</span> {senderName}
        </h1>
        <div className="mx-auto mt-5 max-w-sm rounded-3xl bg-white/80 px-5 py-4 text-left ring-1 ring-primary/10">
          <p className="font-hand text-2xl leading-snug text-foreground">
            {alreadyAnswered
              ? `I've got your answer, ${recipientName}. Nothing left to do but pick an outfit.`
              : `${recipientName}, you just made my whole week. I'll reach out soon to lock in the details. Can't wait.`}
          </p>
          <p className="mt-2 text-right font-hand text-xl text-primary">♡ {senderName}</p>
        </div>

        {chosenSlots.length > 0 && (
          <div className="mt-6 rounded-3xl bg-white/80 p-4 text-left ring-1 ring-primary/10">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Times you said work
            </div>
            <ul className="space-y-1.5">
              {chosenSlots.map((s) => (
                <li key={s.date} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-display font-semibold">{formatDayLong(s.date)}</span>
                  <span className="text-muted-foreground">
                    {s.times.map((t) => TIME_BY_ID[t].label).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Made with{" "}
          <Link href="/" className="font-semibold text-primary hover:underline">
            Yesbird
          </Link>
          . Want to ask someone too?
        </p>
      </div>
    </motion.div>
  );
}
