import {
  LEARN_MORE_ACTION,
  getLearnMoreStartResult,
} from "@/v1/onboarding/learnMoreFlow";

import {
  canShowSignupGate,
  getSignupGateRoute,
} from "@/v1/onboarding/signupGateFlow";

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
  moveStarted: "moveStarted",
  playStarted: "playStarted",
  learn: LEARN_MORE_ACTION,
};

export function normalizeOnboardingProgress(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    playStarted: Boolean(progress?.playStarted),
  };
}

export function getNextOnboardingRoute(progress = {}) {
  const normalized = normalizeOnboardingProgress(progress);

  if (canShowSignupGate(normalized)) {
    return getSignupGateRoute();
  }

  if (normalized.playStarted && !normalized.moveStarted) {
    return V1_ONBOARDING_ROUTES.move;
  }

  if (normalized.moveStarted && !normalized.playStarted) {
    return V1_ONBOARDING_ROUTES.play;
  }

  return null;
}

export function getLandingTargetResult(target) {
  if (target === "move") {
    return {
      progress: normalizeOnboardingProgress(),
      route: V1_ONBOARDING_ROUTES.move,
    };
  }

  if (target === "play") {
    return {
      progress: normalizeOnboardingProgress(),
      route: V1_ONBOARDING_ROUTES.play,
    };
  }

  if (target === LEARN_MORE_ACTION || target === "learn") {
    return getLearnMoreStartResult(normalizeOnboardingProgress());
  }

  return {
    progress: normalizeOnboardingProgress(),
    route: V1_ONBOARDING_ROUTES.root,
  };
}

export function markOnboardingActionStarted(progress = {}, action) {
  const normalized = normalizeOnboardingProgress(progress);

  return {
    moveStarted:
      action === ONBOARDING_ACTIONS.moveStarted
        ? true
        : normalized.moveStarted,
    playStarted:
      action === ONBOARDING_ACTIONS.playStarted
        ? true
        : normalized.playStarted,
  };
}

export function getActionStartedResult(progress = {}, action) {
  const progressAfterAction = markOnboardingActionStarted(progress, action);

  return {
    progress: progressAfterAction,
    route: getNextOnboardingRoute(progressAfterAction),
  };
}