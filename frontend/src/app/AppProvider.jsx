import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import api from "@/lib/api";

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
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

  const loadEmailUser = async (email) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);

      const userData = await api.getUserByEmail(normalizedEmail);

      setUser(userData);
      return userData;
    } catch {
      try {
        const newUser = await api.createOrUpdateEmailUser(normalizedEmail, {
          username: normalizedEmail.split("@")[0],
        });

        setUser(newUser);
        return newUser;
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
        const normalizedAuthUser = {
          ...parsedAuthUser,
          email: normalizeEmail(parsedAuthUser?.email),
        };

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

    setAuthUser(privyAuthUser);
    localStorage.setItem("zwap_auth_user", JSON.stringify(privyAuthUser));
    closeAllAuthModals();

    loadEmailUser(privyAuthUser.email);
  }, [isSigningOut, privyAuthUser]);

  const completeEmailAuth = (emailUser) => {
    const normalizedEmailUser = {
      ...(emailUser || {}),
      email: normalizeEmail(emailUser?.email),
      authProvider: emailUser?.authProvider || "email",
    };

    setIsSigningOut(false);
    setAuthUser(normalizedEmailUser);
    setUser(normalizedEmailUser);
    localStorage.setItem("zwap_auth_user", JSON.stringify(normalizedEmailUser));
    localStorage.setItem("zwap_email", normalizedEmailUser.email);
    closeAllAuthModals();
  };

  const logoutEmailUser = async () => {
    setIsSigningOut(true);
    setAuthUser(null);
    setUser(null);
    localStorage.removeItem("zwap_auth_user");
    localStorage.removeItem("zwap_email");

    if (privyAuthenticated) {
      await privyLogout?.();
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
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (effectiveAuthUser?.email) {
      await loadEmailUser(effectiveAuthUser.email);
    }
  };

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