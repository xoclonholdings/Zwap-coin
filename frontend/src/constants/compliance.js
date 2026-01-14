/**
 * ZWAP! App Compliance Constants
 * 
 * This file contains all platform-safe language and compliance rules
 * for Apple App Store and Google Play compliance.
 * 
 * RULES:
 * - Never use: "portfolio", "your funds", "instant exchange", "profit", "real trading", "investment"
 * - Always use: "earned rewards", "claim to wallet", "view linked wallet", "external swap"
 * - All on-chain actions must be user-initiated externally
 * - App displays/tracks rewards but never moves crypto internally
 */

// Compliant terminology mappings
export const COMPLIANT_TERMS = {
  // Balance/Wallet
  balance: "reward balance",
  wallet: "linked wallet",
  funds: "earned rewards",
  portfolio: "rewards summary",
  
  // Actions
  swap: "external swap",
  trade: "convert (external)",
  exchange: "external exchange",
  transfer: "claim to wallet",
  withdraw: "claim rewards",
  deposit: "add to wallet",
  
  // Value
  profit: "earnings",
  investment: "participation",
  returns: "rewards",
  gains: "bonus rewards",
  
  // Ownership
  yourFunds: "your earned rewards",
  yourMoney: "your reward balance",
  realValue: "reward value",
};

// UI Copy - Platform Safe Language
export const UI_COPY = {
  // Header/Balance Display
  balanceLabel: "Earned Rewards",
  onChainLabel: "Linked Wallet",
  inAppLabel: "In-App Rewards",
  readOnlyNotice: "View only • Claim coming soon",
  
  // SWAP Tab (External)
  swapTitle: "SWAP",
  swapSubtitle: "External Exchange Portal",
  swapDescription: "Convert your rewards using external services",
  swapDisclaimer: "Swaps occur outside this app via third-party services. We do not process, custody, or control any transactions.",
  swapButtonText: "Open External Swap",
  swapInfoText: "You will be redirected to an external service to complete your swap. All transactions are processed by third-party providers.",
  
  // MOVE Tab
  moveClaimButton: "Record Rewards",
  moveClaimSuccess: "Rewards recorded to your account!",
  movePendingLabel: "pending rewards",
  
  // PLAY Tab
  playRewardsLabel: "Game Rewards",
  playClaimSuccess: "Game rewards recorded!",
  
  // SHOP Tab
  shopPurchaseButton: "Redeem",
  shopPurchaseSuccess: "Item redeemed successfully!",
  
  // General Claims
  claimTitle: "Claim to Wallet",
  claimDescription: "Transfer your earned rewards to your personal wallet",
  claimDisclaimer: "Claiming requires wallet signature. Rewards will be sent from the ZWAP treasury to your linked wallet address.",
  claimButtonText: "Claim Rewards",
  claimComingSoon: "Claim to wallet coming soon",
  
  // Tooltips
  tooltipBalance: "Your accumulated in-app rewards. Claim to your wallet to access on-chain.",
  tooltipOnChain: "Balance in your linked external wallet (read-only display).",
  tooltipZPoints: "Loyalty credits earned from games. Not transferable, use in-app only.",
  
  // Warnings/Disclaimers
  disclaimerGeneral: "ZWAP! is a rewards app. Earned tokens are tracked in-app until claimed to your external wallet.",
  disclaimerSwap: "All cryptocurrency exchanges occur via external services. This app does not process transactions.",
  disclaimerNoFinancial: "This is not financial advice. Cryptocurrency values fluctuate. Only participate with what you can afford.",
  disclaimerWallet: "Your wallet is never accessed by this app. We only display your public balance.",
};

// Feature Flags for Compliance
export const COMPLIANCE_FLAGS = {
  // Current State
  inAppSwapsEnabled: false,        // MUST be false for compliance
  directClaimEnabled: false,       // Future: user-initiated external claim
  externalSwapPortal: true,        // Redirect to external swap service
  readOnlyWalletDisplay: true,     // Only display, never sign
  
  // Transaction Rules
  appInitiatesTransactions: false, // MUST be false - app never initiates
  userSignsExternally: true,       // User must sign in their wallet app
  treasurySendsRewards: true,      // Treasury sends after user confirms
};

// External Service URLs (for swap redirects)
export const EXTERNAL_SERVICES = {
  swapPortal: "https://app.1inch.io/#/137/simple/swap/MATIC/", // Example: 1inch on Polygon
  lifiWidget: "https://jumper.exchange/",
  uniswap: "https://app.uniswap.org/swap",
};

// App Store Compliance Checklist
export const COMPLIANCE_CHECKLIST = {
  rules: [
    "App observes, displays, and tracks rewards only",
    "App never moves crypto internally",
    "All on-chain actions are user-initiated externally",
    "Copy does not imply financial ownership inside app",
    "Swaps/conversions are externalized",
    "Wallet display is read-only",
    "No transaction signing occurs in-app",
  ],
  warnings: [
    "SWAP_INTERNAL: In-app swaps violate Apple/Google policies",
    "DIRECT_TRANSFER: App-initiated transfers are prohibited",
    "PROFIT_LANGUAGE: Avoid profit/investment terminology",
    "CUSTODY: App must never custody user funds",
  ],
};

export default {
  COMPLIANT_TERMS,
  UI_COPY,
  COMPLIANCE_FLAGS,
  EXTERNAL_SERVICES,
  COMPLIANCE_CHECKLIST,
};
