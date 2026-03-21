import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Activity,
  Coins,
  Database,
  Pause,
  Play,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import adminApi from "@/lib/adminApi";
import StatCard from "@/components/admin/StatCard";

export default function TreasurySection() {
  const [treasury, setTreasury] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendForm, setSendForm] = useState({ to: "", amount: "" });
  const [sending, setSending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState("");
  const [txError, setTxError] = useState("");

  useEffect(() => {
    loadTreasury();
  }, []);

  const loadTreasury = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/treasury");
      setTreasury(data);
    } catch {
      toast.error("Failed to load treasury");
    }
    setLoading(false);
  };

  const toggleClaims = async (pause) => {
    if (!confirm(pause ? "Pause all claims?" : "Resume claims?")) return;
    try {
      await adminApi.post("/treasury/action", {
        action: pause ? "pause_claims" : "resume_claims",
        reason: "Admin toggle",
      });
      toast.success(pause ? "Claims paused" : "Claims resumed");
      loadTreasury();
    } catch {
      toast.error("Action failed");
    }
  };

  const sendZwap = async () => {
    if (!sendForm.to || !sendForm.amount) {
      toast.error("Destination wallet and amount are required");
      return;
    }

    setSending(true);
    setTxError("");
    setLastTxHash("");

    try {
      const result = await adminApi.post("/treasury/send", {
        to: sendForm.to.trim(),
        amount: Number(sendForm.amount),
      });

      toast.success("ZWAP sent successfully");
      setLastTxHash(result.tx_hash || "");
      setSendForm({ to: "", amount: "" });
      await loadTreasury();
    } catch (err) {
      console.error(err);
      const message = err?.message || "Failed to send ZWAP";
      setTxError(message);
      toast.error("Failed to send ZWAP");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading treasury data...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Treasury & Token Operations</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="ZWAP Treasury"
          value={(treasury?.on_chain_balance || 0).toFixed(2)}
          subValue="Token balance"
          color="cyan"
        />
        <StatCard
          icon={Coins}
          label="Native Balance"
          value={(treasury?.native_balance || 0).toFixed(4)}
          subValue="Wallet gas funds"
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Issued Total"
          value={(treasury?.issued_total || 0).toFixed(0)}
          subValue="All time"
          color="green"
        />
        <StatCard
          icon={Activity}
          label="Claimed Total"
          value={(treasury?.claimed_total || 0).toFixed(0)}
          subValue="All time"
          color="blue"
        />
      </div>

      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 space-y-3">
        <h3 className="text-white font-semibold">Web3 Visibility</h3>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500">Treasury Wallet</p>
            <p className="text-white font-mono text-sm break-all">
              {treasury?.treasury_wallet || "—"}
            </p>
          </div>

          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500">ZWAP Contract</p>
            <p className="text-white font-mono text-sm break-all">
              {treasury?.contract_address || "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <div
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${
              treasury?.web3_connected
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {treasury?.web3_connected ? (
              <Play className="w-3 h-3" />
            ) : (
              <Pause className="w-3 h-3" />
            )}
            Web3: {treasury?.status_label || (treasury?.web3_connected ? "connected" : "offline")}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          Send ZWAP
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Destination Wallet</label>
            <Input
              value={sendForm.to}
              onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
              placeholder="0x..."
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Amount</label>
            <Input
              type="number"
              min="0"
              step="any"
              value={sendForm.amount}
              onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
              placeholder="Amount of ZWAP"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={sendZwap}
            disabled={sending || !sendForm.to || !sendForm.amount}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send ZWAP"}
          </Button>
        </div>

        {lastTxHash && (
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500">Last Transaction Hash</p>
            <p className="text-cyan-400 font-mono text-sm break-all">{lastTxHash}</p>
          </div>
        )}

        {txError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm break-all">{txError}</p>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Emergency Controls
        </h3>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => toggleClaims(true)}
            variant="destructive"
            disabled={treasury?.claims_paused}
            className="bg-red-600 hover:bg-red-700"
          >
            <Pause className="w-4 h-4 mr-2" /> Pause All Claims
          </Button>

          <Button
            onClick={() => toggleClaims(false)}
            className="bg-green-600 hover:bg-green-700"
            disabled={!treasury?.claims_paused}
          >
            <Play className="w-4 h-4 mr-2" /> Resume Claims
          </Button>
        </div>

        {treasury?.claims_paused && (
          <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Claims are currently PAUSED
          </p>
        )}
      </div>
    </div>
  );
}