import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

const polygon = {
  id: 137,
  name: "Polygon",
  network: "polygon",
  nativeCurrency: {
    name: "Polygon",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_POLYGON_RPC_URL],
    },
    public: {
      http: [import.meta.env.VITE_POLYGON_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Polygonscan",
      url: "https://polygonscan.com",
    },
  },
};

export default function PrivyProviderWrapper({ children }) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ["email"],

        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },

        externalWallets: {
          enabled: false,
        },

        defaultChain: polygon,
        supportedChains: [polygon],

        appearance: {
          theme: "dark",
          accentColor: "#22d3ee",
          logo: "/logo.png",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}