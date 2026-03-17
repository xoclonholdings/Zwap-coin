import React, { useState, useEffect, useCallback, useRef } from "react";
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
  console.log("PAGE LOADED", {
    sessionId: searchParams.get("session_id"),
    walletAddress,
  });
  const sessionId = searchParams.get("session_id");

  const activateSubscription = useCallback(
    async (currentSessionId) => {
      if (!walletAddress || !currentSessionId) {
        console.log("ACTIVATE SUB BLOCKED", {
          walletAddress,
          sessionId: currentSessionId,
        });
        setStatus("error");
        toast.error("Missing wallet or session information");
        return;
      }

      try {
        console.log("ACTIVATE SUB DEBUG", {
          walletAddress,
          sessionId: currentSessionId,
        });

        setStatus("activating");
        await api.activateSubscription(walletAddress, currentSessionId);
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

  const pollPaymentStatus = useCallback(
    async (currentSessionId, attempt = 0) => {
      if (!currentSessionId) {
        setStatus("error");
        return;
      }

      if (attempt >= 5) {
        setStatus("error");
        toast.error("Payment verification timed out");
        return;
      }

      try {
        const result = await api.getSubscriptionStatus(currentSessionId);

        console.log("SUB STATUS DEBUG", {
          walletAddress,
          sessionId: currentSessionId,
          attempt,
          result,
        });

        if (result.payment_status === "paid") {
          if (!walletAddress) {
            setAttempts(attempt + 1);
            setTimeout(() => pollPaymentStatus(currentSessionId, attempt + 1), 2000);
            return;
          }

          await activateSubscription(currentSessionId);
        } else if (result.status === "expired") {
          setStatus("error");
          toast.error("Checkout session expired");
        } else {
          setAttempts(attempt + 1);
          setTimeout(() => pollPaymentStatus(currentSessionId, attempt + 1), 2000);
        }
      } catch (error) {
        console.error("Error checking status:", error);
        setAttempts(attempt + 1);
        setTimeout(() => pollPaymentStatus(currentSessionId, attempt + 1), 2000);
      }
    },
    [walletAddress, activateSubscription]
  );

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    if (!walletAddress) {
      console.log("WAITING FOR WALLET ADDRESS...");
      return;
    }

    pollPaymentStatus(sessionId);
  }, [sessionId, walletAddress, pollPaymentStatus]);

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col items-center justify-center p-6">
      {status === "checking" && (
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
          <p className="text-gray-400">Please wait while we verify your payment...</p>
          {attempts > 0 && (
            <p className="text-gray-500 text-xs mt-2">Attempt {attempts + 1} of 5</p>
          )}
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
          <p className="text-gray-400 mb-6">Your Plus membership is active and ready to use.</p>

          <div className="glass-card p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Plus Benefits:</span>
            </div>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>✓ Game Submission Portal unlocked</li>
              <li>✓ Reward multipliers enabled</li>
              <li>✓ Early campaign access</li>
              <li>✓ Exclusive boosts & cosmetics</li>
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