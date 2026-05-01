export const ebooks = [
  {
    id: "the-science-of-mind",
    title: "The Science of Mind",
    releaseMonth: 1,
    releasePart: 1,
    releaseOrder: 1,
    priceZpts: 5000,
    tags: ["mindset", "awareness", "self-awareness", "thought"],
  },
  {
    id: "conversations-with-god",
    title: "Conversations with God",
    releaseMonth: 1,
    releasePart: 1,
    releaseOrder: 2,
    priceZpts: 5000,
    tags: ["awareness", "spiritual-foundation", "belief", "purpose"],
  },
  {
    id: "hidden-potential",
    title: "Hidden Potential",
    releaseMonth: 1,
    releasePart: 2,
    releaseOrder: 3,
    priceZpts: 5000,
    tags: ["growth", "potential", "performance", "discipline"],
  },
  {
    id: "the-4-agreements",
    title: "The 4 Agreements",
    releaseMonth: 1,
    releasePart: 2,
    releaseOrder: 4,
    priceZpts: 5000,
    tags: ["conduct", "self-help", "personal-code", "awareness"],
  },

  {
    id: "the-game-of-life-and-how-to-play-it",
    title: "The Game of Life and How to Play It",
    releaseMonth: 2,
    releasePart: 1,
    releaseOrder: 5,
    priceZpts: 5000,
    tags: ["belief", "outcome", "mindset", "manifestation"],
  },
  {
    id: "your-word-is-your-wand",
    title: "Your Word Is Your Wand",
    releaseMonth: 2,
    releasePart: 1,
    releaseOrder: 6,
    priceZpts: 5000,
    tags: ["language", "belief", "outcome", "self-command"],
  },
  {
    id: "as-a-man-thinketh",
    title: "As a Man Thinketh",
    releaseMonth: 2,
    releasePart: 2,
    releaseOrder: 7,
    priceZpts: 5000,
    tags: ["thought", "mindset", "mental-patterns", "discipline"],
  },
  {
    id: "the-power-of-now",
    title: "The Power of Now",
    releaseMonth: 2,
    releasePart: 2,
    releaseOrder: 8,
    priceZpts: 5000,
    tags: ["presence", "focus", "awareness", "stillness"],
  },

  {
    id: "the-master-key-system",
    title: "The Master Key System",
    releaseMonth: 3,
    releasePart: 1,
    releaseOrder: 9,
    priceZpts: 5000,
    tags: ["systems", "mindset", "belief", "discipline"],
  },
  {
    id: "the-seat-of-the-soul",
    title: "The Seat of the Soul",
    releaseMonth: 3,
    releasePart: 1,
    releaseOrder: 10,
    priceZpts: 5000,
    tags: ["purpose", "awareness", "self-help", "growth"],
  },
  {
    id: "the-alchemist",
    title: "The Alchemist",
    releaseMonth: 3,
    releasePart: 2,
    releaseOrder: 11,
    priceZpts: 5000,
    tags: ["purpose", "journey", "belief", "growth"],
  },
  {
    id: "the-celestine-prophecy",
    title: "The Celestine Prophecy",
    releaseMonth: 3,
    releasePart: 2,
    releaseOrder: 12,
    priceZpts: 5000,
    tags: ["awareness", "energy", "purpose", "connection"],
  },

  {
    id: "the-magic-of-thinking-big",
    title: "The Magic of Thinking Big",
    releaseMonth: 4,
    releasePart: 1,
    releaseOrder: 13,
    priceZpts: 5000,
    tags: ["confidence", "growth", "vision", "value"],
  },
  {
    id: "outwitting-the-devil",
    title: "Outwitting the Devil",
    releaseMonth: 4,
    releasePart: 1,
    releaseOrder: 14,
    priceZpts: 5000,
    tags: ["fear", "discipline", "mental-patterns", "control"],
  },
  {
    id: "the-law-of-success",
    title: "The Law of Success",
    releaseMonth: 4,
    releasePart: 2,
    releaseOrder: 15,
    priceZpts: 5000,
    tags: ["success", "discipline", "wealth", "systems"],
  },
  {
    id: "you-are-a-badass-at-making-money",
    title: "You Are a Badass at Making Money",
    releaseMonth: 4,
    releasePart: 2,
    releaseOrder: 16,
    priceZpts: 5000,
    tags: ["money", "confidence", "wealth", "value"],
  },

  {
    id: "atomic-habits",
    title: "Atomic Habits",
    releaseMonth: 5,
    releasePart: 1,
    releaseOrder: 17,
    priceZpts: 5000,
    tags: ["habits", "movement", "discipline", "consistency"],
  },
  {
    id: "the-secret",
    title: "The Secret",
    releaseMonth: 5,
    releasePart: 1,
    releaseOrder: 18,
    priceZpts: 5000,
    tags: ["belief", "outcome", "mindset", "manifestation"],
  },
  {
    id: "think-and-grow-rich",
    title: "Think and Grow Rich",
    releaseMonth: 5,
    releasePart: 2,
    releaseOrder: 19,
    priceZpts: 5000,
    tags: ["wealth", "value", "belief", "success"],
  },
  {
    id: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    releaseMonth: 5,
    releasePart: 2,
    releaseOrder: 20,
    priceZpts: 5000,
    tags: ["financial-awareness", "ownership", "assets", "wealth"],
  },
];

const SAVED_EBOOK_ARCHIVE_KEY = "zwap_saved_ebook_archive_ids";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeSavedIds(ids = []) {
  return Array.from(
    new Set(
      ids
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  );
}

function buildEbookCard(ebook, archived = false) {
  return {
    id: ebook.id,
    title: `TLDR: ${ebook.title}`,
    rawTitle: ebook.title,
    action: "Read",
    archiveAction: archived ? "Archived" : "Archive",
    archived,
    route: `/learn/ebook/${ebook.id}`,
    tags: ebook.tags || [],
    releaseMonth: ebook.releaseMonth,
    releasePart: ebook.releasePart,
    releaseOrder: ebook.releaseOrder || 999,
    priceZpts: ebook.priceZpts || 0,
  };
}

// ---------------------------
// RELEASE LOGIC
// ---------------------------

export function getReleasedEbooks({
  currentMonth = 1,
  currentPart = 1,
} = {}) {
  return ebooks.filter((ebook) => {
    if (ebook.releaseMonth < currentMonth) return true;

    if (ebook.releaseMonth === currentMonth) {
      return ebook.releasePart <= currentPart;
    }

    return false;
  });
}

export function getEbookById(id) {
  return ebooks.find((ebook) => ebook.id === id) || null;
}

export function getEbooksByIds(ids = []) {
  return ids
    .map((id) => getEbookById(id))
    .filter(Boolean)
    .sort((a, b) => a.releaseOrder - b.releaseOrder);
}

export function getArchivedRecommendedEbooks({
  recommendedEbookIds = [],
  currentMonth = 1,
  currentPart = 1,
} = {}) {
  const releasedIds = new Set(
    getReleasedEbooks({ currentMonth, currentPart }).map((ebook) => ebook.id)
  );

  return getEbooksByIds(recommendedEbookIds).filter((ebook) =>
    releasedIds.has(ebook.id)
  );
}

// ---------------------------
// USER ARCHIVE LOGIC
// ---------------------------

export function getSavedArchiveIds() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(SAVED_EBOOK_ARCHIVE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return normalizeSavedIds(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export function saveArchiveIds(ids = []) {
  const safeIds = normalizeSavedIds(ids);

  if (!canUseStorage()) return safeIds;

  try {
    window.localStorage.setItem(
      SAVED_EBOOK_ARCHIVE_KEY,
      JSON.stringify(safeIds)
    );
  } catch {
    // Ignore storage failures.
  }

  return safeIds;
}

export function isEbookArchived(id) {
  const safeId = String(id || "").trim();

  if (!safeId) return false;

  return getSavedArchiveIds().includes(safeId);
}

export function archiveEbookById(id) {
  const ebook = getEbookById(id);

  if (!ebook) return getSavedArchiveIds();

  const currentIds = getSavedArchiveIds();
  return saveArchiveIds([...currentIds, ebook.id]);
}

export function removeArchivedEbookById(id) {
  const safeId = String(id || "").trim();

  if (!safeId) return getSavedArchiveIds();

  return saveArchiveIds(getSavedArchiveIds().filter((ebookId) => ebookId !== safeId));
}

export function getSavedArchivedEbooks() {
  return getEbooksByIds(getSavedArchiveIds());
}

export function getSavedArchivedEbookCards() {
  return getSavedArchivedEbooks().map((ebook) => buildEbookCard(ebook, true));
}

// ---------------------------
// CAROUSEL BUILDER
// ---------------------------

export function getEbookCarousel({
  recommendedEbookIds = [],
  currentMonth = 1,
  currentPart = 1,
} = {}) {
  const savedIds = new Set(getSavedArchiveIds());

  return getArchivedRecommendedEbooks({
    recommendedEbookIds,
    currentMonth,
    currentPart,
  }).map((ebook) => buildEbookCard(ebook, savedIds.has(ebook.id)));
}

export function getReleasedEbookCarousel({
  currentMonth = 1,
  currentPart = 1,
} = {}) {
  const savedIds = new Set(getSavedArchiveIds());

  return getReleasedEbooks({
    currentMonth,
    currentPart,
  })
    .sort((a, b) => a.releaseOrder - b.releaseOrder)
    .map((ebook) => buildEbookCard(ebook, savedIds.has(ebook.id)));
}

export default ebooks;