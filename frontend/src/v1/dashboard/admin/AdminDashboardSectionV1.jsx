import React from "react";

import AdminSectionCardV1 from "../components/AdminSectionCardV1";

export default function AdminDashboardSectionV1() {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="System Overview">
        ZWAP! behavioral engine is active.
        <br />
        All reward systems route through reward_service.
      </AdminSectionCardV1>

      <AdminSectionCardV1 title="V1 Active Surface">
        Move, Play, Shop, and the ZWAP! system window are the current V1 control
        focus.
      </AdminSectionCardV1>
    </div>
  );
}