import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import V1App from "@/v1/V1App";
import LearnPage from "@/v1/learn/LearnPage";
import AdminPanelV1 from "@/v1/dashboard/admin/AdminPanelV1";

export default function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/v1" replace />} />

      <Route path="/v1/*" element={<V1App />} />

      <Route path="/learn" element={<LearnPage />} />

      <Route path="/admin" element={<AdminPanelV1 />} />

      <Route path="*" element={<Navigate to="/v1" replace />} />
    </Routes>
  );
}
