export const NEXT_ACTION_TYPES = {
  move: "move",
  play: "play",
  continue: "continue",
};

export const ONBOARDING_BONUS_ZPTS = 50;

export function normalizeOnboardingCompletion(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    moveVerified: Boolean(progress?.moveVerified),
    playStarted: Boolean(progress?.playStarted),
    playCompleted: Boolean(progress?.playCompleted),
  };
}

export function getNextOnboardingAction(progress = {}) {
  const normalized = normalizeOnboardingCompletion(progress);

  if (!normalized.playCompleted) {
    return {
      type: NEXT_ACTION_TYPES.play,
      shouldAwardBonus: false,
      bonusZpts: 0,
    };
  }

  if (!normalized.moveStarted) {
    return {
      type: NEXT_ACTION_TYPES.move,
      shouldAwardBonus: false,
      bonusZpts: 0,
    };
  }

  return {
    type: NEXT_ACTION_TYPES.continue,
    shouldAwardBonus: true,
    bonusZpts: ONBOARDING_BONUS_ZPTS,
  };
}

export function canCompleteOnboarding(progress = {}) {
  const normalized = normalizeOnboardingCompletion(progress);

  return normalized.moveStarted && normalized.playCompleted;
}

export function shouldAwardOnboardingBonus(progress = {}) {
  return canCompleteOnboarding(progress);
}

export function getOnboardingBonusZpts(progress = {}) {
  return shouldAwardOnboardingBonus(progress) ? ONBOARDING_BONUS_ZPTS : 0;
}