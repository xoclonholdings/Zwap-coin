export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function distanceFromCenter(value, center) {
  return Math.abs(value - center);
}

export function calculatePulzeScore({ pulzePosition, targetPosition, targetSize }) {
  const distance = distanceFromCenter(pulzePosition, targetPosition);
  const perfectZone = targetSize * 0.18;
  const greatZone = targetSize * 0.36;
  const goodZone = targetSize * 0.5;

  if (distance <= perfectZone) {
    return { label: "PERFECT", points: 100, hit: true };
  }

  if (distance <= greatZone) {
    return { label: "GREAT", points: 65, hit: true };
  }

  if (distance <= goodZone) {
    return { label: "GOOD", points: 35, hit: true };
  }

  return { label: "MISS", points: 0, hit: false };
}
