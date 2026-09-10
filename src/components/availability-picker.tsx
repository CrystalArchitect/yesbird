"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { Chip } from "@/components/chip";
import { formatDay, parseISODate, upcomingDays } from "@/lib/dates";
import { TIMES, type TimeId } from "@/lib/options";
import type { Slot } from "@/lib/schemas";
import { useIsClient } from "@/lib/use-is-client";
import { cn } from "@/lib/utils";

const DEFAULT_TIMES: TimeId[] = ["dinner"];

export function AvailabilityPicker({
  value,
  onChange,
}: {
  value: Slot[];
  onChange: (slots: Slot[]) => void;
}) {
  // Only computed in the browser so the server's clock/timezone never disagrees with the user's.
  const isClient = useIsClient();
  const days = useMemo(() => (isClient ? upcomingDays(21) : []), [isClient]);

  const selected = new Map(value.map((s) => [s.date, s]));

  const toggleDay = (date: string) => {
    if (selected.has(date)) {
      onChange(value.filter((s) => s.date !== date));
    } else {
      const lastTimes = value.at(-1)?.times ?? DEFAULT_TIMES;
      onChange([...value, { date, times: [...lastTimes] }].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };

  const toggleTime = (date: string, time: TimeId) => {
    onChange(
      value.map((s) => {
        if (s.date !== date) return s;
        const has = s.times.includes(time);
        const times = has ? s.times.filter((t) => t !== time) : [...s.times, time];
        return { ...s, times: TIMES.map((t) => t.id).filter((t) => times.includes(t)) };
      }),
    );
  };

  const applyToAll = (times: TimeId[]) => onChange(value.map((s) => ({ ...s, times: [...times] })));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.length === 0
          ? Array.from({ length: 21 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-blush/40" />
            ))
          : days.map((iso) => {
              const d = parseISODate(iso);
              const on = selected.has(iso);
              const weekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDay(iso)}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center rounded-2xl border text-xs font-semibold transition-all active:scale-95",
                    on
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_oklch(0.7_0.18_5)]"
                      : "border-primary/15 bg-white/70 hover:border-primary/40 hover:bg-blush/40",
                    !on && weekend && "text-primary",
                  )}
                >
                  <span className="uppercase opacity-80">
                    {d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3)}
                  </span>
                  <span className="font-display text-lg leading-tight">{d.getDate()}</span>
                  <span className="opacity-70">{d.toLocaleDateString(undefined, { month: "short" })}</span>
                </button>
              );
            })}
      </div>

      <AnimatePresence initial={false}>
        {value.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-butter/60 px-4 py-3 text-sm text-accent-foreground"
          >
            Tap the days you could do. Weekends are highlighted, because we know.
          </motion.p>
        ) : (
          <motion.div key="list" layout className="space-y-3">
            {value.map((slot) => (
              <motion.div
                key={slot.date}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-3xl bg-white/70 p-4 ring-1 ring-primary/10"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display font-semibold">{formatDay(slot.date)}</span>
                  <button
                    type="button"
                    onClick={() => toggleDay(slot.date)}
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TIMES.map((t) => (
                    <Chip
                      key={t.id}
                      selected={slot.times.includes(t.id)}
                      onClick={() => toggleTime(slot.date, t.id)}
                    >
                      <span aria-hidden>{t.emoji}</span> {t.label}
                      <span className="text-[11px] font-medium opacity-70">{t.hint}</span>
                    </Chip>
                  ))}
                </div>
                {slot.times.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-destructive">Pick at least one time for this day.</p>
                )}
              </motion.div>
            ))}
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => applyToAll(value[0].times)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Use {formatDay(value[0].date)}&apos;s times for every day
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
