import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import useNetworkStatus from "@/hooks/useNetworkStatus";
import OfflineNotice from "@/components/ui/OfflineNotice";
import PrivyProviderWrapper from "@/app/PrivyProviderWrapper";

import SplashScreen from "@/components/SplashScreen";
import AboutPage from "@/components/AboutPage";
import FirstTimeUserPage from "@/components/user/firsttimeuser/FirstTimeUserPage";
import ReturningUserPrompt from "@/components/user/ReturningUserPrompt";
import WalletModal from "@/components/wallet/WalletModal";
import AppHeader from "@/components/ui/AppHeader";
import NewsTicker from "@/components/ui/NewsTicker";
import Dashboard from "@/components/ui/Dashboard";
import MoveTab from "@/components/move/MoveTab";
import PlayTab from "@/components/play/PlayTab";
import SwapTab from "@/components/swap/SwapTab";
import ShopTab from "@/components/shop/ShopTab";
import TabNavigation from "@/components/TabNavigation";
import SubscriptionSuccess from "@/components/SubscriptionSuccess";
import ProfilePage from "@/components/user/ProfilePage";
import ContactPage from "@/components/ContactPage";
import PrivacyPage from "@/components/PrivacyPage";
import TermsPage from "@/components/TermsPage";
import AdminPanel from "@/components/admin/AdminPanel";
import LearnPage from "@/components/learn/LearnPage";
import PlusPage from "@/components/PlusPage";

import { useApp } from "@/app/AppProvider";

export default function AppContent() {
  const {
    isAuthenticated,
    isReturningUserPromptOpen,
    setIsReturningUserPromptOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    pendingAction,
    setPendingAction,
    initialized,
    showSplash,
    setShowSplash,
    closeAllAuthModals,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();

  const protectedRoutes = ["/dashboard", "/move", "/play", "/shop", "/swap", "/success"];
  const isProtectedRoute =
    protectedRoutes.includes(location.pathname) && !isAuthenticated;

  useEffect(() => {
    if (isAuthenticated && pendingAction) {
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
  }, [isAuthenticated, pendingAction, navigate, setPendingAction]);

  if (showSplash && location.pathname === "/") {
    return (
      <SplashScreen
        onNewUser={() => {
          sessionStorage.setItem("zwap_force_new_user", "1");
          localStorage.removeItem("zwap_wallet");
          localStorage.removeItem("zwap_auth_user");
          localStorage.removeItem("zwap_email");
          setShowSplash(false);
          closeAllAuthModals();
          window.location.replace("/wallet");
        }}
        onReturningUser={() => {
          setShowSplash(false);

          if (isAuthenticated) {
            navigate("/dashboard");
          } else {
            closeAllAuthModals();
            setIsReturningUserPromptOpen(true);
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
        <FirstTimeUserPage />

        <ReturningUserPrompt
          open={isReturningUserPromptOpen}
          onOpenChange={setIsReturningUserPromptOpen}
        />

        {isWalletModalOpen && !isReturningUserPromptOpen && (
          <PrivyProviderWrapper>
            <WalletModal
              open={true}
              onOpenChange={setIsWalletModalOpen}
            />
          </PrivyProviderWrapper>
        )}
      </>
    );
  }

  if (location.pathname === "/learn") {
    return <LearnPage />;
  }

  const settingsPages = ["/profile", "/contact", "/privacy", "/terms", "/admin"];
  if (settingsPages.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    );
  }

  if (location.pathname === "/") {
    const forceNewUser = sessionStorage.getItem("zwap_force_new_user") === "1";

    if (forceNewUser) {
      sessionStorage.removeItem("zwap_force_new_user");
      return <Navigate to="/wallet" replace />;
    }

    return <Navigate to={isAuthenticated ? "/dashboard" : "/wallet"} replace />;
  }

  if (isProtectedRoute) {
    return <Navigate to="/wallet" replace />;
  }

  const showLayout = [
    "/dashboard",
    "/move",
    "/play",
    "/swap",
    "/shop",
    "/success",
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0a0b1e]">
      {showLayout ? (
        <div className="h-screen flex flex-col overflow-hidden">
          <AppHeader />

          <div className="px-4 pt-20 pb-2 max-w-lg mx-auto w-full">
            <OfflineNotice isOnline={isOnline} />
          </div>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/move" element={<MoveTab />} />
              <Route path="/play" element={<PlayTab />} />
              <Route path="/swap" element={<SwapTab />} />
              <Route path="/shop" element={<ShopTab />} />
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
            <Route path="/swap" element={<SwapTab />} />
            <Route path="/shop" element={<ShopTab />} />
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