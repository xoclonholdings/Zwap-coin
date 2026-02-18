import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import SplashScreen from "@/components/SplashScreen";
import AboutPage from "@/components/AboutPage";
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
import ProfilePage from "@/components/ProfilePage";
import ContactPage from "@/components/ContactPage";
import PrivacyPage from "@/components/PrivacyPage";
import TermsPage from "@/components/TermsPage";
import AdminPanel from "@/components/AdminPanel";
import WalletPage from "@/components/WalletPage";
import LearnPage from "@/components/LearnPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// App Context
export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// ZWAP Contract Configuration (Polygon)
export const ZWAP_CONTRACT = {
  address: "0xe8898453af13b9496a6e8ada92c6efdaf4967a81",
  network: "polygon",
  chainId: 137,
  symbol: "ZWAP",
  decimals: 18,
  name: "ZWAP Coin",
  totalSupply: "30000000000", // 30 billion
  // The contract itself holds the treasury tokens
  // Owner/deployer: 0x85EaDbB165cf4c8202d33562DfaeeA0b632B0849
};

// ZWAP Logo URLs
export const ZWAP_LOGO = "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/8gvtmj56_Zwap_logo_full.png";
export const ZWAP_BANG = "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/ubzr4hka_Zwap_bang_3d.png";
export const ZUPREME_LOGO = "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/bpbzieau_Zwap_Logo.png-1.png";
export const ZWAP_COIN = "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/7csajqza_zwap_coin_logo.png";

// Crypto logos
export const CRYPTO_LOGOS = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png?v=029",
  POL: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=029",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=029",
  ZWAP: "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/7csajqza_zwap_coin_logo.png",
};

// Tier configs
export const TIERS = {
  starter: { name: "Starter", games: ["zbrickles", "ztrivia"], dailyZptsCap: 75, multiplier: 1 },
  plus: { name: "Plus", games: ["zbrickles", "ztrivia", "ztetris", "zslots"], dailyZptsCap: 150, multiplier: 1.5 }
};

// API functions — centralized in lib/api.js
import api from "@/lib/api";
export { default as api } from "@/lib/api";

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [onchainBalance, setOnchainBalance] = useState(null);

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

  // Fetch on-chain balance when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      fetchOnchainBalance(walletAddress);
    } else {
      setOnchainBalance(null);
    }
  }, [walletAddress]);

  const fetchOnchainBalance = async (address) => {
    try {
      const data = await api.getOnchainBalance(address);
      if (data.onchain_balance !== null && data.onchain_balance !== undefined) {
        setOnchainBalance(data.onchain_balance);
      }
    } catch (error) {
      console.log("Failed to fetch on-chain balance:", error);
    }
  };

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
    setOnchainBalance(null);
    localStorage.removeItem("zwap_wallet");
    toast.success("Wallet disconnected");
  };

  const refreshUser = async () => {
    if (walletAddress) {
      await loadUser(walletAddress);
      await fetchOnchainBalance(walletAddress);
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
    <AppContext.Provider value={{
      user, walletAddress, isWalletModalOpen, setIsWalletModalOpen,
      pendingAction, setPendingAction, connectWallet, disconnectWallet,
      refreshUser, requireWallet, isLoading, initialized, showSplash, setShowSplash,
      onchainBalance, fetchOnchainBalance,
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

  // Show splash screen on root - routes based on wallet state
  if (showSplash && location.pathname === "/") {
    return <SplashScreen onEnter={() => { 
      setShowSplash(false); 
      navigate(walletAddress ? "/dashboard" : "/wallet"); 
    }} />;
  }

  // Wait for initialization
  if (!initialized) {
    return (
      <div className="h-screen bg-[#0a0b1e] flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  // About page - no header/footer, needs special scroll handling
  if (location.pathname === "/about") {
    return (
      <div className="about-page-wrapper" style={{ 
        position: 'fixed', 
        inset: 0, 
        overflow: 'auto', 
        WebkitOverflowScrolling: 'touch' 
      }}>
        <AboutPage />
      </div>
    );
  }

  // Admin panel - completely separate
  if (location.pathname === "/admin") {
    return <AdminPanel />;
  }

  // Wallet onboarding page - accessible without wallet
  if (location.pathname === "/wallet") {
    return (
      <>
        <WalletPage />
        <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
      </>
    );
  }

  // Learn page - accessible without wallet
  if (location.pathname === "/learn") {
    return <LearnPage />;
  }

  // Settings pages - no main layout
  const settingsPages = ["/profile", "/contact", "/privacy", "/terms"];
  if (settingsPages.includes(location.pathname)) {
    return (
      <>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
        <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
      </>
    );
  }

  // Redirect from root
  if (location.pathname === "/") {
    navigate(walletAddress ? "/dashboard" : "/wallet");
    return null;
  }

  // Wallet gate: protected routes require wallet connection
  const protectedRoutes = ["/dashboard", "/move", "/play", "/shop", "/swap"];
  if (protectedRoutes.includes(location.pathname) && !walletAddress) {
    navigate("/wallet");
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/move" element={<MoveTab />} />
          <Route path="/play" element={<PlayTab />} />
          <Route path="/shop" element={<ShopTab />} />
          <Route path="/swap" element={<SwapTab />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
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
