import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";
import { canCompleteOnboarding } from "@/v1/onboarding/onboardingCompletionFlow";

export function canShowSignupGate(progress = {}) {
  return canCompleteOnboarding(progress);
}

export function getSignupGateRoute() {
  return V1_ONBOARDING_ROUTES.signupGate;
}

export function getSignupGateFallbackRoute(progress = {}) {
  // If Play not completed → send to Play
  if (!progress?.playCompleted) {
    return V1_ONBOARDING_ROUTES.play;
  }

  // If Move not started → send to Move
  if (!progress?.moveStarted) {
    return V1_ONBOARDING_ROUTES.move;
  }

  return V1_ONBOARDING_ROUTES.root;
}