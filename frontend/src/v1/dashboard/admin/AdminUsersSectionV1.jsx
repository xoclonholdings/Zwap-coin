import React from "react";

import AdminSectionCardV1 from "./AdminSectionCardV1";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function UserMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-white">
        {formatNumber(value)}
      </div>
    </div>
  );
}

export default function AdminUsersSectionV1({ data = null }) {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Users">
        Monitor user growth, onboarding flow, account status, and retention
        signals.
      </AdminSectionCardV1>

      <div className="grid grid-cols-2 gap-3">
        <UserMetric label="Total" value={data?.total_users} />
        <UserMetric label="Active" value={data?.active_users} />
        <UserMetric label="Zwapper" value={data?.zwapper_users} />
        <UserMetric label="Zitizen" value={data?.zitizen_users} />
      </div>

      <AdminSectionCardV1 title="V1 User Focus">
        Watch for first-action completion, Shop unlock progress, Garden unlock
        readiness, and returning daily behavior.
      </AdminSectionCardV1>
    </div>
  );
}
