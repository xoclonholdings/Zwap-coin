import React from "react";
import { Activity, Globe, MapPin } from "lucide-react";

const demoData = {
  local: [
    {
      id: "local_1",
      message: "A Zwapper nearby just completed their rings",
      event_type: "RING_COMPLETION",
    },
    {
      id: "local_2",
      message: "3 people are active in this area",
      event_type: "MOVEMENT_ACTIVITY",
    },
  ],
  region: [
    {
      id: "region_1",
      message: "An assist was just sent to Echo",
      event_type: "ASSIST_SENT",
    },
    {
      id: "region_2",
      message: "Kai just became a Finisher",
      event_type: "BADGE_MILESTONE",
    },
  ],
  global: [
    {
      id: "global_1",
      message: "Movement is picking up across ZWAP",
      event_type: "MOVEMENT_ACTIVITY",
    },
    {
      id: "global_2",
      message: "Another Finisher just emerged",
      event_type: "BADGE_MILESTONE",
    },
  ],
};

function SectionBlock({ icon: Icon, title, items }) {
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
        {items.map((item) => (
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
        ))}
      </div>
    </div>
  );
}

export default function ActivityStreamSection() {
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
        items={demoData.local}
      />

      <SectionBlock
        icon={Activity}
        title="Region"
        items={demoData.region}
      />

      <SectionBlock
        icon={Globe}
        title="Global"
        items={demoData.global}
      />
    </div>
  );
}