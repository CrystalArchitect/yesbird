"use client";

import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import type { Mascot as MascotKind } from "@/lib/options";
import { Blush, Eye, Heart, Mouth, type Mood } from "./face";

export type { Mood };

const OUTLINE = "#e7b8c6";

const isDown = (mood: Mood) => mood === "sad" || mood === "cry";

/** A tiny personal rain cloud, because the moment calls for it. */
function RainCloud({ x = 100, y = 26 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g fill="#dfe4f3" stroke="#c3cbe6" strokeWidth="2">
        <ellipse cx="0" cy="0" rx="20" ry="10" />
        <circle cx="-9" cy="-5" r="9" />
        <circle cx="5" cy="-8" r="11" />
      </g>
      {[-10, 0, 10].map((dx, i) => (
        <path
          key={dx}
          d={`M ${dx} 10 l -2 7`}
          stroke="#8fd0ff"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="animate-rain"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </g>
  );
}

function Bunny({ mood }: { mood: Mood }) {
  const earTilt = mood === "cry" ? 30 : mood === "sad" ? 18 : mood === "happy" ? -6 : 0;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      {mood === "cry" && <RainCloud x={150} y={30} />}
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
      {isDown(mood) && <Heart x={100} y={178} size={1.2} color="#d9a3b3" broken />}
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
  const droop = mood === "cry" ? 10 : mood === "sad" ? 6 : 0;
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
      {mood === "cry" && <RainCloud x={100} y={28} />}
      {isDown(mood) ? (
        <Heart x={100} y={mood === "cry" ? 84 : 70} size={1.4} color="#d9a3b3" broken />
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
      {mood === "cry" && <RainCloud x={158} y={30} />}
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
      {isDown(mood) ? (
        <Heart x={100} y={180} size={1.2} color="#d9a3b3" broken />
      ) : (
        <Heart x={100} y={180} size={mood === "idle" || mood === "shy" ? 1.3 : 1.7} />
      )}
    </svg>
  );
}

function Kitty({ mood }: { mood: Mood }) {
  const CREAM = "#fff4e8";
  const LINE = "#ead0bb";
  const earDroop = isDown(mood) ? 14 : mood === "happy" ? -4 : 0;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      {mood === "cry" && <RainCloud x={156} y={34} />}
      <g transform={`rotate(${-6 + earDroop} 58 70)`}>
        <path d="M 40 96 L 50 40 L 92 76 Z" fill={CREAM} stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 52 84 L 56 56 L 78 74 Z" fill="#ffc7d6" />
      </g>
      <g transform={`rotate(${6 - earDroop} 142 70)`}>
        <path d="M 160 96 L 150 40 L 108 76 Z" fill={CREAM} stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 148 84 L 144 56 L 122 74 Z" fill="#ffc7d6" />
      </g>
      <ellipse cx="100" cy="122" rx="66" ry="56" fill={CREAM} stroke={LINE} strokeWidth="3" />
      <g stroke="#f2b27a" strokeWidth="3.5" strokeLinecap="round">
        <path d="M 92 74 v 14" />
        <path d="M 100 70 v 18" />
        <path d="M 108 74 v 14" />
      </g>
      <g stroke="#d9b39a" strokeWidth="2.2" strokeLinecap="round">
        <path d="M 24 126 h 26" />
        <path d="M 26 138 l 25 -5" />
        <path d="M 176 126 h -26" />
        <path d="M 174 138 l -25 -5" />
      </g>
      <Blush x={100} y={136} mood={mood} spread={40} />
      <Eye x={76} y={118} mood={mood} side="left" />
      <Eye x={124} y={118} mood={mood} side="right" />
      <path d="M 95 133 h 10 l -5 5 z" fill="#ff8fab" />
      <Mouth x={100} y={141} mood={mood} />
      <ellipse cx="72" cy="178" rx="15" ry="10" fill={CREAM} stroke={LINE} strokeWidth="3" />
      <ellipse cx="128" cy="178" rx="15" ry="10" fill={CREAM} stroke={LINE} strokeWidth="3" />
      {isDown(mood) ? (
        <Heart x={100} y={180} size={1.2} color="#d9a3b3" broken />
      ) : (
        <Heart x={100} y={178} size={mood === "idle" || mood === "shy" ? 1.3 : 1.6} />
      )}
    </svg>
  );
}

function Duck({ mood }: { mood: Mood }) {
  const YELLOW = "#ffe28f";
  const LINE = "#ecc45e";
  const beakTilt = isDown(mood) ? 5 : 0;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      {mood === "cry" && <RainCloud x={44} y={34} />}
      <ellipse cx="100" cy="168" rx="62" ry="40" fill={YELLOW} stroke={LINE} strokeWidth="3" />
      <ellipse cx="46" cy="160" rx="18" ry="11" transform={`rotate(${-25 - (isDown(mood) ? 12 : 0)} 46 160)`} fill="#ffd66b" stroke={LINE} strokeWidth="3" />
      <ellipse cx="154" cy="160" rx="18" ry="11" transform={`rotate(${25 + (isDown(mood) ? 12 : 0)} 154 160)`} fill="#ffd66b" stroke={LINE} strokeWidth="3" />
      <circle cx="100" cy="104" r="54" fill={YELLOW} stroke={LINE} strokeWidth="3" />
      <g stroke={LINE} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M 96 52 q -2 -12 -10 -14" />
        <path d="M 100 50 q 0 -12 4 -16" />
        <path d="M 105 52 q 4 -10 12 -10" />
      </g>
      <g transform="translate(136 62)">
        {[
          [7, 0],
          [2.2, 6.7],
          [-5.7, 4.1],
          [-5.7, -4.1],
          [2.2, -6.7],
        ].map(([cx, cy]) => (
          <circle key={`${cx},${cy}`} cx={cx} cy={cy} r="5.5" fill="#ffb3c7" />
        ))}
        <circle r="3.5" fill="#fff3c4" />
      </g>
      <Blush x={100} y={118} mood={mood} spread={34} />
      <Eye x={80} y={100} mood={mood} side="left" r={5} />
      <Eye x={120} y={100} mood={mood} side="right" r={5} />
      <g transform={`rotate(${beakTilt} 100 124)`}>
        <path d="M 82 118 q 18 -10 36 0 q -18 16 -36 0 z" fill="#ffab5c" stroke="#e78f3c" strokeWidth="2.5" />
        {(mood === "happy" || mood === "love") && <path d="M 86 122 q 14 12 28 0 q -14 4 -28 0 z" fill="#c95b4a" />}
        {mood === "cry" && <path d="M 90 126 q 5 -3 10 0 q 5 3 10 0" stroke="#c95b4a" strokeWidth="2" fill="none" strokeLinecap="round" />}
      </g>
      {isDown(mood) ? (
        <Heart x={100} y={172} size={1.2} color="#d9a3b3" broken />
      ) : (
        <Heart x={100} y={172} size={mood === "idle" || mood === "shy" ? 1.3 : 1.7} />
      )}
    </svg>
  );
}

const ART: Record<MascotKind, (p: { mood: Mood }) => React.ReactElement> = {
  bunny: Bunny,
  lovebirds: Lovebirds,
  bear: Bear,
  kitty: Kitty,
  duck: Duck,
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
  cry: {
    animate: { y: 8, x: [0, -2, 2, -2, 0], rotate: 0, scale: 0.94 },
    transition: { duration: 0.22, repeat: Infinity, ease: "easeInOut" },
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
