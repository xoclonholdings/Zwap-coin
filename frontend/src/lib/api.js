/**
 * ZWAP! Coin — Centralized API Client
 * Single source of truth for all backend communication.
 * Stubs log to console and return structured "not implemented" responses.
 */

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function request(method, path, body = null) {
  const opts = { method, headers: {} };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${method} ${path}`);
  }
  return res.json();
}

function stub(name, fallback = {}) {
  console.log(`[API] ${name} — endpoint not yet implemented`);
  return Promise.resolve({ _stub: true, ...fallback });
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

/** POST /api/users/connect — register or reconnect wallet */
const connectWallet = (walletAddress) =>
  request("POST", "/users/connect", { wallet_address: walletAddress });

/** Stub: GET /api/wallet/status — future: session validity */
const walletStatus = () => stub("walletStatus", { connected: false });

/** Stub: POST /api/wallet/disconnect */
const disconnectWallet = () => stub("disconnectWallet", { disconnected: true });

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

/** GET /api/users/:address */
const getUser = async (walletAddress) => {
  const res = await fetch(`${API}/users/${walletAddress}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
};

/** PUT /api/users/:address/profile */
const updateProfile = (walletAddress, username, avatarUrl) =>
  request("PUT", `/users/${walletAddress}/profile`, { username, avatar_url: avatarUrl });

/** GET /api/blockchain/balance/:address */
const getOnchainBalance = (walletAddress) =>
  request("GET", `/blockchain/balance/${walletAddress}`);

/** GET /api/blockchain/contract-info */
const getContractInfo = () => request("GET", "/blockchain/contract-info");

// ---------------------------------------------------------------------------
// Move-to-Earn
// ---------------------------------------------------------------------------

/**
 * POST /api/faucet/steps/:address
 * @param {string} walletAddress
 * @param {number} steps
 */
const claimStepRewards = (walletAddress, steps) =>
  request("POST", `/faucet/steps/${walletAddress}`, { steps });

/** Stub: GET /api/move/session/:address — active step-tracking session */
const getMoveSession = (walletAddress) =>
  stub("getMoveSession", { active: false, steps: 0, wallet: walletAddress });

/** Stub: POST /api/move/anti-cheat — submit client-side cheat flags */
const submitAntiCheatFlags = (walletAddress, flags) =>
  stub("submitAntiCheatFlags", { received: true, wallet: walletAddress });

// ---------------------------------------------------------------------------
// Play (Games)
// ---------------------------------------------------------------------------

/**
 * GET /api/games/trivia/questions?count=N&difficulty=D
 * @returns {Array<{id,question,options,correctAnswer}>}
 */
const getTriviaQuestions = async (count = 5, difficulty = 1) => {
  const res = await fetch(`${API}/games/trivia/questions?count=${count}&difficulty=${difficulty}`);
  return res.json();
};

/**
 * POST /api/games/trivia/answer
 * @param {string} questionId
 * @param {string} answer
 * @param {number} timeTaken — seconds
 */
const checkTriviaAnswer = (questionId, answer, timeTaken) =>
  request("POST", "/games/trivia/answer", { question_id: questionId, answer, time_taken: timeTaken });

/**
 * POST /api/games/result/:address
 * @param {string} walletAddress
 * @param {string} gameType — zbrickles | ztrivia | ztetris | zslots
 * @param {number} score
 * @param {number} level
 * @param {number} blocksDestroyed — zbrickles only
 */
const submitGameResult = async (walletAddress, gameType, score, level = 1, blocksDestroyed = 0) => {
  const res = await fetch(`${API}/games/result/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_type: gameType, score, level, blocks_destroyed: blocksDestroyed }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Game submission failed");
  }
  return res.json();
};

/** POST /api/faucet/scratch/:address */
const scratchToWin = (walletAddress) =>
  request("POST", `/faucet/scratch/${walletAddress}`);

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

/** GET /api/shop/items */
const getShopItems = () => request("GET", "/shop/items");

/**
 * POST /api/shop/purchase/:address
 * @param {string} walletAddress
 * @param {string} itemId
 * @param {"zwap"|"zpts"} paymentType
 */
const purchaseItem = async (walletAddress, itemId, paymentType = "zwap") => {
  const res = await fetch(`${API}/shop/purchase/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item_id: itemId, payment_type: paymentType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Purchase failed");
  }
  return res.json();
};

// ---------------------------------------------------------------------------
// Swap
// ---------------------------------------------------------------------------

/** GET /api/swap/prices */
const getPrices = () => request("GET", "/swap/prices");

/**
 * POST /api/swap/execute/:address
 * @param {string} walletAddress
 * @param {string} fromToken
 * @param {string} toToken
 * @param {number} amount
 */
const executeSwap = async (walletAddress, fromToken, toToken, amount) => {
  const res = await fetch(`${API}/swap/execute/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from_token: fromToken, to_token: toToken, amount }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Swap failed");
  }
  return res.json();
};

/** Stub: GET /api/swap/quote?from=X&to=Y&amount=N */
const getSwapQuote = (fromToken, toToken, amount) =>
  stub("getSwapQuote", { from: fromToken, to: toToken, amount, estimated: 0, fee: 0 });

/** Stub: GET /api/swap/history/:address */
const getSwapHistory = (walletAddress) =>
  stub("getSwapHistory", { swaps: [], wallet: walletAddress });

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/** POST /api/subscription/checkout */
const createSubscription = (originUrl) =>
  request("POST", "/subscription/checkout", { origin_url: originUrl });

/** GET /api/subscription/status/:sessionId */
const getSubscriptionStatus = (sessionId) =>
  request("GET", `/subscription/status/${sessionId}`);

/** POST /api/subscription/activate/:address?session_id=X */
const activateSubscription = async (walletAddress, sessionId) => {
  const res = await fetch(`${API}/subscription/activate/${walletAddress}?session_id=${sessionId}`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Activation failed");
  }
  return res.json();
};

/** Stub: POST /api/subscription/cancel/:address */
const cancelSubscription = (walletAddress) =>
  stub("cancelSubscription", { cancelled: true, wallet: walletAddress });

// ---------------------------------------------------------------------------
// zPts
// ---------------------------------------------------------------------------

/**
 * POST /api/zpts/convert/:address
 * @param {string} walletAddress
 * @param {number} zptsAmount
 */
const convertZptsToZwap = async (walletAddress, zptsAmount) => {
  const res = await fetch(`${API}/zpts/convert/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zpts_amount: zptsAmount }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Conversion failed");
  }
  return res.json();
};

// ---------------------------------------------------------------------------
// Treasury / Claims
// ---------------------------------------------------------------------------

/**
 * Stub: POST /api/claims/request
 * @param {string} walletAddress
 * @param {number} amount — ZWAP to claim to on-chain wallet
 */
const requestClaim = (walletAddress, amount) =>
  stub("requestClaim", { status: "not_implemented", wallet: walletAddress, amount });

/** Stub: GET /api/claims/status/:claimId */
const getClaimStatus = (claimId) =>
  stub("getClaimStatus", { claimId, status: "not_implemented" });

/** Stub: GET /api/claims/history/:address */
const getClaimHistory = (walletAddress) =>
  stub("getClaimHistory", { claims: [], wallet: walletAddress });

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

/** GET /api/leaderboard/:category?limit=N */
const getLeaderboard = (category, limit = 10) =>
  request("GET", `/leaderboard/${category}?limit=${limit}`);

/** GET /api/leaderboard/stats */
const getLeaderboardStats = () => request("GET", "/leaderboard/stats");

/** GET /api/leaderboard/user/:address/:category */
const getUserRank = async (walletAddress, category) => {
  const res = await fetch(`${API}/leaderboard/user/${walletAddress}/${category}`);
  if (!res.ok) return null;
  return res.json();
};

// ---------------------------------------------------------------------------
// Admin (pass-through — admin panel has its own auth header)
// ---------------------------------------------------------------------------

/** Admin endpoints use their own auth via X-Admin-Key header.
 *  See AdminPanel.jsx → adminApi for the authenticated wrapper. */

// ---------------------------------------------------------------------------
// Export all methods as default object
// ---------------------------------------------------------------------------

const api = {
  // Wallet
  connectWallet,
  walletStatus,
  disconnectWallet,
  // User
  getUser,
  updateProfile,
  getOnchainBalance,
  getContractInfo,
  // Move
  claimStepRewards,
  getMoveSession,
  submitAntiCheatFlags,
  // Play
  getTriviaQuestions,
  checkTriviaAnswer,
  submitGameResult,
  scratchToWin,
  // Shop
  getShopItems,
  purchaseItem,
  // Swap
  getPrices,
  executeSwap,
  getSwapQuote,
  getSwapHistory,
  // Subscription
  createSubscription,
  getSubscriptionStatus,
  activateSubscription,
  cancelSubscription,
  // zPts
  convertZptsToZwap,
  // Treasury / Claims
  requestClaim,
  getClaimStatus,
  getClaimHistory,
  // Leaderboard
  getLeaderboard,
  getLeaderboardStats,
  getUserRank,
};

export default api;
