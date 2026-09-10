"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/mascots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { celebrate } from "@/lib/confetti";
import { formatDay, formatDayLong } from "@/lib/dates";
import { CONTACT_METHODS, TIME_BY_ID, VIBES } from "@/lib/options";
import type { Invite } from "@/lib/schemas";
import { useIsClient } from "@/lib/use-is-client";

const POLL_MS = 8000;

function useShareUrl(id: string) {
  const isClient = useIsClient();
  return isClient ? `${window.location.origin}/to/${id}` : `/to/${id}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      className="rounded-full"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          window.prompt("Copy your link", text);
        }
      }}
    >
      {copied ? "Copied 💗" : "Copy link"}
    </Button>
  );
}

export function NestView({ initial, manageKey, fresh }: { initial: Invite; manageKey: string; fresh: boolean }) {
  const [invite, setInvite] = useState(initial);
  const [showFresh, setShowFresh] = useState(fresh);
  const hadResponse = useRef(Boolean(initial.response));
  const shareUrl = useShareUrl(invite.id);

  useEffect(() => {
    if (invite.response) return;
    const tick = async () => {
      try {
        const res = await fetch(`/api/nest/${manageKey}`, { cache: "no-store" });
        if (!res.ok) return;
        const next = (await res.json()) as Invite;
        if (next.response && !hadResponse.current) {
          hadResponse.current = true;
          celebrate();
        }
        setInvite(next);
      } catch {
        // Offline for a moment; the next tick will try again.
      }
    };
    const t = setInterval(tick, POLL_MS);
    return () => clearInterval(t);
  }, [invite.response, manageKey]);

  const r = invite.response;
  const shareText = `${invite.recipientName}, I made you something. ${shareUrl}`;
  const vibe = VIBES.find((v) => v.id === invite.vibe);

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {showFresh && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-3xl bg-butter/70 p-4 text-accent-foreground ring-1 ring-accent-foreground/10"
          >
            <span className="text-2xl" aria-hidden>
              🔖
            </span>
            <div className="flex-1 text-sm">
              <strong className="font-display text-base">Your letter is sealed.</strong> Bookmark this page — it&apos;s
              the only way to see {invite.recipientName}&apos;s answer. Nobody else can find it.
            </div>
            <button
              type="button"
              onClick={() => setShowFresh(false)}
              className="text-xs font-semibold hover:underline"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="card-cute p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              For {invite.recipientName}
              <span className="text-primary"> ♥</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              from {invite.senderName}
              {vibe && (
                <>
                  {" · "}
                  <span aria-hidden>{vibe.emoji}</span> {vibe.label}
                </>
              )}
            </p>
          </div>
          <Badge className="rounded-full bg-blush px-3 py-1 text-foreground">
            {r ? "Answered" : "Waiting"}
          </Badge>
        </div>

        <div className="mt-5 rounded-3xl bg-blush/30 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Send this link
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-2xl bg-white/80 px-4 py-2.5 text-sm ring-1 ring-primary/10">
              {shareUrl}
            </code>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={shareUrl} />
              <Button variant="outline" className="rounded-full" render={<Link href={`/to/${invite.id}`} target="_blank" />}>
                Preview
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <a
              className="rounded-full bg-white/80 px-3 py-1.5 font-semibold ring-1 ring-primary/10 hover:bg-white"
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              className="rounded-full bg-white/80 px-3 py-1.5 font-semibold ring-1 ring-primary/10 hover:bg-white"
              href={`sms:?&body=${encodeURIComponent(shareText)}`}
            >
              Text message
            </a>
            <a
              className="rounded-full bg-white/80 px-3 py-1.5 font-semibold ring-1 ring-primary/10 hover:bg-white"
              href={`mailto:?subject=${encodeURIComponent("A little something for you")}&body=${encodeURIComponent(shareText)}`}
            >
              Email
            </a>
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {!r ? (
          <motion.section
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="card-cute flex flex-col items-center gap-3 p-8 text-center"
          >
            <Mascot kind={invite.mascot} mood="shy" className="h-36 w-36" />
            <h2 className="font-display text-2xl font-semibold">Waiting for {invite.recipientName}…</h2>
            <p className="max-w-sm text-muted-foreground">
              This page refreshes itself. The moment they say yes, everything they shared shows up right here.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span className="size-2 animate-ping rounded-full bg-primary" /> Listening for a yes
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="answered"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-cute overflow-hidden"
          >
            <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-blush/70 to-transparent px-6 pt-6 text-center">
              <Mascot kind={invite.mascot} mood="love" className="h-32 w-32" />
              <h2 className="font-display text-3xl font-semibold text-primary">
                {invite.recipientName} said yes!
              </h2>
              <p className="text-sm text-muted-foreground">
                {r.noAttempts === 0
                  ? "Didn't even touch the No button."
                  : `After ${r.noAttempts} attempt${r.noAttempts === 1 ? "" : "s"} at No. Cute.`}
                {" · "}
                {new Date(r.respondedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
              <Detail title="Times that work" emoji="🗓️" className="sm:col-span-2">
                <ul className="space-y-1.5">
                  {r.chosenSlots.map((s) => (
                    <li key={s.date} className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display font-semibold">{formatDayLong(s.date)}</span>
                      <span className="text-muted-foreground">
                        {s.times.map((t) => `${TIME_BY_ID[t].label} (${TIME_BY_ID[t].hint})`).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </Detail>

              <Detail title="Reach them" emoji="📱">
                <div className="space-y-1">
                  <a href={`tel:${r.phone}`} className="block font-display text-lg font-semibold text-primary hover:underline">
                    {r.phone}
                  </a>
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="block text-sm hover:underline">
                      {r.email}
                    </a>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Prefers: {CONTACT_METHODS.find((c) => c.id === r.contactMethod)?.label ?? r.contactMethod}
                    {r.contactHandle && ` · ${r.contactHandle}`}
                  </p>
                </div>
              </Detail>

              <Detail title="Craving" emoji="🍜">
                <ChipList items={r.foods} empty="No strong opinions. Dangerous." />
                {r.placeIdeas && <p className="mt-2 text-sm">{r.placeIdeas}</p>}
              </Detail>

              <Detail title="Into" emoji="🎬">
                <ChipList items={r.interests} empty="Kept that a mystery." />
              </Detail>

              <Detail title="Little notes" emoji="📝">
                <p className="text-sm">{r.notes || <span className="text-muted-foreground">Nothing extra. Ask in person.</span>}</p>
              </Detail>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="card-cute p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">What you offered</h2>
        {invite.message && <p className="mt-2 text-muted-foreground">“{invite.message}”</p>}
        <ul className="mt-4 flex flex-wrap gap-2">
          {invite.slots.map((s) => (
            <li key={s.date} className="rounded-2xl bg-white/80 px-3 py-2 text-sm ring-1 ring-primary/10">
              <span className="font-display font-semibold">{formatDay(s.date)}</span>{" "}
              <span className="text-muted-foreground">{s.times.map((t) => TIME_BY_ID[t].label).join(", ")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Detail({
  title,
  emoji,
  children,
  className = "",
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl bg-white/80 p-4 ring-1 ring-primary/10 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span aria-hidden>{emoji}</span> {title}
      </div>
      {children}
    </div>
  );
}

function ChipList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-blush/60 px-2.5 py-1 text-xs font-semibold">
          {i}
        </span>
      ))}
    </div>
  );
}
