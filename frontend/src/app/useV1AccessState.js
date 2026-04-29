const ADMIN_PREVIEW_EMAILS = ["admin@zwap.online"];

function getResolvedEmail({ authUser, user }) {
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

function buildDisplayName({ authUser, user }) {
  if (user?.username) return user.username;
  if (authUser?.username) return authUser.username;
  if (authUser?.email?.address) return authUser.email.address.split("@")[0];
  if (authUser?.email) return String(authUser.email).split("@")[0];
  if (user?.email) return String(user.email).split("@")[0];

  return "Zwapper";
}

export default function useV1AccessState({ user, authUser, isAuthenticated }) {
  const resolvedEmail = getResolvedEmail({ authUser, user });
  const isAdminPreviewUser = getIsAdminPreviewUser(resolvedEmail);
  const canSeeDashboard = Boolean(isAuthenticated);

  const displayName = buildDisplayName({
    authUser,
    user,
  });

  const tier =
    isAdminPreviewUser || user?.subscription_tier === "plus"
      ? "zitizen"
      : "zwapper";

  return {
    isReviewAccess: resolvedEmail === "review@zwap.app",
    canSeeDashboard,
    resolvedEmail,
    isAdminPreviewUser,
    displayName,
    tier,
    reviewUser: null,
  };
}