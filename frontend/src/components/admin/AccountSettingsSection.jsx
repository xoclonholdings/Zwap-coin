import React from "react";
import AccountSection from "@/components/admin/AccountSection";
import SettingsSection from "@/components/admin/SettingsSection";

export default function AccountSettingsSection() {
  return (
    <div className="space-y-6">

      {/* Account */}
      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
        <h3 className="text-white font-semibold mb-4">
          Account & Security
        </h3>
        <AccountSection />
      </div>

      {/* System Settings */}
      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
        <h3 className="text-white font-semibold mb-4">
          System Settings
        </h3>
        <SettingsSection />
      </div>

    </div>
  );
}