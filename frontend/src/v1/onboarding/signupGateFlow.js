import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingFlow";

export function canShowSignupGate(progress = {}) {
  return Boolean(progress?.move) && Boolean(progress?.play);
}

export function getSignupGateRoute() {
  return V1_ONBOARDING_ROUTES.signupGate;
}

export function getSignupGateFallbackRoute(progress = {}) {
  if (progress?.play && !progress?.move) return V1_ONBOARDING_ROUTES.move;
  if (progress?.move && !progress?.play) return V1_ONBOARDING_ROUTES.play;
  return V1_ONBOARDING_ROUTES.root;
}