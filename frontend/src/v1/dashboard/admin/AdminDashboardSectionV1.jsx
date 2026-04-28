import React from "react";

import AdminSectionCardV1 from "./AdminSectionCardV1";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-sm font-semibold text-cyan-200">
        {formatNumber(value)}
      </div>
    </div>
  );
}

export default function AdminDashboardSectionV1({ data = null }) {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="System Overview">
        ZWAP! behavioral engine is active.
        <br />
        All reward systems route through reward_service.
      </AdminSectionCardV1>

      <div className="grid grid-cols-1 gap-3">
        <StatRow label="Total Users" value={data?.total_users} />
        <StatRow label="Active Users" value={data?.active_users} />
        <StatRow label="Total zPts Issued" value={data?.total_zpts_issued} />
        <StatRow label="Total ZWAP Unlocked" value={data?.total_zwap_unlocked} />
        <StatRow label="Move Claims Today" value={data?.move_claims_today} />
        <StatRow label="Play Sessions Today" value={data?.play_sessions_today} />
      </div>

      <AdminSectionCardV1 title="V1 Active Surface">
        Move, Play, locked Shop visibility, and the ZWAP! system window remain
        the current operational focus.
      </AdminSectionCardV1>
    </div>
  );
}
