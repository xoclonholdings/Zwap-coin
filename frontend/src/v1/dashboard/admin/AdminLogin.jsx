import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import adminApi from "@/lib/adminApi";

export default function AdminLogin({ onLogin }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    localStorage.setItem("zwap_admin_key", key);

    try {
      await adminApi.get("/dashboard", key);
      onLogin();
    } catch {
      setError("Invalid admin key");
      localStorage.removeItem("zwap_admin_key");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md p-8 rounded-2xl bg-[#0a0b1e] border border-cyan-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">ZWAP! Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Mission Control Access</p>
        </div>

        <Input
          type="password"
          placeholder="Admin Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="mb-4 bg-gray-800 border-gray-700 h-12"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 bg-cyan-500 hover:bg-cyan-600"
        >
          {loading ? "Verifying..." : "Access Admin Panel"}
        </Button>
      </motion.div>
    </div>
  );
}