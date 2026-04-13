import { useMemo, useState } from "react";

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function percent(part, whole) {
  const safeWhole = Math.max(1, toNumber(whole, 1));
  return clamp(toNumber(part, 0) / safeWhole) * 100;
}

function formatZpts(value) {
  return toNumber(value, 0).toLocaleString();
}

function buildTaskPreview({
  completedTaskCount,
  taskStates,
  shopUnlocked,
}) {
  if (Array.isArray(taskStates) && taskStates.length > 0) {
    return taskStates.slice(0, 4).map((task, index) => ({
      id: task?.id || `task-${index}`,
      label: String(task?.label || "").trim() || `Task ${index + 1}`,
      completed: Boolean(task?.completed),
    }));
  }

  const labels = shopUnlocked
    ? ["Login", "Move", "Play", "Shop"]
    : ["Login", "Move", "Play", "Learn"];

  return labels.map((label, index) => ({
    id: label.toLowerCase(),
    label,
    completed: index < completedTaskCount,
  }));
}

function deriveMoveStatus({
  todaySteps,
  stepGoal,
  isMoveActive,
}) {
  if (isMoveActive) return "active";

  const progress = percent(todaySteps, stepGoal);

  if (progress >= 100) return "on-track";
  if (todaySteps > 0) return "on-track";
  return "idle";
}

function derivePlayStatus({
  gamesPlayedToday,
  isPlayActive,
}) {
  if (isPlayActive) return "active";
  if (gamesPlayedToday > 0) return "played-today";
  return "ready";
}

function deriveTasksStatus({
  completedTaskCount,
  totalTaskCount,
}) {
  if (completedTaskCount >= totalTaskCount && totalTaskCount > 0) {
    return "complete";
  }

  if (completedTaskCount > 0) {
    return "in-progress";
  }

  return "ready";
}

function deriveShopUnlocked({
  explicitShopUnlocked,
  user,
  completedTaskCount,
  totalTaskCount,
}) {
  if (typeof explicitShopUnlocked === "boolean") {
    return explicitShopUnlocked;
  }

  if (typeof user?.shop_unlocked === "boolean") {
    return user.shop_unlocked;
  }

  if (typeof user?.shopUnlocked === "boolean") {
    return user.shopUnlocked;
  }

  return completedTaskCount >= totalTaskCount && totalTaskCount > 0;
}

function deriveZwapWindowState({
  explicitMode,
  explicitMessage,
  explicitHint,
  shopUnlocked,
  moveStatus,
  playStatus,
  tasksStatus,
  completedTaskCount,
  totalTaskCount,
}) {
  if (explicitMode || explicitMessage || explicitHint) {
    return {
      zwapMode: explicitMode || "active",
      zwapMessage: explicitMessage || "",
      zwapHint: explicitHint || "",
    };
  }

  if (shopUnlocked) {
    return {
      zwapMode: "active",
      zwapMessage: "Shop is ready.",
      zwapHint: "",
    };
  }

  if (tasksStatus === "complete") {
    return {
      zwapMode: "active",
      zwapMessage: "Daily loop complete.",
      zwapHint: "Nice work.",
    };
  }

  if (playStatus === "played-today") {
    return {
      zwapMode: "active",
      zwapMessage: "You just earned.",
      zwapHint: "Want to keep going?",
    };
  }

  if (moveStatus === "active") {
    return {
      zwapMode: "active",
      zwapMessage: "You’re moving.",
      zwapHint: "Keep it going.",
    };
  }

  if (completedTaskCount > 0 && completedTaskCount < totalTaskCount) {
    return {
      zwapMode: "active",
      zwapMessage: "You’re in motion.",
      zwapHint: "Finish today strong.",
    };
  }

  return {
    zwapMode: "idle",
    zwapMessage: "Ready when you are.",
    zwapHint: explicitHint || "",
  };
}

export default function useV1DashboardState({
  user,
  authUser,

  todaySteps,
  stepGoal = 10000,
  isMoveActive = false,

  gamesPlayedToday,
  playGoal = 3,
  isPlayActive = false,

  completedTaskCount,
  totalTaskCount = 4,
  taskStates,

  zptsBalance,

  shopUnlocked: explicitShopUnlocked,

  zwapMode: explicitZwapMode,
  zwapMessage: explicitZwapMessage,
  zwapHint: explicitZwapHint,
} = {}) {
  const [accountOpen, setAccountOpen] = useState(false);

  const openAccount = () => setAccountOpen(true);
  const closeAccount = () => setAccountOpen(false);

  const normalizedTodaySteps = useMemo(() => {
    return toNumber(
      todaySteps ??
        user?.today_steps ??
        user?.daily_steps ??
        user?.steps_today,
      0
    );
  }, [todaySteps, user]);

  const normalizedStepGoal = useMemo(() => {
    return Math.max(
      1,
      toNumber(
        stepGoal ??
          user?.step_goal ??
          user?.daily_step_goal,
        10000
      )
    );
  }, [stepGoal, user]);

  const normalizedGamesPlayedToday = useMemo(() => {
    return toNumber(
      gamesPlayedToday ??
        user?.games_played_today ??
        user?.gamesPlayedToday,
      0
    );
  }, [gamesPlayedToday, user]);

  const normalizedPlayGoal = useMemo(() => {
    return Math.max(
      1,
      toNumber(
        playGoal ??
          user?.play_goal ??
          user?.daily_play_goal,
        3
      )
    );
  }, [playGoal, user]);

  const normalizedCompletedTaskCount = useMemo(() => {
    return clamp(
      toNumber(
        completedTaskCount ??
          user?.completed_task_count ??
          user?.daily_tasks_completed,
        0
      ),
      0,
      Math.max(
        1,
        toNumber(
          totalTaskCount ??
            user?.total_task_count ??
            user?.daily_tasks_total,
          4
        )
      )
    );
  }, [completedTaskCount, totalTaskCount, user]);

  const normalizedTotalTaskCount = useMemo(() => {
    return Math.max(
      1,
      toNumber(
        totalTaskCount ??
          user?.total_task_count ??
          user?.daily_tasks_total,
        4
      )
    );
  }, [totalTaskCount, user]);

  const normalizedZptsBalance = useMemo(() => {
    return toNumber(
      zptsBalance ??
        user?.zpts_balance ??
        user?.zPtsBalance ??
        user?.zpts,
      0
    );
  }, [zptsBalance, user]);

  const moveProgressPercent = useMemo(() => {
    return percent(normalizedTodaySteps, normalizedStepGoal);
  }, [normalizedTodaySteps, normalizedStepGoal]);

  const moveStatus = useMemo(() => {
    return deriveMoveStatus({
      todaySteps: normalizedTodaySteps,
      stepGoal: normalizedStepGoal,
      isMoveActive,
    });
  }, [normalizedTodaySteps, normalizedStepGoal, isMoveActive]);

  const playProgressPercent = useMemo(() => {
    return percent(normalizedGamesPlayedToday, normalizedPlayGoal);
  }, [normalizedGamesPlayedToday, normalizedPlayGoal]);

  const playStatus = useMemo(() => {
    return derivePlayStatus({
      gamesPlayedToday: normalizedGamesPlayedToday,
      isPlayActive,
    });
  }, [normalizedGamesPlayedToday, isPlayActive]);

  const tasksProgressPercent = useMemo(() => {
    return percent(normalizedCompletedTaskCount, normalizedTotalTaskCount);
  }, [normalizedCompletedTaskCount, normalizedTotalTaskCount]);

  const tasksStatus = useMemo(() => {
    return deriveTasksStatus({
      completedTaskCount: normalizedCompletedTaskCount,
      totalTaskCount: normalizedTotalTaskCount,
    });
  }, [normalizedCompletedTaskCount, normalizedTotalTaskCount]);

  const shopUnlocked = useMemo(() => {
    return deriveShopUnlocked({
      explicitShopUnlocked,
      user,
      completedTaskCount: normalizedCompletedTaskCount,
      totalTaskCount: normalizedTotalTaskCount,
    });
  }, [
    explicitShopUnlocked,
    user,
    normalizedCompletedTaskCount,
    normalizedTotalTaskCount,
  ]);

  const normalizedTaskPreview = useMemo(() => {
    return buildTaskPreview({
      completedTaskCount: normalizedCompletedTaskCount,
      taskStates: taskStates ?? user?.taskStates ?? user?.daily_task_states,
      shopUnlocked,
    });
  }, [normalizedCompletedTaskCount, taskStates, user, shopUnlocked]);

  const zptsDisplay = useMemo(() => {
    return formatZpts(normalizedZptsBalance);
  }, [normalizedZptsBalance]);

  const zwapWindowState = useMemo(() => {
    return deriveZwapWindowState({
      explicitMode: explicitZwapMode,
      explicitMessage: explicitZwapMessage,
      explicitHint: explicitZwapHint,
      shopUnlocked,
      moveStatus,
      playStatus,
      tasksStatus,
      completedTaskCount: normalizedCompletedTaskCount,
      totalTaskCount: normalizedTotalTaskCount,
    });
  }, [
    explicitZwapMode,
    explicitZwapMessage,
    explicitZwapHint,
    shopUnlocked,
    moveStatus,
    playStatus,
    tasksStatus,
    normalizedCompletedTaskCount,
    normalizedTotalTaskCount,
  ]);

  return {
    account: {
      accountOpen,
      setAccountOpen,
      openAccount,
      closeAccount,
    },

    move: {
      todaySteps: normalizedTodaySteps,
      stepGoal: normalizedStepGoal,
      moveProgressPercent,
      moveStatus,
      isMoveActive: Boolean(isMoveActive),
    },

    play: {
      gamesPlayedToday: normalizedGamesPlayedToday,
      playGoal: normalizedPlayGoal,
      playProgressPercent,
      playStatus,
      isPlayActive: Boolean(isPlayActive),
    },

    tasks: {
      completedTaskCount: normalizedCompletedTaskCount,
      totalTaskCount: normalizedTotalTaskCount,
      tasksProgressPercent,
      tasksStatus,
      taskPreview: normalizedTaskPreview,
    },

    zpts: {
      zptsBalance: normalizedZptsBalance,
      zptsDisplay,
    },

    unlocks: {
      shopUnlocked,
    },

    zwap: {
      zwapMode: zwapWindowState.zwapMode,
      zwapMessage: zwapWindowState.zwapMessage,
      zwapHint: zwapWindowState.zwapHint,
    },

    user: {
      user,
      authUser,
    },
  };
}
