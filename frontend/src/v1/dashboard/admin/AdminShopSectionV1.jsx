import React from "react";

import AdminSectionCardV1 from "../components/AdminSectionCardV1";

export default function AdminShopSectionV1() {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Shop">
        Manage item rotation, unlock thresholds, and purchase flow.
      </AdminSectionCardV1>

      <AdminSectionCardV1 title="Value Sink">
        Ensure zPts and ZWAP are being spent in balanced, controlled ways.
      </AdminSectionCardV1>
    </div>
  );
}