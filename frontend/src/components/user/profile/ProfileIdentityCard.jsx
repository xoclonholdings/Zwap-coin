import React from "react";
import { motion } from "framer-motion";
import { Edit2, Check, X, Calendar, Mail, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function formatWallet(address) {
  if (!address) return "Not connected";
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

export default function ProfileIdentityCard({
  displayName,
  avatarInitials,
  walletAddress,
  email,
  createdAt,
  isEditingName,
  newUsername,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onChangeUsername,
  onSaveUsername,
  onConnectWallet,
}) {
  const hasWallet = !!walletAddress;
  const hasEmail = !!email;

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative mb-4 inline-block">
        <motion.div
          className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30 text-3xl font-bold uppercase text-white shadow-lg"
          animate={{
            boxShadow: [
              "0 0 20px rgba(34,211,238,0.20)",
              "0 0 38px rgba(168,85,247,0.30)",
              "0 0 20px rgba(34,211,238,0.20)",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          {avatarInitials}
        </motion.div>
      </div>

      {isEditingName ? (
        <div className="mb-3 flex items-center justify-center gap-2">
          <Input
            value={newUsername}
            onChange={(e) => onChangeUsername(e.target.value)}
            placeholder="Enter new username"
            className="max-w-[220px] border-gray-700 bg-gray-800"
            autoFocus
          />
          <button
            onClick={onSaveUsername}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500"
            type="button"
          >
            <Check className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={onCancelEdit}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700"
            type="button"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      ) : (
        <div className="mb-2 flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-white">{displayName}</h2>
          <button
            onClick={onStartEdit}
            className="text-gray-400 hover:text-cyan-400"
            type="button"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Wallet className="h-4 w-4 text-cyan-400" />
          <span>{formatWallet(walletAddress)}</span>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Mail className="h-4 w-4 text-purple-400" />
          <span>{hasEmail ? email : "Email not connected"}</span>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>
            Member since{" "}
            {new Date(createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>

      {!hasWallet && (
        <div className="mt-4">
          <Button
            onClick={onConnectWallet}
            className="bg-gradient-to-r from-cyan-500 to-purple-500"
            type="button"
          >
            Set Up Wallet
          </Button>
        </div>
      )}
    </motion.div>
  );
}