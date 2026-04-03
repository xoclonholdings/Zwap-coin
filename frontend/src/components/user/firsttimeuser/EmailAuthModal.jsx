import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/App";
import { Button } from "@/components/ui/button";

const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "") +
  "/api";

export default function EmailAuthModal() {
  const navigate = useNavigate();
  const {
    isEmailAuthModalOpen,
    setIsEmailAuthModalOpen,
    completeEmailAuth,
  } = useApp();

  const [email, setEmail] = useState(localStorage.getItem("zwap_email") || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const isValidPassword = password.trim().length >= 8;

  const closeModal = () => {
    if (saving) return;
    setPassword("");
    setIsEmailAuthModalOpen(false);
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

      setIsEmailAuthModalOpen(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error?.message || "Unable to create account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isEmailAuthModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={closeModal}
          />

          {/* MODAL */}
          <motion.div
            className="relative w-full max-w-md rounded-[1.9rem] border border-cyan-500/20 bg-[#050510]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(0,245,255,0.15)] p-6"
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* CLOSE */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-cyan-300" />
              </div>

              <div>
                <h2 className="text-lg font-black text-white">
                  Save Your Progress
                </h2>
                <p className="text-sm text-gray-400">
                  Create your ZWAP account
                </p>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 rounded-xl bg-[#0a0b1e] border border-cyan-500/20 px-4 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400"
                  disabled={saving}
                />

                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full h-12 rounded-xl bg-[#0a0b1e] border border-cyan-500/20 px-4 pr-10 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400"
                    disabled={saving}
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isValidEmail || !isValidPassword || saving}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-base font-semibold rounded-xl"
              >
                {saving ? "Saving..." : "Continue"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You can connect a wallet later to claim rewards.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}