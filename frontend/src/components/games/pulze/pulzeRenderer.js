export function getAccentFromResult(result) {
  if (!result) return "#00f5ff";

  if (result.tier === "perfect") return "#00f5ff";
  if (result.tier === "hit") return "#a855f7";
  return "#64748b";
}