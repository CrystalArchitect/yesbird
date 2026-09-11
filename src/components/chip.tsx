"use client";

import { motion } from "framer-motion";
import { bouncy } from "@/lib/motion";
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
    <motion.button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      animate={{ scale: selected ? 1.04 : 1 }}
      transition={bouncy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold select-none",
        "transition-[background-color,border-color,color,box-shadow] duration-300 ease-out",
        "disabled:opacity-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_22px_-10px_oklch(0.7_0.18_5)]"
          : "border-primary/20 bg-white/70 text-foreground hover:border-primary/50 hover:bg-blush/50",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
