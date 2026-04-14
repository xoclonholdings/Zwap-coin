import { PULZE_CONFIG } from "./pulzeConfig";

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getTarget() {
  return 20 + Math.random() * 60;
}

export function getPulseDuration(level) {
  const { BASE_DURATION, LEVEL_SCALE, MIN_DURATION } =
    PULZE_CONFIG.SPEED;

  return Math.max(BASE_DURATION - (level - 1) * LEVEL_SCALE, MIN_DURATION);
}

export function evaluateHit(position, target, level, combo) {
  const { PERFECT_WINDOW, HIT_WINDOW } = PULZE_CONFIG.TIMING;
  const { PERFECT, HIT, COMBO_PERFECT, COMBO_HIT } =
    PULZE_CONFIG.SCORING;

  const distance = Math.abs(position - target);

  if (distance <= PERFECT_WINDOW) {
    const base = PERFECT * level;
    const comboBonus = combo * COMBO_PERFECT * level;

    return {
      hit: true,
      tier: "perfect",
      points: base + comboBonus,
      comboBonus,
      distance,
    };
  }

  if (distance <= HIT_WINDOW) {
    const base = HIT * level;
    const comboBonus = combo * COMBO_HIT * level;

    return {
      hit: true,
      tier: "hit",
      points: base + comboBonus,
      comboBonus,
      distance,
    };
  }

  return {
    hit: false,
    tier: "miss",
    points: 0,
    comboBonus: 0,
    distance,
  };
}