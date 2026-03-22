import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "") +
  "/api";

export default function ReturningUserPrompt({ open, onOpenChange }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState(localStorage.getItem("zwap_email") || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const isValidPassword = password.trim().length >= 8;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidEmail || !isValidPassword) {
      toast.error("Enter your email and password");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Unable to log in");
      }

      localStorage.setItem("zwap_email", email.trim().toLowerCase());
      toast.success("Welcome back");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.message || "Unable to log in");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-[1.75rem] bg-[#0f1029] border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white text-center font-black tracking-tight">
            Welcome Back
          </DialogTitle>

          <DialogDescription className="text-gray-400 text-center leading-relaxed">
            Sign in with your email and password to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 space-y-4">
            <div>
              <label
                htmlFor="returning-email"
                className="block text-sm text-gray-300 mb-2"
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
                  className="w-full h-12 rounded-xl bg-[#0a0b1e] border border-cyan-500/20 px-4 pr-10 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400"
                  disabled={saving}
                />
                <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label
                htmlFor="returning-password"
                className="block text-sm text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="returning-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full h-12 rounded-xl bg-[#0a0b1e] border border-cyan-500/20 px-4 pr-10 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400"
                  disabled={saving}
                />
                <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValidEmail || !isValidPassword || saving}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-base font-semibold rounded-xl"
          >
            {saving ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}