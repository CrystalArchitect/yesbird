"use client";

import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import type { Mascot as MascotKind } from "@/lib/options";
import { Blush, Eye, Heart, Mouth, type Mood } from "./face";

export type { Mood };

const OUTLINE = "#e7b8c6";

function Bunny({ mood }: { mood: Mood }) {
  const earTilt = mood === "sad" ? 18 : mood === "happy" ? -6 : 0;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <g transform={`rotate(${-8 + earTilt} 72 70)`}>
        <ellipse cx="72" cy="52" rx="17" ry="46" fill="#fff8fa" stroke={OUTLINE} strokeWidth="3" />
        <ellipse cx="72" cy="56" rx="9" ry="32" fill="#ffc7d6" />
      </g>
      <g transform={`rotate(${8 - earTilt} 128 70)`}>
        <ellipse cx="128" cy="52" rx="17" ry="46" fill="#fff8fa" stroke={OUTLINE} strokeWidth="3" />
        <ellipse cx="128" cy="56" rx="9" ry="32" fill="#ffc7d6" />
      </g>
      <ellipse cx="100" cy="122" rx="66" ry="58" fill="#fff8fa" stroke={OUTLINE} strokeWidth="3" />
      <Blush x={100} y={135} mood={mood} spread={38} />
      <Eye x={76} y={116} mood={mood} side="left" />
      <Eye x={124} y={116} mood={mood} side="right" />
      <ellipse cx="100" cy="133" rx="4.5" ry="3" fill="#ff8fab" />
      <Mouth x={100} y={139} mood={mood} />
      <ellipse cx="70" cy="176" rx="15" ry="10" fill="#fff8fa" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="130" cy="176" rx="15" ry="10" fill="#fff8fa" stroke={OUTLINE} strokeWidth="3" />
      {(mood === "happy" || mood === "love") && <Heart x={100} y={176} size={1.5} />}
      {mood === "sad" && <Heart x={100} y={178} size={1.2} color="#d9a3b3" broken />}
    </svg>
  );
}

function Bird({
  x,
  color,
  belly,
  mood,
  flip = false,
}: {
  x: number;
  color: string;
  belly: string;
  mood: Mood;
  flip?: boolean;
}) {
  const droop = mood === "sad" ? 6 : 0;
  return (
    <g transform={`translate(${x} 0) ${flip ? "scale(-1 1)" : ""}`}>
      <path
        d={`M -32 ${112 + droop} q -18 6 -22 26 q 14 -8 26 -2 z`}
        fill={color}
        stroke={OUTLINE}
        strokeWidth="2.5"
      />
      <ellipse cx="0" cy="128" rx="40" ry="42" fill={color} stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="4" cy="142" rx="24" ry="22" fill={belly} />
      <path
        d={`M 34 ${124 + droop} l 16 6 l -16 6 z`}
        fill="#ffb86b"
        stroke="#e39a4a"
        strokeWidth="2"
      />
      <path d="M -6 88 q 6 -16 14 -4 q -8 -4 -14 4z" fill={color} stroke={OUTLINE} strokeWidth="2" />
      <Blush x={12} y={130} mood={mood} spread={16} />
      <Eye x={12} y={118} mood={mood} side={flip ? "left" : "right"} r={4.5} />
      <path d="M -12 170 l -4 12 M -6 170 l 0 12 M 0 170 l 4 12" stroke="#e39a4a" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Lovebirds({ mood }: { mood: Mood }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <path d="M 10 182 Q 100 168 190 182" stroke="#a97b5b" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Bird x={58} color="#ffb3c7" belly="#fff0f4" mood={mood} />
      <Bird x={142} color="#c9b8ff" belly="#f2edff" mood={mood} flip />
      {mood === "sad" ? (
        <Heart x={100} y={70} size={1.4} color="#d9a3b3" broken />
      ) : (
        <g className={mood === "happy" || mood === "love" ? "animate-heartbeat origin-center" : ""}>
          <Heart x={100} y={68} size={mood === "idle" ? 1.2 : 1.8} />
        </g>
      )}
      {(mood === "happy" || mood === "love") && (
        <>
          <Heart x={62} y={52} size={0.7} color="#ffb3c7" />
          <Heart x={140} y={46} size={0.6} color="#c9b8ff" />
        </>
      )}
    </svg>
  );
}

function Bear({ mood }: { mood: Mood }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <circle cx="48" cy="72" r="22" fill="#d8a878" stroke="#b98858" strokeWidth="3" />
      <circle cx="48" cy="72" r="11" fill="#f5d4bb" />
      <circle cx="152" cy="72" r="22" fill="#d8a878" stroke="#b98858" strokeWidth="3" />
      <circle cx="152" cy="72" r="11" fill="#f5d4bb" />
      <ellipse cx="100" cy="118" rx="66" ry="60" fill="#d8a878" stroke="#b98858" strokeWidth="3" />
      <ellipse cx="100" cy="140" rx="26" ry="18" fill="#f5d4bb" />
      <Blush x={100} y={128} mood={mood} spread={42} />
      <Eye x={74} y={110} mood={mood} side="left" />
      <Eye x={126} y={110} mood={mood} side="right" />
      <ellipse cx="100" cy="134" rx="7" ry="5" fill="#3b2233" />
      <Mouth x={100} y={146} mood={mood} />
      <ellipse cx="66" cy="180" rx="16" ry="11" fill="#d8a878" stroke="#b98858" strokeWidth="3" />
      <ellipse cx="134" cy="180" rx="16" ry="11" fill="#d8a878" stroke="#b98858" strokeWidth="3" />
      {mood === "sad" ? (
        <Heart x={100} y={180} size={1.2} color="#d9a3b3" broken />
      ) : (
        <Heart x={100} y={180} size={mood === "idle" || mood === "shy" ? 1.3 : 1.7} />
      )}
    </svg>
  );
}

const ART: Record<MascotKind, (p: { mood: Mood }) => React.ReactElement> = {
  bunny: Bunny,
  lovebirds: Lovebirds,
  bear: Bear,
};

const MOTION: Record<Mood, { animate: TargetAndTransition; transition: Transition }> = {
  idle: {
    animate: { y: [0, -6, 0], rotate: 0, scale: 1 },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  shy: {
    animate: { y: 0, rotate: [0, -3, 3, 0], scale: 1 },
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
  sad: {
    animate: { y: 6, rotate: [0, -2, 2, 0], scale: 0.96 },
    transition: { duration: 0.35, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    animate: { y: [0, -22, 0], rotate: [0, -6, 6, 0], scale: [1, 1.06, 1] },
    transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" },
  },
  love: {
    animate: { y: [0, -10, 0], scale: [1, 1.05, 1], rotate: 0 },
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
};

export function Mascot({
  kind,
  mood = "idle",
  className = "h-40 w-40",
}: {
  kind: MascotKind;
  mood?: Mood;
  className?: string;
}) {
  const Art = ART[kind];
  const m = MOTION[mood];
  return (
    <motion.div
      className={className}
      animate={m.animate}
      transition={m.transition}
      style={{ transformOrigin: "50% 90%" }}
    >
      <Art mood={mood} />
    </motion.div>
  );
}
