import React, { useState, useEffect, createContext, useContext } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const [isGetWalletPromptOpen, setIsGetWalletPromptOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isReturningUserPromptOpen, setIsReturningUserPromptOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [onchainBalance, setOnchainBalance] = useState(null);

  const isAuthenticated = !!walletAddress || !!authUser;

  const closeAllAuthModals = () => {
    setIsGetWalletPromptOpen(false);
    setIsOnboardingModalOpen(false);
    setIsReturningUserPromptOpen(false);
    setIsWalletModalOpen(false);
  };

  const openWalletUpgradeFlow = () => {
    closeAllAuthModals();
    setIsOnboardingModalOpen(true);
  };

  const openGuestWalletFlow = () => {
    closeAllAuthModals();
    setIsGetWalletPromptOpen(true);
  };

  const fetchOnchainBalance = async (address) => {
    try {
      const data = await api.getOnchainBalance(address);
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
    try {
      setIsLoading(true);
      const userData = await api.getUser(address);
      setUser(userData);
    } catch (error) {
      try {
        const newUser = await api.connectWallet(address);
        setUser(newUser);
      } catch (err) {
        console.log("Failed to load/create user");
        localStorage.removeItem("zwap_wallet");
        setWalletAddress(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedWallet = localStorage.getItem("zwap_wallet");
    const savedAuthUser = localStorage.getItem("zwap_auth_user");

    if (savedAuthUser) {
      try {
        setAuthUser(JSON.parse(savedAuthUser));
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
    console.log("🔌 connectWallet called with:", address);

    try {
      setIsLoading(true);
      const userData = await api.connectWallet(address);
      console.log("✅ api.connectWallet response:", userData);

      setUser(userData);
      setWalletAddress(address);
      localStorage.setItem("zwap_wallet", address);

      closeAllAuthModals();

      toast.success("Wallet connected!");
      return userData;
    } catch (error) {
      console.error("❌ api.connectWallet failed:", error);
      toast.error("Failed to connect wallet");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeEmailAuth = (emailUser) => {
    setAuthUser(emailUser);
    localStorage.setItem("zwap_auth_user", JSON.stringify(emailUser));
    closeAllAuthModals();
    toast.success("Signed in");
  };

  const disconnectWallet = () => {
    setUser(null);
    setWalletAddress(null);
    setOnchainBalance(null);
    localStorage.removeItem("zwap_wallet");
    toast.success("Wallet disconnected");
  };

  const logoutEmailUser = () => {
    setAuthUser(null);
    localStorage.removeItem("zwap_auth_user");
    localStorage.removeItem("zwap_email");
    toast.success("Signed out");
  };

  const logoutAll = () => {
    disconnectWallet();
    logoutEmailUser();
  };

  const refreshUser = async () => {
    if (walletAddress) {
      await loadWalletUser(walletAddress);
      await fetchOnchainBalance(walletAddress);
    }
  };

  const requireWallet = (action) => {
    if (!isAuthenticated) {
      setPendingAction(action);
      openGuestWalletFlow();
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

        isGetWalletPromptOpen,
        setIsGetWalletPromptOpen,

        isOnboardingModalOpen,
        setIsOnboardingModalOpen,

        isReturningUserPromptOpen,
        setIsReturningUserPromptOpen,

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
        openGuestWalletFlow,

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
