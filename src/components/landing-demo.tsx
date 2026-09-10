"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { AskQuestion } from "@/components/invite/ask-question";
import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";
import { celebrate } from "@/lib/confetti";

export function LandingDemo() {
  const [saidYes, setSaidYes] = useState<number | null>(null);

  return (
    <div className="card-cute relative mx-auto w-full max-w-xl overflow-hidden p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {saidYes === null ? (
          <motion.div key="ask" exit={{ opacity: 0, scale: 0.96 }}>
            <AskQuestion
              recipientName="Hey you"
              senderName="Yesbird"
              message="Try pressing No. Go on."
              mascot="bunny"
              compact
              onYes={(n) => {
                celebrate();
                setSaidYes(n);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="yay"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-4 text-center"
          >
            <Mascot kind="bunny" mood="happy" className="h-32 w-32" />
            <h3 className="font-display text-2xl font-semibold">See? Works every time.</h3>
            <p className="max-w-sm text-muted-foreground">
              {saidYes === 0
                ? "Straight to Yes. Someone's confident."
                : `${saidYes} attempt${saidYes === 1 ? "" : "s"} at No. The bunny forgives you.`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setSaidYes(null)}
              >
                Try again
              </Button>
              <Button className="rounded-full" nativeButton={false} render={<Link href="/create" />}>
                Make mine
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
