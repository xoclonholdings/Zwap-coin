import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/App";
import api from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Check, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionSuccess() {
  const { walletAddress, refreshUser } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // checking, activating, success, error
  const [attempts, setAttempts] = useState(0);

  // ---------------------------
  // Stable function definitions
  // ---------------------------

  // 1️⃣ Wrap activateSubscription in useCallback
  const activateSubscription = useCallback(
    async (sessionId) => {
      try {
        setStatus("activating");
        await api.activateSubscription(walletAddress, sessionId);
        await refreshUser();
        setStatus("success");
        toast.success("Plus subscription activated!");
      } catch (error) {
        console.error("Activation error:", error);
        setStatus("error");
        toast.error(error?.message || "Activation failed");
      }
    },
    [walletAddress, refreshUser]
  );

  // 2️⃣ Wrap pollPaymentStatus in useCallback and include activateSubscription in deps
  const pollPaymentStatus = useCallback(
    async (sessionId, attempt = 0) => {
      if (attempt >= 5) {
        setStatus("error");
        return;
      }

      try {
        const result = await api.getSubscriptionStatus(sessionId);

        if (result.payment_status === "paid") {
          await activateSubscription(sessionId); // ✅ stable reference
        } else if (result.status === "expired") {
          setStatus("error");
        } else {
          setAttempts(attempt + 1);
          setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), 2000);
        }
      } catch (error) {
        console.error("Error checking status:", error);
        setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), 2000);
      }
    },
    [activateSubscription] // ✅ added missing dependency
  );

  // ---------------------------
  // Effects
  // ---------------------------

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }
    pollPaymentStatus(sessionId);
  }, [searchParams, pollPaymentStatus]);

  // ---------------------------
  // Render
  // ---------------------------

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col items-center justify-center p-6">
      {status === "checking" && (
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
          <p className="text-gray-400">Please wait while we verify your payment...</p>
        </div>
      )}

      {status === "activating" && (
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Activating Plus</h2>
          <p className="text-gray-400">Setting up your premium features...</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Plus! 🎉</h2>
          <p className="text-gray-400 mb-6">You now have access to all premium features</p>

          <div className="glass-card p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Plus Benefits:</span>
            </div>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>✓ All 4 games unlocked (zTetris, zSlots)</li>
              <li>✓ 1.5× ZWAP rewards</li>
              <li>✓ 30 Z Points daily cap</li>
              <li>✓ No ads</li>
              <li>✓ zDance & zWorkout modes</li>
            </ul>
          </div>

          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">We couldn't process your subscription</p>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-gray-600"
          >
            Return to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
