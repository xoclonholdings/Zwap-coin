import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePrivy } from "@privy-io/react-auth";
import { useApp } from "@/App";
import { ChevronRight, Shield } from "lucide-react";
import ProfilePage from "@/pages/ProfilePage";

function generateUsername(wallet) {
  if (!wallet) return "Zwapper";

  const adjectives = [
    "Nova","Pixel","Quantum","Echo","Neon",
    "Solar","Cyber","Hyper","Shadow","Turbo",
  ];

  const nouns = [
    "Runner","Walker","Strider","Pilot","Glider",
    "Breaker","Phantom","Rider","Explorer","Voyager",
  ];

  const seed = parseInt(wallet.slice(2, 10), 16);
  const adjIndex = Math.abs(seed) % adjectives.length;
  const nounIndex = Math.abs(Math.floor(seed / 8)) % nouns.length;
  const num = Math.abs(seed) % 999;

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${num}`;
}

export default function AccountDrawer({ open, onOpenChange, trigger }) {
  const navigate = useNavigate();
  const { logout: privyLogout } = usePrivy();

  const {
    user,
    walletAddress,
    logoutAll,
    onchainBalance,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = useMemo(() => {
    if (user?.custom_username) return user.custom_username;
    if (walletAddress) return generateUsername(walletAddress);
    return "Zwapper";
  }, [user, walletAddress]);

  const initials = useMemo(() => {
    return displayName
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "Z";
  }, [displayName]);

  const isPlus = user?.tier === "plus";

  const zptsBalance = Number(user?.zpts_balance ?? 0);

  const handleSignOut = async () => {
    try {
      await privyLogout();
    } catch (e) {}

    logoutAll();
    onOpenChange(false);
    navigate("/start", { replace: true });
  };

  const handleShieldPress = () => {
    onOpenChange(false);
    if (user?.is_admin) {
      navigate("/admin");
    } else {
      navigate("/about");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent
        side="right"
        className="w-80 bg-[#0a0b1e] border-l border-white/10 p-0"
      >
        <div className="relative h-full flex flex-col justify-between">

          {/* ================= TOP ================= */}
          <div className="p-5 space-y-5">

            {/* Identity */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-purple-500/30">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white truncate">
                    {displayName}
                  </p>

                  {/* Tier Tag */}
                  {isPlus ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-black font-semibold">
                      Zitizen
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400">
                        Zwapper
                      </span>
                      <button
                        onClick={() => {
                          onOpenChange(false);
                          navigate("/plus");
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold"
                      >
                        Upgrade
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="text-sm text-gray-300">
              <span className="text-cyan-400 font-semibold">
                {walletAddress && onchainBalance != null
                  ? onchainBalance.toFixed(2)
                  : "0.00"}
              </span>{" "}
              ZWAP
              <span className="mx-2 text-gray-600">|</span>
              <span className="text-purple-400 font-semibold">
                {zptsBalance}
              </span>{" "}
              zPts
            </div>

            {/* Open Wallet */}
            <button
              onClick={() => setProfileOpen(true)}
              className="w-full flex items-center justify-between rounded-xl border border-cyan-500/30 px-4 py-3 text-left hover:bg-cyan-500/10 transition"
            >
              <span className="text-cyan-400 font-semibold">
                {walletAddress ? "Open Wallet" : "Set Up Wallet"}
              </span>
              <ChevronRight className="w-5 h-5 text-cyan-400" />
            </button>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setProfileOpen(true)}
                className="block w-full text-left text-lg text-white hover:text-cyan-400"
              >
                Profile
              </button>

              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/learn");
                }}
                className="block w-full text-left text-lg text-white hover:text-cyan-400"
              >
                Learn
              </button>

              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/contact");
                }}
                className="block w-full text-left text-lg text-white hover:text-cyan-400"
              >
                Contact
              </button>

              <button
                onClick={handleSignOut}
                className="block w-full text-left text-lg text-red-400 hover:text-red-300"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* ================= BOTTOM ================= */}
          <div className="p-5 space-y-4">

            {/* Shield */}
            <div className="flex justify-center">
              <button
                onClick={handleShieldPress}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center"
              >
                <Shield className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500">
              <span
                onClick={() => navigate("/privacy")}
                className="cursor-pointer hover:text-gray-300"
              >
                Privacy
              </span>
              {" • "}
              <span
                onClick={() => navigate("/about")}
                className="cursor-pointer hover:text-gray-300"
              >
                Help
              </span>
              {" • "}
              <span
                onClick={() => navigate("/terms")}
                className="cursor-pointer hover:text-gray-300"
              >
                Terms
              </span>
            </div>
          </div>

          {/* ================= PROFILE OVERLAY ================= */}
          {profileOpen && (
            <div className="absolute inset-0 z-50 bg-[#050510]">
              <ProfilePage onClose={() => setProfileOpen(false)} />
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
}