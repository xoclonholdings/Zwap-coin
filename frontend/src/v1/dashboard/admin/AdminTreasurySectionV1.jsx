import React from "react";

import AdminSectionCardV1 from "./AdminSectionCardV1";

export default function AdminTreasurySectionV1() {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Treasury">
        Track zPts issuance, ZWAP unlock flow, and conversion readiness.
      </AdminSectionCardV1>

      <AdminSectionCardV1 title="Economic Controls">
        Monitor emission pacing, caps, and value sinks to maintain system
        balance.
      </AdminSectionCardV1>
    </div>
  );
}