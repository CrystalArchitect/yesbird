"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AvailabilityPicker } from "@/components/availability-picker";
import { Chip } from "@/components/chip";
import { Mascot } from "@/components/mascots";
import { TextArea, TextInput } from "@/components/text-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  MASCOTS,
  MASCOT_META,
  MESSAGE_IDEAS,
  VIBES,
  type Mascot as MascotKind,
  type Vibe,
} from "@/lib/options";
import { createInviteSchema, type Slot } from "@/lib/schemas";
import { isPast } from "@/lib/dates";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "yesbird:draft:v1";

type Draft = {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  message: string;
  mascot: MascotKind;
  vibe?: Vibe;
  slots: Slot[];
};

const EMPTY: Draft = {
  senderName: "",
  senderEmail: "",
  recipientName: "",
  message: "",
  mascot: "bunny",
  vibe: undefined,
  slots: [],
};

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    const draft: Draft = {
      ...EMPTY,
      ...parsed,
      mascot: MASCOTS.includes(parsed.mascot as MascotKind) ? (parsed.mascot as MascotKind) : "bunny",
      slots: Array.isArray(parsed.slots) ? parsed.slots.filter((s) => s?.date && !isPast(s.date)) : [],
    };
    const hasContent =
      draft.senderName || draft.recipientName || draft.message || draft.slots.length > 0 || draft.vibe;
    return hasContent ? draft : null;
  } catch {
    return null;
  }
}

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
    <section
      className="card-cute animate-in fade-in slide-in-from-bottom-3 fill-mode-both p-6 duration-500 sm:p-8"
      style={{ animationDelay: `${step * 70}ms` }}
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
    </section>
  );
}

export function CreateForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hydrated = useRef(false);

  // Restore an unfinished invitation after a reload, then keep saving as they type.
  useEffect(() => {
    const saved = readDraft();
    if (saved) {
      // localStorage is browser-only, so the draft can't be the initial state without a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(saved);
      setRestored(true);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Private mode or full storage: drafts are a convenience, not a requirement.
    }
  }, [draft]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const startOver = () => {
    setDraft(EMPTY);
    setRestored(false);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  };

  const previewName = draft.recipientName.trim() || "them";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = createInviteSchema.safeParse(draft);
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
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      router.push(`/nest/${data.manageKey}?fresh=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your invitation");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {restored && (
        <div className="flex items-center justify-between gap-3 rounded-3xl bg-butter/70 px-4 py-3 text-sm text-accent-foreground ring-1 ring-accent-foreground/10 animate-in fade-in">
          <span>
            <strong className="font-display">Picked up where you left off.</strong> Your draft was saved.
          </span>
          <button type="button" onClick={startOver} className="shrink-0 font-semibold hover:underline">
            Start over
          </button>
        </div>
      )}

      <Section step={1} title="Who's asking, and who's the lucky one?">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sender">Your name</Label>
            <TextInput
              id="sender"
              name="senderName"
              value={draft.senderName}
              onChange={(e) => update("senderName", e.target.value)}
              placeholder="Minho"
              maxLength={40}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Their name</Label>
            <TextInput
              id="recipient"
              name="recipientName"
              value={draft.recipientName}
              onChange={(e) => update("recipientName", e.target.value)}
              placeholder="Ji-woo"
              maxLength={40}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="senderEmail">
              Your email <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <TextInput
              id="senderEmail"
              name="senderEmail"
              type="email"
              inputMode="email"
              value={draft.senderEmail}
              onChange={(e) => update("senderEmail", e.target.value)}
              placeholder="you@example.com"
              maxLength={120}
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              The moment they say yes, we email you the times and everything they shared. Never shown to them.
            </p>
          </div>
        </div>
      </Section>

      <Section step={2} title="Pick who does the asking" hint="They cry a little when No is hovered. Very cute about it.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {MASCOTS.map((m) => {
            const on = draft.mascot === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => update("mascot", m)}
                className={cn(
                  "flex flex-col items-center rounded-3xl border-2 p-3 text-center transition-all duration-500 ease-out active:scale-[0.98]",
                  on
                    ? "border-primary bg-blush/40 shadow-[0_14px_30px_-16px_oklch(0.7_0.18_5)]"
                    : "border-transparent bg-white/60 hover:bg-blush/30",
                )}
              >
                <Mascot kind={m} mood={on ? "love" : "idle"} className="h-24 w-24 sm:h-[6.5rem] sm:w-[6.5rem]" />
                <span className="mt-1 font-display text-sm font-semibold leading-tight">{MASCOT_META[m].label}</span>
                <span className="mt-1 text-[11px] leading-snug text-muted-foreground">{MASCOT_META[m].blurb}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section step={3} title="Say something sweet" hint="Optional, but this is the part they'll screenshot.">
        <TextArea
          id="message"
          name="message"
          value={draft.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder={`${previewName === "them" ? "Hey" : previewName}, I've been meaning to ask…`}
          maxLength={400}
          rows={3}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {MESSAGE_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => update("message", idea)}
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
              <Chip
                key={v.id}
                selected={draft.vibe === v.id}
                onClick={() => update("vibe", draft.vibe === v.id ? undefined : v.id)}
              >
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
        <AvailabilityPicker value={draft.slots} onChange={(slots) => update("slots", slots)} />
      </Section>

      <div className="card-cute sticky bottom-4 flex flex-col items-center gap-3 p-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {error ? (
            <span className="font-semibold text-destructive">{error}</span>
          ) : (
            <>You&apos;ll get a private link to watch for {previewName}&apos;s answer.</>
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
