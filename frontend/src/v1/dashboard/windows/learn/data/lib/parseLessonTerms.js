import { getTermDefinition } from "@/data/terms";

// Build dynamic term set from definitions
function getAllTerms() {
  try {
    const { TERM_DEFINITIONS } = require("@/data/terms");
    return Object.keys(TERM_DEFINITIONS || {}).map((t) => t.toLowerCase());
  } catch {
    return [];
  }
}

const TERM_SET = new Set(getAllTerms());

export function parseLessonText(text = "") {
  if (!text) return [];

  const words = text.split(/(\s+)/); // preserve spacing

  return words.map((word, index) => {
    // Strip punctuation but keep original word intact
    const clean = word
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (TERM_SET.has(clean)) {
      const term = getTermDefinition(clean);

      if (term) {
        return {
          type: "term",
          value: word, // keep original formatting
          term,
          key: `${clean}-${index}`,
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