/**
 * ZWAP! Coin — Centralized API Client
 * Single source of truth for all backend communication.
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

console.log("ZWAP API BASE =", API);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function request(method, path, body = null, extraHeaders = {}) {
  const opts = {
    method,
    headers: {
      ...extraHeaders,
    },
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

function stub(name, fallback = {}) {
  console.log(`[API] ${name} — endpoint not yet implemented`);
  return Promise.resolve({ _stub: true, ...fallback });
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

const connectWallet = (walletAddress) =>
  request("POST", "/users/connect", { wallet_address: walletAddress });

const walletStatus = () => stub("walletStatus", { connected: false });
const disconnectWallet = () => stub("disconnectWallet", { disconnected: true });

const convertZpts = (walletAddress, zptsAmount) =>
  request("POST", "/wallet/convert-zpts", {
    walletAddress,
    zpts_amount: zptsAmount,
  });

const claimZwap = (walletAddress, amount = null) =>
  request("POST", "/wallet/claim-zwap", {
    walletAddress,
    amount,
  });

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

const getUser = (walletAddress) => request("GET", `/users/${walletAddress}`);

const updateProfile = (walletAddress, username, avatarUrl) =>
  request("PUT", `/users/${walletAddress}/profile`, {
    username,
    avatar_url: avatarUrl,
  });

const getOnchainBalance = (walletAddress) =>
  request("GET", `/blockchain/balance/${walletAddress}`);

const getContractInfo = () => request("GET", "/blockchain/contract-info");

// ---------------------------------------------------------------------------
// Daily Rewards
// ---------------------------------------------------------------------------

const getDailyRewardStatus = (walletAddress) =>
  request("GET", `/rewards/status/${walletAddress}`);

const claimDailyReward = (walletAddress) =>
  request("POST", `/rewards/daily/${walletAddress}`);

// ---------------------------------------------------------------------------
// Learn
// ---------------------------------------------------------------------------

const completeLearnModule = (walletAddress, moduleId) =>
  request("POST", `/learn/complete/${walletAddress}/${moduleId}`);

// ---------------------------------------------------------------------------
// Move-to-Earn
// ---------------------------------------------------------------------------

const claimStepRewards = (walletAddress, steps) =>
  request("POST", `/move/steps/${walletAddress}`, { steps });

const getMoveSession = (walletAddress) =>
  request("GET", `/move/session/${walletAddress}`);

const submitAntiCheatFlags = (walletAddress, flags) =>
  stub("submitAntiCheatFlags", {
    received: true,
    flagged: false,
    wallet: walletAddress,
    flags,
  });

// ---------------------------------------------------------------------------
// Play (Games)
// ---------------------------------------------------------------------------

const getTriviaQuestions = (count = 5, difficulty = 1) =>
  request(
    "GET",
    `/games/trivia/questions?count=${encodeURIComponent(
      count
    )}&difficulty=${encodeURIComponent(difficulty)}`
  );

const checkTriviaAnswer = (questionId, answer, timeTaken) =>
  request("POST", "/games/trivia/answer", {
    question_id: questionId,
    answer,
    time_taken: timeTaken,
  });

const submitGameResult = (
  walletAddress,
  gameType,
  score,
  level = 1,
  blocksDestroyed = 0
) =>
  request("POST", `/games/result/${walletAddress}`, {
    game_type: gameType,
    score,
    level,
    blocks_destroyed: blocksDestroyed,
  });

// ---------------------------------------------------------------------------
// Game Submission Portal
// ---------------------------------------------------------------------------

const submitGame = (payload) => request("POST", "/games/submit", payload);

const getApprovedGames = () => request("GET", "/games/list?approved_only=true");

const getAllSubmittedGames = (params = {}) => {
  const query = new URLSearchParams();

  if (params.approved_only !== undefined) {
    query.set("approved_only", String(params.approved_only));
  }

  if (params.developer_wallet) {
    query.set("developer_wallet", params.developer_wallet);
  }

  if (params.status) {
    query.set("status", params.status);
  }

  const qs = query.toString();
  return request("GET", `/games/list${qs ? `?${qs}` : ""}`);
};

const approveGame = (gameId, approvedBy, reviewNotes = "", adminKey) =>
  request(
    "POST",
    `/games/approve/${gameId}`,
    {
      approved_by: approvedBy,
      review_notes: reviewNotes || null,
    },
    adminKey ? { "X-Admin-Key": adminKey } : {}
  );

const rejectGame = (gameId, rejectedBy, reviewNotes = "", adminKey) =>
  request(
    "POST",
    `/games/reject/${gameId}`,
    {
      rejected_by: rejectedBy,
      review_notes: reviewNotes || null,
    },
    adminKey ? { "X-Admin-Key": adminKey } : {}
  );

// ---------------------------------------------------------------------------
// Game Sessions / Rounds (future-ready)
// ---------------------------------------------------------------------------

const startGameSession = (payload) =>
  stub("startGameSession", {
    session_id: `local-${Date.now()}`,
    status: "started",
    ...payload,
  });

const submitRoundResult = (payload) =>
  stub("submitRoundResult", {
    accepted: true,
    ...payload,
  });

const completeGameSession = (payload) =>
  stub("completeGameSession", {
    completed: true,
    ...payload,
  });

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

const getShopItems = () => request("GET", "/shop/items");

const purchaseItem = (walletAddress, itemId, paymentType = "zwap") =>
  request("POST", `/shop/purchase/${walletAddress}`, {
    item_id: itemId,
    payment_type: paymentType,
  });

// ---------------------------------------------------------------------------
// Swap
// ---------------------------------------------------------------------------

const getPrices = () => request("GET", "/swap/prices");

const executeSwap = (walletAddress, fromToken, toToken, amount) =>
  request("POST", `/swap/execute/${walletAddress}`, {
    from_token: fromToken,
    to_token: toToken,
    amount,
  });

const getSwapQuote = (fromToken, toToken, amount) =>
  stub("getSwapQuote", {
    from: fromToken,
    to: toToken,
    amount,
    estimated: 0,
    fee: 0,
  });

const getSwapHistory = (walletAddress) =>
  stub("getSwapHistory", { swaps: [], wallet: walletAddress });

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

const createSubscription = async (walletAddress) => {
  const data = await request("POST", "/subscription/checkout", {
    wallet_address: walletAddress,
    origin_url: window.location.origin,
  });

  return {
    checkout_url: data.url || data.checkout_url,
    session_id: data.session_id,
  };
};

const getSubscriptionStatus = (sessionId) =>
  request("GET", `/subscription/status/${sessionId}`);

const activateSubscription = (walletAddress, sessionId) =>
  request(
    "POST",
    `/subscription/activate/${walletAddress}?session_id=${encodeURIComponent(
      sessionId
    )}`
  );

const cancelSubscription = (walletAddress) =>
  stub("cancelSubscription", { cancelled: true, wallet: walletAddress });

// ---------------------------------------------------------------------------
// Treasury / Claims
// ---------------------------------------------------------------------------

const requestClaim = (walletAddress, amount = null) =>
  claimZwap(walletAddress, amount);

const getClaimStatus = (claimId) =>
  stub("getClaimStatus", { claimId, status: "not_implemented" });

const getClaimHistory = (walletAddress) =>
  stub("getClaimHistory", { claims: [], wallet: walletAddress });

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

const getLeaderboard = (category, limit = 10) =>
  request(
    "GET",
    `/leaderboard/${encodeURIComponent(category)}?limit=${encodeURIComponent(
      limit
    )}`
  );

const getLeaderboardStats = (category = "earned", limit = 10) =>
  request(
    "GET",
    `/leaderboard/stats?category=${encodeURIComponent(
      category
    )}&limit=${encodeURIComponent(limit)}`
  );

const getUserRank = async (walletAddress, category, neighbors = 0) => {
  try {
    return await request(
      "GET",
      `/leaderboard/user/${encodeURIComponent(
        walletAddress
      )}/${encodeURIComponent(category)}?neighbors=${encodeURIComponent(
        neighbors
      )}`
    );
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Per-Game Leaderboards (LIVE)
// ---------------------------------------------------------------------------

const getGameLeaderboard = (gameId, limit = 10) =>
  request(
    "GET",
    `/leaderboard/games/${encodeURIComponent(
      gameId
    )}?limit=${encodeURIComponent(limit)}`
  );

const getUserGameRank = async (walletAddress, gameId) => {
  try {
    return await request(
      "GET",
      `/leaderboard/games/${encodeURIComponent(
        gameId
      )}/user/${encodeURIComponent(walletAddress)}`
    );
  } catch {
    return null;
  }
};

const getGameLeaderboardChart = (gameId, limit = 5) =>
  request(
    "GET",
    `/leaderboard/games/${encodeURIComponent(
      gameId
    )}?limit=${encodeURIComponent(limit)}`
  );

// ---------------------------------------------------------------------------
// Export all methods as default object
// ---------------------------------------------------------------------------

const api = {
  connectWallet,
  walletStatus,
  disconnectWallet,
  convertZpts,
  claimZwap,

  getUser,
  updateProfile,
  getOnchainBalance,
  getContractInfo,

  getDailyRewardStatus,
  claimDailyReward,

  completeLearnModule,

  claimStepRewards,
  getMoveSession,
  submitAntiCheatFlags,

  getTriviaQuestions,
  checkTriviaAnswer,
  submitGameResult,

  submitGame,
  getApprovedGames,
  getAllSubmittedGames,
  approveGame,
  rejectGame,

  startGameSession,
  submitRoundResult,
  completeGameSession,

  getShopItems,
  purchaseItem,

  getPrices,
  executeSwap,
  getSwapQuote,
  getSwapHistory,

  createSubscription,
  getSubscriptionStatus,
  activateSubscription,
  cancelSubscription,

  requestClaim,
  getClaimStatus,
  getClaimHistory,

  getLeaderboard,
  getLeaderboardStats,
  getUserRank,
  getGameLeaderboard,
  getUserGameRank,
  getGameLeaderboardChart,
};

export default api;
