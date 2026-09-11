import { Mascot } from "@/components/mascots";
import { cn } from "@/lib/utils";

/**
 * A soft "buy me a coffee" nudge. Shown only to the asker (landing, /create, /nest).
 * Never render this on /to/* — that page belongs to the person being asked.
 */
export const TIP_URL = process.env.NEXT_PUBLIC_TIP_URL ?? "https://buymeacoffee.com/xfreeze";

export function TipJar({ className, context = "create" }: { className?: string; context?: "create" | "nest" }) {
  const line =
    context === "nest"
      ? "Fingers crossed for you. If Yesbird made the asking a little easier, a coffee keeps the birds fed."
      : "Yesbird is free and made by one person with a lot of blushing. If it helps you get the yes, a coffee is the nicest thank-you.";

  return (
    <aside
      aria-label="Support Yesbird"
      className={cn(
        "flex items-center gap-4 rounded-3xl bg-white/55 px-4 py-3 ring-1 ring-primary/10 backdrop-blur-sm sm:px-5",
        className,
      )}
    >
      <Mascot kind="bear" mood="love" className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
      <div className="min-w-0 flex-1 text-sm text-muted-foreground">
        <p>{line}</p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">Totally optional. Your date never sees this.</p>
      </div>
      <a
        href={TIP_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-butter px-3.5 py-2 text-sm font-semibold text-accent-foreground ring-1 ring-accent-foreground/10 transition-colors hover:bg-butter/80"
      >
        <span aria-hidden>☕</span> Buy me a coffee
      </a>
    </aside>
  );
}

export function TipLink({ className }: { className?: string }) {
  return (
    <a
      href={TIP_URL}
      target="_blank"
      rel="noreferrer"
      className={cn("font-semibold text-primary/80 underline-offset-4 hover:text-primary hover:underline", className)}
    >
      ☕ Buy me a coffee
    </a>
  );
}
