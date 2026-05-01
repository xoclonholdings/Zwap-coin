import { TERM_DEFINITIONS, getTermDefinition } from "@/data/terms";

// ---------------------------
// BUILD TERM INDEX (AUTO)
// ---------------------------

// Expandable synonym layer (OPTIONAL, not required)
const EXTRA_SYNONYMS = {
  wallet: ["key", "access"],
  swap: ["exchange"],
  ownership: ["own", "control"],
  reward: ["earn"],
  cryptocurrency: ["crypto"],
};

// Normalize helper
function normalize(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

// Build searchable dictionary
function buildSearchIndex() {
  const index = [];

  Object.entries(TERM_DEFINITIONS).forEach(([key, def]) => {
    const baseTerms = [
      key,
      def.title,
      def.shortLabel,
    ]
      .filter(Boolean)
      .map(normalize);

    const synonyms = (EXTRA_SYNONYMS[key] || []).map(normalize);

    const allVariants = new Set([
      ...baseTerms,
      ...synonyms,
    ]);

    allVariants.forEach((variant) => {
      index.push({
        variant,
        key,
        wordCount: variant.split(" ").length,
      });
    });
  });

  // 🔥 PRIORITY: longest phrases first
  index.sort((a, b) => b.wordCount - a.wordCount);

  return index;
}

const SEARCH_INDEX = buildSearchIndex();

// ---------------------------
// MAIN PARSER
// ---------------------------

export function parseLessonText(text = "") {
  if (!text) return [];

  const words = text.split(/(\s+)/); // preserve spacing
  const usedTerms = new Set();
  const results = [];

  let i = 0;

  while (i < words.length) {
    let matched = false;

    for (const entry of SEARCH_INDEX) {
      const { variant, key, wordCount } = entry;

      // Build candidate phrase
      const slice = words.slice(i, i + wordCount).join("");
      const cleanSlice = normalize(slice);

      if (cleanSlice === variant && !usedTerms.has(key)) {
        const term = getTermDefinition(key);

        if (term) {
          results.push({
            type: "term",
            value: slice,
            term,
            key: `${key}-${i}`,
          });

          usedTerms.add(key);
          i += wordCount;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      results.push({
        type: "text",
        value: words[i],
        key: `text-${i}`,
      });
      i++;
    }
  }

  return results;
}