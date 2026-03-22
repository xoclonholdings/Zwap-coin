import React, { useMemo, useState } from "react";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Wallet, Sparkles, ChevronRight, ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";

const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "") +
  "/api";

export default function OnboardingModal({ open, onOpenChange }) {
  const { setIsWalletModalOpen } = useApp();

  const [mode, setMode] = useState("choices");
  const [email, setEmail] = useState(localStorage.getItem("zwap_email") || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const isValidEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const isValidPassword = password.trim().length >= 8;

  const closeAndReset = () => {
    setMode("choices");
    setSaving(false);
    setPassword("");
    onOpenChange(false);
  };

  const closeAndOpenWalletModal = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("choices");
      setPassword("");
      setIsWalletModalOpen(true);
    }, 100);
  };

  const handleGuest = () => {
    closeAndReset();
    toast.success("Continuing as guest");
  };

  const handleGetWallet = () => {
    closeAndOpenWalletModal();
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isValidEmail) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!isValidPassword) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          source: "app",
          status: "active",
          email_opt_in: true,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Unable to create account");
      }

      localStorage.setItem("zwap_email", email.trim().toLowerCase());
      toast.success("Account created");
      closeAndReset();
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error?.message || "Unable to create account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-[1.75rem] bg-[#0f1029] border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        {mode === "choices" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white text-center font-black tracking-tight">
                Start Your Journey
              </DialogTitle>

              <DialogDescription className="text-gray-400 text-center leading-relaxed">
                Try ZWAP your way. Save progress now, connect a wallet when it actually matters.
              </DialogDescription>
            </DialogHeader>

            <div className="text-center text-xs text-gray-500 px-2">
              Use email if you want to explore first. Get a wallet now if you’re ready.
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="text-sm leading-relaxed">
                  <p className="text-white font-semibold mb-1">
                    Not sure yet?
                  </p>
                  <p className="text-gray-400">
                    Start with email to save progress and keep earning while you learn.
                    Get a wallet later when you’re ready to claim rewards.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <Button
                onClick={() => setMode("email")}
                className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-base font-semibold justify-between rounded-xl shadow-[0_0_25px_rgba(0,245,255,0.22)]"
              >
                <span className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Continue with Email
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleGetWallet}
                variant="outline"
                className="w-full h-14 text-base font-semibold justify-between rounded-xl border-cyan-500/30 text-gray-200 hover:bg-white/5"
              >
                <span className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Get Wallet
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleGuest}
                variant="ghost"
                className="w-full h-12 text-gray-400 hover:text-white"
              >
                Continue as Guest
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white text-center font-black tracking-tight">
                Save Your Progress
              </DialogTitle>

              <DialogDescription className="text-gray-400 text-center leading-relaxed">
                Create your ZWAP account with email and password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 space-y-4">
                <div>
                  <label htmlFor="zwap-email" className="block text-sm text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="zwap-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 rounded-xl bg-[#0a0b1e] border border-cyan-500/20 px-4 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="zwap-password" className="block text-sm text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="zwap-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-12 rounded-xl bg-[#0a0b1e] border border-cyan-500/20 px-4 pr-10 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400"
                      disabled={saving}
                    />
                    <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  This saves your progress now. You can still connect a wallet later when you want to claim rewards.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode("choices")}
                  disabled={saving}
                  className="flex-1 h-12 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  type="submit"
                  disabled={!isValidEmail || !isValidPassword || saving}
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-base font-semibold rounded-xl"
                >
                  {saving ? "Saving..." : "Continue"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}