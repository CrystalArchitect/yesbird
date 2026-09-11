import confetti from "canvas-confetti";

let heartShapes: confetti.Shape[] | null = null;

function shapes() {
  if (!heartShapes) {
    heartShapes = ["💗", "💖", "🌸", "💕"].map((text) =>
      confetti.shapeFromText({ text, scalar: 2.4 }),
    );
  }
  return heartShapes;
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A big, soft shower of hearts and petals from both sides of the screen. */
export function celebrate() {
  if (reducedMotion()) return;
  const end = Date.now() + 1800;
  const colors = ["#f0668a", "#ffb3c7", "#c9b8ff", "#ffd9c2"];
  // Phones get a lighter shower: fewer particles means the stickers and text stay readable.
  const perSide = window.innerWidth < 640 ? 2 : 3;

  (function frame() {
    confetti({
      particleCount: perSide,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
      shapes: shapes(),
      scalar: 2,
      gravity: 0.7,
      drift: 0.4,
      ticks: 200,
    });
    confetti({
      particleCount: perSide,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
      shapes: shapes(),
      scalar: 2,
      gravity: 0.7,
      drift: -0.4,
      ticks: 200,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** A small pop of hearts, for tiny wins like finishing a step. */
export function sparkle(x = 0.5, y = 0.5) {
  if (reducedMotion()) return;
  confetti({
    particleCount: 24,
    spread: 80,
    startVelocity: 22,
    origin: { x, y },
    shapes: shapes(),
    scalar: 1.6,
    gravity: 0.8,
    ticks: 160,
  });
}
