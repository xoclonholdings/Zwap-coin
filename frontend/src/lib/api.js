/**
 * ZWAP! Coin — Centralized API Client
 * Single source of truth for all backend communication.
 */

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
console.log("ZWAP API BASE =", API);

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
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.message || `Request failed: ${method} ${path}`
    );
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

const connectWallet = (walletAddress) =>
  request("POST", "/users/connect", { wallet_address: walletAddress });

const walletStatus = () => stub("walletStatus", { connected: false });
const disconnectWallet = () => stub("disconnectWallet", { disconnected: true });

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

const getUser = async (walletAddress) => {
  const res = await fetch(`${API}/users/${walletAddress}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
};

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
  request("POST", `/faucet/steps/${walletAddress}`, { steps });

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

const getTriviaQuestions = async (count = 5, difficulty = 1) => {
  const res = await fetch(
    `${API}/games/trivia/questions?count=${count}&difficulty=${difficulty}`
  );
  if (!res.ok) throw new Error("Failed to load trivia questions");
  return res.json();
};

const checkTriviaAnswer = (questionId, answer, timeTaken) =>
  request("POST", "/games/trivia/answer", {
    question_id: questionId,
    answer,
    time_taken: timeTaken,
  });

const submitGameResult = async (
  walletAddress,
  gameType,
  score,
  level = 1,
  blocksDestroyed = 0
) => {
  const res = await fetch(`${API}/games/result/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game_type: gameType,
      score,
      level,
      blocks_destroyed: blocksDestroyed,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.message || "Game submission failed"
    );
  }

  return res.json();
};

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

const getShopItems = () => request("GET", "/shop/items");

const purchaseItem = async (walletAddress, itemId, paymentType = "zwap") => {
  const res = await fetch(`${API}/shop/purchase/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item_id: itemId, payment_type: paymentType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.message || "Purchase failed"
    );
  }

  return res.json();
};

// ---------------------------------------------------------------------------
// Swap
// ---------------------------------------------------------------------------

const getPrices = () => request("GET", "/swap/prices");

const executeSwap = async (walletAddress, fromToken, toToken, amount) => {
  const res = await fetch(`${API}/swap/execute/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from_token: fromToken,
      to_token: toToken,
      amount,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.message || "Swap failed"
    );
  }

  return res.json();
};

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
  const res = await fetch(`${API}/subscription/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      wallet_address: walletAddress,
      origin_url: window.location.origin,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to create subscription checkout");
  }

  return {
    checkout_url: data.url,
    session_id: data.session_id,
  };
};

const getSubscriptionStatus = (sessionId) =>
  request("GET", `/subscription/status/${sessionId}`);

const activateSubscription = async (walletAddress, sessionId) => {
  const res = await fetch(
    `${API}/subscription/activate/${walletAddress}?session_id=${sessionId}`,
    { method: "POST" }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.message || "Activation failed"
    );
  }

  return res.json();
};

const cancelSubscription = (walletAddress) =>
  stub("cancelSubscription", { cancelled: true, wallet: walletAddress });

// ---------------------------------------------------------------------------
// zPts
// ---------------------------------------------------------------------------

const convertZptsToZwap = async (walletAddress, zptsAmount) => {
  const res = await fetch(`${API}/zpts/convert/${walletAddress}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zpts_amount: zptsAmount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.message || "Conversion failed"
    );
  }

  return res.json();
};

// ---------------------------------------------------------------------------
// Treasury / Claims
// ---------------------------------------------------------------------------

const requestClaim = (walletAddress, amount) =>
  stub("requestClaim", {
    status: "not_implemented",
    wallet: walletAddress,
    amount,
  });

const getClaimStatus = (claimId) =>
  stub("getClaimStatus", { claimId, status: "not_implemented" });

const getClaimHistory = (walletAddress) =>
  stub("getClaimHistory", { claims: [], wallet: walletAddress });

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

const getLeaderboard = (category, limit = 10) =>
  request("GET", `/leaderboard/${category}?limit=${limit}`);

const getLeaderboardStats = () => request("GET", "/leaderboard/stats");

const getUserRank = async (walletAddress, category) => {
  const res = await fetch(`${API}/leaderboard/user/${walletAddress}/${category}`);
  if (!res.ok) return null;
  return res.json();
};

// ---------------------------------------------------------------------------
// Export all methods as default object
// ---------------------------------------------------------------------------

const api = {
  connectWallet,
  walletStatus,
  disconnectWallet,

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

  convertZptsToZwap,

  requestClaim,
  getClaimStatus,
  getClaimHistory,

  getLeaderboard,
  getLeaderboardStats,
  getUserRank,
};

export default api;