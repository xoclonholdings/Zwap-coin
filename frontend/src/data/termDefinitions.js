export const TERM_DEFINITIONS = {
  wallet: {
    title: "Wallet",
    shortLabel: "Wallet",
    description:
      "A wallet is your digital key for accessing and controlling crypto assets.",
    whyItMatters:
      "In ZWAP, a wallet lets you claim ZWAP, connect your rewards to you, and use full Web3 features.",
    learnMorePath: "/learn",
  },

  zwap: {
    title: "ZWAP",
    shortLabel: "ZWAP",
    description:
      "ZWAP is the core reward token used across the ZWAP ecosystem.",
    whyItMatters:
      "You can earn it through activity and, once connected with a wallet, claim and use it more directly.",
    learnMorePath: "/learn",
  },

  zpts: {
    title: "zPts",
    shortLabel: "zPts",
    description:
      "zPts are in-app points you can earn while using ZWAP.",
    whyItMatters:
      "They help track progress and engagement, and can later connect into broader reward flows inside the app.",
    learnMorePath: "/learn",
  },

  swap: {
    title: "Swap",
    shortLabel: "Swap",
    description:
      "Swap means exchanging one token or digital asset for another.",
    whyItMatters:
      "In ZWAP, swap features are part of the broader wallet-connected experience.",
    learnMorePath: "/learn",
  },

  ownership: {
    title: "Ownership",
    shortLabel: "Ownership",
    description:
      "Ownership means your rewards or assets are connected directly to you instead of staying only inside the app.",
    whyItMatters:
      "A wallet is what gives you direct control over that ownership.",
    learnMorePath: "/learn",
  },
};

export function getTermDefinition(term) {
  if (!term) return null;
  return TERM_DEFINITIONS[String(term).toLowerCase()] || null;
}
