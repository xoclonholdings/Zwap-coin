import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Wallet, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useApp } from "@/app/AppProvider";
import { Button } from "@/components/ui/button";

export default function WalletModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { authenticated, ready, login } = usePrivy();
  const { wallets } = useWallets();
  const {
    connectWallet,
    setIsReturningUserPromptOpen,
    setIsEmailAuthModalOpen,
  } = useApp();

  const [isLaunching, setIsLaunching] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const primaryWalletAddress = useMemo(() => {
    if (!wallets || wallets.length === 0) return null;
    return wallets[0]?.address || null;
  }, [wallets]);

  const handleClose = () => {
    if (isLaunching || isConnectingWallet) return;
    onOpenChange(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleLaunchWalletSetup = async () => {
    try {
      setIsReturningUserPromptOpen(false);
      setIsEmailAuthModalOpen(false);
      setIsLaunching(true);
      await login();
    } catch (error) {
      console.error("Privy login launch failed:", error);
      toast.error("Unable to open wallet setup");
    } finally {
      setIsLaunching(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (!ready) return;
    if (!authenticated) return;
    if (!primaryWalletAddress) return;

    let isMounted = true;

    const finalizeWalletConnection = async () => {
      try {
        setIsConnectingWallet(true);
        await connectWallet(primaryWalletAddress);

        if (!isMounted) return;

        onOpenChange(false);
        toast.success("Wallet setup complete");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Wallet connection finalization failed:", error);
        if (!isMounted) return;
        toast.error("Wallet connected, but app sync failed");
      } finally {
        if (isMounted) {
          setIsConnectingWallet(false);
        }
      }
    };

    finalizeWalletConnection();

    return () => {
      isMounted = false;
    };
  }, [
    open,
    ready,
    authenticated,
    primaryWalletAddress,
    connectWallet,
    onOpenChange,
    navigate,
  ]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onMouseDown={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-[2rem] border border-cyan-500/20 bg-[#0b1020]/95 text-white shadow-[0_0_40px_rgba(0,245,255,0.12)] overflow-hidden"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 left-8 h-32 w-32 rounded-full bg-cyan-500/15 blur-3xl" />
              <div className="absolute -bottom-8 right-8 h-32 w-32 rounded-full bg-purple-500/15 blur-3xl" />
            </div>

            <div className="relative px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                    <Wallet className="h-5 w-5 text-cyan-300" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black leading-tight">
                      Create a Wallet
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                      ZWAP will open secure wallet setup through Privy and bring you
                      straight into your account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLaunching || isConnectingWallet}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                  aria-label="Close wallet modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-500/15 bg-white/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-cyan-300 shrink-0" />
                    <p className="text-sm leading-relaxed text-gray-300">
                      If you do not already have a wallet, Privy can create one for
                      you during setup.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-green-500/15 bg-green-500/[0.06] p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-green-300 shrink-0" />
                    <p className="text-sm leading-relaxed text-gray-300">
                      Your private keys are not stored by ZWAP. Wallet setup is
                      handled securely through Privy.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.06] px-4 py-3">
                  <p className="text-xs text-purple-100/90">
                    Using Polygon network
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleLaunchWalletSetup}
                  disabled={!ready || isLaunching || isConnectingWallet}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-base font-semibold hover:from-cyan-400 hover:to-purple-400"
                >
                  {isConnectingWallet
                    ? "Connecting Wallet..."
                    : isLaunching
                    ? "Opening Secure Setup..."
                    : "Create Wallet in App"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isLaunching || isConnectingWallet}
                  className="h-11 w-full rounded-xl text-gray-300 hover:text-white"
                >
                  Not now
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}