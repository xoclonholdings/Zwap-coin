import {
  LEARN_MORE_ACTION,
  getLearnMoreRoute,
  getLearnMoreAvailableActions,
} from "@/v1/onboarding/learnMoreFlow";

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
  learn: LEARN_MORE_ACTION,
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

  if (normalized.play && !normalized.move) {
    return V1_ONBOARDING_ROUTES.move;
  }

  if (normalized.move && !normalized.play) {
    return V1_ONBOARDING_ROUTES.play;
  }

  return null;
}

export function getLandingTargetRoute(target) {
  if (target === ONBOARDING_ACTIONS.move) {
    return V1_ONBOARDING_ROUTES.move;
  }

  if (target === ONBOARDING_ACTIONS.play) {
    return V1_ONBOARDING_ROUTES.play;
  }

  if (target === ONBOARDING_ACTIONS.learn) {
    return getLearnMoreRoute();
  }

  return V1_ONBOARDING_ROUTES.root;
}

export function getWelcomeStartResult(target) {
  return {
    progress: normalizeOnboardingProgress({
      move: false,
      play: false,
    }),
    route: getLandingTargetRoute(target),
  };
}

export function markOnboardingActionTried(progress = {}, action) {
  const normalized = normalizeOnboardingProgress(progress);

  return {
    move: action === ONBOARDING_ACTIONS.move ? true : normalized.move,
    play: action === ONBOARDING_ACTIONS.play ? true : normalized.play,
  };
}

export function getActionCompletionResult(progress = {}, action) {
  const nextProgress = markOnboardingActionTried(progress, action);

  return {
    progress: nextProgress,
    route: getNextOnboardingRoute(nextProgress),
  };
}

export function getAboutAvailableActions(progress = {}) {
  return getLearnMoreAvailableActions(normalizeOnboardingProgress(progress));
}