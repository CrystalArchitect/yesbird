export type Accessory = "none" | "partyhat" | "sunglasses";

/** A striped party cone with a pom-pom, brim resting at (x, y). */
export function PartyHat({ x, y, scale = 1, tilt = -8 }: { x: number; y: number; scale?: number; tilt?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
      <path d="M -18 0 L 0 -40 L 18 0 Z" fill="#c9b8ff" stroke="#a894e6" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M -8 -18 L 8 -18" stroke="#ff8fab" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M -13 -8 L 13 -8" stroke="#ffd27a" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx="19" ry="4" fill="#a894e6" />
      <circle cx="0" cy="-41" r="5.5" fill="#ffd27a" stroke="#e8b955" strokeWidth="2" />
    </g>
  );
}

/** Two dark lenses over the eyes at (lx, ly) and (rx, ry), with a little glint. */
export function Sunglasses({ lx, ly, rx, ry, w = 26, h = 17 }: { lx: number; ly: number; rx: number; ry: number; w?: number; h?: number }) {
  const cy = (ly + ry) / 2;
  return (
    <g>
      <path d={`M ${lx - w / 2 - 6} ${cy - 2} L ${lx - w / 2} ${cy - 3}`} stroke="#3b2233" strokeWidth="3" strokeLinecap="round" />
      <path d={`M ${rx + w / 2 + 6} ${cy - 2} L ${rx + w / 2} ${cy - 3}`} stroke="#3b2233" strokeWidth="3" strokeLinecap="round" />
      <rect x={lx + w / 2 - 2} y={cy - 4} width={rx - lx - w + 4} height="3.5" rx="1.75" fill="#3b2233" />
      <rect x={lx - w / 2} y={ly - h / 2} width={w} height={h} rx="7" fill="#3b2233" />
      <rect x={rx - w / 2} y={ry - h / 2} width={w} height={h} rx="7" fill="#3b2233" />
      <rect x={lx - w / 2 + 4} y={ly - h / 2 + 3} width="8" height="3" rx="1.5" fill="#fff" opacity="0.4" />
      <rect x={rx - w / 2 + 4} y={ry - h / 2 + 3} width="8" height="3" rx="1.5" fill="#fff" opacity="0.4" />
    </g>
  );
}
