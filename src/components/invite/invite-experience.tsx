"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FloatingHearts } from "@/components/floating-hearts";
import { Mascot } from "@/components/mascots";
import { Petals } from "@/components/petals";
import { Sparkles } from "@/components/sparkles";
import { Button } from "@/components/ui/button";
import { celebrate } from "@/lib/confetti";
import { EASE_SOFT, gentleSlow } from "@/lib/motion";
import type { PublicInvite, Slot } from "@/lib/schemas";
import { AskQuestion } from "./ask-question";
import { DetailsWizard } from "./details-wizard";
import { Envelope } from "./envelope";
import { ItsADate } from "./its-a-date";

type Stage = "letter" | "ask" | "yay" | "details" | "done";

const YAY_LINES = ["YESSS!!!", "They said yes!!", "Okay okay okay breathe", "Best. Day. Ever."];
const YAY_MS = 4600;

export function InviteExperience({ invite }: { invite: PublicInvite }) {
  const [stage, setStage] = useState<Stage>(invite.answered ? "done" : "letter");
  const [noAttempts, setNoAttempts] = useState(0);
  const [chosenSlots, setChosenSlots] = useState<Slot[]>(invite.chosenSlots ?? []);
  const yayLine = YAY_LINES[noAttempts % YAY_LINES.length];

  useEffect(() => {
    if (stage !== "yay") return;
    celebrate();
    const t = setTimeout(() => setStage("details"), YAY_MS);
    return () => clearTimeout(t);
  }, [stage]);

  const festive = stage === "yay" || stage === "done";

  return (
    <>
      <Petals count={festive ? 30 : 14} />
      {festive && <FloatingHearts />}
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {stage === "letter" && (
            <motion.div key="letter" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <Envelope
                recipientName={invite.recipientName}
                senderName={invite.senderName}
                mascot={invite.mascot}
                onOpened={() => setStage("ask")}
              />
            </motion.div>
          )}

          {stage === "ask" && (
            <motion.div
              key="ask"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.35 } }}
              transition={gentleSlow}
              className="card-cute relative w-full max-w-xl p-6 sm:p-10"
            >
              <Sparkles count={5} className="-inset-3" />
              <AskQuestion
                recipientName={invite.recipientName}
                senderName={invite.senderName}
                message={invite.message}
                mascot={invite.mascot}
                onYes={(n) => {
                  setNoAttempts(n);
                  setStage("yay");
                }}
              />
            </motion.div>
          )}

          {stage === "yay" && (
            <motion.div
              key="yay"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -30, transition: { duration: 0.4 } }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <Mascot kind={invite.mascot} mood="happy" className="h-56 w-56 sm:h-64 sm:w-64" />
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: EASE_SOFT }}
                className="font-display text-5xl font-semibold text-primary sm:text-6xl"
              >
                {yayLine}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="max-w-sm text-lg text-muted-foreground"
              >
                {noAttempts === 0
                  ? `Straight to Yes. ${invite.senderName} is going to be unbearable about this.`
                  : `After only ${noAttempts} attempt${noAttempts === 1 ? "" : "s"} at No. We'll keep that between us.`}
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}>
                <Button className="mt-2 rounded-full" onClick={() => setStage("details")}>
                  Let&apos;s plan it
                </Button>
              </motion.div>
            </motion.div>
          )}

          {stage === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}
              transition={gentleSlow}
              className="flex w-full justify-center"
            >
              <DetailsWizard
                invite={invite}
                noAttempts={noAttempts}
                onDone={(r) => {
                  setChosenSlots(r.chosenSlots);
                  celebrate();
                  setStage("done");
                }}
              />
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div key="done" className="flex w-full justify-center">
              <ItsADate
                mascot={invite.mascot}
                recipientName={invite.recipientName}
                senderName={invite.senderName}
                chosenSlots={chosenSlots}
                alreadyAnswered={invite.answered}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
