import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import adminApi from "@/lib/adminApi";

export default function ActivityLogSection() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/actions");
      setActions(data.actions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Loading activity log...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Activity Log</h2>

        <Button
          size="sm"
          variant="outline"
          onClick={loadActions}
          className="border-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {actions.length === 0 ? (
        <div className="text-gray-400 text-center py-8 rounded-xl border border-gray-700 bg-gray-800/20">
          No admin actions recorded yet
        </div>
      ) : (
        <div className="grid gap-3">
          {actions.map((action, i) => (
            <div
              key={action.id || i}
              className="p-4 rounded-xl border border-gray-700 bg-gray-800/30"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left side */}
                <div>
                  <p className="text-white font-medium">
                    {action.action_type || "Unknown Action"}
                  </p>

                  <p className="text-gray-400 text-xs mt-1">
                    Target: {action.target_type || "—"} •{" "}
                    {action.target_id || "—"}
                  </p>

                  {action.wallet_address && (
                    <p className="text-gray-500 text-xs font-mono mt-1">
                      Wallet: {action.wallet_address}
                    </p>
                  )}
                </div>

                {/* Right side */}
                <div className="text-right">
                  {action.amount !== undefined &&
                    action.amount !== null && (
                      <p className="text-cyan-400 text-sm font-medium">
                        {action.amount} {action.currency || ""}
                      </p>
                    )}

                  <p className="text-gray-500 text-xs mt-1">
                    {action.created_at
                      ? new Date(action.created_at).toLocaleString()
                      : "No timestamp"}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-2 text-xs text-gray-500">
                Performed by: {action.performed_by || "admin"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}