import { useMemo, useState } from "react";

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
  const [isReviewAccess] = useState(() => getReviewAccessEnabled());

  const canSeeDashboard = Boolean(isAuthenticated || isReviewAccess);

  const resolvedEmail = useMemo(() => {
    return getResolvedEmail({ authUser, user, isReviewAccess });
  }, [authUser, user, isReviewAccess]);

  const isAdminPreviewUser = useMemo(() => {
    return getIsAdminPreviewUser(resolvedEmail);
  }, [resolvedEmail]);

  const displayName = useMemo(() => {
    return buildDisplayName({
      authUser,
      user,
      walletAddress,
      isReviewAccess,
    });
  }, [authUser, user, walletAddress, isReviewAccess]);

  const tier =
    isAdminPreviewUser || user?.subscription_tier === "plus"
      ? "zitizen"
      : "zwapper";

  return {
    isReviewAccess,
    canSeeDashboard,
    resolvedEmail,
    isAdminPreviewUser,
    displayName,
    tier,
  };
}