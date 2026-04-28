const ADJECTIVES = [
  "Nova",
  "Pixel",
  "Quantum",
  "Echo",
  "Neon",
  "Solar",
  "Cyber",
  "Hyper",
  "Shadow",
  "Turbo",
];

const NOUNS = [
  "Runner",
  "Walker",
  "Strider",
  "Pilot",
  "Glider",
  "Breaker",
  "Phantom",
  "Rider",
  "Explorer",
  "Voyager",
];

function hashString(value = "") {
  let hash = 0;
  const safeValue = String(value || "").toLowerCase().trim();

  for (let i = 0; i < safeValue.length; i += 1) {
    hash = (hash << 5) - hash + safeValue.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function normalizeEmail(email = "") {
  if (!email) return "";
  return String(email).toLowerCase().trim();
}

function normalizeWallet(walletAddress = "") {
  if (!walletAddress) return "";
  return String(walletAddress).trim();
}

export function generateUsername({
  walletAddress = "",
  email = "",
  username = "",
} = {}) {
  const savedUsername = String(username || "").trim();

  if (savedUsername) {
    return savedUsername;
  }

  const safeWalletAddress = normalizeWallet(walletAddress);
  const safeEmail = normalizeEmail(email);

  const seedSource = safeWalletAddress || safeEmail;

  if (!seedSource) {
    return "";
  }

  let seed = 0;

  if (safeWalletAddress.startsWith("0x") && safeWalletAddress.length >= 10) {
    seed = parseInt(safeWalletAddress.slice(2, 10), 16);
  } else {
    seed = hashString(seedSource);
  }

  const safeSeed = Math.abs(seed);
  const adjective = ADJECTIVES[safeSeed % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(safeSeed / 7) % NOUNS.length];
  const number = safeSeed % 999;

  return `${adjective}${noun}${number}`;
}

export default generateUsername;
