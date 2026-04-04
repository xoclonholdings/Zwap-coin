import React from "react";
import { motion } from "framer-motion";
import { Wallet, Copy } from "lucide-react";
import { toast } from "sonner";

function formatWallet(address) {
  if (!address) return "Not connected";
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function formatZwap(value) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}

function formatZpts(value) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

export default function WalletCard({
  walletAddress,
  zwapBalance = 0,
  zptsBalance = 0,
  onConnectWallet,
  className = "",
}) {
  const hasWallet = !!walletAddress;

  const handleCopyWallet = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success("Wallet address copied");
    } catch (error) {
      toast.error("Failed to copy wallet address");
    }
  };

  return (
    <motion.div
      className={`rounded-[1.75rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent p-5 ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
            Wallet
          </p>
          <p className="mt-1 text-sm text-gray-300">
            {hasWallet ? "Connected balances" : "Connect to unlock rewards"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10">
          <Wallet className="h-5 w-5 text-cyan-300" />
        </div>
      </div>

      {hasWallet ? (
        <>
          <button
            type="button"
            onClick={handleCopyWallet}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-left transition hover:bg-white/[0.04]"
          >
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                Wallet Address
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {formatWallet(walletAddress)}
              </p>
            </div>

            <Copy className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-cyan-400/15 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                ZWAP
              </p>
              <p className="mt-2 text-2xl font-bold text-cyan-300">
                {formatZwap(zwapBalance)}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-400/15 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                zPts
              </p>
              <p className="mt-2 text-2xl font-bold text-purple-300">
                {formatZpts(zptsBalance)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={onConnectWallet}
          className="w-full rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-3 font-semibold text-cyan-300 transition hover:opacity-95"
        >
          Set Up Wallet
        </button>
      )}
    </motion.div>
  );
}