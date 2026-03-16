import React from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const handleSubscribe = async () => {
  try {
    const data = await api.createPlusSubscription();
    window.location.href = data.checkout_url;
  } catch (error) {
    console.error("Subscription checkout failed:", error);
  }
};

export default function PlusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full bg-card border rounded-2xl p-8 text-center shadow"
      >
        <Crown className="mx-auto mb-4 text-yellow-400" size={40} />

        <h1 className="text-3xl font-bold mb-2">ZWAP! Plus</h1>

        <p className="text-muted-foreground mb-6">
          Upgrade your ZWAP! experience with premium rewards and creator tools.
        </p>

        <div className="text-4xl font-bold mb-6">
          $9.99
          <span className="text-lg font-normal"> / month</span>
        </div>

        <div className="text-left mb-8 space-y-2 text-sm">
          <div>• Reward multipliers</div>
          <div>• Developer game submission portal</div>
          <div>• Early campaign access</div>
          <div>• Exclusive boosts & cosmetics</div>
        </div>

       <Button
  size="lg"
  className="w-full text-base font-semibold"
  onClick={handleSubscribe}
>
  Subscribe to Plus
</Button>
      </motion.div>
    </div>
  );
}