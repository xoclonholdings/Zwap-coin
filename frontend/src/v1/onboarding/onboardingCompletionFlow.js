export const NEXT_ACTION_TYPES = {
  move: "move",
  play: "play",
  choose: "choose",
  continue: "continue",
};

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
    };
  }

  if (!normalized.moveStarted) {
    return {
      type: NEXT_ACTION_TYPES.move,
    };
  }

  return {
    type: NEXT_ACTION_TYPES.continue,
  };
}

export function canCompleteOnboarding(progress = {}) {
  const normalized = normalizeOnboardingCompletion(progress);

  return normalized.moveStarted && normalized.playCompleted;
}