"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvailabilityPicker } from "@/components/availability-picker";
import { Chip } from "@/components/chip";
import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MASCOTS,
  MASCOT_META,
  MESSAGE_IDEAS,
  VIBES,
  type Mascot as MascotKind,
  type Vibe,
} from "@/lib/options";
import { createInviteSchema, type Slot } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="card-cute p-6 sm:p-8"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
          {step}
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight">{title}</h2>
          {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export function CreateForm() {
  const router = useRouter();
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [mascot, setMascot] = useState<MascotKind>("bunny");
  const [vibe, setVibe] = useState<Vibe | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const previewName = recipientName.trim() || "them";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = createInviteSchema.safeParse({
      senderName,
      recipientName,
      message,
      mascot,
      vibe,
      slots,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Something's missing");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { manageKey?: string; error?: string };
      if (!res.ok || !data.manageKey) throw new Error(data.error ?? "Couldn't save your invitation");
      router.push(`/nest/${data.manageKey}?fresh=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your invitation");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section step={1} title="Who's asking, and who's the lucky one?">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sender">Your name</Label>
            <Input
              id="sender"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Minho"
              maxLength={40}
              className="h-11 rounded-2xl bg-white/80"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Their name</Label>
            <Input
              id="recipient"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Ji-woo"
              maxLength={40}
              className="h-11 rounded-2xl bg-white/80"
              required
            />
          </div>
        </div>
      </Section>

      <Section step={2} title="Pick who does the asking" hint="They'll get sad when No is hovered. Very sad.">
        <div className="grid gap-3 sm:grid-cols-3">
          {MASCOTS.map((m) => {
            const on = mascot === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => setMascot(m)}
                className={cn(
                  "flex flex-col items-center rounded-3xl border-2 p-4 text-center transition-all active:scale-[0.98]",
                  on
                    ? "border-primary bg-blush/40 shadow-[0_14px_30px_-16px_oklch(0.7_0.18_5)]"
                    : "border-transparent bg-white/60 hover:bg-blush/30",
                )}
              >
                <Mascot kind={m} mood={on ? "love" : "idle"} className="h-28 w-28" />
                <span className="mt-1 font-display font-semibold">{MASCOT_META[m].label}</span>
                <span className="text-xs text-muted-foreground">{MASCOT_META[m].blurb}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section step={3} title="Say something sweet" hint="Optional, but this is the part they'll screenshot.">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`${previewName === "them" ? "Hey" : previewName}, I've been meaning to ask…`}
          maxLength={400}
          rows={3}
          className="rounded-2xl bg-white/80 text-base"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {MESSAGE_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => setMessage(idea)}
              className="rounded-full bg-lavender/60 px-3 py-1 text-left text-xs font-semibold text-secondary-foreground hover:bg-lavender"
            >
              {idea}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <Label className="mb-2 block">What kind of date? (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Chip key={v.id} selected={vibe === v.id} onClick={() => setVibe(vibe === v.id ? undefined : v.id)}>
                <span aria-hidden>{v.emoji}</span> {v.label}
              </Chip>
            ))}
          </div>
        </div>
      </Section>

      <Section
        step={4}
        title="When are you free?"
        hint="They'll pick from these. Offer a few so it's easy to say yes."
      >
        <AvailabilityPicker value={slots} onChange={setSlots} />
      </Section>

      <div className="card-cute sticky bottom-4 flex flex-col items-center gap-3 p-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {error ? (
            <span className="font-semibold text-destructive">{error}</span>
          ) : (
            <>
              You&apos;ll get a private link to watch for {previewName}&apos;s answer.
            </>
          )}
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-12 w-full rounded-full px-8 text-base sm:w-auto"
        >
          {submitting ? "Sealing the letter…" : "Create my invitation"}
        </Button>
      </div>
    </form>
  );
}
