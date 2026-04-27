import React from "react";

import AdminSectionCardV1 from "../components/AdminSectionCardV1";

export default function AdminPlaySectionV1() {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Play System">
        Game sessions, completion rates, and performance scoring.
      </AdminSectionCardV1>

      <AdminSectionCardV1 title="Reward Distribution">
        Ensure zPts allocation aligns with session caps and balance rules.
      </AdminSectionCardV1>
    </div>
  );
}