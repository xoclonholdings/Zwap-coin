export const V1_ONBOARDING_ROUTES = {
  root: "/v1",
  about: "/v1/about",
  move: "/v1/move",
  play: "/v1/play",
  signupGate: "/v1/signup-gate",
  signup: "/v1/signup",
  signin: "/v1/signin",
  dashboard: "/v1/dashboard",
};

export function getNextOnboardingRoute({ move = false, play = false } = {}) {
  if (move && play) return V1_ONBOARDING_ROUTES.signupGate;
  if (move && !play) return V1_ONBOARDING_ROUTES.play;
  if (!move && play) return V1_ONBOARDING_ROUTES.move;

  return V1_ONBOARDING_ROUTES.about;
}

export function getLandingTargetRoute(target) {
  if (target === "move") return V1_ONBOARDING_ROUTES.move;
  if (target === "play") return V1_ONBOARDING_ROUTES.play;
  if (target === "learn") return V1_ONBOARDING_ROUTES.about;

  return V1_ONBOARDING_ROUTES.root;
}

export function markOnboardingActionTried(progress, action) {
  return {
    move: action === "move" ? true : Boolean(progress?.move),
    play: action === "play" ? true : Boolean(progress?.play),
  };
}

export function isOnboardingComplete(progress) {
  return Boolean(progress?.move) && Boolean(progress?.play);
}