"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Chip } from "@/components/chip";
import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sparkle } from "@/lib/confetti";
import { formatDay } from "@/lib/dates";
import {
  CONTACT_METHODS,
  FOODS,
  INTERESTS,
  TIMES,
  TIME_BY_ID,
  type ContactMethod,
  type Mascot as MascotKind,
  type TimeId,
} from "@/lib/options";
import { responseSchema, type PublicInvite, type ResponseInput, type Slot } from "@/lib/schemas";

const STEPS = [
  { title: "When works for you?", hint: (n: string) => `${n} is free on these days. Tap every time you could do.` },
  { title: "What are you craving?", hint: () => "So they can pick a place you'll actually love." },
  { title: "Little things about you", hint: () => "For the part of the date after the food." },
  { title: "How should they reach you?", hint: (n: string) => `Only ${n} sees this. Promise.` },
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function DetailsWizard({
  invite,
  noAttempts,
  onDone,
}: {
  invite: PublicInvite;
  noAttempts: number;
  onDone: (response: ResponseInput) => void;
}) {
  const [step, setStep] = useState(0);
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
  };

  const selectEverything = () => setChosen(invite.slots.map((s) => ({ date: s.date, times: [...s.times] })));
  const totalChosen = chosen.reduce((n, s) => n + s.times.length, 0);

  const canContinue = [totalChosen > 0, true, true, phone.trim().length >= 6][step];

  const next = () => {
    setError(null);
    if (!canContinue) return;
    sparkle(0.5, 0.35);
    setStep((s) => s + 1);
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mascot kind={mascot} mood={step === 3 ? "love" : "happy"} className="h-16 w-16" />
          <div>
            <h2 className="font-display text-xl font-semibold leading-tight sm:text-2xl">{STEPS[step].title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[step].hint(invite.senderName)}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <span key={i} className={i <= step ? "text-primary" : "text-primary/25"} aria-hidden>
              ♥
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="space-y-3">
              {invite.slots.map((slot) => (
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
                  <Chip key={f} selected={foods.includes(f)} onClick={() => setFoods(toggle(foods, f))}>
                    {f}
                  </Chip>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="places">A place you&apos;ve wanted to try? Anything you can&apos;t eat?</Label>
                <Textarea
                  id="places"
                  value={placeIdeas}
                  onChange={(e) => setPlaceIdeas(e.target.value)}
                  placeholder="That tiny ramen spot by the station… also I'm allergic to shrimp."
                  maxLength={300}
                  rows={3}
                  className="rounded-2xl bg-white/80 text-base"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <Chip key={i} selected={interests.includes(i)} onClick={() => setInterests(toggle(interests, i))}>
                    {i}
                  </Chip>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Anything else they should know?</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Favourite flower, how you take your coffee, whether you cry at movies (you do)."
                  maxLength={500}
                  rows={3}
                  className="rounded-2xl bg-white/80 text-base"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 010 2030"
                    className="h-11 rounded-2xl bg-white/80"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@somewhere.com"
                    className="h-11 rounded-2xl bg-white/80"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Best way to reach you</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_METHODS.map((c) => (
                    <Chip key={c.id} selected={contactMethod === c.id} onClick={() => setContactMethod(c.id)}>
                      <span aria-hidden>{c.emoji}</span> {c.label}
                    </Chip>
                  ))}
                </div>
              </div>
              {contactMethod === "instagram" && (
                <div className="space-y-1.5">
                  <Label htmlFor="handle">Your handle</Label>
                  <Input
                    id="handle"
                    value={contactHandle}
                    onChange={(e) => setContactHandle(e.target.value)}
                    placeholder="@you"
                    className="h-11 rounded-2xl bg-white/80"
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
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm font-semibold text-destructive">{error}</span>}
          {step < STEPS.length - 1 ? (
            <Button type="button" className="h-11 rounded-full px-6" disabled={!canContinue} onClick={next}>
              {step === 0 && totalChosen > 0
                ? `Next · ${totalChosen} time${totalChosen === 1 ? "" : "s"}`
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
