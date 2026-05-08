export function getPlantFloatY(time = 0, intensity = 1) {
  return Math.sin(time * 1.2) * 0.06 * intensity;
}

export function getPlantSwayRotation(time = 0, amount = 1) {
  return Math.sin(time * 0.9) * 0.045 * amount;
}

export function getLeafSwayRotation(
  time = 0,
  baseRotation = 0,
  amount = 1
) {
  return (
    baseRotation +
    Math.sin(time * 1.5) * 0.08 * amount
  );
}

export function getFlowerPulse(time = 0, amount = 1) {
  return 1 + Math.sin(time * 2.2) * 0.04 * amount;
}

export function getWeakPlantScale(isWeak = false) {
  return isWeak ? 0.92 : 1;
}

export function getPlantDroop(healthKey = "healthy") {
  if (healthKey === "wilted") return 0.28;
  if (healthKey === "weak") return 0.12;
  return 0;
}

export function getParticleFloatY(
  time = 0,
  offset = 0,
  amount = 1
) {
  return Math.sin(time + offset) * 0.18 * amount;
}

export function getParticleFloatX(
  time = 0,
  offset = 0,
  amount = 1
) {
  return Math.cos(time * 0.7 + offset) * 0.08 * amount;
}

export function getParticleOpacity(
  time = 0,
  offset = 0
) {
  return 0.35 + (Math.sin(time * 2 + offset) + 1) * 0.25;
}