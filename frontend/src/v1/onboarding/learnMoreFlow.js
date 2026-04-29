import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingFlow";

export const LEARN_MORE_ACTION = "learn";

export function getLearnMoreRoute() {
  return V1_ONBOARDING_ROUTES.about;
}

export function getLearnMoreFinalState(progress = {}) {
  const move = Boolean(progress?.move);
  const play = Boolean(progress?.play);

  if (!move && !play) {
    return {
      lines: ["Choose your", "next action."],
      showMove: true,
      showPlay: true,
    };
  }

  if (move && !play) {
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