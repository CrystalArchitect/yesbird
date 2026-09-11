import type { Transition } from "framer-motion";

/** One shared feel for the whole app: unhurried, soft, a little bouncy. */
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

export const gentle: Transition = { duration: 0.55, ease: EASE_SOFT };
export const gentleSlow: Transition = { duration: 0.8, ease: EASE_SOFT };
export const springy: Transition = { type: "spring", stiffness: 260, damping: 22, mass: 0.9 };
export const bouncy: Transition = { type: "spring", stiffness: 380, damping: 16 };

export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
