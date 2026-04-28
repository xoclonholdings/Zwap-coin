import React from "react";

import AdminSectionCardV1 from "./AdminSectionCardV1";

export default function AdminSettingsSectionV1({ onLogout }) {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="System Settings">
        Control environment flags, unlock behavior, and reward tuning.
      </AdminSectionCardV1>

      <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
        <div className="text-sm font-semibold text-white mb-2">
          Admin Session
        </div>

        <button
          onClick={onLogout}
          className="w-full h-11 rounded-xl border border-red-400/30 bg-red-500/20 text-sm font-semibold text-red-200 transition active:scale-[0.98]"
        >
          Logout Admin
        </button>
      </div>
    </div>
  );
}
