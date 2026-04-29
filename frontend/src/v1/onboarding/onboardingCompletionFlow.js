export function normalizeOnboardingCompletion(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    moveVerified: Boolean(progress?.moveVerified),
    playStarted: Boolean(progress?.playStarted),
    playCompleted: Boolean(progress?.playCompleted),
  };
}

/**
 * Core decision engine
 * Returns what the user should see NEXT
 */
export function getNextOnboardingAction(progress = {}) {
  const normalized = normalizeOnboardingCompletion(progress);

  const { moveStarted, playCompleted } = normalized;

  // Haven’t played yet → force Play
  if (!playCompleted) {
    return {
      type: "play",
    };
  }

  // Played, but never attempted Move → try Move
  if (!moveStarted) {
    return {
      type: "move",
    };
  }

  // Both satisfied → allow progression
  return {
    type: "continue",
  };
}

/**
 * Used ONLY for gating SignupGate
 */
export function canCompleteOnboarding(progress = {}) {
  const normalized = normalizeOnboardingCompletion(progress);

  return normalized.moveStarted && normalized.playCompleted;
}

/**
 * Reward decision (kept separate intentionally)
 */
export function shouldAwardOnboardingBonus(progress = {}) {
  return canCompleteOnboarding(progress);
}