import React, { useState, useEffect, createContext, useContext } from "react";
import api from "@/lib/api";

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

function normalizeWallet(address) {
  return String(address || "").trim().toLowerCase();
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const [isReturningUserPromptOpen, setIsReturningUserPromptOpen] =
    useState(false);
  const [isEmailAuthModalOpen, setIsEmailAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [onchainBalance, setOnchainBalance] = useState(null);

  const isAuthenticated = !!walletAddress || !!authUser;

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
      } else {
        setOnchainBalance(null);
      }
    } catch (error) {
      console.log("Failed to fetch on-chain balance:", error);
      setOnchainBalance(null);
    }
  };

  const loadWalletUser = async (address) => {
    const normalizedAddress = normalizeWallet(address);

    if (!normalizedAddress) {
      setUser(null);
      setWalletAddress(null);
      setOnchainBalance(null);
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
        setOnchainBalance(null);
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

        const normalizedAuthUser = parsedAuthUser?.walletAddress
          ? {
              ...parsedAuthUser,
              walletAddress: normalizeWallet(parsedAuthUser.walletAddress),
            }
          : parsedAuthUser;

        setAuthUser(normalizedAuthUser);
        localStorage.setItem(
          "zwap_auth_user",
          JSON.stringify(normalizedAuthUser)
        );
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

      if (authUser && !authUser.walletAddress) {
        const updatedAuthUser = {
          ...authUser,
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

    if (authUser) {
      const updatedAuthUser = {
        ...authUser,
        walletAddress: null,
      };
      setAuthUser(updatedAuthUser);
      localStorage.setItem("zwap_auth_user", JSON.stringify(updatedAuthUser));
    }
  };

  const logoutEmailUser = () => {
    setAuthUser(null);
    localStorage.removeItem("zwap_auth_user");
    localStorage.removeItem("zwap_email");
  };

  const logoutAll = () => {
    setUser(null);
    setAuthUser(null);
    setWalletAddress(null);
    setOnchainBalance(null);

    setPendingAction(null);

    localStorage.removeItem("zwap_wallet");
    localStorage.removeItem("zwap_auth_user");
    localStorage.removeItem("zwap_email");

    sessionStorage.removeItem("zwap_force_new_user");

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
        authUser,
        setAuthUser,
        walletAddress,
        isAuthenticated,

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