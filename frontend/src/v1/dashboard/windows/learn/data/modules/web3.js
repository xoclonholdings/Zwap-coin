export const web3Modules = [
  {
    id: "web3-basics",
    title: "Web3 Basics",
    category: "web3",
    level: "Beginner",
    short_description:
      "Understand the shift from platform-controlled accounts to user-controlled access and ownership.",

    lessons: [
      {
        id: "w3-1",
        title: "Concept",
        content:
          "Web3 is a model of the internet where users can directly control access, identity, and assets through wallets. Instead of relying only on platform-owned accounts, users can hold and move value themselves.",
      },
      {
        id: "w3-2",
        title: "Application",
        content:
          "Think of Web2 like renting space in someone else's building. Your account exists inside their system. Web3 is closer to carrying your own key. You can access your assets and identity without being tied to one platform.",
      },
      {
        id: "w3-3",
        title: "Lock In",
        content:
          "Web3 shifts control toward the user. Wallets act as the access layer. Ownership can become portable across platforms instead of being locked in one place.",
      },
    ],

    core:
      "Web3 is a model of the internet where users can directly hold assets, identities, and access through wallets instead of relying only on platform-owned accounts.",
    analogy:
      "Think of Web2 like renting space in someone else's building. Web3 is closer to carrying your own key.",

    tags: ["web3", "ownership", "identity", "internet"],
    recommendedEbookTags: ["web3", "ownership", "digital-identity"],
    recommendedArticleTags: ["web3", "ownership", "digital-identity"],

    content: {
      overview:
        "Web3 changes who controls access and ownership. Your wallet becomes portable identity.",
      zwap_context:
        "In ZWAP!, Web3 allows rewards to connect to you, not just the app.",
      key_points: [
        "Web3 shifts control toward the user",
        "Wallets are the access layer",
        "Ownership can become portable",
      ],
    },
  },

  {
    id: "wallet-basics",
    title: "Wallet Fundamentals",
    category: "web3",
    level: "Intermediate",
    short_description:
      "Understand how wallets function before using wallet-connected features.",

    lessons: [
      {
        id: "wb-1",
        title: "Concept",
        content:
          "Wallets manage keys, not assets directly. The assets exist on the blockchain, and the wallet gives you access and control over them.",
      },
      {
        id: "wb-2",
        title: "Application",
        content:
          "Think of a wallet like a key. The key does not contain what is inside the safe. It only controls access. Losing the key means losing access to what it protects.",
      },
      {
        id: "wb-3",
        title: "Lock In",
        content:
          "Private keys control access. Wallets do not physically store tokens. Wallet safety is critical before claiming or managing value.",
      },
    ],

    core:
      "Wallets manage keys, not assets directly. The assets live on the blockchain, and the wallet controls access.",
    analogy:
      "The key controls access, not the contents.",

    tags: ["wallet", "web3", "keys", "ownership"],
    recommendedEbookTags: ["wallet", "web3", "security"],
    recommendedArticleTags: ["wallet", "web3", "security"],

    content: {
      overview:
        "Wallets are the interface between users and blockchain systems. They help users control access, identity, and assets.",
      zwap_context:
        "ZWAP! uses wallets only when users are ready for deeper ownership and conversion features.",
      key_points: [
        "Private keys control access",
        "Wallets do not physically store tokens",
        "Wallet safety matters before claiming value",
      ],
    },
  },

  {
    id: "nft-reframe",
    title: "NFT Reframe",
    category: "web3",
    level: "Intermediate",
    short_description:
      "Understand NFTs beyond hype, pictures, and speculation.",

    lessons: [
      {
        id: "nft-1",
        title: "Concept",
        content:
          "An NFT is a unique digital record that represents ownership, access, proof, identity, or membership. It is not just an image. It is a record tied to a specific holder.",
      },
      {
        id: "nft-2",
        title: "Application",
        content:
          "Think of an NFT like a digital certificate. The image may be visible to everyone, but the record proves something specific belongs to one person.",
      },
      {
        id: "nft-3",
        title: "Lock In",
        content:
          "NFTs are unique digital records. The image is not the main purpose. NFTs can represent access, proof, identity, or membership. Useful systems focus on function, not hype.",
      },
    ],

    core:
      "An NFT is a unique digital record that can represent ownership, access, proof, identity, collectibles, tickets, rewards, or membership.",
    analogy:
      "Think of an NFT like a digital certificate. The image may be visible, but the record proves something specific belongs to one holder.",

    tags: ["nft", "ownership", "access", "identity", "collectibles"],
    recommendedEbookTags: ["nft", "ownership", "digital-assets"],
    recommendedArticleTags: ["nft", "ownership", "digital-culture"],

    content: {
      overview:
        "NFTs became famous through digital art, but the broader idea is unique digital proof.",
      zwap_context:
        "ZWAP! can use NFT-style systems later for identity, rewards, access, and progress tracking.",
      key_points: [
        "NFTs are unique digital records",
        "The image is not the whole point",
        "NFTs can represent access, proof, identity, or membership",
        "Useful NFT systems focus on function, not hype",
      ],
    },
  },

  {
    id: "web3-safety-basics",
    title: "Web3 Safety Basics",
    category: "web3",
    level: "Advanced",
    short_description:
      "Learn the basic safety habits needed before using wallet-connected tools.",

    lessons: [
      {
        id: "w3s-1",
        title: "Concept",
        content:
          "Web3 gives users more control, but more control also means more responsibility. Users must understand how connections, signatures, and permissions work.",
      },
      {
        id: "w3s-2",
        title: "Application",
        content:
          "Think of Web3 safety like checking doors before leaving home. One careless action can create risk. Being aware of what you approve or connect to protects your assets.",
      },
      {
        id: "w3s-3",
        title: "Lock In",
        content:
          "Do not connect wallets to random links. Always read signature requests. Never share private keys or seed phrases. Use trusted sources before taking action.",
      },
    ],

    core:
      "Web3 gives users more control, but more control means more responsibility. Safety starts with links, signatures, keys, and permissions.",
    analogy:
      "Think of Web3 safety like checking doors before leaving home. One careless action can create avoidable risk.",

    tags: ["web3", "security", "wallet", "scams", "safety"],
    recommendedEbookTags: ["security", "web3", "critical-thinking"],
    recommendedArticleTags: ["wallet-safety", "web3-security", "scams"],

    content: {
      overview:
        "Users should learn basic safety before connecting wallets or interacting with digital assets.",
      zwap_context:
        "ZWAP! delays deeper wallet features until users understand how to use them safely.",
      key_points: [
        "Do not connect wallets to random links",
        "Read signature requests before approving",
        "Never share private keys or seed phrases",
        "Use trusted sources before taking action",
      ],
    },
  },
];