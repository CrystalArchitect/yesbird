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

/** A big, soft shower of hearts and petals from both sides of the screen. */
export function celebrate() {
  const end = Date.now() + 2200;
  const colors = ["#f0668a", "#ffb3c7", "#c9b8ff", "#ffd9c2"];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
      shapes: shapes(),
      scalar: 2,
      gravity: 0.7,
      drift: 0.4,
      ticks: 260,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
      shapes: shapes(),
      scalar: 2,
      gravity: 0.7,
      drift: -0.4,
      ticks: 260,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** A small pop of hearts, for tiny wins like finishing a step. */
export function sparkle(x = 0.5, y = 0.5) {
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
