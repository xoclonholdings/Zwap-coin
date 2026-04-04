import React, { useState, useEffect, createContext, useContext } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
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

  const isPrivyOnlyAuth =
    !!authUser &&
    authUser?.authProvider === "privy" &&
    !walletAddress;

  const isAuthenticated =
    !!walletAddress || (!!authUser && !isPrivyOnlyAuth);

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
    try {
      setIsLoading(true);
      const userData = await api.connectWallet(address);

      setUser(userData);
      setWalletAddress(address);
      localStorage.setItem("zwap_wallet", address);

      if (authUser && !authUser.walletAddress) {
        const updatedAuthUser = {
          ...authUser,
          walletAddress: address,
        };
        setAuthUser(updatedAuthUser);
        localStorage.setItem("zwap_auth_user", JSON.stringify(updatedAuthUser));
      }

      closeAllAuthModals();

      toast.success("Wallet connected!");
      return userData;
    } catch (error) {
      console.error("api.connectWallet failed:", error);
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

  const disconnectWallet = (showToast = true) => {
    setUser(null);
    setWalletAddress(null);
    setOnchainBalance(null);
    localStorage.removeItem("zwap_wallet");

    if (authUser?.authProvider === "privy") {
      setAuthUser(null);
      localStorage.removeItem("zwap_auth_user");
    } else if (authUser?.walletAddress) {
      const updatedAuthUser = {
        ...authUser,
        walletAddress: null,
      };
      setAuthUser(updatedAuthUser);
      localStorage.setItem("zwap_auth_user", JSON.stringify(updatedAuthUser));
    }

    if (showToast) {
      toast.success("Wallet disconnected");
    }
  };

  const logoutEmailUser = (showToast = true) => {
    setAuthUser(null);
    localStorage.removeItem("zwap_auth_user");
    localStorage.removeItem("zwap_email");

    if (showToast) {
      toast.success("Signed out");
    }
  };

  const logoutAll = () => {
    disconnectWallet(false);
    logoutEmailUser(false);
    closeAllAuthModals();
    toast.success("Signed out");
  };

  const refreshUser = async () => {
    if (walletAddress) {
      await loadWalletUser(walletAddress);
      await fetchOnchainBalance(walletAddress);
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