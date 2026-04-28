import React from "react";

import AdminSectionCardV1 from "./AdminSectionCardV1";

export default function AdminActivitySectionV1() {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Activity">
        Track global engagement, streaks, assists, and system-wide events.
      </AdminSectionCardV1>

      <AdminSectionCardV1 title="Live Signals">
        Observe how users are interacting with MOVE, PLAY, and DAILY TASKS in real time.
      </AdminSectionCardV1>
    </div>
  );
}
