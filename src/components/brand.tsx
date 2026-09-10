import Link from "next/link";
import { cn } from "@/lib/utils";

export function BirdMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="30" cy="36" r="20" fill="#ffb3c7" />
      <ellipse cx="33" cy="42" rx="11" ry="10" fill="#fff0f4" />
      <path d="M 48 34 l 9 3 l -9 3 z" fill="#ffb86b" />
      <circle cx="37" cy="31" r="2.6" fill="#3b2233" />
      <circle cx="38" cy="30" r="0.9" fill="#fff" />
      <path d="M 12 30 q -8 4 -9 14 q 8 -5 15 -2 z" fill="#ffb3c7" />
      <path d="M 26 16 q 4 -8 9 -2 q -5 -2 -9 2z" fill="#ffb3c7" />
      <path
        transform="translate(38 6) scale(0.8)"
        d="M12 21s-7.5-4.8-9.6-9.1C.7 8.3 2.6 4 6.6 4c2.1 0 3.6 1.2 5.4 3.1C13.8 5.2 15.3 4 17.4 4c4 0 5.9 4.3 4.2 7.9C19.5 16.2 12 21 12 21z"
        fill="#f0668a"
      />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 font-display text-2xl font-semibold text-foreground", className)}
    >
      <BirdMark />
      <span>
        Yes<span className="text-primary">bird</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
      <Brand />
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}
