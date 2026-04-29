import { useRef, useState } from "react";

import {
  hasSeenV1Onboarding,
  markV1OnboardingSeen,
} from "@/v1/V1OnboardingStorage";

import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";

import {
  ONBOARDING_ACTIONS,
  getActionResult,
  getLandingTargetResult,
  normalizeOnboardingProgress,
} from "@/v1/onboarding/onboardingFlow";

import {
  getNextOnboardingAction,
  NEXT_ACTION_TYPES,
} from "@/v1/onboarding/onboardingCompletionFlow";

import { COMPLETION_TYPES } from "@/v1/onboarding/CompletionFlow";
import { getLearnMoreStartResult } from "@/v1/onboarding/learnMoreFlow";

import {
  canShowSignupGate,
  getSignupGateFallbackRoute,
} from "@/v1/onboarding/signupGateFlow";

export default function useV1OnboardingController({ navigate }) {
  const progressRef = useRef({
    moveStarted: false,
    moveVerified: false,
    playStarted: false,
    playCompleted: false,
  });

  const [onboardingProgress, setOnboardingProgress] = useState({
    moveStarted: false,
    moveVerified: false,
    playStarted: false,
    playCompleted: false,
  });

  const [completionType, setCompletionType] = useState(null);
  const [nextActionType, setNextActionType] = useState(null);
  const [onboardingSeen] = useState(() => hasSeenV1Onboarding());

  function setProgress(nextProgress) {
    const normalizedProgress = normalizeOnboardingProgress(nextProgress);

    progressRef.current = normalizedProgress;
    setOnboardingProgress(normalizedProgress);

    return normalizedProgress;
  }

  function clearCompletion() {
    setCompletionType(null);
  }

  function clearNextAction() {
    setNextActionType(null);
  }

  function clearFlowScreens() {
    clearCompletion();
    clearNextAction();
  }

  function setNextActionFromProgress(progress) {
    const nextAction = getNextOnboardingAction(progress);

    setNextActionType(nextAction.type);

    return nextAction;
  }

  function applyAction(action) {
    const result = getActionResult(progressRef.current, action);

    setProgress(result.progress);

    return result;
  }

  function applyActionThenShowCompletion(action, type) {
    const result = getActionResult(progressRef.current, action);

    clearNextAction();
    setProgress(result.progress);
    setCompletionType(type);

    return result;
  }

  function startFromWelcome(target) {
    const result = getLandingTargetResult(target);

    clearFlowScreens();
    setProgress(result.progress);
    navigate(result.route);

    return result;
  }

  function goToRoot() {
    clearFlowScreens();
    navigate(V1_ONBOARDING_ROUTES.root);
  }

  function goToMove() {
    clearFlowScreens();
    navigate(V1_ONBOARDING_ROUTES.move);
  }

  function goToPlay() {
    clearFlowScreens();
    navigate(V1_ONBOARDING_ROUTES.play);
  }

  function goToDashboard() {
    clearFlowScreens();
    navigate(V1_ONBOARDING_ROUTES.dashboard);
  }

  function goToSignupGate() {
    clearFlowScreens();
    navigate(V1_ONBOARDING_ROUTES.signupGate);
  }

  function goToLearnMore() {
    const result = getLearnMoreStartResult(progressRef.current);

    clearFlowScreens();
    setProgress(result.progress);
    navigate(result.route);

    return result;
  }

  function markMoveStarted() {
    return applyAction(ONBOARDING_ACTIONS.moveStarted);
  }

  function markMoveVerified() {
    return applyAction(ONBOARDING_ACTIONS.moveVerified);
  }

  function markPlayStarted() {
    return applyAction(ONBOARDING_ACTIONS.playStarted);
  }

  function markPlayCompleted() {
    return applyAction(ONBOARDING_ACTIONS.playCompleted);
  }

  function finishLearnMoreAndShowCompletion() {
    clearNextAction();
    setCompletionType(COMPLETION_TYPES.learnMore);
  }

  function finishMoveAndShowCompletion() {
    return applyActionThenShowCompletion(
      ONBOARDING_ACTIONS.moveStarted,
      COMPLETION_TYPES.move
    );
  }

  function verifyMoveAndShowCompletion() {
    return applyActionThenShowCompletion(
      ONBOARDING_ACTIONS.moveVerified,
      COMPLETION_TYPES.move
    );
  }

  function finishPlayAndShowCompletion() {
    return applyActionThenShowCompletion(
      ONBOARDING_ACTIONS.playCompleted,
      COMPLETION_TYPES.play
    );
  }

  function finishCompletionAndShowNext() {
    const completedType = completionType;

    clearCompletion();

    if (completedType === COMPLETION_TYPES.learnMore) {
      setNextActionType(NEXT_ACTION_TYPES.choose);
      navigate(V1_ONBOARDING_ROUTES.next);
      return {
        type: NEXT_ACTION_TYPES.choose,
      };
    }

    const nextAction = setNextActionFromProgress(progressRef.current);

    navigate(V1_ONBOARDING_ROUTES.next);

    return nextAction;
  }

  function canEnterSignupGate() {
    return canShowSignupGate(progressRef.current);
  }

  function getSignupGateFallback() {
    return getSignupGateFallbackRoute(progressRef.current);
  }

  function markSeenAndGo(route) {
    clearFlowScreens();
    markV1OnboardingSeen();
    navigate(route);
  }

  return {
    onboardingProgress,
    onboardingSeen,
    completionType,
    nextActionType,

    moveStarted: onboardingProgress.moveStarted,
    moveVerified: onboardingProgress.moveVerified,
    playStarted: onboardingProgress.playStarted,
    playCompleted: onboardingProgress.playCompleted,

    startFromWelcome,

    goToRoot,
    goToMove,
    goToPlay,
    goToDashboard,
    goToSignupGate,
    goToLearnMore,

    markMoveStarted,
    markMoveVerified,
    markPlayStarted,
    markPlayCompleted,

    finishLearnMoreAndShowCompletion,
    finishMoveAndShowCompletion,
    verifyMoveAndShowCompletion,
    finishPlayAndShowCompletion,
    finishCompletionAndShowNext,

    clearCompletion,
    clearNextAction,
    canEnterSignupGate,
    getSignupGateFallback,
    markSeenAndGo,
  };
}