import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";

export const LEARN_MORE_ACTION = "learn";

function normalize(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    playStarted: Boolean(progress?.playStarted),
  };
}

export function getLearnMoreStartResult(progress = {}) {
  return {
    progress: normalize(progress),
    route: V1_ONBOARDING_ROUTES.about,
  };
}

export function getLearnMoreFinalState(progress = {}) {
  const { moveStarted, playStarted } = normalize(progress);

  if (!moveStarted && !playStarted) {
    return {
      lines: ["Choose your", "next action."],
      showMove: true,
      showPlay: true,
    };
  }

  if (moveStarted && !playStarted) {
    return {
      lines: ["Now try", "PLAY."],
      showMove: false,
      showPlay: true,
    };
  }

  return {
    lines: ["Now try", "MOVE."],
    showMove: true,
    showPlay: false,
  };
}