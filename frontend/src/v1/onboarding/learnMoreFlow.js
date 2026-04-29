import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingFlow";

export const LEARN_MORE_ACTION = "learn";

export function getLearnMoreRoute() {
  return V1_ONBOARDING_ROUTES.about;
}

export function getLearnMoreGuidanceLines(progress = {}) {
  const move = Boolean(progress?.move);
  const play = Boolean(progress?.play);

  if (!move && !play) {
    return ["Choose your", "next action."];
  }

  if (move && !play) {
    return ["Now try", "PLAY."];
  }

  if (play && !move) {
    return ["Now try", "MOVE."];
  }

  return null;
}

export function getLearnMoreAvailableActions(progress = {}) {
  const move = Boolean(progress?.move);
  const play = Boolean(progress?.play);

  return {
    showMove: !move,
    showPlay: !play,
  };
}