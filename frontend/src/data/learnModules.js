export const learnModules = {
  beginner: [
    {
      id: "web3-basics",
      title: "Web3 Basics",
      category: "foundations",
      level: "Beginner",
      short_description:
        "Understand the shift from platform-controlled accounts to user-controlled access and ownership.",
      core:
        "Web3 is a model of the internet where users can directly hold assets, identities, and access through wallets instead of relying only on platform-owned accounts.",
      analogy:
        "Think of Web2 like renting space in someone else's building. Web3 is closer to carrying your own key.",
      content: {
        overview:
          "Web3 changes who controls access and ownership. Your wallet becomes portable identity.",
        zwap_context:
          "In ZWAP, Web3 allows rewards to connect to you, not just the app.",
        key_points: [
          "Web3 shifts control to the user",
          "Wallets are the access layer",
          "Ownership is portable",
        ],
      },
    },

    {
      id: "utility-token-basics",
      title: "Utility Token Basics",
      category: "tokens",
      level: "Beginner",
      short_description:
        "Learn what a utility token is and how it differs from points.",
      core:
        "A utility token is designed to be used inside a system for access and function.",
      analogy:
        "Think of it like a programmable pass, not just currency.",
      content: {
        overview:
          "Utility tokens gain value from what they allow you to do.",
        zwap_context:
          "ZWAP connects movement, play, and rewards into one system.",
        key_points: [
          "Utility > speculation",
          "Function defines value",
        ],
      },
    },

    {
      id: "zwap-token-utility",
      title: "ZWAP Token Utility",
      category: "zwap",
      level: "Beginner",
      short_description:
        "Understand how ZWAP works inside the app.",
      core:
        "ZWAP is the reward layer of the ecosystem.",
      analogy:
        "zPts track progress, ZWAP carries value.",
      content: {
        overview:
          "ZWAP connects all activity into one system.",
        zwap_context:
          "Wallet connection unlocks deeper utility.",
        key_points: [
          "ZWAP is earned through activity",
          "It extends beyond the app",
        ],
      },
    },
  ],

  intermediate: [
    {
      id: "wallet-basics",
      title: "Wallet Fundamentals",
      category: "foundations",
      level: "Intermediate",
      short_description:
        "Understand how wallets actually function.",
      core:
        "Wallets manage keys, not assets directly.",
      analogy:
        "The key controls access, not the contents.",
      content: {
        overview:
          "Wallets are the interface between you and blockchain systems.",
        zwap_context:
          "ZWAP uses wallets when users are ready to claim ownership.",
        key_points: [
          "Private keys = control",
          "Wallet ≠ storage",
        ],
      },
    },
  ],

  advanced: [
    {
      id: "onchain-vs-offchain",
      title: "On-Chain vs Off-Chain",
      category: "foundations",
      level: "Advanced",
      short_description:
        "Learn how systems split data between blockchain and apps.",
      core:
        "Not everything lives on-chain.",
      analogy:
        "Think of blockchain as a ledger, not the entire app.",
      content: {
        overview:
          "Apps balance performance and decentralization.",
        zwap_context:
          "ZWAP uses both layers for speed and usability.",
        key_points: [
          "On-chain = trust",
          "Off-chain = speed",
        ],
      },
    },
  ],

  expert: [
    {
      id: "token-design",
      title: "Token Design Systems",
      category: "zwap",
      level: "Expert",
      short_description:
        "Understand how token ecosystems are structured.",
      core:
        "Token design controls behavior.",
      analogy:
        "It’s like designing an economy, not just a currency.",
      content: {
        overview:
          "Token systems influence user behavior.",
        zwap_context:
          "ZWAP is built as a behavioral reward layer.",
        key_points: [
          "Design > hype",
          "Behavior is engineered",
        ],
      },
    },
  ],
};