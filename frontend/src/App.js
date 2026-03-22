import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import SplashScreen from "@/components/SplashScreen";
import AboutPage from "@/components/AboutPage";
import GetWalletPrompt from "@/components/GetWalletPrompt";
import OnboardingModal from "@/components/OnboardingModal";
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
import PlusPage from "@/components/PlusPage";

import api from "@/lib/api";
export { default as api } from "@/lib/api";

console.log("ZWAP LOCAL APP.JS LOADED");

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const API = `${BACKEND_URL}/api`;
console.log("ZWAP API BASE =", API);

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const ZWAP_CONTRACT = {
  address: "0xe8898453af13b9496a6e8ada92c6efdaf4967a81",
  network: "polygon",
  chainId: 137,
  symbol: "ZWAP",
  decimals: 18,
  name: "ZWAP Coin",
  totalSupply: "30000000000",
};

export const ZWAP_LOGO =
  "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/8gvtmj56_Zwap_logo_full.png";
export const ZWAP_BANG =
  "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/ubzr4hka_Zwap_bang_3d.png";
export const ZUPREME_LOGO =
  "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/bpbzieau_Zwap_Logo.png-1.png";
export const ZWAP_COIN =
  "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/7csajqza_zwap_coin_logo.png";

export const CRYPTO_LOGOS = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png?v=029",
  POL: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=029",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=029",
  ZWAP:
    "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/7csajqza_zwap_coin_logo.png",
};

export const TIERS = {
  starter: {
    name: "Starter",
    multiplier: 1,
    dailyZptsCap: 75,
    gameSubmission: false,
  },
  plus: {
    name: "Plus",
    multiplier: 1.5,
    dailyZptsCap: 150,
    gameSubmission: true,
  },
};

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const [isGetWalletPromptOpen, setIsGetWalletPromptOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
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
    console.log("🔌 connectWallet called with:", address);

    try {
      setIsLoading(true);
      const userData = await api.connectWallet(address);
      console.log("✅ api.connectWallet response:", userData);

      setUser(userData);
      setWalletAddress(address);
      localStorage.setItem("zwap_wallet", address);

      setIsWalletModalOpen(false);
      setIsOnboardingModalOpen(false);
      setIsGetWalletPromptOpen(false);

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
      setIsGetWalletPromptOpen(false);
      setIsWalletModalOpen(false);
      setIsOnboardingModalOpen(true);
      return false;
    }
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        walletAddress,

        isGetWalletPromptOpen,
        setIsGetWalletPromptOpen,

        isOnboardingModalOpen,
        setIsOnboardingModalOpen,

        isWalletModalOpen,
        setIsWalletModalOpen,

        pendingAction,
        setPendingAction,
        connectWallet,
        disconnectWallet,
        refreshUser,
        requireWallet,

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

function AppContent() {
  const {
    walletAddress,
    isGetWalletPromptOpen,
    setIsGetWalletPromptOpen,
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    pendingAction,
    setPendingAction,
    initialized,
    showSplash,
    setShowSplash,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress && pendingAction) {
      setPendingAction(null);
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

  if (showSplash && location.pathname === "/") {
    return (
      <SplashScreen
        onNewUser={() => {
          setShowSplash(false);
          setIsWalletModalOpen(false);
          setIsOnboardingModalOpen(false);
          setIsGetWalletPromptOpen(false);
          navigate("/wallet");
        }}
        onReturningUser={() => {
          setShowSplash(false);

          if (walletAddress) {
            navigate("/dashboard");
          } else {
            setIsGetWalletPromptOpen(false);
            setIsOnboardingModalOpen(false);
            setIsWalletModalOpen(true);
            navigate("/wallet");
          }
        }}
        onWhatIsZwap={() => {
          setShowSplash(false);
          navigate("/about");
        }}
      />
    );
  }

  if (!initialized) {
    return (
      <div className="h-screen bg-[#0a0b1e] flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (location.pathname === "/about") {
    return (
      <div
        className="about-page-wrapper"
        style={{
          position: "fixed",
          inset: 0,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <AboutPage />
      </div>
    );
  }

  if (location.pathname === "/admin") {
    return <AdminPanel />;
  }

  if (location.pathname === "/wallet") {
    return (
      <>
        <WalletPage />

        <GetWalletPrompt
          open={isGetWalletPromptOpen}
          onOpenChange={setIsGetWalletPromptOpen}
        />

        <OnboardingModal
          open={!isGetWalletPromptOpen && isOnboardingModalOpen}
          onOpenChange={setIsOnboardingModalOpen}
        />

        <WalletModal
          open={
            !isGetWalletPromptOpen &&
            !isOnboardingModalOpen &&
            isWalletModalOpen
          }
          onOpenChange={setIsWalletModalOpen}
        />
      </>
    );
  }

  if (location.pathname === "/learn") {
    return <LearnPage />;
  }

  const settingsPages = ["/profile", "/contact", "/privacy", "/terms", "/admin"];
  if (settingsPages.includes(location.pathname)) {
    return (
      <>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </>
    );
  }

  if (location.pathname === "/") {
    navigate(walletAddress ? "/dashboard" : "/wallet");
    return null;
  }

  const protectedRoutes = ["/dashboard", "/move", "/play", "/shop", "/swap", "/success"];
  if (protectedRoutes.includes(location.pathname) && !walletAddress) {
    setIsWalletModalOpen(false);
    setIsGetWalletPromptOpen(false);
    setIsOnboardingModalOpen(true);
    navigate("/wallet");
    return null;
  }

  const showLayout = [
    "/dashboard",
    "/move",
    "/play",
    "/shop",
    "/swap",
    "/success",
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0a0b1e]">
      {showLayout ? (
        <div className="h-screen flex flex-col overflow-hidden">
          <AppHeader />

          <main className="flex-1 overflow-y-auto pt-20">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/move" element={<MoveTab />} />
              <Route path="/play" element={<PlayTab />} />
              <Route path="/shop" element={<ShopTab />} />
              <Route path="/swap" element={<SwapTab />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/plus" element={<PlusPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
              <Route path="/subscription/cancel" element={<PlusPage />} />
              <Route path="/success" element={<ShopTab />} />
              <Route path="/cancel" element={<ShopTab />} />
            </Routes>
          </main>

          <div className="shrink-0 bg-[#0a0b1e] border-t border-cyan-500/10">
            <NewsTicker />
            <TabNavigation />
          </div>
        </div>
      ) : (
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/move" element={<MoveTab />} />
            <Route path="/play" element={<PlayTab />} />
            <Route path="/shop" element={<ShopTab />} />
            <Route path="/swap" element={<SwapTab />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/plus" element={<PlusPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/cancel" element={<PlusPage />} />
            <Route path="/success" element={<ShopTab />} />
            <Route path="/cancel" element={<ShopTab />} />
          </Routes>
        </main>
      )}
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