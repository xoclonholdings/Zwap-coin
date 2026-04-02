const STORAGE_KEY = "zwap_pending_rewards";

export function getPendingRewards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read pending rewards:", error);
    return [];
  }
}

export function savePendingRewards(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save pending rewards:", error);
  }
}

export function queuePendingReward(reward) {
  const existing = getPendingRewards();

  const item = {
    id: reward.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: reward.type || "unknown",
    source: reward.source || "unknown",
    walletAddress: reward.walletAddress || null,
    payload: reward.payload || {},
    createdAt: reward.createdAt || new Date().toISOString(),
    status: "pending",
  };

  const updated = [...existing, item];
  savePendingRewards(updated);
  return item;
}

export function removePendingReward(id) {
  const existing = getPendingRewards();
  const updated = existing.filter((item) => item.id !== id);
  savePendingRewards(updated);
}

export function clearPendingRewards() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear pending rewards:", error);
  }
}