import { TERM_DEFINITIONS, getTermDefinition } from "@/data/terms";

// ---------------------------
// CONFIG
// ---------------------------

// Phrase + alias mapping (can expand anytime)
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

  // 🔥 Phrase-level detection
  "private key": ["private key"],
  "digital identity": ["digital identity"],
  "cash flow": ["cash flow"],
};

// ---------------------------
// BUILD TERM INDEX
// ---------------------------

const TERM_KEYS = Object.keys(TERM_DEFINITIONS);

// Flatten phrases + aliases into lookup
function buildAliasMap() {
  const map = new Map();

  Object.entries(TERM_ALIASES).forEach(([termKey, aliases]) => {
    aliases.forEach((alias) => {
      map.set(alias.toLowerCase(), termKey);
    });
  });

  return map;
}

const ALIAS_MAP = buildAliasMap();

// ---------------------------
// TEXT NORMALIZATION
// ---------------------------

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

// ---------------------------
// MAIN PARSER
// ---------------------------

export function parseLessonText(text = "") {
  if (!text) return [];

  const normalized = normalize(text);
  const words = text.split(/(\s+)/); // preserve original spacing

  const usedTerms = new Set();
  const results = [];

  let i = 0;

  while (i < words.length) {
    let matched = false;

    // Try phrase matching first (2-word phrases)
    if (i < words.length - 2) {
      const phrase = normalize(words[i] + words[i + 1]);

      if (ALIAS_MAP.has(phrase)) {
        const termKey = ALIAS_MAP.get(phrase);

        if (!usedTerms.has(termKey)) {
          const term = getTermDefinition(termKey);

          if (term) {
            results.push({
              type: "term",
              value: words[i] + words[i + 1],
              term,
              key: `${termKey}-${i}`,
            });

            usedTerms.add(termKey);
            i += 2;
            matched = true;
          }
        }
      }
    }

    if (matched) continue;

    // Single word match
    const clean = normalize(words[i]);

    if (ALIAS_MAP.has(clean)) {
      const termKey = ALIAS_MAP.get(clean);

      if (!usedTerms.has(termKey)) {
        const term = getTermDefinition(termKey);

        if (term) {
          results.push({
            type: "term",
            value: words[i],
            term,
            key: `${termKey}-${i}`,
          });

          usedTerms.add(termKey);
          i++;
          continue;
        }
      }
    }

    // Default text
    results.push({
      type: "text",
      value: words[i],
      key: `text-${i}`,
    });

    i++;
  }

  return results;
}