import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";

export function canShowSignupGate(progress = {}) {
  return Boolean(progress?.moveStarted) && Boolean(progress?.playStarted);
}

export function getSignupGateRoute() {
  return V1_ONBOARDING_ROUTES.signupGate;
}

export function getSignupGateFallbackRoute(progress = {}) {
  if (progress?.playStarted && !progress?.moveStarted) {
    return V1_ONBOARDING_ROUTES.move;
  }

  if (progress?.moveStarted && !progress?.playStarted) {
    return V1_ONBOARDING_ROUTES.play;
  }

  return V1_ONBOARDING_ROUTES.root;
}