function toSafeNumber(value) {
  return Math.max(Number(value) || 0, 0);
}

export function getNextBadge(profile = {}) {
  const loginDays = toSafeNumber(profile?.badge_login_days ?? profile?.daily_login_count);
  const fullLoopDays = toSafeNumber(profile?.badge_full_loop_days ?? profile?.daily_loop_completions);
  const stepDays = toSafeNumber(profile?.badge_step_days ?? profile?.move_active_days);
  const sustainedMoveDays = toSafeNumber(profile?.badge_sustained_move_days ?? profile?.move_streak_days);
  const assistsSent = toSafeNumber(profile?.badge_assists_sent ?? profile?.daily_assists_sent_total);
  const deepEngagement = toSafeNumber(profile?.badge_deep_engagement ?? profile?.learn_modules_completed_total);
  const zptsEarned = toSafeNumber(profile?.badge_zpts_earned ?? profile?.zpts_lifetime);
  const referrals = toSafeNumber(profile?.badge_referrals ?? profile?.referral_count);
  const learnCompletions = toSafeNumber(profile?.badge_learn_completions ?? profile?.learn_modules_completed_total);

  const badgeOrder = [
    {
      key: "starter",
      label: "Starter",
      category: "Consistency",
      progress: loginDays,
      goal: 3,
      hint: (remaining) =>
        `${remaining} more daily login${remaining === 1 ? "" : "s"} to reach Starter.`,
    },
    {
      key: "finisher",
      label: "Finisher",
      category: "Consistency",
      progress: fullLoopDays,
      goal: 7,
      hint: (remaining) =>
        `${remaining} more full daily loop${remaining === 1 ? "" : "s"} to reach Finisher.`,
    },
    {
      key: "shaker",
      label: "Shaker",
      category: "Movement",
      progress: stepDays,
      goal: 5,
      hint: (remaining) =>
        `${remaining} more active step day${remaining === 1 ? "" : "s"} to reach Shaker.`,
    },
    {
      key: "mover",
      label: "Mover",
      category: "Movement",
      progress: sustainedMoveDays,
      goal: 7,
      hint: (remaining) =>
        `${remaining} more movement day${remaining === 1 ? "" : "s"} to reach Mover.`,
    },
    {
      key: "contributor",
      label: "Contributor",
      category: "Behavior",
      progress: assistsSent,
      goal: 10,
      hint: (remaining) =>
        `${remaining} more assist${remaining === 1 ? "" : "s"} to reach Contributor.`,
    },
    {
      key: "builder",
      label: "Builder",
      category: "Behavior",
      progress: deepEngagement,
      goal: 5,
      hint: (remaining) =>
        `${remaining} more deep engagement action${remaining === 1 ? "" : "s"} to reach Builder.`,
    },
    {
      key: "earner",
      label: "Earner",
      category: "Activity",
      progress: zptsEarned,
      goal: 1000,
      hint: (remaining) =>
        `${remaining} more zPts to reach Earner.`,
    },
    {
      key: "supporter",
      label: "Supporter",
      category: "Activity",
      progress: referrals,
      goal: 3,
      hint: (remaining) =>
        `${remaining} more referral${remaining === 1 ? "" : "s"} to reach Supporter.`,
    },
    {
      key: "learner",
      label: "Learner",
      category: "Activity",
      progress: learnCompletions,
      goal: 3,
      hint: (remaining) =>
        `${remaining} more learn completion${remaining === 1 ? "" : "s"} to reach Learner.`,
    },
  ];

  const nextBadge =
    badgeOrder.find((badge) => badge.progress < badge.goal) || badgeOrder[badgeOrder.length - 1];

  const safeProgress = Math.min(nextBadge.progress, nextBadge.goal);
  const remaining = Math.max(nextBadge.goal - safeProgress, 0);

  return {
    key: nextBadge.key,
    label: nextBadge.label,
    category: nextBadge.category,
    progress: safeProgress,
    goal: nextBadge.goal,
    completed: safeProgress >= nextBadge.goal,
    hint:
      safeProgress >= nextBadge.goal
        ? `${nextBadge.label} completed.`
        : nextBadge.hint(remaining),
  };
}