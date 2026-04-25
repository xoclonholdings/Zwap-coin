import React, { useState, useEffect, createContext, useContext, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import api from "@/lib/api";

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

function normalizeWallet(address) {
  return String(address || "").trim().toLowerCase();
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
    email,
    authProvider: "privy",
    walletAddress: privyUser?.wallet?.address
      ? normalizeWallet(privyUser.wallet.address)
      : null,
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
  const [walletAddress, setWalletAddress] = useState(null);

  const [isReturningUserPromptOpen, setIsReturningUserPromptOpen] = useState(false);
  const [isEmailAuthModalOpen, setIsEmailAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [onchainBalance, setOnchainBalance] = useState(null);

  const privyAuthUser = useMemo(() => {
    if (!privyReady || !privyAuthenticated) return null;
    return buildPrivyAuthUser(privyUser);
  }, [privyReady, privyAuthenticated, privyUser]);

  const effectiveAuthUser = authUser || privyAuthUser;

  const isAuthenticated =
    Boolean(walletAddress) || Boolean(authUser) || Boolean(privyAuthUser);

  const closeAllAuthModals = () => {
    setIsReturningUserPromptOpen(false);
    setIsEmailAuthModalOpen(false);
    setIsWalletModalOpen(false);
  };

  const openWalletUpgradeFlow = () => {
    closeAllAuthModals();
    setIsWalletModalOpen(true);
  };

  const fetchOnchainBalance = async (address) => {
    const normalizedAddress = normalizeWallet(address);
    if (!normalizedAddress) {
      setOnchainBalance(null);
      return;
    }

    try {
      const data = await api.getOnchainBalance(normalizedAddress);
      if (
        data?.onchain_balance !== null &&
        data?.onchain_balance !== undefined
      ) {
        setOnchainBalance(data.onchain_balance);
      }
    } catch (error) {
      console.log("Failed to fetch on-chain balance:", error);
    }
  };

  const loadWalletUser = async (address) => {
    const normalizedAddress = normalizeWallet(address);
    if (!normalizedAddress) {
      setUser(null);
      setWalletAddress(null);
      localStorage.removeItem("zwap_wallet");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setWalletAddress(normalizedAddress);

      const userData = await api.getUser(normalizedAddress);
      setUser(userData);
      localStorage.setItem("zwap_wallet", normalizedAddress);
    } catch (error) {
      try {
        const newUser = await api.connectWallet(normalizedAddress);
        setUser(newUser);
        localStorage.setItem("zwap_wallet", normalizedAddress);
      } catch (err) {
        console.log("Failed to load/create user");
        localStorage.removeItem("zwap_wallet");
        setWalletAddress(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedWallet = normalizeWallet(localStorage.getItem("zwap_wallet"));
    const savedAuthUser = localStorage.getItem("zwap_auth_user");

    if (savedAuthUser) {
      try {
        const parsedAuthUser = JSON.parse(savedAuthUser);

        if (parsedAuthUser?.walletAddress) {
          parsedAuthUser.walletAddress = normalizeWallet(parsedAuthUser.walletAddress);
        }

        setAuthUser(parsedAuthUser);
        localStorage.setItem("zwap_auth_user", JSON.stringify(parsedAuthUser));
      } catch (error) {
        console.log("Failed to parse saved auth user");
        localStorage.removeItem("zwap_auth_user");
      }
    }

    if (savedWallet) {
      setWalletAddress(savedWallet);
      loadWalletUser(savedWallet).finally(() => setInitialized(true));
    } else {
      setIsLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!privyAuthUser) return;

    setAuthUser(privyAuthUser);
    localStorage.setItem("zwap_auth_user", JSON.stringify(privyAuthUser));
    closeAllAuthModals();
  }, [privyAuthUser]);

  useEffect(() => {
    if (walletAddress) {
      fetchOnchainBalance(walletAddress);
    } else {
      setOnchainBalance(null);
    }
  }, [walletAddress]);

  const connectWallet = async (address) => {
    const normalizedAddress = normalizeWallet(address);
    if (!normalizedAddress) {
      throw new Error("Invalid wallet address");
    }

    try {
      setIsLoading(true);

      const userData = await api.connectWallet(normalizedAddress);

      setUser(userData);
      setWalletAddress(normalizedAddress);
      localStorage.setItem("zwap_wallet", normalizedAddress);

      if (effectiveAuthUser && !effectiveAuthUser.walletAddress) {
        const updatedAuthUser = {
          ...effectiveAuthUser,
          walletAddress: normalizedAddress,
        };
        setAuthUser(updatedAuthUser);
        localStorage.setItem("zwap_auth_user", JSON.stringify(updatedAuthUser));
      }

      closeAllAuthModals();
      return userData;
    } catch (error) {
      console.error("api.connectWallet failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeEmailAuth = (emailUser) => {
    const normalizedEmailUser = emailUser?.walletAddress
      ? {
          ...emailUser,
          walletAddress: normalizeWallet(emailUser.walletAddress),
        }
      : emailUser;

    setAuthUser(normalizedEmailUser);
    localStorage.setItem("zwap_auth_user", JSON.stringify(normalizedEmailUser));
    closeAllAuthModals();
  };

  const disconnectWallet = () => {
    setUser(null);
    setWalletAddress(null);
    setOnchainBalance(null);
    localStorage.removeItem("zwap_wallet");

    if (authUser?.walletAddress) {
      const updatedAuthUser = {
        ...authUser,
        walletAddress: null,
      };
      setAuthUser(updatedAuthUser);
      localStorage.setItem("zwap_auth_user", JSON.stringify(updatedAuthUser));
    }
  };

  const logoutEmailUser = async () => {
    setAuthUser(null);
    localStorage.removeItem("zwap_auth_user");
    localStorage.removeItem("zwap_email");

    if (privyAuthenticated) {
      await privyLogout?.();
    }
  };

  const logoutAll = async () => {
    disconnectWallet();
    await logoutEmailUser();
    closeAllAuthModals();
  };

  const refreshUser = async () => {
    const normalizedAddress = normalizeWallet(walletAddress);
    if (normalizedAddress) {
      await loadWalletUser(normalizedAddress);
      await fetchOnchainBalance(normalizedAddress);
    }
  };

  const requireWallet = (action) => {
    if (!walletAddress) {
      setPendingAction(action);
      closeAllAuthModals();
      setIsWalletModalOpen(true);
      return false;
    }
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authUser: effectiveAuthUser,
        setAuthUser,
        walletAddress,
        isAuthenticated,

        privyReady,
        privyAuthenticated,
        privyUser,

        isReturningUserPromptOpen,
        setIsReturningUserPromptOpen,

        isEmailAuthModalOpen,
        setIsEmailAuthModalOpen,

        isWalletModalOpen,
        setIsWalletModalOpen,

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

        onchainBalance,
        fetchOnchainBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}