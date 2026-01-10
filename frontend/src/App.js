import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import SplashScreen from "@/components/SplashScreen";
import AboutPage from "@/components/AboutPage";
import WelcomeScreen from "@/components/WelcomeScreen";
import WalletModal from "@/components/WalletModal";
import AppHeader from "@/components/AppHeader";
import NewsTicker from "@/components/NewsTicker";
import Dashboard from "@/components/Dashboard";
import MoveTab from "@/components/MoveTab";
import PlayTab from "@/components/PlayTab";
import ShopTab from "@/components/ShopTab";
import SwapTab from "@/components/SwapTab";
import TabNavigation from "@/components/TabNavigation";
import SubscriptionSuccess from "@/components/SubscriptionSuccess";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// App Context
export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// ZWAP Logo URLs
export const ZWAP_LOGO = "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/8gvtmj56_Zwap_logo_full.png";
export const ZWAP_BANG = "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/ubzr4hka_Zwap_bang_3d.png";
export const ZUPREME_LOGO = "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/3x86eqay_image.png";
export const ZWAP_COIN = "https://customer-assets.emergentagent.com/job_8243de8c-fe3d-478f-9f50-7ad5404aea5c/artifacts/ejxhkn40_IMG_0609.jpeg";

// Crypto logos
export const CRYPTO_LOGOS = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png?v=029",
  POL: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=029",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=029",
  ZWAP: "https://customer-assets.emergentagent.com/job_8243de8c-fe3d-478f-9f50-7ad5404aea5c/artifacts/ejxhkn40_IMG_0609.jpeg",
};

// Tier configs
export const TIERS = {
  starter: { name: "Starter", games: ["zbrickles", "ztrivia"], dailyZptsCap: 20, multiplier: 1.0 },
  plus: { name: "Plus", games: ["zbrickles", "ztrivia", "ztetris", "zslots"], dailyZptsCap: 30, multiplier: 1.5 }
};

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
  
  submitGameResult: async (walletAddress, gameType, score, level = 1, blocksDestroyed = 0) => {
    const res = await fetch(`${API}/games/result/${walletAddress}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_type: gameType, score, level, blocks_destroyed: blocksDestroyed }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Game submission failed");
    }
    return res.json();
  },
  
  getTriviaQuestions: async (count = 5, difficulty = 1) => {
    const res = await fetch(`${API}/games/trivia/questions?count=${count}&difficulty=${difficulty}`);
    return res.json();
  },
  
  checkTriviaAnswer: async (questionId, answer, timeTaken) => {
    const res = await fetch(`${API}/games/trivia/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: questionId, answer, time_taken: timeTaken }),
    });
    return res.json();
  },
  
  scratchToWin: async (walletAddress) => {
    const res = await fetch(`${API}/faucet/scratch/${walletAddress}`, { method: "POST" });
    return res.json();
  },
  
  convertZptsToZwap: async (walletAddress, zptsAmount) => {
    const res = await fetch(`${API}/zpts/convert/${walletAddress}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zpts_amount: zptsAmount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Conversion failed");
    }
    return res.json();
  },
  
  getShopItems: async () => {
    const res = await fetch(`${API}/shop/items`);
    return res.json();
  },
  
  purchaseItem: async (walletAddress, itemId, paymentType = "zwap") => {
    const res = await fetch(`${API}/shop/purchase/${walletAddress}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId, payment_type: paymentType }),
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
  
  createSubscription: async (originUrl) => {
    const res = await fetch(`${API}/subscription/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin_url: originUrl }),
    });
    return res.json();
  },
  
  getSubscriptionStatus: async (sessionId) => {
    const res = await fetch(`${API}/subscription/status/${sessionId}`);
    return res.json();
  },
  
  activateSubscription: async (walletAddress, sessionId) => {
    const res = await fetch(`${API}/subscription/activate/${walletAddress}?session_id=${sessionId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Activation failed");
    }
    return res.json();
  },
  
  getLeaderboard: async (category, limit = 10) => {
    const res = await fetch(`${API}/leaderboard/${category}?limit=${limit}`);
    return res.json();
  },
};

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const savedWallet = localStorage.getItem("zwap_wallet");
    if (savedWallet) {
      setWalletAddress(savedWallet);
      loadUser(savedWallet).finally(() => setInitialized(true));
    } else {
      setIsLoading(false);
      setInitialized(true);
    }
  }, []);

  const loadUser = async (address) => {
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

  const connectWallet = async (address) => {
    try {
      setIsLoading(true);
      const userData = await api.connectWallet(address);
      setUser(userData);
      setWalletAddress(address);
      localStorage.setItem("zwap_wallet", address);
      setIsWalletModalOpen(false);
      toast.success("Wallet connected!");
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
    if (walletAddress) await loadUser(walletAddress);
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
    <AppContext.Provider value={{
      user, walletAddress, isWalletModalOpen, setIsWalletModalOpen,
      pendingAction, setPendingAction, connectWallet, disconnectWallet,
      refreshUser, requireWallet, isLoading, initialized, showSplash, setShowSplash,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function AppContent() {
  const { walletAddress, isWalletModalOpen, setIsWalletModalOpen, pendingAction, setPendingAction, initialized, showSplash, setShowSplash } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress && pendingAction) {
      setPendingAction(null);
      switch (pendingAction) {
        case "swap": navigate("/swap"); break;
        case "earn": navigate("/move"); break;
        case "shop": navigate("/shop"); break;
        default: navigate("/dashboard");
      }
    }
  }, [walletAddress, pendingAction, navigate, setPendingAction]);

  // Show splash screen
  if (showSplash && location.pathname === "/") {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  // Wait for initialization
  if (!initialized) {
    return (
      <div className="h-screen bg-[#0a0b1e] flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  // About page - no header/footer
  if (location.pathname === "/about") {
    return <AboutPage />;
  }

  // Welcome screen for non-connected users
  if (!walletAddress && location.pathname === "/") {
    return (
      <>
        <WelcomeScreen />
        <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
      </>
    );
  }

  // Redirect connected users from root to dashboard
  if (walletAddress && location.pathname === "/") {
    navigate("/dashboard");
    return null;
  }

  const showLayout = ["/dashboard", "/move", "/play", "/shop", "/swap"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0a0b1e]">
      {/* Persistent Header */}
      {showLayout && <AppHeader />}
      
      {/* Main content with padding for header/ticker/nav */}
      <main className={showLayout ? "pt-20 pb-32" : ""}>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/move" element={<MoveTab />} />
          <Route path="/play" element={<PlayTab />} />
          <Route path="/shop" element={<ShopTab />} />
          <Route path="/swap" element={<SwapTab />} />
          <Route path="/subscription/success" element={<SubscriptionSuccess />} />
          <Route path="/subscription/cancel" element={<Dashboard />} />
        </Routes>
      </main>
      
      {/* News Ticker */}
      {showLayout && <NewsTicker />}
      
      {/* Bottom Navigation */}
      {showLayout && <TabNavigation />}
      
      {/* Wallet Modal */}
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
