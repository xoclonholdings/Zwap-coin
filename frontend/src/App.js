import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import WelcomeScreen from "@/components/WelcomeScreen";
import WalletModal from "@/components/WalletModal";
import Dashboard from "@/components/Dashboard";
import MoveTab from "@/components/MoveTab";
import PlayTab from "@/components/PlayTab";
import ShopTab from "@/components/ShopTab";
import SwapTab from "@/components/SwapTab";
import TabNavigation from "@/components/TabNavigation";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// App Context
export const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// API functions
export const api = {
  connectWallet: async (walletAddress) => {
    const res = await fetch(`${API}/users/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
    return res.json();
  },
  
  getUser: async (walletAddress) => {
    const res = await fetch(`${API}/users/${walletAddress}`);
    if (!res.ok) throw new Error("User not found");
    return res.json();
  },
  
  claimStepRewards: async (walletAddress, steps) => {
    const res = await fetch(`${API}/faucet/steps/${walletAddress}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps }),
    });
    return res.json();
  },
  
  claimGameRewards: async (walletAddress, score, blocksDestroyed) => {
    const res = await fetch(`${API}/faucet/game/${walletAddress}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, blocks_destroyed: blocksDestroyed }),
    });
    return res.json();
  },
  
  scratchToWin: async (walletAddress) => {
    const res = await fetch(`${API}/faucet/scratch/${walletAddress}`, {
      method: "POST",
    });
    return res.json();
  },
  
  getShopItems: async () => {
    const res = await fetch(`${API}/shop/items`);
    return res.json();
  },
  
  purchaseItem: async (walletAddress, itemId) => {
    const res = await fetch(`${API}/shop/purchase/${walletAddress}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Purchase failed");
    }
    return res.json();
  },
  
  getPrices: async () => {
    const res = await fetch(`${API}/swap/prices`);
    return res.json();
  },
  
  executeSwap: async (walletAddress, fromToken, toToken, amount) => {
    const res = await fetch(`${API}/swap/execute/${walletAddress}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from_token: fromToken, to_token: toToken, amount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Swap failed");
    }
    return res.json();
  },
};

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("zwap_wallet");
    if (savedWallet) {
      setWalletAddress(savedWallet);
      loadUser(savedWallet);
    }
  }, []);

  const loadUser = async (address) => {
    try {
      setIsLoading(true);
      const userData = await api.getUser(address);
      setUser(userData);
    } catch (error) {
      // If user doesn't exist, connect wallet will create them
      console.log("User not found, will create on connect");
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (address) => {
    try {
      setIsLoading(true);
      const userData = await api.connectWallet(address);
      setUser(userData);
      setWalletAddress(address);
      localStorage.setItem("zwap_wallet", address);
      setIsWalletModalOpen(false);
      toast.success("Wallet connected successfully!");
      return userData;
    } catch (error) {
      toast.error("Failed to connect wallet");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setUser(null);
    setWalletAddress(null);
    localStorage.removeItem("zwap_wallet");
    toast.success("Wallet disconnected");
  };

  const refreshUser = async () => {
    if (walletAddress) {
      await loadUser(walletAddress);
    }
  };

  const requireWallet = (action) => {
    if (!walletAddress) {
      setPendingAction(action);
      setIsWalletModalOpen(true);
      return false;
    }
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        walletAddress,
        isWalletModalOpen,
        setIsWalletModalOpen,
        pendingAction,
        setPendingAction,
        connectWallet,
        disconnectWallet,
        refreshUser,
        requireWallet,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function AppContent() {
  const { walletAddress, isWalletModalOpen, setIsWalletModalOpen, pendingAction, setPendingAction } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle pending action after wallet connect
  useEffect(() => {
    if (walletAddress && pendingAction) {
      setPendingAction(null);
      // Navigate based on pending action
      switch (pendingAction) {
        case "swap":
          navigate("/swap");
          break;
        case "earn":
          navigate("/move");
          break;
        case "shop":
          navigate("/shop");
          break;
        default:
          navigate("/dashboard");
      }
    }
  }, [walletAddress, pendingAction, navigate, setPendingAction]);

  // Show welcome screen if not connected
  if (!walletAddress && location.pathname === "/") {
    return (
      <>
        <WelcomeScreen />
        <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
      </>
    );
  }

  // If connected but on root, redirect to dashboard
  if (walletAddress && location.pathname === "/") {
    navigate("/dashboard");
    return null;
  }

  const showTabs = ["/dashboard", "/move", "/play", "/shop", "/swap"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0a0b1e] pb-20">
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/move" element={<MoveTab />} />
        <Route path="/play" element={<PlayTab />} />
        <Route path="/shop" element={<ShopTab />} />
        <Route path="/swap" element={<SwapTab />} />
      </Routes>
      
      {showTabs && <TabNavigation />}
      <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
        <Toaster position="top-center" richColors />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
