import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full min-w-0 rounded-2xl border border-input bg-white/80 px-4 text-base text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive";

export function TextInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(base, "h-11", className)} {...props} />;
}

export function TextArea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(base, "min-h-20 resize-y py-2.5 leading-relaxed", className)} {...props} />;
}
