const REVIEW_ACCESS_STORAGE_KEY = "zwap_review_access_enabled";
const ADMIN_PREVIEW_EMAILS = ["admin@zwap.online"];

function getReviewAccessEnabled() {
  try {
    return window.localStorage.getItem(REVIEW_ACCESS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getResolvedEmail({ authUser, user, isReviewAccess }) {
  if (isReviewAccess) return "review@zwap.app";

  return String(
    authUser?.email?.address ||
      authUser?.email ||
      user?.email ||
      user?.email_address ||
      ""
  )
    .trim()
    .toLowerCase();
}

function getIsAdminPreviewUser(email) {
  return ADMIN_PREVIEW_EMAILS.includes(String(email || "").trim().toLowerCase());
}

function buildDisplayName({ authUser, user, walletAddress, isReviewAccess }) {
  if (isReviewAccess) return "Reviewer";
  if (authUser?.email?.address) return authUser.email.address.split("@")[0];
  if (authUser?.email) return String(authUser.email).split("@")[0];
  if (user?.email) return String(user.email).split("@")[0];
  if (walletAddress) return `Zwapper ${walletAddress.slice(2, 6)}`;
  return "Zwapper";
}

export default function useV1AccessState({
  user,
  authUser,
  walletAddress,
  isAuthenticated,
}) {
  const isReviewAccess = getReviewAccessEnabled();
  const canSeeDashboard = Boolean(isAuthenticated || isReviewAccess);

  const resolvedEmail = getResolvedEmail({
    authUser,
    user,
    isReviewAccess,
  });

  const isAdminPreviewUser = getIsAdminPreviewUser(resolvedEmail);

  const displayName = buildDisplayName({
    authUser,
    user,
    walletAddress,
    isReviewAccess,
  });

  const tier =
    isAdminPreviewUser || user?.subscription_tier === "plus"
      ? "zitizen"
      : "zwapper";

  const reviewUser = isReviewAccess
    ? {
        id: "review-user",
        email: "review@zwap.app",
        username: "Reviewer",
        zptsBalance: 100,
        zpts_balance: 100,
        zwap_balance: 0,
        dailySteps: 20,
        daily_steps: 20,
        gamesPlayedToday: 1,
        games_played_today: 1,
        completed_task_count: 2,
        total_task_count: 4,
        tier,
      }
    : null;

  return {
    isReviewAccess,
    canSeeDashboard,
    resolvedEmail,
    isAdminPreviewUser,
    displayName,
    tier,
    reviewUser,
  };
}