import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useApp } from "@/App";

export default function useZwapAuthState() {
  const { walletAddress, authUser } = useApp();
  const { ready, authenticated, user } = usePrivy();

  return useMemo(() => {
    const hasLegacyAuth = !!walletAddress || !!authUser;
    const hasPrivyAuth = ready && authenticated;

    return {
      ready,
      authenticated: hasPrivyAuth,
      privyAuthenticated: hasPrivyAuth,
      legacyAuthenticated: hasLegacyAuth,
      privyUser: user || null,
    };
  }, [walletAddress, authUser, ready, authenticated, user]);
}