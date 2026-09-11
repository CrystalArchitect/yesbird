export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function upcomingDays(count: number, startOffset = 1): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + startOffset + i);
    out.push(toISODate(d));
  }
  return out;
}

// The UI copy is English, so dates are too. A fixed locale also keeps the server-rendered
// HTML identical to what the visitor's browser would render, whatever language it is set to.
export const LOCALE = "en-US";

export function formatDay(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return parseISODate(iso).toLocaleDateString(LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...opts,
  });
}

export function formatDayLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString(LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isPast(iso: string): boolean {
  return parseISODate(iso).getTime() < new Date(toISODate(new Date())).getTime();
}
