export const WALLET_CONFIG = {
  metamask: {
    name: "MetaMask",
    color: "#F6851B",
    icon: "🦊",
    setupUrl: "https://metamask.io/download/",
    checkInstalled: () =>
      typeof window !== "undefined" && !!window.ethereum?.isMetaMask,
  },
  coinbase: {
    name: "Coinbase Wallet",
    color: "#1652F0",
    icon: "🔵",
    setupUrl: "https://www.coinbase.com/wallet/downloads",
    checkInstalled: () =>
      typeof window !== "undefined" &&
      (!!window.ethereum?.isCoinbaseWallet || !!window.coinbaseWalletExtension),
  },
  trust: {
    name: "Trust Wallet",
    color: "#3375BB",
    icon: "🛡️",
    setupUrl: "https://trustwallet.com/download",
    checkInstalled: () =>
      typeof window !== "undefined" &&
      (!!window.trustwallet || !!window.ethereum?.isTrust),
  },
};