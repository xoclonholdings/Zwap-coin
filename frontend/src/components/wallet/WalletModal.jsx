import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, KeyRound, Shield, Lock, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/App";
import { Button } from "@/components/ui/button";

import FirstTimeHero from "@/components/user/firsttimeuser/FirstTimeHero";
import StartOptionsCard from "@/components/user/firsttimeuser/StartOptionsCard";
import LearnMoreCard from "@/components/user/firsttimeuser/LearnMoreCard";
import TermTrigger from "@/components/ui/TermTrigger";

const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "") +
  "/api";

export default function FirstTimeUserPage() {
  const navigate = useNavigate();
  const {
    setIsWalletModalOpen,
    setIsReturningUserPromptOpen,
    completeEmailAuth,
  } = useApp();

  const [mode, setMode] = useState("choices");
  const [email, setEmail] = useState(localStorage.getItem("zwap_email") || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const isValidPassword = password.trim().length >= 8;

  const handleGetWallet = () => {
    setIsReturningUserPromptOpen(false);
    setIsWalletModalOpen(true);
  };

  const handleContinueEmail = () => {
    setIsWalletModalOpen(false);
    setIsReturningUserPromptOpen(false);
    setMode("email");
  };

  const handleBackToChoices = () => {
    if (saving) return;
    setPassword("");
    setMode("choices");
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
      const normalizedEmail = email.trim().toLowerCase();

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
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

      localStorage.setItem("zwap_email", normalizedEmail);

      if (data?.user) {
        completeEmailAuth(data.user);
      }

      setPassword("");
      toast.success("Account created");
      navigate("/dashboard");
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error?.message || "Unable to create account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04040d] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-24 left-[12%] w-[420px] h-[420px] bg-cyan-500/12 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[34rem] right-[10%] w-[360px] h-[360px] bg-purple-500/12 rounded-full blur-[140px]"
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-24 left-[30%] w-[320px] h-[320px] bg-blue-500/10 rounded-full blur-[130px]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%)]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
        <FirstTimeHero />

        <div className="space-y-6">
          {mode === "choices" ? (
            <StartOptionsCard
              onContinueEmail={handleContinueEmail}
              onGetWallet={handleGetWallet}
            />
          ) : (
            <motion.div
              className="rounded-[1.9rem] border border-cyan-500/20 bg-white/[0.05] backdrop-blur-xl overflow-hidden shadow-[0_0_35px_rgba(0,245,255,0.08)]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-cyan-300" />
                    </div>

                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Save Your Progress
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Create your ZWAP account with email and password
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToChoices}
                    disabled={saving}
                    className="text-gray-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 space-y-4">
                    <div>
                      <label
                        htmlFor="zwap-email"
                        className="block text-sm text-gray-300 mb-2"
                      >
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
                      <label
                        htmlFor="zwap-password"
                        className="block text-sm text-gray-300 mb-2"
                      >
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
                      This saves your progress now. You can still connect a wallet
                      later when you want to claim rewards.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackToChoices}
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
              </div>
            </motion.div>
          )}

          <motion.div
            className="rounded-[1.9rem] border border-cyan-500/20 bg-white/[0.05] backdrop-blur-xl overflow-hidden shadow-[0_0_35px_rgba(0,245,255,0.08)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
          >
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-cyan-300" />
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Wallet Basics for{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                      ZWAP!
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Just enough context to move with confidence
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 px-4 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-blue-300" />
                    <h3 className="text-white font-bold text-sm sm:text-base">
                      What is a Crypto Wallet?
                    </h3>
                  </div>

                  <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
                    A crypto <TermTrigger term="wallet">wallet</TermTrigger> does
                    not store money the way a physical wallet does. It stores
                    keys that allow you to access your crypto.
                  </p>

                  <div className="mt-3 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
                    <p className="text-blue-200 text-sm italic leading-relaxed">
                      Your wallet is like the key to a safety deposit box. The
                      money is not in the key. The key just unlocks access.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.07] px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <KeyRound className="w-4 h-4 text-cyan-300" />
                      <h3 className="text-white font-bold text-sm sm:text-base">
                        Why You Need One
                      </h3>
                    </div>

                    <ul className="space-y-2.5 text-gray-300 text-sm leading-relaxed">
                      <li>
                        • It gives you a portable identity inside{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 font-semibold">
                          ZWAP!
                        </span>
                      </li>
                      <li>
                        • It lets you claim{" "}
                        <TermTrigger term="zwap">ZWAP</TermTrigger> directly
                      </li>
                      <li>
                        • Your rewards can follow you across sessions and devices
                      </li>
                      <li>
                        • You can explore first, then connect when ready
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.07] px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-green-300" />
                      <h3 className="text-white font-bold text-sm sm:text-base">
                        Your Keys Stay Yours
                      </h3>
                    </div>

                    <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 font-semibold">
                        ZWAP!
                      </span>{" "}
                      does not store, see, or ask for your private key. When you
                      connect a <TermTrigger term="wallet">wallet</TermTrigger>,
                      your keys stay with you. That means you stay in control.
                    </p>

                    <div className="mt-3 rounded-xl border border-green-400/15 bg-black/20 px-3 py-2">
                      <p className="text-xs text-green-200/90">
                        Control stays with you, not the app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <LearnMoreCard delay={0.22} />
        </div>
      </div>
    </div>
  );
}