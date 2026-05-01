import React from "react";

function formatZpts(value) {
  return Number(value || 0).toLocaleString();
}

function formatZwap(value) {
  const num = Number(value || 0);

  if (!Number.isFinite(num) || num <= 0) return "--";

  if (num >= 1000) {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }

  if (num >= 1) {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }

  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

export default function AccountBalanceCardV1({
  zptsBalance = 0,
  zwapBalance = 0,
  onAdminTap,
  compact = false,
}) {
  const hasZwap = Number(zwapBalance || 0) > 0;

  if (compact) {
    return (
      <div className="relative flex min-h-[116px] flex-col justify-between overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.13),transparent_38%),radial-gradient(circle_at_92%_18%,rgba(168,85,247,0.10),transparent_34%),linear-gradient(180deg,rgba(10,18,30,0.96),rgba(4,8,16,1))] px-4 py-4 shadow-[0_18px_46px_rgba(0,0,0,0.42)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_34%,rgba(34,211,238,0.05))]" />

        <div className="relative flex items-center justify-between gap-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/58">
            Balance
          </div>

          <button
            type="button"
            onClick={onAdminTap}
            className="h-2 w-2 rounded-full bg-transparent"
            aria-label="Hidden admin trigger"
          />
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/70">
              zPts
            </div>

            <div className="mt-1 text-[24px] font-black leading-none tracking-[-0.04em] text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.24)]">
              {formatZpts(zptsBalance)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/38">
              ZWAP
            </div>

            <div
              className={[
                "mt-1 text-[20px] font-black leading-none tracking-[-0.035em]",
                hasZwap
                  ? "text-white/48"
                  : "text-white/24",
              ].join(" ")}
            >
              {formatZwap(zwapBalance)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-cyan-300/12 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.11),transparent_38%),radial-gradient(circle_at_92%_18%,rgba(168,85,247,0.09),transparent_34%),linear-gradient(180deg,rgba(10,18,30,0.96),rgba(4,8,16,1))] px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%,rgba(34,211,238,0.04))]" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/58">
          Balance
        </div>

        <button
          type="button"
          onClick={onAdminTap}
          className="h-2 w-2 rounded-full bg-transparent"
          aria-label="Hidden admin trigger"
        />
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/70">
            zPts
          </div>

          <div className="mt-1 text-[1.35rem] font-black leading-none tracking-[-0.04em] text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.22)]">
            {formatZpts(zptsBalance)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/38">
            ZWAP
          </div>

          <div
            className={[
              "mt-1 text-[1.1rem] font-black leading-none tracking-[-0.035em]",
              hasZwap
                ? "text-white/48"
                : "text-white/24",
            ].join(" ")}
          >
            {formatZwap(zwapBalance)}
          </div>
        </div>
      </div>
    </div>
  );
}