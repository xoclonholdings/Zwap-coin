export const TERM_DEFINITIONS = {
  // ---------------------------
  // FOUNDATIONAL (ENTRY POINT)
  // ---------------------------

  web3: {
    title: "Web3",
    shortLabel: "Web3",
    description:
      "Web3 is a version of the internet where users can own and control their data, assets, and identity instead of relying only on platforms.",
    whyItMatters:
      "ZWAP introduces Web3 so your rewards and progress can eventually belong to you, not just the app.",
    learnMorePath: "/learn",
  },

  cryptocurrency: {
    title: "Cryptocurrency",
    shortLabel: "Crypto",
    description:
      "Cryptocurrency is digital money that exists on the internet and is not controlled by a single bank.",
    whyItMatters:
      "ZWAP connects to this system, helping you understand how digital value works beyond traditional money.",
    learnMorePath: "/learn",
  },

  blockchain: {
    title: "Blockchain",
    shortLabel: "Blockchain",
    description:
      "A blockchain is a digital record that stores transactions across many computers so it cannot easily be changed.",
    whyItMatters:
      "It is the system that tracks ownership and transactions for crypto and tokens like ZWAP.",
    learnMorePath: "/learn",
  },

  // ---------------------------
  // CORE ZWAP SYSTEM
  // ---------------------------

  zpts: {
    title: "zPts",
    shortLabel: "zPts",
    description:
      "zPts are in-app points you earn through movement, play, and learning.",
    whyItMatters:
      "They track your effort and progress before converting into deeper value systems like ZWAP.",
    learnMorePath: "/learn",
  },

  zwap: {
    title: "ZWAP",
    shortLabel: "ZWAP",
    description:
      "ZWAP is the main reward token in the ecosystem that connects to real digital value.",
    whyItMatters:
      "You earn zPts first, then ZWAP becomes accessible as your progress grows.",
    learnMorePath: "/learn",
  },

  token: {
    title: "Token",
    shortLabel: "Token",
    description:
      "A token is a digital unit of value that exists on a blockchain.",
    whyItMatters:
      "ZWAP is a token, so understanding tokens helps you understand how value moves in the system.",
    learnMorePath: "/learn",
  },

  wallet: {
    title: "Wallet",
    shortLabel: "Wallet",
    description:
      "A wallet is a digital tool that gives you access to your crypto and tokens.",
    whyItMatters:
      "In ZWAP, a wallet allows you to connect your rewards to you and access full Web3 features.",
    learnMorePath: "/learn",
  },

  ownership: {
    title: "Ownership",
    shortLabel: "Ownership",
    description:
      "Ownership means your assets or rewards are connected directly to you, not just stored inside an app.",
    whyItMatters:
      "A wallet allows you to truly own your rewards instead of relying on a platform.",
    learnMorePath: "/learn",
  },

  swap: {
    title: "Swap",
    shortLabel: "Swap",
    description:
      "Swap means exchanging one digital asset for another.",
    whyItMatters:
      "ZWAP introduces swapping later so users understand value before exchanging it.",
    learnMorePath: "/learn",
  },

  conversion: {
    title: "Conversion",
    shortLabel: "Conversion",
    description:
      "Conversion is turning one type of value into another under system rules.",
    whyItMatters:
      "In ZWAP, zPts convert into ZWAP only after enough progress is made.",
    learnMorePath: "/learn",
  },

  // ---------------------------
  // SYSTEM / ECONOMY
  // ---------------------------

  value: {
    title: "Value",
    shortLabel: "Value",
    description:
      "Value is how useful or meaningful something is based on what it provides.",
    whyItMatters:
      "ZWAP is built around creating value through action, not just assigning it.",
    learnMorePath: "/learn",
  },

  utility: {
    title: "Utility",
    shortLabel: "Utility",
    description:
      "Utility is how something is used and what purpose it serves.",
    whyItMatters:
      "ZWAP focuses on utility so rewards have real use, not just speculation.",
    learnMorePath: "/learn",
  },

  progression: {
    title: "Progression",
    shortLabel: "Progression",
    description:
      "Progression is moving forward step by step over time.",
    whyItMatters:
      "ZWAP unlocks features gradually as you build consistency.",
    learnMorePath: "/learn",
  },

  reward: {
    title: "Reward",
    shortLabel: "Reward",
    description:
      "A reward is something you earn after completing an action.",
    whyItMatters:
      "ZWAP uses rewards to reinforce useful behaviors like movement and learning.",
    learnMorePath: "/learn",
  },

  loop: {
    title: "Loop",
    shortLabel: "Loop",
    description:
      "A loop is a repeating cycle of actions and results.",
    whyItMatters:
      "ZWAP uses loops like Move → Play → Earn to build consistency.",
    learnMorePath: "/learn",
  },

  // ---------------------------
  // BEHAVIOR / DEVELOPMENT
  // ---------------------------

  habit: {
    title: "Habit",
    shortLabel: "Habit",
    description:
      "A habit is a behavior that becomes automatic through repetition.",
    whyItMatters:
      "ZWAP helps build habits through daily actions and rewards.",
    learnMorePath: "/learn",
  },

  consistency: {
    title: "Consistency",
    shortLabel: "Consistency",
    description:
      "Consistency means repeating an action regularly over time.",
    whyItMatters:
      "Progress in ZWAP comes from showing up repeatedly, not one-time effort.",
    learnMorePath: "/learn",
  },

  focus: {
    title: "Focus",
    shortLabel: "Focus",
    description:
      "Focus is directing your attention toward a specific task.",
    whyItMatters:
      "Better focus leads to better execution and stronger results.",
    learnMorePath: "/learn",
  },

  discipline: {
    title: "Discipline",
    shortLabel: "Discipline",
    description:
      "Discipline is taking action even when you don’t feel like it.",
    whyItMatters:
      "Discipline turns intention into real progress.",
    learnMorePath: "/learn",
  },

  identity: {
    title: "Identity",
    shortLabel: "Identity",
    description:
      "Identity is how you see yourself based on repeated actions.",
    whyItMatters:
      "ZWAP reinforces identity through streaks and consistent behavior.",
    learnMorePath: "/learn",
  },

  // ---------------------------
  // AI LAYER
  // ---------------------------

  ai: {
    title: "AI",
    shortLabel: "AI",
    description:
      "AI (Artificial Intelligence) is technology that can generate, analyze, and automate tasks.",
    whyItMatters:
      "ZWAP introduces AI so users can learn to use tools instead of avoiding them.",
    learnMorePath: "/learn",
  },

  automation: {
    title: "Automation",
    shortLabel: "Automation",
    description:
      "Automation is using technology to complete tasks with less manual effort.",
    whyItMatters:
      "Automation changes how work is done, making efficiency more important.",
    learnMorePath: "/learn",
  },

  prompt: {
    title: "Prompt",
    shortLabel: "Prompt",
    description:
      "A prompt is the instruction you give to an AI system.",
    whyItMatters:
      "Clear prompts lead to better AI results and more control.",
    learnMorePath: "/learn",
  },
};

export function getTermDefinition(term) {
  if (!term) return null;
  return TERM_DEFINITIONS[String(term).toLowerCase()] || null;
}