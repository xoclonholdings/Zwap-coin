export const SHORT_INTERSTITIAL_MS = 1800;

export const REWARDED_AD_MS = 4200;

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/* ---------------- SHORT ROUND ADS ---------------- */

export async function playInterstitialAd({
  gameId = "",
  round = 1,
} = {}) {
  console.log("[ZWAP! Arcade] Interstitial Ad", {
    gameId,
    round,
  });

  await delay(SHORT_INTERSTITIAL_MS);

  return {
    completed: true,
    type: "interstitial",
  };
}

/* ---------------- REWARDED DOUBLE zPTS ---------------- */

export async function playDoubleRewardAd({
  gameId = "",
  round = 1,
} = {}) {
  console.log("[ZWAP! Arcade] Rewarded Double zPts Ad", {
    gameId,
    round,
  });

  await delay(REWARDED_AD_MS);

  return {
    completed: true,
    rewarded: true,
    type: "double_zpts",
  };
}

/* ---------------- REWARDED EXTRA LIFE ---------------- */

export async function playExtraLifeAd({
  gameId = "",
  round = 1,
} = {}) {
  console.log("[ZWAP! Arcade] Rewarded Extra Life Ad", {
    gameId,
    round,
  });

  await delay(REWARDED_AD_MS);

  return {
    completed: true,
    rewarded: true,
    type: "extra_life",
  };
}