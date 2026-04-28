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

function normalizeEmail(email = "") {
  return String(email || "").toLowerCase().trim();
}

function normalizeWallet(walletAddress = "") {
  return String(walletAddress || "").toLowerCase().trim();
}

function hashString(value = "") {
  let hashValue = 0;
  const safeValue = String(value || "").toLowerCase().trim();

  for (let index = 0; index < safeValue.length; index += 1) {
    hashValue = (hashValue << 5) - hashValue + safeValue.charCodeAt(index);
    hashValue |= 0;
  }

  return Math.abs(hashValue);
}

export function generateUsername({
  username = "",
  email = "",
  walletAddress = "",
} = {}) {
  if (username) return username;

  const safeEmail = normalizeEmail(email);
  const safeWallet = normalizeWallet(walletAddress);
  const seedSource = safeEmail || safeWallet;

  if (!seedSource) return "Zwapper";

  const seed = hashString(seedSource);
  const adjective = ADJECTIVES[seed % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(seed / 7) % NOUNS.length];
  const number = seed % 999;

  return `${adjective}${noun}${number}`;
}