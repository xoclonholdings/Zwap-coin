import React from "react";

import AdminSectionCardV1 from "./AdminSectionCardV1";

export default function AdminMoveSectionV1() {
  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Move System">
        Step validation, cooldown enforcement, and motion tracking integrity.
      </AdminSectionCardV1>

      <AdminSectionCardV1 title="Abuse Detection">
        Monitor irregular step spikes and invalid claim patterns.
      </AdminSectionCardV1>
    </div>
  );
}
