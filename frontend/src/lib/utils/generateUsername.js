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
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateUsername({
  walletAddress,
  email,
  username,
}) {
  // ✅ priority order (DO NOT CHANGE)
  if (username) return username;

  const seedSource = walletAddress || email || "";
  if (!seedSource) return "Zwapper";

  let seed;

  if (walletAddress && walletAddress.startsWith("0x")) {
    seed = parseInt(walletAddress.slice(2, 10), 16);
  } else {
    seed = hashString(String(seedSource).toLowerCase().trim());
  }

  const safeSeed = Math.abs(seed);

  const adjIndex = safeSeed % ADJECTIVES.length;
  const nounIndex = Math.floor(safeSeed / 7) % NOUNS.length;
  const num = safeSeed % 999;

  return `${ADJECTIVES[adjIndex]}${NOUNS[nounIndex]}${num}`;
}
