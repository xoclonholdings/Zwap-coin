import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useRef,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import api from "@/lib/api";
import { generateUsername } from "@/lib/utils/generateUsername";

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getEmailPrefix(email) {
  return normalizeEmail(email).split("@")[0] || "";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * V1 Identity Normalization
 * - Email is the ONLY identity input
 * - Username is generated if missing or still equal to email prefix
 * - No wallet logic allowed in V1
 */
function normalizeV1UserIdentity(userData, emailFallback = "") {
  const normalizedEmail = normalizeEmail(userData?.email || emailFallback);
  const emailPrefix = getEmailPrefix(normalizedEmail);
  const currentUsername = String(userData?.username || "").trim();

  const shouldGenerateUsername =
    !currentUsername ||
    currentUsername.toLowerCase() === emailPrefix.toLowerCase();

  const resolvedUsername = shouldGenerateUsername
    ? generateUsername({ email: normalizedEmail })
    : currentUsername;

  return {
    ...(userData || {}),
    email: normalizedEmail,
    username: resolvedUsername,
    displayName:
      userData?.displayName || userData?.display_name || resolvedUsername,
    display_name:
      userData?.display_name || userData?.displayName || resolvedUsername,
  };
}

function buildPrivyAuthUser(privyUser) {
  if (!privyUser) return null;

  const email =
    privyUser?.email?.address ||
    privyUser?.google?.email ||
    privyUser?.apple?.email ||
    null;

  return {
    id: privyUser.id,
    email: normalizeEmail(email),
    authProvider: "privy",
  };
}

export function AppProvider({ children }) {
  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
    logout: privyLogout,
  } = usePrivy();

  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  const [isReturningUserPromptOpen, setIsReturningUserPromptOpen] =
    useState(false);
  const [isEmailAuthModalOpen, setIsEmailAuthModalOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const dailyClaimRef = useRef({});

  const privyAuthUser = useMemo(() => {
    if (isSigningOut) return null;
    if (!privyReady || !privyAuthenticated) return null;
    return buildPrivyAuthUser(privyUser);
  }, [isSigningOut, privyReady, privyAuthenticated, privyUser]);

  const effectiveAuthUser = authUser || privyAuthUser;
  const isAuthenticated = Boolean(effectiveAuthUser);

  const closeAllAuthModals = () => {
    setIsReturningUserPromptOpen(false);
    setIsEmailAuthModalOpen(false);
  };

  const clearLocalAuthStorage = () => {
    localStorage.removeItem("zwap_auth_user");
    localStorage.removeItem("zwap_email");
  };

  const clearAuthState = () => {
    setUser(null);
    setAuthUser(null);
    setPendingAction(null);
    closeAllAuthModals();
  };

  const claimDailyRewardOnce = async (email) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    const claimKey = `${normalizedEmail}:${todayKey()}`;

    if (dailyClaimRef.current[claimKey]) {
      return null;
    }

    dailyClaimRef.current[claimKey] = true;

    try {
      return await api.claimDailyReward(normalizedEmail);
    } catch (error) {
      console.log("Daily reward claim skipped:", error?.message || error);
      return null;
    }
  };

  const loadEmailUser = async (email, options = {}) => {
    const normalizedEmail = normalizeEmail(email);
    const shouldClaimDaily = options.claimDaily !== false;

    if (!normalizedEmail) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);

      const userData = await api.getUserByEmail(normalizedEmail);

      let normalizedUser = normalizeV1UserIdentity(
        userData,
        normalizedEmail
      );

      setUser(normalizedUser);

      if (shouldClaimDaily) {
        const claimResult = await claimDailyRewardOnce(normalizedEmail);

        if (claimResult?.success) {
          const refreshedUser = await api.getUserByEmail(normalizedEmail);

          normalizedUser = normalizeV1UserIdentity(
            refreshedUser,
            normalizedEmail
          );

          setUser(normalizedUser);
        }
      }

      return normalizedUser;
    } catch {
      try {
        const generatedUsername = generateUsername({
          email: normalizedEmail,
        });

        const newUser = await api.createOrUpdateEmailUser(normalizedEmail, {
          username: generatedUsername,
          displayName: generatedUsername,
          display_name: generatedUsername,
        });

        let normalizedUser = normalizeV1UserIdentity(
          newUser,
          normalizedEmail
        );

        setUser(normalizedUser);

        if (shouldClaimDaily) {
          const claimResult = await claimDailyRewardOnce(normalizedEmail);

          if (claimResult?.success) {
            const refreshedUser = await api.getUserByEmail(normalizedEmail);

            normalizedUser = normalizeV1UserIdentity(
              refreshedUser,
              normalizedEmail
            );

            setUser(normalizedUser);
          }
        }

        return normalizedUser;
      } catch (error) {
        console.log("Failed to load/create email user:", error);
        setUser(null);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedAuthUser = localStorage.getItem("zwap_auth_user");

    if (savedAuthUser) {
      try {
        const parsedAuthUser = JSON.parse(savedAuthUser);

        const normalizedAuthUser = normalizeV1UserIdentity(parsedAuthUser);

        setIsSigningOut(false);
        setAuthUser(normalizedAuthUser);

        localStorage.setItem(
          "zwap_auth_user",
          JSON.stringify(normalizedAuthUser)
        );

        if (normalizedAuthUser.email) {
          loadEmailUser(normalizedAuthUser.email).finally(() =>
            setInitialized(true)
          );
          return;
        }
      } catch {
        console.log("Failed to parse saved auth user");
        localStorage.removeItem("zwap_auth_user");
      }
    }

    setIsLoading(false);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (isSigningOut) return;
    if (!privyAuthUser?.email) return;

    const normalizedPrivyAuthUser =
      normalizeV1UserIdentity(privyAuthUser);

    setAuthUser(normalizedPrivyAuthUser);

    localStorage.setItem(
      "zwap_auth_user",
      JSON.stringify(normalizedPrivyAuthUser)
    );
    localStorage.setItem("zwap_email", normalizedPrivyAuthUser.email);

    closeAllAuthModals();

    loadEmailUser(normalizedPrivyAuthUser.email);
  }, [isSigningOut, privyAuthUser]);

  const completeEmailAuth = async (emailUser) => {
    const normalizedEmailUser = normalizeV1UserIdentity({
      ...(emailUser || {}),
      authProvider: emailUser?.authProvider || "email",
    });

    setIsSigningOut(false);
    setAuthUser(normalizedEmailUser);
    setUser(normalizedEmailUser);

    localStorage.setItem(
      "zwap_auth_user",
      JSON.stringify(normalizedEmailUser)
    );
    localStorage.setItem("zwap_email", normalizedEmailUser.email);

    closeAllAuthModals();

    if (normalizedEmailUser.email) {
      await loadEmailUser(normalizedEmailUser.email);
    }
  };

  const logoutEmailUser = async () => {
    try {
      setIsSigningOut(true);
      setAuthUser(null);
      setUser(null);

      localStorage.removeItem("zwap_auth_user");
      localStorage.removeItem("zwap_email");

      if (privyAuthenticated) {
        await privyLogout?.();
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  const logoutAll = async () => {
    try {
      setIsSigningOut(true);
      setIsLoading(true);

      clearAuthState();
      clearLocalAuthStorage();

      if (privyAuthenticated) {
        await privyLogout?.();
      }
    } finally {
      clearAuthState();
      clearLocalAuthStorage();
      setIsSigningOut(false);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (effectiveAuthUser?.email) {
      await loadEmailUser(effectiveAuthUser.email, { claimDaily: false });
    }
  };

  // V1: Wallet completely disabled
  const requireWallet = () => false;

  const connectWallet = async () => {
    throw new Error("Wallets are not enabled in ZWAP! V1.");
  };

  const disconnectWallet = () => {};

  const openWalletUpgradeFlow = () => {};

  const fetchOnchainBalance = async () => {};

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authUser: effectiveAuthUser,
        setAuthUser,

        walletAddress: null,
        isAuthenticated,

        privyReady,
        privyAuthenticated,
        privyUser,

        isReturningUserPromptOpen,
        setIsReturningUserPromptOpen,

        isEmailAuthModalOpen,
        setIsEmailAuthModalOpen,

        isWalletModalOpen: false,
        setIsWalletModalOpen: () => {},

        pendingAction,
        setPendingAction,

        connectWallet,
        completeEmailAuth,
        disconnectWallet,
        logoutEmailUser,
        logoutAll,
        refreshUser,
        requireWallet,

        closeAllAuthModals,
        openWalletUpgradeFlow,

        isLoading,
        initialized,
        showSplash,
        setShowSplash,

        onchainBalance: null,
        fetchOnchainBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}