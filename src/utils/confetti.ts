import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0b1b3d', '#c8102e', '#ffffff', '#d4af37'], // British flag colors + Royal Gold
    });
  } catch (e) {
    // Graceful fallback if canvas is restricted
  }
}

export function fireKidsStars() {
  try {
    confetti({
      particleCount: 60,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      shapes: ['star', 'circle'],
    });
  } catch (e) {
    // Fallback
  }
}
