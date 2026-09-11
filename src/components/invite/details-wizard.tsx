"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "@/components/chip";
import { Mascot } from "@/components/mascots";
import { SpeechBubble } from "@/components/stickers";
import { TextArea, TextInput } from "@/components/text-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sparkle } from "@/lib/confetti";
import { EASE_SOFT } from "@/lib/motion";
import { formatDay, isPast } from "@/lib/dates";
import {
  CONTACT_METHODS,
  CONTACT_REACTIONS,
  FOODS,
  FOOD_REACTIONS,
  INTERESTS,
  INTEREST_REACTIONS,
  TIMES,
  TIME_BY_ID,
  TIME_REACTIONS,
  type ContactMethod,
  type Mascot as MascotKind,
  type TimeId,
} from "@/lib/options";
import { responseSchema, type PublicInvite, type ResponseInput, type Slot } from "@/lib/schemas";

const STEPS = [
  { title: "When works for you?", hint: "I'm free on these days. Tap every time you could do." },
  { title: "What are you craving?", hint: "So I can pick a place you'll actually love." },
  { title: "Little things about you", hint: "For the part of the date after the food." },
  { title: "How should I reach you?", hint: "This stays between us. Promise." },
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function DetailsWizard({
  invite,
  noAttempts,
  preview = false,
  onDone,
}: {
  invite: PublicInvite;
  noAttempts: number;
  /** The asker looking at their own invitation: nothing is saved. */
  preview?: boolean;
  onDone: (response: ResponseInput) => void;
}) {
  const [step, setStep] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Days that have already gone by can't be picked. If none are left, they can still say yes;
  // the asker is told to sort out a new day.
  const openSlots = useMemo(() => invite.slots.filter((s) => !isPast(s.date)), [invite.slots]);
  const nothingLeft = openSlots.length === 0;

  useEffect(() => () => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
  }, []);

  const react = (line: string, selected: boolean) => {
    if (!selected) return;
    setReaction(line);
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setReaction(null), 3800);
  };
  const [chosen, setChosen] = useState<Slot[]>([]);
  const [foods, setFoods] = useState<string[]>([]);
  const [placeIdeas, setPlaceIdeas] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("text");
  const [contactHandle, setContactHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const chosenMap = new Map(chosen.map((s) => [s.date, s.times]));

  const toggleTime = (date: string, time: TimeId) => {
    const current = chosenMap.get(date) ?? [];
    const times = toggle(current, time);
    const next = chosen.filter((s) => s.date !== date);
    if (times.length) next.push({ date, times: TIMES.map((t) => t.id).filter((t) => times.includes(t)) });
    setChosen(next.sort((a, b) => a.date.localeCompare(b.date)));
    react(TIME_REACTIONS[time], !current.includes(time));
  };

  const selectEverything = () => {
    setChosen(openSlots.map((s) => ({ date: s.date, times: [...s.times] })));
    react("All of them?! My calendar is blushing.", true);
  };
  const totalChosen = chosen.reduce((n, s) => n + s.times.length, 0);

  const canContinue = [totalChosen > 0 || nothingLeft, true, true, phone.trim().length >= 6][step];

  const goTo = (s: number) => {
    setError(null);
    setReaction(null);
    setStep(s);
  };

  const next = () => {
    if (!canContinue) return;
    sparkle(0.5, 0.35);
    goTo(step + 1);
  };

  const submit = async () => {
    setError(null);
    const parsed = responseSchema.safeParse({
      chosenSlots: chosen,
      foods,
      placeIdeas,
      interests,
      notes,
      phone,
      email,
      contactMethod,
      contactHandle,
      noAttempts,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Something's missing");
      return;
    }
    if (preview) {
      onDone(parsed.data);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invites/${invite.id}/response`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Couldn't send your answer");
      }
      onDone(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your answer");
      setSubmitting(false);
    }
  };

  const mascot: MascotKind = invite.mascot;

  return (
    <div className="card-cute w-full max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Mascot
            kind={mascot}
            mood={reaction || step === 3 ? "love" : "happy"}
            className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
          />
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold leading-tight sm:text-2xl">{STEPS[step].title}</h2>
            <div className="mt-1.5">
              <SpeechBubble text={reaction ?? STEPS[step].hint} tone={reaction ? "loud" : "soft"} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <motion.span
              key={i}
              animate={{ scale: i === step ? 1.35 : 1, color: i <= step ? "#f0668a" : "#f5c3d2" }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="text-lg leading-none"
              aria-hidden
            >
              ♥
            </motion.span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 36, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -36, filter: "blur(4px)", transition: { duration: 0.3 } }}
          transition={{ duration: 0.55, ease: EASE_SOFT }}
        >
          {step === 0 && nothingLeft && (
            <div className="rounded-3xl bg-butter/60 p-5 text-sm text-accent-foreground">
              <p className="font-display text-base font-semibold">The days I offered have already flown by.</p>
              <p className="mt-1">
                That&apos;s on me. Say yes anyway and I&apos;ll reach out so we can find a new one together.
              </p>
            </div>
          )}

          {step === 0 && !nothingLeft && (
            <div className="space-y-3">
              {openSlots.map((slot) => (
                <div key={slot.date} className="rounded-3xl bg-white/70 p-4 ring-1 ring-primary/10">
                  <div className="mb-2 font-display font-semibold">{formatDay(slot.date)}</div>
                  <div className="flex flex-wrap gap-2">
                    {slot.times.map((t) => (
                      <Chip
                        key={t}
                        selected={chosenMap.get(slot.date)?.includes(t) ?? false}
                        onClick={() => toggleTime(slot.date, t)}
                      >
                        <span aria-hidden>{TIME_BY_ID[t].emoji}</span> {TIME_BY_ID[t].label}
                        <span className="text-[11px] font-medium opacity-70">{TIME_BY_ID[t].hint}</span>
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={selectEverything}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Honestly, any of these work ✨
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {FOODS.map((f) => (
                  <Chip
                    key={f}
                    selected={foods.includes(f)}
                    onClick={() => {
                      setFoods(toggle(foods, f));
                      react(FOOD_REACTIONS[f], !foods.includes(f));
                    }}
                  >
                    {f}
                  </Chip>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="places">A place you&apos;ve wanted to try? Anything you can&apos;t eat?</Label>
                <TextArea
                  id="places"
                  value={placeIdeas}
                  onChange={(e) => setPlaceIdeas(e.target.value)}
                  placeholder="That tiny ramen spot by the station… also I'm allergic to shrimp."
                  maxLength={300}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <Chip
                    key={i}
                    selected={interests.includes(i)}
                    onClick={() => {
                      setInterests(toggle(interests, i));
                      react(INTEREST_REACTIONS[i], !interests.includes(i));
                    }}
                  >
                    {i}
                  </Chip>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Anything else I should know?</Label>
                <TextArea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Favourite flower, how you take your coffee, whether you cry at movies (you do)."
                  maxLength={500}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <TextInput
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 010 2030"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email (optional)</Label>
                  <TextInput
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@somewhere.com"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Best way to reach you</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_METHODS.map((c) => (
                    <Chip
                      key={c.id}
                      selected={contactMethod === c.id}
                      onClick={() => {
                        setContactMethod(c.id);
                        react(CONTACT_REACTIONS[c.id], contactMethod !== c.id);
                      }}
                    >
                      <span aria-hidden>{c.emoji}</span> {c.label}
                    </Chip>
                  ))}
                </div>
              </div>
              {contactMethod === "instagram" && (
                <div className="space-y-1.5">
                  <Label htmlFor="handle">Your handle</Label>
                  <TextInput
                    id="handle"
                    value={contactHandle}
                    onChange={(e) => setContactHandle(e.target.value)}
                    placeholder="@you"
                  />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          disabled={step === 0 || submitting}
          onClick={() => goTo(step - 1)}
        >
          Back
        </Button>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm font-semibold text-destructive">{error}</span>}
          {step < STEPS.length - 1 ? (
            <Button type="button" className="h-11 rounded-full px-6" disabled={!canContinue} onClick={next}>
              {step === 0 && totalChosen > 0
                ? `Next · ${totalChosen} time${totalChosen === 1 ? "" : "s"}`
                : step === 0 && nothingLeft
                  ? "Yes anyway"
                  : "Next"}
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 rounded-full px-6"
              disabled={!canContinue || submitting}
              onClick={submit}
            >
              {submitting ? "Sending…" : `Send to ${invite.senderName} 💌`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
