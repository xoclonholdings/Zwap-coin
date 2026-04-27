import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyProviderWrapper({ children }) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ["email"], // 👈 ONLY email

        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },

        externalWallets: {
          enabled: false, // 👈 disables MetaMask and others
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}