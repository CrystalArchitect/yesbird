"use client";

import { cn } from "@/lib/utils";

export function Chip({
  selected,
  onClick,
  children,
  className,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all select-none",
        "active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_oklch(0.7_0.18_5)]"
          : "border-primary/20 bg-white/70 text-foreground hover:border-primary/50 hover:bg-blush/50",
        className,
      )}
    >
      {children}
    </button>
  );
}
