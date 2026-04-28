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
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex min-h-[116px] flex-col justify-between rounded-[22px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_44%),linear-gradient(180deg,rgba(12,20,32,0.94),rgba(5,9,18,0.98))] px-3.5 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.26)]">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">
            Balance
          </div>

          <button
            type="button"
            onClick={onAdminTap}
            className="h-2 w-2 rounded-full bg-transparent"
            aria-label="Hidden admin trigger"
          />
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/36">
            zPts
          </div>

          <div className="mt-1 text-[24px] font-black leading-none tracking-[-0.06em] text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.20)]">
            {formatZpts(zptsBalance)}
          </div>
        </div>

        {Number(zwapBalance || 0) > 0 ? (
          <div className="text-[11px] font-semibold tracking-[-0.02em] text-white/52">
            {formatZwap(zwapBalance)} ZWAP
          </div>
        ) : (
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/24">
            ZWAP
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">
          Balance
        </div>

        <button
          type="button"
          onClick={onAdminTap}
          className="h-2 w-2 rounded-full bg-transparent"
          aria-label="Hidden admin trigger"
        />
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">
            zPts
          </div>

          <div className="mt-1 text-[1.25rem] font-semibold tracking-[-0.04em] text-cyan-300">
            {formatZpts(zptsBalance)}
          </div>
        </div>

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
