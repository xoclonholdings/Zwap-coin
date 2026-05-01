import { TERM_DEFINITIONS, getTermDefinition } from "@/data/terms";

// Build term keys once
const TERM_KEYS = Object.keys(TERM_DEFINITIONS);

// Map concepts → terms (semantic matching)
const TERM_ALIASES = {
  wallet: ["wallet", "key", "access"],
  zwap: ["zwap"],
  zpts: ["zpts", "points"],
  swap: ["swap", "exchange"],
  ownership: ["ownership", "own", "control"],

  web3: ["web3"],
  cryptocurrency: ["crypto", "cryptocurrency"],
  blockchain: ["blockchain"],
  token: ["token"],

  value: ["value"],
  utility: ["utility", "use"],
  progression: ["progress", "progression"],
  reward: ["reward", "earn"],
  loop: ["loop", "cycle"],

  habit: ["habit"],
  consistency: ["consistency", "repeat"],
  focus: ["focus", "attention"],
  discipline: ["discipline"],
  identity: ["identity"],

  ai: ["ai"],
  automation: ["automation"],
  prompt: ["prompt"],
};

// Flatten alias lookup
function resolveTerm(cleanWord) {
  for (const termKey of TERM_KEYS) {
    const aliases = TERM_ALIASES[termKey] || [];
    if (aliases.includes(cleanWord)) {
      return termKey;
    }
  }
  return null;
}

export function parseLessonText(text = "") {
  if (!text) return [];

  const words = text.split(/(\s+)/);

  const usedTerms = new Set(); // prevent over-highlighting

  return words.map((word, index) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");

    const matchedTermKey = resolveTerm(clean);

    if (matchedTermKey && !usedTerms.has(matchedTermKey)) {
      const term = getTermDefinition(matchedTermKey);

      if (term) {
        usedTerms.add(matchedTermKey);

        return {
          type: "term",
          value: word,
          term,
          key: `${matchedTermKey}-${index}`,
        };
      }
    }

    return {
      type: "text",
      value: word,
      key: `text-${index}`,
    };
  });
}