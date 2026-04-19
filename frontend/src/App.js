import React from "react";
import { BrowserRouter } from "react-router-dom";

import "@/App.css";

import PrivyProviderWrapper from "@/app/PrivyProviderWrapper";
import { AppProvider } from "@/app/AppProvider";
import AppContent from "@/app/AppContent";
import MobileAppFrame from "@/components/ui/layout/MobileAppFrame";

// Re-exports
export { useApp, AppContext } from "@/app/AppProvider";
export { default as api } from "@/lib/api";

// ZWAP Core Config
export const ZWAP_CONTRACT = {
  address: "0xe8898453af13b9496a6e8ada92c6efdaf4967a81",
  network: "polygon",
  chainId: 137,
  symbol: "ZWAP",
  decimals: 18,
  name: "ZWAP Coin",
  totalSupply: "30000000000",
};

// Assets
export const ZWAP_LOGO =
  "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/8gvtmj56_Zwap_logo_full.png";

export const ZWAP_BANG =
  "https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/ubzr4hka_Zwap_bang_3d.png";

export const ZUPREME_LOGO =
  "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/bpbzieau_Zwap_Logo.png-1.png";

export const ZWAP_COIN =
  "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/7csajqza_zwap_coin_logo.png";

// Crypto Logos
export const CRYPTO_LOGOS = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png?v=029",
  POL: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=029",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=029",
  ZWAP:
    "https://customer-assets.emergentagent.com/job_a4dcc7bf-3db5-4e78-a723-311ef95c2e90/artifacts/7csajqza_zwap_coin_logo.png",
};

// Tier System
export const TIERS = {
  starter: {
    name: "Zwapper",
    multiplier: 1,
    zwap_multiplier: 1,
    dailyZptsCap: 300,
    daily_zpts_cap: 300,
    gameSubmission: true,
  },
  plus: {
    name: "Zitizen",
    multiplier: 1.5,
    zwap_multiplier: 1.5,
    dailyZptsCap: 600,
    daily_zpts_cap: 600,
    gameSubmission: true,
  },
};

// Root App
function App() {
  return (
    <BrowserRouter>
      <PrivyProviderWrapper>
        <AppProvider>
          <MobileAppFrame>
            <AppContent />
          </MobileAppFrame>
        </AppProvider>
      </PrivyProviderWrapper>
    </BrowserRouter>
  );
}

export default App;
