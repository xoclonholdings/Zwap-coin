import React from "react";
import { Crown, Star } from "lucide-react";

function TierPill({ tier = "zwapper" }) {
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div
      className={[
        "inline-flex w-fit items-center rounded-full border px-3 py-1",
        "text-[11px] font-medium tracking-[-0.01em]",
        isPlus
          ? "border-violet-300/18 bg-violet-400/12 text-violet-200/78"
          : "border-cyan-300/16 bg-cyan-400/10 text-cyan-200/72",
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
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div
      className="
        relative min-h-[116px] overflow-hidden rounded-[26px]
        border border-violet-300/15
        bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.22),transparent_42%),radial-gradient(circle_at_90%_20%,rgba(139,92,246,0.18),transparent_38%),linear-gradient(180deg,rgba(18,12,32,0.96),rgba(6,6,18,1))]
        px-5 py-4
        shadow-[0_18px_44px_rgba(0,0,0,0.42),0_0_28px_rgba(168,85,247,0.10)]
      "
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%,rgba(168,85,247,0.08))]" />

      <div className="relative flex h-full flex-col items-start justify-center text-left">
        <div className="text-[12px] font-medium tracking-[0.04em] text-violet-200/45">
          Welcome,
        </div>

        <div className="mt-1 flex max-w-full items-center gap-2">
          <div
            className="
              min-w-0 break-words text-left
              text-[17px] font-semibold tracking-[-0.02em]
              leading-tight text-white
            "
          >
            {safeUsername}
          </div>

          {isPlus ? (
            <Crown
              size={14}
              strokeWidth={2.2}
              className="shrink-0 text-violet-300/85"
            />
          ) : (
            <Star
              size={13}
              strokeWidth={2}
              className="shrink-0 text-violet-200/70"
            />
          )}
        </div>

        <div className="mt-2">
          <TierPill tier={tier} />
        </div>
      </div>
    </div>
  );
}