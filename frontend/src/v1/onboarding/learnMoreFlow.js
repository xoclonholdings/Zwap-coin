import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";

export const LEARN_MORE_ACTION = "learn";

function normalize(progress = {}) {
  return {
    moveStarted: Boolean(progress?.moveStarted),
    moveVerified: Boolean(progress?.moveVerified),
    playStarted: Boolean(progress?.playStarted),
    playCompleted: Boolean(progress?.playCompleted),
  };
}

export function getLearnMoreStartResult(progress = {}) {
  return {
    progress: normalize(progress),
    route: V1_ONBOARDING_ROUTES.about,
  };
}