import confetti from 'canvas-confetti';

export function triggerConfetti(options?: confetti.Options) {
  const defaults: confetti.Options = {
    origin: { y: 0.7 },
    spread: 100,
    ticks: 100,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'],
  };
  confetti({ ...defaults, ...options });
}

export function triggerLevelUp() {
  const end = Date.now() + 1000;
  const colors = ['#8B5CF6', '#06B6D4', '#10B981'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
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

export function triggerStreakFlame() {
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#F59E0B', '#EF4444', '#F97316'],
    shapes: ['circle'],
    scalar: 1.2,
  });
}

export function triggerSuccess() {
  confetti({
    particleCount: 40,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10B981', '#34D399', '#6EE7B7'],
    shapes: ['circle'],
  });
}
