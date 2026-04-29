import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";

import {
  LEARN_MORE_ACTION,
  getLearnMoreStartResult,
} from "@/v1/onboarding/learnMoreFlow";

import {
  canShowSignupGate,
  getSignupGateRoute,
} from "@/v1/onboarding/signupGateFlow";

export const ONBOARDING_ACTIONS = {
  moveStarted: "moveStarted",
  moveVerified: "moveVerified",
  playStarted: "playStarted",
  playCompleted: "playCompleted",
  learn: LEARN_MORE_ACTION,
};

export function normalizeOnboardingProgress(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    moveVerified: Boolean(progress?.moveVerified),
    playStarted: Boolean(progress?.playStarted),
    playCompleted: Boolean(progress?.playCompleted),
  };
}

export function getNextOnboardingRoute(progress = {}) {
  const normalized = normalizeOnboardingProgress(progress);

  if (canShowSignupGate(normalized)) {
    return getSignupGateRoute();
  }

  if (!normalized.playCompleted) {
    return V1_ONBOARDING_ROUTES.play;
  }

  if (!normalized.moveStarted) {
    return V1_ONBOARDING_ROUTES.move;
  }

  return V1_ONBOARDING_ROUTES.root;
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

export function markOnboardingAction(progress = {}, action) {
  const normalized = normalizeOnboardingProgress(progress);

  return {
    moveStarted:
      action === ONBOARDING_ACTIONS.moveStarted
        ? true
        : normalized.moveStarted,
    moveVerified:
      action === ONBOARDING_ACTIONS.moveVerified
        ? true
        : normalized.moveVerified,
    playStarted:
      action === ONBOARDING_ACTIONS.playStarted
        ? true
        : normalized.playStarted,
    playCompleted:
      action === ONBOARDING_ACTIONS.playCompleted
        ? true
        : normalized.playCompleted,
  };
}

export function getActionResult(progress = {}, action) {
  const progressAfterAction = markOnboardingAction(progress, action);

  return {
    progress: progressAfterAction,
    route: getNextOnboardingRoute(progressAfterAction),
  };
}