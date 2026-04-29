/**
 * ZWAP! — V1 API Client
 * Strict V1 only.
 * Email-auth flow only. No wallet, swap, leaderboard, subscription, or V2 logic.
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

console.log("ZWAP! V1 API =", API);

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: {},
  };

  if (body !== null && body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API}${path}`, opts);
  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : data.detail?.message || `Request failed: ${method} ${path}`
    );
  }

  return data;
}

// ---------------------------------------------------------------------------
// V1 User
// ---------------------------------------------------------------------------

const getUserByEmail = (email) =>
  request("GET", `/users/email/${encodeURIComponent(email)}`);

const createOrUpdateEmailUser = (email, payload = {}) =>
  request("POST", "/users/email", {
    email,
    ...payload,
  });

const updateProfile = (userId, username) =>
  request("PUT", `/users/${userId}/profile`, {
    username,
  });

// ---------------------------------------------------------------------------
// V1 Rewards
// ---------------------------------------------------------------------------

const getDailyRewardStatus = (userId) =>
  request("GET", `/rewards/status/${userId}`);

const claimDailyReward = (userId) =>
  request("POST", `/rewards/daily/${userId}`);

// ---------------------------------------------------------------------------
// V1 Move
// ---------------------------------------------------------------------------

const claimStepRewards = (userId, steps) =>
  request("POST", `/move/steps/${userId}`, { steps });

const getMoveSession = (userId) =>
  request("GET", `/move/session/${userId}`);

// ---------------------------------------------------------------------------
// V1 Play
// ---------------------------------------------------------------------------

const submitGameResult = (userId, gameType, score) =>
  request("POST", `/games/result/${userId}`, {
    game_type: gameType,
    score,
  });

// ---------------------------------------------------------------------------
// V1 Learn
// ---------------------------------------------------------------------------

const completeLearnModule = (userId, moduleId) =>
  request("POST", `/learn/complete/${userId}/${moduleId}`);

// ---------------------------------------------------------------------------
// V1 Shop
// ---------------------------------------------------------------------------

const getShopItems = () => request("GET", "/shop/items");

const purchaseItem = (userId, itemId, paymentType = "zpts") =>
  request("POST", `/shop/purchase/${userId}`, {
    item_id: itemId,
    payment_type: paymentType,
  });

const api = {
  getUserByEmail,
  createOrUpdateEmailUser,
  updateProfile,

  getDailyRewardStatus,
  claimDailyReward,

  claimStepRewards,
  getMoveSession,

  submitGameResult,

  completeLearnModule,

  getShopItems,
  purchaseItem,
};

export default api;
