import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyProviderWrapper({ children }) {
  return (
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#22d3ee",
          walletList: ["detected_wallets", "metamask", "coinbase_wallet"],
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}