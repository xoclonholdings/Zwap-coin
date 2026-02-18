// Education Knowledge Spine
// Structured as modular knowledge units at 7th-grade reading level
// Powers: Learn section, Trivia, Ticker, Between-round facts, Wallet page, About page

const educationModules = [
  {
    id: "cryptocurrency",
    title: "What Is Cryptocurrency?",
    icon: "coins",
    color: "cyan",
    core: "Cryptocurrency is digital money that lives on the internet. It is not printed like paper cash and it is not controlled by one single bank. Instead, it runs on a network of computers that agree on every transaction.",
    analogy: "Think of it like a shared notebook that everyone can see, but no one can erase. Every time someone sends money, it gets written in ink.",
    trivia: [
      { question: "Is cryptocurrency physical or digital?", answer: "Digital", options: ["Physical", "Digital", "Both", "Neither"] },
      { question: "Does one bank control cryptocurrency?", answer: "No", options: ["Yes", "No", "Sometimes", "Only in the US"] },
      { question: "What keeps track of crypto transactions?", answer: "A network of computers", options: ["A single bank", "A network of computers", "Paper receipts", "The government"] },
    ],
    didYouKnow: [
      "Crypto transactions are recorded on something called a blockchain.",
      "You don't need a bank to send cryptocurrency.",
      "Every crypto transaction is verified by computers around the world.",
    ],
  },
  {
    id: "blockchain",
    title: "What Is a Blockchain?",
    icon: "blocks",
    color: "purple",
    core: "A blockchain is a digital record book. It stores transactions in blocks. Once a block is full, it gets sealed and linked to the next one.",
    analogy: "Imagine stacking Lego bricks. Each brick connects to the one before it. If someone tries to remove one in the middle, the whole stack breaks.",
    trivia: [
      { question: "What are transactions stored in?", answer: "Blocks", options: ["Files", "Blocks", "Folders", "Emails"] },
      { question: "Can you erase a block once it is added?", answer: "No", options: ["Yes", "No", "Only admins can", "After 24 hours"] },
      { question: "Why is it called a chain?", answer: "Because blocks are linked together", options: ["It looks like a chain", "Because blocks are linked together", "It was invented by a chain company", "No reason"] },
    ],
    didYouKnow: [
      "Blockchain makes cheating very hard.",
      "Blocks are connected in order, like train cars.",
      "Once information is added, it cannot easily be changed.",
    ],
  },
  {
    id: "wallet",
    title: "What Is a Crypto Wallet?",
    icon: "wallet",
    color: "blue",
    core: "A crypto wallet does not store money the way a physical wallet does. It stores keys that allow you to access your crypto.",
    analogy: "Your wallet is like the key to a safety deposit box. The money is not in the key. The key just unlocks access.",
    trivia: [
      { question: "Does a wallet hold crypto physically?", answer: "No", options: ["Yes", "No", "Only some wallets", "Only on phones"] },
      { question: "What does a wallet really store?", answer: "Keys", options: ["Coins", "Keys", "Passwords", "Photos"] },
      { question: "Should you share your private key?", answer: "Never", options: ["Yes, with friends", "Never", "Only online", "Only with your bank"] },
    ],
    didYouKnow: [
      "Your wallet address is safe to share.",
      "Your private key should never be shared.",
      "Losing your private key means losing access.",
    ],
  },
  {
    id: "zwap",
    title: "What Is ZWAP?",
    icon: "zap",
    color: "cyan",
    core: "ZWAP is a digital token used inside this app. You earn it by walking or playing games. You can use it in the shop or swap it.",
    analogy: "Think of ZWAP like arcade tickets. You earn them by playing. Then you trade them for prizes.",
    trivia: [
      { question: "How do you earn ZWAP?", answer: "Walking and playing games", options: ["Buying it", "Walking and playing games", "Watching ads", "Signing up"] },
      { question: "Can you use ZWAP in the shop?", answer: "Yes", options: ["Yes", "No", "Only on weekends", "Only with Plus"] },
      { question: "Is ZWAP a physical coin?", answer: "No, it is digital", options: ["Yes", "No, it is digital", "Sometimes", "Only in some countries"] },
    ],
    didYouKnow: [
      "1000 zPts convert into 1 ZWAP.",
      "ZWAP runs on the Polygon network.",
      "ZWAP has a fixed total supply of 30 billion.",
    ],
  },
  {
    id: "zpts",
    title: "What Are zPts?",
    icon: "star",
    color: "purple",
    core: "zPts are reward points inside the app. They are not cryptocurrency. But they can convert into ZWAP.",
    analogy: "zPts are like reward stars in school. Collect enough stars and you get a prize.",
    trivia: [
      { question: "Are zPts the same as ZWAP?", answer: "No", options: ["Yes", "No", "They are similar", "Only on Plus tier"] },
      { question: "How many zPts equal 1 ZWAP?", answer: "1000", options: ["100", "500", "1000", "10000"] },
      { question: "Do zPts live on the blockchain?", answer: "No, they are tracked in the app", options: ["Yes", "No, they are tracked in the app", "Sometimes", "Only for Plus users"] },
    ],
    didYouKnow: [
      "zPts are tracked in the app database.",
      "zPts help prevent spam rewards.",
      "zPts can have daily limits depending on your tier.",
    ],
  },
  {
    id: "swap",
    title: "What Is a Swap?",
    icon: "arrows",
    color: "green",
    core: "A swap lets you exchange one cryptocurrency for another. It works like trading one type of money for another.",
    analogy: "Like exchanging dollars for euros at an airport.",
    trivia: [
      { question: "What does a swap do?", answer: "Exchanges one crypto for another", options: ["Deletes crypto", "Exchanges one crypto for another", "Creates new crypto", "Sends crypto to a bank"] },
      { question: "Does the price stay the same all the time?", answer: "No, it changes", options: ["Yes", "No, it changes", "Only on weekdays", "Only for ZWAP"] },
      { question: "Why is there a small fee?", answer: "To help support the system", options: ["There is no fee", "To help support the system", "To pay the government", "It is a bug"] },
    ],
    didYouKnow: [
      "Swap prices change based on market value.",
      "Small fees help support the network.",
      "Swaps use live market pricing.",
    ],
  },
];

// Flatten all "Did You Know?" facts for ticker usage
export const allDidYouKnow = educationModules.flatMap((m) =>
  m.didYouKnow.map((fact) => ({ moduleId: m.id, moduleTitle: m.title, fact }))
);

// Flatten all trivia questions for game usage
export const allTrivia = educationModules.flatMap((m) =>
  m.trivia.map((t) => ({ ...t, moduleId: m.id, moduleTitle: m.title }))
);

// Get a specific module by ID
export const getModule = (id) => educationModules.find((m) => m.id === id);

// Get wallet-specific content (Module 3) for the Wallet Page
export const walletModule = educationModules.find((m) => m.id === "wallet");

export default educationModules;
