"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Mascot } from "@/components/mascots";
import { Petals } from "@/components/petals";
import { Button } from "@/components/ui/button";
import { celebrate } from "@/lib/confetti";
import type { PublicInvite, Slot } from "@/lib/schemas";
import { AskQuestion } from "./ask-question";
import { DetailsWizard } from "./details-wizard";
import { Envelope } from "./envelope";
import { ItsADate } from "./its-a-date";

type Stage = "letter" | "ask" | "yay" | "details" | "done";

const YAY_LINES = [
  "YESSS!!!",
  "They said yes!!",
  "Okay okay okay breathe",
  "Best. Day. Ever.",
];

export function InviteExperience({ invite }: { invite: PublicInvite }) {
  const [stage, setStage] = useState<Stage>(invite.answered ? "done" : "letter");
  const [noAttempts, setNoAttempts] = useState(0);
  const [chosenSlots, setChosenSlots] = useState<Slot[]>(invite.chosenSlots ?? []);
  const yayLine = YAY_LINES[noAttempts % YAY_LINES.length];

  useEffect(() => {
    if (stage !== "yay") return;
    celebrate();
    const t = setTimeout(() => setStage("details"), 3200);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <>
      <Petals count={stage === "yay" || stage === "done" ? 30 : 14} />
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {stage === "letter" && (
            <motion.div key="letter" exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
              <Envelope
                recipientName={invite.recipientName}
                senderName={invite.senderName}
                onOpened={() => setStage("ask")}
              />
            </motion.div>
          )}

          {stage === "ask" && (
            <motion.div
              key="ask"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card-cute w-full max-w-xl p-6 sm:p-10"
            >
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
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <Mascot kind={invite.mascot} mood="happy" className="h-56 w-56 sm:h-64 sm:w-64" />
              <h1 className="font-display text-5xl font-semibold text-primary sm:text-6xl">{yayLine}</h1>
              <p className="max-w-sm text-lg text-muted-foreground">
                {noAttempts === 0
                  ? `Straight to Yes. ${invite.senderName} is going to be unbearable about this.`
                  : `After only ${noAttempts} attempt${noAttempts === 1 ? "" : "s"} at No. We'll keep that between us.`}
              </p>
              <Button className="mt-2 rounded-full" onClick={() => setStage("details")}>
                Let&apos;s plan it
              </Button>
            </motion.div>
          )}

          {stage === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
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
