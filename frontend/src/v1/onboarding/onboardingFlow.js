export const V1_ONBOARDING_ROUTES = {
  root: "/v1",
  about: "/v1/about",
  move: "/v1/move",
  play: "/v1/play",
  signupGate: "/v1/signup-gate",
  signup: "/v1/signup",
  signin: "/v1/signin",
  dashboard: "/v1/dashboard",
};

export const ONBOARDING_ACTIONS = {
  move: "move",
  play: "play",
  learn: "learn",
};

export function normalizeOnboardingProgress(progress = {}) {
  return {
    move: Boolean(progress?.move),
    play: Boolean(progress?.play),
  };
}

export function isOnboardingComplete(progress = {}) {
  const normalized = normalizeOnboardingProgress(progress);
  return normalized.move && normalized.play;
}

export function getNextOnboardingRoute(progress = {}) {
  const normalized = normalizeOnboardingProgress(progress);

  if (normalized.move && normalized.play) {
    return V1_ONBOARDING_ROUTES.signupGate;
  }

  if (normalized.move && !normalized.play) {
    return V1_ONBOARDING_ROUTES.play;
  }

  if (!normalized.move && normalized.play) {
    return V1_ONBOARDING_ROUTES.move;
  }

  return V1_ONBOARDING_ROUTES.about;
}

export function getLandingTargetRoute(target) {
  if (target === ONBOARDING_ACTIONS.move) {
    return V1_ONBOARDING_ROUTES.move;
  }

  if (target === ONBOARDING_ACTIONS.play) {
    return V1_ONBOARDING_ROUTES.play;
  }

  if (target === ONBOARDING_ACTIONS.learn) {
    return V1_ONBOARDING_ROUTES.about;
  }

  return V1_ONBOARDING_ROUTES.root;
}

export function markOnboardingActionTried(progress = {}, action) {
  const normalized = normalizeOnboardingProgress(progress);

  return {
    move: action === ONBOARDING_ACTIONS.move ? true : normalized.move,
    play: action === ONBOARDING_ACTIONS.play ? true : normalized.play,
  };
}

export function getAboutAvailableActions(progress = {}) {
  const normalized = normalizeOnboardingProgress(progress);

  return {
    showMove: !normalized.move,
    showPlay: !normalized.play,
  };
}