import confetti from 'canvas-confetti';

export const celebrateOrderConfirmed = () => {
  confetti({
    particleCount: 130,
    spread: 80,
    origin: { y: 0.55 },
    colors: ['#00E5B0', '#33EDBE', '#ffffff', '#7C3AED'],
    scalar: 1.2,
  });
};

export const celebrateInvoicePaid = () => {
  const end = Date.now() + 1200;
  const goldShower = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#F59E0B', '#FBB040', '#ffffff'],
      shapes: ['star'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#F59E0B', '#FBB040', '#ffffff'],
      shapes: ['star'],
    });
    if (Date.now() < end) requestAnimationFrame(goldShower);
  };
  goldShower();
};

export const celebrateNewOrder = () => {
  confetti({
    particleCount: 60,
    spread: 50,
    origin: { y: 0.7, x: 0.5 },
    colors: ['#7C3AED', '#9B59F5', '#ffffff'],
    scalar: 0.9,
  });
};
