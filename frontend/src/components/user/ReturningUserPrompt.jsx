import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/app/AppProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";

const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "") +
  "/api";

export default function ReturningUserPrompt({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { completeEmailAuth } = useApp();

  const [email, setEmail] = useState(localStorage.getItem("zwap_email") || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("login"); // login | forgot | reset | reset-success

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const isValidPassword = password.trim().length >= 8;
  const isValidNewPassword = newPassword.trim().length >= 8;
  const passwordsMatch =
    newPassword.trim().length >= 8 &&
    confirmPassword.trim().length >= 8 &&
    newPassword === confirmPassword;

  const resetModalState = () => {
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setSaving(false);
    setMode("login");
  };

  const handleClose = (nextOpen) => {
    if (saving) return;
    if (!nextOpen) {
      resetModalState();
    }
    onOpenChange(nextOpen);
  };

  const handleOpenForgotPassword = () => {
    if (saving) return;
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setMode("forgot");
  };

  const handleBackToLogin = () => {
    if (saving) return;
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setMode("login");
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();

    if (!isValidEmail) {
      toast.error("Enter a valid email address");
      return;
    }

    setSaving(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Unable to start password reset");
      }

      localStorage.setItem("zwap_email", normalizedEmail);

      if (!data?.reset_token) {
        throw new Error("Reset token was not returned");
      }

      setResetToken(data.reset_token);
      setMode("reset");
      toast.success("Password reset started");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error?.message || "Unable to start password reset");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isValidNewPassword) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (!resetToken) {
      toast.error("Reset session is missing. Start over.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Unable to reset password");
      }

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setMode("reset-success");
      toast.success("Password updated");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error?.message || "Unable to reset password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidEmail || !isValidPassword) {
      toast.error("Enter your email and password");
      return;
    }

    setSaving(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Unable to sign in");
      }

      localStorage.setItem("zwap_email", normalizedEmail);

      if (data?.user) {
        completeEmailAuth(data.user);
      }

      resetModalState();
      onOpenChange(false);
      toast.success("Welcome back");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.message || "Unable to sign in");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-[1.75rem] border border-cyan-500/30 bg-[#0f1029] shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-black tracking-tight text-white">
            {mode === "login"
              ? "Welcome Back"
              : mode === "forgot"
              ? "Reset Password"
              : mode === "reset"
              ? "Create New Password"
              : "Password Updated"}
          </DialogTitle>

          <DialogDescription className="text-center leading-relaxed text-gray-400">
            {mode === "login" ? (
              <>
                Sign in to continue with your{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  ZWAP!
                </span>{" "}
                account.
              </>
            ) : mode === "forgot" ? (
              <>
                Enter your email to start a password reset for your{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  ZWAP!
                </span>{" "}
                account.
              </>
            ) : mode === "reset" ? (
              <>
                Set a new password for{" "}
                <span className="font-medium text-white">{email.trim().toLowerCase()}</span>.
              </>
            ) : (
              <>Your password has been changed. Sign in with your new password.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" && (
          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            <div className="space-y-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div>
                <label
                  htmlFor="returning-email"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <input
                    id="returning-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-cyan-500/20 bg-[#0a0b1e] px-4 pr-10 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
                    disabled={saving}
                  />
                  <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="returning-password"
                    className="block text-sm text-gray-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    disabled={saving}
                    className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="returning-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="h-12 w-full rounded-xl border border-cyan-500/20 bg-[#0a0b1e] px-4 pr-10 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
                    disabled={saving}
                  />
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isValidEmail || !isValidPassword || saving}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-base font-semibold hover:from-cyan-400 hover:to-purple-400"
            >
              {saving ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleRequestPasswordReset} className="mt-4 space-y-4">
            <div className="space-y-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-cyan-500/20 bg-[#0a0b1e] px-4 pr-10 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
                    disabled={saving}
                  />
                  <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                disabled={saving}
                className="h-12 flex-1 rounded-xl text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                type="submit"
                disabled={!isValidEmail || saving}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-base font-semibold hover:from-cyan-400 hover:to-purple-400"
              >
                {saving ? "Starting..." : "Continue"}
              </Button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
            <div className="space-y-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm text-gray-300"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-12 w-full rounded-xl border border-cyan-500/20 bg-[#0a0b1e] px-4 pr-10 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
                    disabled={saving}
                  />
                  <KeyRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-12 w-full rounded-xl border border-cyan-500/20 bg-[#0a0b1e] px-4 pr-10 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
                    disabled={saving}
                  />
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                disabled={saving}
                className="h-12 flex-1 rounded-xl text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!isValidNewPassword || !passwordsMatch || saving}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-base font-semibold hover:from-cyan-400 hover:to-purple-400"
              >
                {saving ? "Updating..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}

        {mode === "reset-success" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <p className="text-sm leading-relaxed text-gray-300">
                Your password has been updated for{" "}
                <span className="font-medium text-white">
                  {email.trim().toLowerCase()}
                </span>
                .
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="h-12 flex-1 rounded-xl text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                type="button"
                onClick={handleBackToLogin}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-base font-semibold hover:from-cyan-400 hover:to-purple-400"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}