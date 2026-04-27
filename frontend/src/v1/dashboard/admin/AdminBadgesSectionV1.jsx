import React from "react";

import AdminSectionCardV1 from "./AdminSectionCardV1";

export default function AdminBadgesSectionV1() {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Badges">
        Track badge unlocks, progression tiers, and trophy accumulation.
      </AdminSectionCardV1>

      <AdminSectionCardV1 title="Identity Layer">
        Monitor how users are developing identity through achievements.
      </AdminSectionCardV1>
    </div>
  );
}