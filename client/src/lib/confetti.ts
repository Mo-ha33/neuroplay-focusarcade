import confetti from "canvas-confetti";

export function fireConfetti() {
  // Big celebration burst
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#00E5FF", "#7C4DFF", "#AEEA00", "#FFD700", "#FF6B6B"],
    ticks: 200,
  });
  // Side bursts
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ["#00E5FF", "#AEEA00"],
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ["#7C4DFF", "#AEEA00"],
    });
  }, 150);
}

export function fireMegaConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ["#00E5FF", "#7C4DFF", "#AEEA00", "#FFD700", "#FF6B6B"];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export function fireStarBurst(x: number, y: number) {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: {
      x: x / window.innerWidth,
      y: y / window.innerHeight,
    },
    colors: ["#AEEA00", "#FFD700", "#00E5FF"],
    shapes: ["star"],
    scalar: 1.5,
    ticks: 150,
  });
}
