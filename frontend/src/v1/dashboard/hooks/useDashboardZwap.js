import { useMemo } from "react";

function mergeTaskState(taskStates = [], updates = {}) {
  if (!Array.isArray(taskStates)) return taskStates;

  return taskStates.map((task) => {
    const label = String(task?.label || "").toLowerCase();

    if (label === "move") {
      return {
        ...task,
        completed: Boolean(task?.completed || updates.move),
      };
    }

    if (label === "play") {
      return {
        ...task,
        completed: Boolean(task?.completed || updates.play),
      };
    }

    return task;
  });
}

export default function useDashboardZwap({
  isAdminPreviewUser = false,

  shopUnlocked = false,
  gardenUnlocked = false,
  rarePlantUnlocked = false,
  isSwapUnlocked = false,
  badgeVisibilityUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  assistUnlocked = false,

  activitySnapshot = null,

  zptsBalance = 0,
  localZptsBalance = null,

  dailySteps = 0,
  sessionSteps = 0,

  gamesPlayedToday = 0,
  localGamesPlayedToday = 0,

  lessonsCompletedToday = 0,
  fullLoopCompleted = false,

  completedTaskCount = 0,
  totalTaskCount = 4,
  taskStates = [],
}) {
  const previewShopUnlocked = isAdminPreviewUser || shopUnlocked;
  const previewGardenUnlocked = isAdminPreviewUser || gardenUnlocked;
  const previewRarePlantUnlocked = isAdminPreviewUser || rarePlantUnlocked;
  const previewSwapUnlocked = isAdminPreviewUser || isSwapUnlocked;
  const previewBadgeVisibilityUnlocked =
    isAdminPreviewUser || badgeVisibilityUnlocked;
  const previewLearnUnlocked = isAdminPreviewUser || learnUnlocked;
  const previewStreamUnlocked = isAdminPreviewUser || streamUnlocked;
  const previewAssistUnlocked = isAdminPreviewUser || assistUnlocked;

  const resolvedZptsBalance = Math.max(
    Number(activitySnapshot?.zptsBalance || 0),
    Number(zptsBalance || 0),
    Number(localZptsBalance || 0)
  );

  const resolvedDailySteps = Math.max(
    Number(activitySnapshot?.dailySteps || 0),
    Number(dailySteps || 0),
    Number(sessionSteps || 0)
  );

  const resolvedGamesPlayedToday = Math.max(
    Number(activitySnapshot?.gamesPlayedToday || 0),
    Number(gamesPlayedToday || 0),
    Number(localGamesPlayedToday || 0)
  );

  const resolvedHighScores =
    activitySnapshot?.highScores && typeof activitySnapshot.highScores === "object"
      ? activitySnapshot.highScores
      : {};

  const resolvedLessonsCompletedToday =
    activitySnapshot?.lessonsCompletedToday ?? lessonsCompletedToday;

  const resolvedFullLoopCompleted =
    activitySnapshot?.fullLoopCompleted ?? fullLoopCompleted;

  const baseResolvedTaskStates =
    Array.isArray(activitySnapshot?.taskStates) &&
    activitySnapshot.taskStates.length > 0
      ? activitySnapshot.taskStates
      : taskStates;

  const resolvedTaskStates = mergeTaskState(baseResolvedTaskStates, {
    move: resolvedDailySteps > 0 || sessionSteps > 0,
    play: resolvedGamesPlayedToday > 0,
  });

  const resolvedCompletedTaskCount = Math.max(
    Number(activitySnapshot?.completedTaskCount || 0),
    Number(completedTaskCount || 0),
    resolvedTaskStates.filter((task) => task?.completed).length
  );

  const resolvedTotalTaskCount =
    activitySnapshot?.totalTaskCount ?? totalTaskCount;

  return useMemo(
    () => ({
      previewShopUnlocked,
      previewGardenUnlocked,
      previewRarePlantUnlocked,
      previewSwapUnlocked,
      previewBadgeVisibilityUnlocked,
      previewLearnUnlocked,
      previewStreamUnlocked,
      previewAssistUnlocked,

      resolvedZptsBalance,
      resolvedDailySteps,
      resolvedGamesPlayedToday,
      resolvedHighScores,
      resolvedLessonsCompletedToday,
      resolvedFullLoopCompleted,
      resolvedTaskStates,
      resolvedCompletedTaskCount,
      resolvedTotalTaskCount,
    }),
    [
      previewShopUnlocked,
      previewGardenUnlocked,
      previewRarePlantUnlocked,
      previewSwapUnlocked,
      previewBadgeVisibilityUnlocked,
      previewLearnUnlocked,
      previewStreamUnlocked,
      previewAssistUnlocked,
      resolvedZptsBalance,
      resolvedDailySteps,
      resolvedGamesPlayedToday,
      resolvedHighScores,
      resolvedLessonsCompletedToday,
      resolvedFullLoopCompleted,
      resolvedTaskStates,
      resolvedCompletedTaskCount,
      resolvedTotalTaskCount,
    ]
  );
}