export function normalizeOnboardingCompletion(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    moveVerified: Boolean(progress?.moveVerified),
    playStarted: Boolean(progress?.playStarted),
    playCompleted: Boolean(progress?.playCompleted),
  };
}

export function canCompleteOnboarding(progress = {}) {
  const normalized = normalizeOnboardingCompletion(progress);

  return normalized.moveStarted && normalized.playCompleted;
}

export function shouldAwardOnboardingBonus(progress = {}) {
  const normalized = normalizeOnboardingCompletion(progress);

  return normalized.moveStarted && normalized.playCompleted;
}