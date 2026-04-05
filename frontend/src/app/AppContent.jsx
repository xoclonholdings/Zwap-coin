import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import useNetworkStatus from "@/hooks/useNetworkStatus";

import AppHeader from "../components/ui/dashboard/AppHeader";
import NewsTicker from "../components/ui/dashboard/NewsTicker";
import Dashboard from "../components/ui/dashboard/Dashboard";
import TabNavigation from "../components/ui/dashboard/TabNavigation";
import DesktopAppShell from "@/components/layout/DesktopAppShell";

import SplashScreen from "../components/SplashScreen";
import AboutPage from "../components/AboutPage";
import FirstTimeUserPage from "../components/user/firsttimeuser/FirstTimeUserPage";
import ReturningUserPrompt from "../components/user/ReturningUserPrompt";
import EmailAuthModal from "../components/user/firsttimeuser/EmailAuthModal";
import WalletModal from "../components/wallet/WalletModal";

import MoveTab from "../components/move/MoveTab";
import PlayTab from "../components/play/PlayTab";
import SwapTab from "../components/swap/SwapTab";
import ShopTab from "../components/shop/ShopTab";

import SubscriptionSuccess from "../components/SubscriptionSuccess";
import ProfilePage from "../components/user/profile/ProfilePage";
import ContactPage from "../components/ContactPage";
import PrivacyPage from "../components/docs/PrivacyPage";
import TermsPage from "../components/docs/TermsPage";
import AdminPanel from "../components/admin/AdminPanel";
import LearnPage from "../components/learn/LearnPage";
import PlusPage from "../components/PlusPage";

import { useApp } from "./AppProvider";

function DesktopShellRoute({ children }) {
  return <DesktopAppShell>{children}</DesktopAppShell>;
}

export default function AppContent() {
  const {
    isAuthenticated,
    isReturningUserPromptOpen,
    setIsReturningUserPromptOpen,
    isEmailAuthModalOpen,
    setIsEmailAuthModalOpen,
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

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0b1e]">
        <div className="animate-pulse text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (showSplash && location.pathname === "/") {
    return (
      <>
        <SplashScreen
          onNewUser={() => {
            sessionStorage.setItem("zwap_force_new_user", "1");
            localStorage.removeItem("zwap_wallet");
            localStorage.removeItem("zwap_auth_user");
            localStorage.removeItem("zwap_email");
            closeAllAuthModals();
            setShowSplash(false);
            navigate("/start", { replace: true });
          }}
          onReturningUser={() => {
            sessionStorage.removeItem("zwap_force_new_user");
            closeAllAuthModals();
            setIsReturningUserPromptOpen(true);
          }}
          onWhatIsZwap={() => {
            sessionStorage.removeItem("zwap_force_new_user");
            closeAllAuthModals();
            navigate("/about", { replace: true });
          }}
        />

        <ReturningUserPrompt
          open={isReturningUserPromptOpen}
          onOpenChange={setIsReturningUserPromptOpen}
        />
      </>
    );
  }

  if (location.pathname === "/wallet") {
    return <Navigate to={isAuthenticated ? "/dashboard" : "/start"} replace />;
  }

  if (location.pathname === "/") {
    const forceNewUser = sessionStorage.getItem("zwap_force_new_user") === "1";

    if (forceNewUser) {
      sessionStorage.removeItem("zwap_force_new_user");
      return <Navigate to="/start" replace />;
    }

    return <Navigate to={isAuthenticated ? "/dashboard" : "/start"} replace />;
  }

  if (isProtectedRoute) {
    return <Navigate to="/" replace />;
  }

  if (location.pathname === "/start") {
    return (
      <>
        <FirstTimeUserPage />

        <EmailAuthModal
          open={isEmailAuthModalOpen}
          onOpenChange={setIsEmailAuthModalOpen}
        />

        <WalletModal
          open={isWalletModalOpen}
          onOpenChange={setIsWalletModalOpen}
        />
      </>
    );
  }

  if (location.pathname === "/about") {
    return <AboutPage />;
  }

  if (location.pathname === "/learn") {
    return <LearnPage />;
  }

  if (location.pathname === "/admin") {
    return <AdminPanel />;
  }

  const settingsPages = ["/profile", "/contact", "/privacy", "/terms"];
  if (settingsPages.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    );
  }

  const showLayout = [
    "/dashboard",
    "/move",
    "/play",
    "/swap",
    "/shop",
    "/success",
    "/plus",
    "/subscription/success",
    "/subscription/cancel",
    "/cancel",
  ].includes(location.pathname);

  if (!showLayout) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0b1e]">
      <div className="flex h-screen flex-col overflow-hidden">
        <AppHeader isOnline={isOnline} />

        <main className="flex-1 overflow-hidden pt-[84px]">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <DesktopShellRoute>
                  <Dashboard />
                </DesktopShellRoute>
              }
            />
            <Route
              path="/move"
              element={
                <DesktopShellRoute>
                  <MoveTab />
                </DesktopShellRoute>
              }
            />
            <Route
              path="/play"
              element={
                <DesktopShellRoute>
                  <PlayTab />
                </DesktopShellRoute>
              }
            />
            <Route
              path="/swap"
              element={
                <DesktopShellRoute>
                  <SwapTab />
                </DesktopShellRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <DesktopShellRoute>
                  <ShopTab />
                </DesktopShellRoute>
              }
            />

            <Route path="/plus" element={<PlusPage />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/cancel" element={<PlusPage />} />
            <Route path="/success" element={<ShopTab />} />
            <Route path="/cancel" element={<ShopTab />} />
          </Routes>
        </main>

        <div className="shrink-0 border-t border-cyan-500/10 bg-[#0a0b1e]">
          <NewsTicker />
          <TabNavigation />
        </div>
      </div>
    </div>
  );
}