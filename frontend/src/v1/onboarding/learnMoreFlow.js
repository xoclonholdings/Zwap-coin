import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingFlow";

export const LEARN_MORE_ACTION = "learn";

export function getLearnMoreRoute() {
  return V1_ONBOARDING_ROUTES.about;
}

export function getLearnMoreFinalState(progress = {}) {
  const move = Boolean(progress?.move);
  const play = Boolean(progress?.play);

  // Both not tried
  if (!move && !play) {
    return {
      lines: ["Choose your", "next action."],
      showMove: true,
      showPlay: true,
    };
  }

  // Move done → push Play
  if (move && !play) {
    return {
      lines: ["Now try", "PLAY."],
      showMove: false,
      showPlay: true,
    };
  }

  // Play done → push Move
  if (play && !move) {
    return {
      lines: ["Now try", "MOVE."],
      showMove: true,
      showPlay: false,
    };
  }

  // Both done → no Learn More needed
  return null;
}