import { useEffect, useRef, useState } from "react";
import { getCurrentSteps, subscribeToSteps } from "@/services/stepService";
import {
  resetStepFeeder,
  startStepFeeder,
  stopStepFeeder,
} from "@/lib/steps/stepFeeder";

function estimateCaloriesFromSteps(steps) {
  return Math.round(Math.max(0, Number(steps || 0)) * 0.04);
}

export default function useDashboardMove({
  resolvedEmail,
  apiBase,
  refreshActivitySnapshot,
  setActivitySignal,
  onBalanceUpdate,
}) {
  const [moveIsActive, setMoveIsActive] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const sessionStartStepsRef = useRef(0);

  const submitMoveSteps = async (steps) => {
    const safeSteps = Math.max(0, Number(steps || 0));

    if (!resolvedEmail || safeSteps <= 0) return null;

    const res = await fetch(
      `${apiBase}/move/steps/${encodeURIComponent(resolvedEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steps: safeSteps,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Move submission failed");
    }

    return res.json();
  };

  const handleToggleMove = async () => {
    const wasActive = moveIsActive;
    const stepsToSubmit = Number(sessionSteps || 0);

    setMoveIsActive((current) => {
      const next = !current;

      if (next) {
        resetStepFeeder();
        sessionStartStepsRef.current = getCurrentSteps();
        setSessionSteps(0);
        setTimerSeconds(0);
        startStepFeeder();
      } else {
        stopStepFeeder();
      }

      return next;
    });

    if (!wasActive) return;

    try {
      const moveResult = await submitMoveSteps(stepsToSubmit);

      if (
        moveResult?.new_balance !== undefined &&
        typeof onBalanceUpdate === "function"
      ) {
        onBalanceUpdate(Number(moveResult.new_balance || 0));
      }

      setActivitySignal?.({
        type: "move",
        steps: stepsToSubmit,
        zpts: Number(moveResult?.rewards_earned || 0),
        created_at: new Date().toISOString(),
      });

      await refreshActivitySnapshot?.();
    } catch (error) {
      console.error("Move submit failed:", error);

      setActivitySignal?.({
        type: "move",
        steps: stepsToSubmit,
        zpts: 0,
        created_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    if (!moveIsActive) return;

    const unsubscribe = subscribeToSteps((deviceSteps) => {
      const start = Number(sessionStartStepsRef.current || 0);
      setSessionSteps(Math.max(0, Number(deviceSteps || 0) - start));
    });

    return () => unsubscribe();
  }, [moveIsActive]);

  useEffect(() => {
    if (!moveIsActive) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [moveIsActive]);

  useEffect(() => {
    return () => {
      stopStepFeeder();
    };
  }, []);

  return {
    moveIsActive,
    sessionSteps,
    timerSeconds,
    calories: estimateCaloriesFromSteps(sessionSteps),
    handleToggleMove,
  };
}