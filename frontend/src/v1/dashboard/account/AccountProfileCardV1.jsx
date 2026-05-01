import React from "react";

function TierPill({ tier = "zwapper" }) {
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-[10px] font-black uppercase tracking-[0.18em]",
        isPlus
          ? "border-violet-300/35 bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(88,28,135,0.22))] text-violet-100 shadow-[0_0_14px_rgba(168,85,247,0.18)]"
          : "border-cyan-300/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(8,80,92,0.22))] text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.18)]",
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
        border border-cyan-300/15
        bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.12),transparent_36%),linear-gradient(180deg,rgba(10,18,30,0.96),rgba(4,8,16,1))]
        px-5 py-4
        shadow-[0_18px_46px_rgba(0,0,0,0.42)]
      "
    >
      {/* surface glow */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(34,211,238,0.06))]" />

      <div className="relative flex h-full flex-col justify-center">
        {/* USERNAME — primary focus */}
        <div
          className="
            text-[18px] font-black uppercase tracking-[0.06em]
            text-white
            leading-tight
            drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]
          "
        >
          {safeUsername}
        </div>

        {/* tier */}
        <div className="mt-3">
          <TierPill tier={tier} />
        </div>
      </div>
    </div>
  );
}