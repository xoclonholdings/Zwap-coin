import React, { useEffect, useState } from "react";
import { Activity, Globe, MapPin } from "lucide-react";
import api from "@/lib/api";

function SectionBlock({ icon: Icon, title, items, loading }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          {title}
        </p>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
            <p className="text-sm text-gray-400">Loading activity...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
            <p className="text-sm text-gray-500">No activity yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/6 bg-black/20 px-3 py-2.5"
            >
              <p className="text-sm leading-relaxed text-gray-200">
                {item.message}
              </p>

              <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                <button className="rounded-full border border-white/8 px-2 py-1 text-gray-400 hover:text-white">
                  ❤️
                </button>
                <button className="rounded-full border border-white/8 px-2 py-1 text-gray-400 hover:text-white">
                  🔥
                </button>
                <button className="rounded-full border border-white/8 px-2 py-1 text-gray-400 hover:text-white">
                  👏
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ActivityStreamSection() {
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState({
    local: [],
    region: [],
    global: [],
  });

  useEffect(() => {
    let mounted = true;

    const loadStream = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const walletAddress =
          localStorage.getItem("walletAddress") || "test_wallet";

        const response = await api.get(`/activity/stream/${walletAddress}`);
        const data = response.data || {};

        if (!mounted) return;

        setStream({
          local: Array.isArray(data.local) ? data.local : [],
          region: Array.isArray(data.region) ? data.region : [],
          global: Array.isArray(data.global) ? data.global : [],
        });
      } catch (error) {
        console.error("Failed to load activity stream:", error);

        if (!mounted) return;

        setStream({
          local: [],
          region: [],
          global: [],
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStream(true);

    const intervalId = setInterval(() => {
      loadStream(false);
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-300" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Live Pulse
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          What’s happening around the ZWAP world right now.
        </p>
      </div>

      <SectionBlock
        icon={MapPin}
        title="Local"
        items={stream.local}
        loading={loading}
      />

      <SectionBlock
        icon={Activity}
        title="Region"
        items={stream.region}
        loading={loading}
      />

      <SectionBlock
        icon={Globe}
        title="Global"
        items={stream.global}
        loading={loading}
      />
    </div>
  );
}
