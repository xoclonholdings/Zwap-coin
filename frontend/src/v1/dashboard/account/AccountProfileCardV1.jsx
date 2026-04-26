import React from "react";

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "";

  const parts = safe.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function TierPill({ tier = "zwapper" }) {
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-[10px] font-black uppercase tracking-[0.18em]",
        isPlus
          ? "border-violet-300/30 bg-violet-400/10 text-violet-100"
          : "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
      ].join(" ")}
    >
      {isPlus ? "Zitizen" : "Zwapper"}
    </div>
  );
}

export default function AccountProfileCardV1({
  username = "",
  initials = "",
  tier = "zwapper",
}) {
  const safeUsername = String(username || "").trim();
  const resolvedInitials = initials || buildInitials(safeUsername);

  return (
    <div className="relative min-h-[116px] overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_88%_12%,rgba(168,85,247,0.12),transparent_34%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] px-4 py-4 shadow-[0_16px_42px_rgba(0,0,0,0.38)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_34%,rgba(34,211,238,0.06))]" />

      <div className="relative flex h-full items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.24),rgba(8,14,24,0.96))] text-[17px] font-black tracking-[-0.04em] text-white shadow-[0_0_24px_rgba(34,211,238,0.16)]">
          {resolvedInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-black tracking-[-0.05em] text-white">
            {safeUsername}
          </div>

          <div className="mt-2">
            <TierPill tier={tier} />
          </div>
        </div>

        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
      </div>
    </div>
  );
}