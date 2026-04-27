import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

import adminApi from "@/lib/adminApi";

export default function AdminLogin({ onLogin }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const safeKey = key.trim();

  const handleLogin = async () => {
    if (loading) return;

    if (!safeKey) {
      setError("Enter admin key");
      return;
    }

    setLoading(true);
    setError("");

    localStorage.setItem("zwap_admin_key", safeKey);

    try {
      const data = await adminApi.get("/dashboard", safeKey);

      if (typeof onLogin === "function") {
        onLogin(data);
      }
    } catch {
      setError("Invalid admin key");
      localStorage.removeItem("zwap_admin_key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,18,28,0.98),rgba(4,8,14,0.98))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            <Lock className="h-8 w-8 text-cyan-300" />
          </div>

          <h1 className="mt-4 text-xl font-bold tracking-[-0.04em] text-white">
            ZWAP! Admin
          </h1>

          <p className="mt-1 text-xs leading-5 text-white/45">
            Mission control access for the V1 behavioral engine.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Admin Key
            </span>

            <input
              type="password"
              value={key}
              placeholder="Enter admin key"
              autoComplete="off"
              disabled={loading}
              onChange={(event) => {
                setKey(event.target.value);
                if (error) setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleLogin();
                }
              }}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-cyan-400/40 focus:bg-cyan-500/[0.06] disabled:opacity-60"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className={[
              "flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
              "border border-cyan-400/25 bg-cyan-500/15 text-sm font-semibold text-cyan-100",
              "shadow-[0_0_22px_rgba(34,211,238,0.12)] transition active:scale-[0.98]",
              loading ? "cursor-not-allowed opacity-60" : "hover:bg-cyan-500/20",
            ].join(" ")}
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Verifying..." : "Access Admin Panel"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}