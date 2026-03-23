import React from "react";
import { Button } from "@/components/ui/button";
import {
  Activity,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Timer,
  Watch,
} from "lucide-react";

export default function MovePortal({
  challenges = [],
  challengesLoading = false,
  challengesError = "",
  onRefreshChallenges,
  integrations = [
    {
      id: "apple-health",
      name: "Apple Health",
      status: "Coming Soon",
      description: "Sync step data from iPhone and Apple Watch.",
      icon: Smartphone,
    },
    {
      id: "google-fit",
      name: "Google Fit",
      status: "Coming Soon",
      description: "Connect Android step tracking and activity sources.",
      icon: Activity,
    },
    {
      id: "wearables",
      name: "Wearables",
      status: "Future",
      description: "Future-ready support for bands and smart watches.",
      icon: Watch,
    },
  ],
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(10,16,23,0.96),rgba(8,12,18,0.98))] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-semibold text-white">
              Movement Portal
            </h3>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Challenges, campaigns, and device integrations.
          </p>
        </div>

        <Button
          onClick={onRefreshChallenges}
          variant="outline"
          className="h-9 rounded-xl border-white/10 bg-white/5 px-3 text-white hover:bg-white/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-[22px] border border-cyan-400/14 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_26%),linear-gradient(180deg,rgba(8,16,23,0.94),rgba(7,12,18,0.98))] p-3">
        <div className="mb-2">
          <p className="text-[11px] uppercase tracking-wide text-cyan-200/65">
            Challenges & Campaigns
          </p>
          <p className="mt-1 text-sm text-white/60">
            Step-based events and timed movement pushes.
          </p>
        </div>

        {challengesLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-black/20 px-4 py-6 text-white/55">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading movement challenges...
          </div>
        ) : challenges.length > 0 ? (
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id || challenge.title}
                className="rounded-2xl border border-cyan-400/12 bg-cyan-400/[0.05] px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-white">
                      {challenge.title}
                    </h4>

                    <p className="mt-0.5 text-[11px] text-cyan-200/70">
                      {challenge.type || "challenge"} •{" "}
                      {challenge.steps_required
                        ? `${Number(challenge.steps_required).toLocaleString()} steps`
                        : "step goal"}
                    </p>

                    <p className="mt-1 text-sm text-white/55">
                      {challenge.description ||
                        "Complete the movement objective to unlock rewards."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70">
                    {challenge.reward
                      ? `${challenge.reward} reward`
                      : "Live"}
                  </div>
                </div>

                {challenge.progress_percent !== undefined ? (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-white/45">
                      <span>Progress</span>
                      <span>{Math.round(challenge.progress_percent)}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(challenge.progress_percent, 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                {challenge.ends_in ? (
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/45">
                    <Timer className="h-3.5 w-3.5 text-cyan-300" />
                    {challenge.ends_in}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-5 text-center">
            <p className="text-sm text-white/60">
              {challengesError || "No live movement challenges yet."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-[22px] border border-violet-400/16 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),linear-gradient(180deg,rgba(17,10,32,0.96),rgba(10,10,22,0.98))] p-3">
        <div className="mb-2">
          <p className="text-[11px] uppercase tracking-wide text-violet-200/65">
            Device & Integration Layer
          </p>
          <p className="mt-1 text-sm text-white/60">
            Health sync and wearable support for future movement tracking.
          </p>
        </div>

        <div className="space-y-2">
          {integrations.map((integration) => {
            const Icon = integration.icon || Smartphone;

            return (
              <div
                key={integration.id}
                className="rounded-2xl border border-violet-400/14 bg-black/20 px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-400/16 bg-violet-400/10">
                    <Icon className="h-4 w-4 text-violet-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {integration.name}
                      </p>

                      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/65">
                        {integration.status}
                      </div>
                    </div>

                    <p className="mt-1 text-sm text-white/55">
                      {integration.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}