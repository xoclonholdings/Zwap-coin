import React from "react";

function TierPill({ tier = "zwapper" }) {
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div
      className={[
        "inline-flex items-center rounded-full px-2.5 py-[3px]",
        "text-[11px] font-medium tracking-[-0.01em]",
        isPlus
          ? "text-violet-200/70 bg-violet-400/10"
          : "text-cyan-200/70 bg-cyan-400/10",
      ].join(" ")}
    >
      {isPlus ? "Zitizen" : "Zwapper"}
    </div>
  );
}

export default function AccountProfileCardV1({
  username = "",
  tier = "zwapper",
}) {
  const safeUsername = String(username || "").trim();

  return (
    <div
      className="
        relative min-h-[116px] overflow-hidden rounded-[26px]
        border border-cyan-300/12
        bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.14),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(10,18,30,0.96),rgba(4,8,16,1))]
        px-5 py-4
        shadow-[0_16px_40px_rgba(0,0,0,0.38)]
      "
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%,rgba(34,211,238,0.05))]" />

      <div className="relative flex h-full flex-col justify-center">
        {/* USERNAME */}
        <div
          className="
            text-[17px] font-semibold tracking-[-0.02em]
            text-white
            leading-tight
          "
        >
          {safeUsername}
        </div>

        {/* TIER TAG (subtle) */}
        <div className="mt-2">
          <TierPill tier={tier} />
        </div>
      </div>
    </div>
  );
}