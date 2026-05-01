// learn/data/progression.js

import { learnModuleList } from "./modules";

/**
 * Explicit ordered progression path
 * This overrides simple level sorting
 * and gives you full control of learning flow.
 */

export const learnProgressionOrder = [
  // --- FOUNDATIONS (ENTRY) ---
  "web3-basics",
  "utility-token-basics",
  "zwap-token-utility",

  // --- WELLNESS (MOVE CONNECTION) ---
  "movement-benefits",
  "energy-and-consistency",

  // --- SELF HELP ---
  "microlearning-power",
  "habit-building",

  // --- PERSONAL DEVELOPMENT ---
  "discipline-and-identity",
  "long-term-thinking",

  // --- AI ---
  "ai-basics",
  "ai-fears",
  "ai-practical-use",

  // --- WEB3 DEEPER ---
  "wallet-basics",
  "ownership-and-identity",

  // --- SYSTEM UNDERSTANDING ---
  "onchain-vs-offchain",

  // --- ADVANCED ---
  "token-design",
];

/**
 * Returns modules in correct progression order
 */
export function getOrderedModules() {
  const map = Object.fromEntries(
    learnModuleList.map((m) => [m.id, m])
  );

  return learnProgressionOrder
    .map((id) => map[id])
    .filter(Boolean);
}

/**
 * Get current module (first incomplete later)
 * For now: first in list (V1 simple)
 */
export function getCurrentModule() {
  const ordered = getOrderedModules();
  return ordered[0] || null;
}