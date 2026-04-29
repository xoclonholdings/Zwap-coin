import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingFlow";

export const LEARN_MORE_ACTION = "learn";

export function getLearnMoreStartResult(progress = {}) {
  return {
    progress: normalize(progress),
    route: V1_ONBOARDING_ROUTES.about,
  };
}

export function getLearnMoreFinalState(progress = {}) {
  const { moveStarted, playStarted } = normalize(progress);

  // both false → choose
  if (!moveStarted && !playStarted) {
    return {
      lines: ["Choose your", "next action."],
      showMove: true,
      showPlay: true,
    };
  }

  // move true, play false → show play
  if (moveStarted && !playStarted) {
    return {
      lines: ["Now try", "PLAY."],
      showMove: false,
      showPlay: true,
    };
  }

  // play true, move false → show move
  return {
    lines: ["Now try", "MOVE."],
    showMove: true,
    showPlay: false,
  };
}

function normalize(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    playStarted: Boolean(progress?.playStarted),
  };
}