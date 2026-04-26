import React from "react";

function formatZpts(value) {
  return Number(value || 0).toLocaleString();
}

function formatZwap(value) {
  const num = Number(value || 0);

  if (!Number.isFinite(num)) return "0";

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
}) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">
          Balance
        </div>

        {/* Hidden admin trigger */}
        <button
          type="button"
          onClick={onAdminTap}
          className="h-2 w-2 rounded-full bg-transparent"
          aria-label="Hidden admin trigger"
        />
      </div>

      {/* Values */}
      <div className="mt-3 flex items-end justify-between gap-4">
        {/* zPts */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">
            zPts
          </div>

          <div className="mt-1 text-[1.25rem] font-semibold tracking-[-0.04em] text-cyan-300">
            {formatZpts(zptsBalance)}
          </div>
        </div>

        {/* ZWAP (only show if > 0) */}
        {Number(zwapBalance || 0) > 0 ? (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">
              ZWAP
            </div>

            <div className="mt-1 text-sm font-medium tracking-[-0.02em] text-white/62">
              {formatZwap(zwapBalance)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}