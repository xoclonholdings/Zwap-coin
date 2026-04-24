const ONBOARDING_SEEN_KEY = "zwap_v1_onboarding_seen";

export function hasSeenV1Onboarding() {
  return window.localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";
}

export function markV1OnboardingSeen() {
  window.localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
}

export function clearV1OnboardingSeen() {
  window.localStorage.removeItem(ONBOARDING_SEEN_KEY);
}