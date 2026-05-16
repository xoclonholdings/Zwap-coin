import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Copy,
  ExternalLink,
  FileCode2,
  Gamepad2,
  KeyRound,
  Plus,
  Save,
  Send,
  SlidersHorizontal,
  TerminalSquare,
  Upload,
} from "lucide-react";

function HeaderButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)] transition active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-9 shrink-0 rounded-full border px-3 text-[11px] font-semibold tracking-[-0.01em] transition active:scale-[0.98]",
        active
          ? "border-cyan-300/26 bg-cyan-400/14 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.10)]"
          : "border-white/10 bg-white/[0.04] text-white/48",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder = "", multiline = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">
        {label}
      </span>

      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[88px] w-full resize-none rounded-[16px] border border-white/10 bg-white/[0.045] px-3 py-3 text-[12px] font-medium leading-5 text-white outline-none placeholder:text-white/24 focus:border-cyan-300/30 focus:bg-cyan-400/[0.06]"
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-[16px] border border-white/10 bg-white/[0.045] px-3 text-[12px] font-medium text-white outline-none placeholder:text-white/24 focus:border-cyan-300/30 focus:bg-cyan-400/[0.06]"
        />
      )}
    </label>
  );
}

function ActionCard({ icon, title, description, onClick, tone = "cyan" }) {
  const toneClasses =
    tone === "violet"
      ? {
          card: "border-violet-300/16 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_44%),linear-gradient(180deg,rgba(24,16,42,0.94),rgba(6,10,18,0.98))]",
          icon: "border-violet-300/20 bg-violet-400/10 text-violet-100 shadow-[0_0_16px_rgba(168,85,247,0.10)]",
        }
      : {
          card: "border-cyan-300/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_44%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))]",
          icon: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.10)]",
        };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex min-h-[96px] items-center gap-3 overflow-hidden rounded-[22px] p-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition active:scale-[0.98]",
        "border",
        toneClasses.card,
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border",
          toneClasses.icon,
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold tracking-[-0.02em] text-white/92">
          {title}
        </div>

        <div className="mt-1 text-[10px] font-medium leading-4 text-white/45">
          {description}
        </div>
      </div>
    </button>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/8 py-2 last:border-b-0">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
        {label}
      </span>

      <span className="text-right text-[11px] font-semibold text-white/62">
        {value}
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-[17px] border border-cyan-300/24 bg-cyan-400/14 text-[12px] font-semibold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.10)] transition active:scale-[0.98]"
    >
      {icon}
      {children}
    </button>
  );
}

function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 top-[76px] z-[140] w-[280px] -translate-x-1/2 rounded-2xl border border-cyan-300/18 bg-[#07111c]/95 px-4 py-3 text-center text-[12px] font-semibold text-cyan-100 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-md">
      {message}
    </div>
  );
}

export default function DevelopersViewV1({ onBack }) {
  const [activeTab, setActiveTab] = useState("integrations");
  const [toast, setToast] = useState("");

  const [integrationForm, setIntegrationForm] = useState({
    appName: "ZWAP! Partner App",
    callbackUrl: "https://example.com/zwap/callback",
    eventName: "play.round.completed",
  });

  const [gameForm, setGameForm] = useState({
    gameName: "Untitled Game",
    buildUrl: "",
    category: "Arcade",
    rewardSignal: "round_completed",
  });

  const [toolForm, setToolForm] = useState({
    toolName: "Creator Utility",
    purpose: "Track engagement signals and review submissions.",
  });

  const apiKey = "zwap_dev_live_x7k9_4q2p_demo";

  const savedItems = useMemo(
    () => [
      {
        label: "Integration",
        value: integrationForm.appName || "Untitled Integration",
      },
      {
        label: "Game",
        value: gameForm.gameName || "Untitled Game",
      },
      {
        label: "Tool",
        value: toolForm.toolName || "Untitled Tool",
      },
    ],
    [integrationForm.appName, gameForm.gameName, toolForm.toolName]
  );

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1600);
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      showToast("API key copied");
    } catch {
      showToast("Copy unavailable");
    }
  };

  const renderIntegrations = () => (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-[22px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.26)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
            <KeyRound size={18} strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold tracking-[-0.02em] text-white/92">
              API Key
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-[15px] border border-white/10 bg-black/20 px-3 py-2">
              <div className="min-w-0 flex-1 truncate text-[11px] font-medium text-white/50">
                {apiKey}
              </div>

              <button
                type="button"
                onClick={copyApiKey}
                aria-label="Copy API key"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/14 bg-cyan-400/10 text-cyan-100/72"
              >
                <Copy size={14} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,22,32,0.94),rgba(6,10,18,0.98))] p-3.5">
        <div className="mb-3 text-sm font-semibold tracking-[-0.02em] text-white/92">
          Integration Setup
        </div>

        <div className="flex flex-col gap-3">
          <Field
            label="App Name"
            value={integrationForm.appName}
            onChange={(value) =>
              setIntegrationForm((current) => ({ ...current, appName: value }))
            }
          />

          <Field
            label="Callback URL"
            value={integrationForm.callbackUrl}
            onChange={(value) =>
              setIntegrationForm((current) => ({
                ...current,
                callbackUrl: value,
              }))
            }
          />

          <Field
            label="Event Signal"
            value={integrationForm.eventName}
            onChange={(value) =>
              setIntegrationForm((current) => ({ ...current, eventName: value }))
            }
          />

          <PrimaryButton
            onClick={() => showToast("Integration saved")}
            icon={<Save size={15} strokeWidth={2.3} />}
          >
            Save Integration
          </PrimaryButton>
        </div>
      </div>
    </div>
  );

  const renderGames = () => (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-[22px] border border-violet-300/14 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_44%),linear-gradient(180deg,rgba(24,16,42,0.94),rgba(6,10,18,0.98))] p-3.5">
        <div className="mb-3 text-sm font-semibold tracking-[-0.02em] text-white/92">
          Game Submission
        </div>

        <div className="flex flex-col gap-3">
          <Field
            label="Game Name"
            value={gameForm.gameName}
            onChange={(value) =>
              setGameForm((current) => ({ ...current, gameName: value }))
            }
          />

          <Field
            label="Build URL"
            value={gameForm.buildUrl}
            placeholder="https://..."
            onChange={(value) =>
              setGameForm((current) => ({ ...current, buildUrl: value }))
            }
          />

          <Field
            label="Category"
            value={gameForm.category}
            onChange={(value) =>
              setGameForm((current) => ({ ...current, category: value }))
            }
          />

          <Field
            label="Reward Signal"
            value={gameForm.rewardSignal}
            onChange={(value) =>
              setGameForm((current) => ({ ...current, rewardSignal: value }))
            }
          />

          <PrimaryButton
            onClick={() => showToast("Game submitted")}
            icon={<Upload size={15} strokeWidth={2.3} />}
          >
            Submit Game
          </PrimaryButton>
        </div>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-[22px] border border-violet-300/14 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_44%),linear-gradient(180deg,rgba(24,16,42,0.94),rgba(6,10,18,0.98))] p-3.5">
        <div className="mb-3 text-sm font-semibold tracking-[-0.02em] text-white/92">
          Creator Tool
        </div>

        <div className="flex flex-col gap-3">
          <Field
            label="Tool Name"
            value={toolForm.toolName}
            onChange={(value) =>
              setToolForm((current) => ({ ...current, toolName: value }))
            }
          />

          <Field
            label="Purpose"
            value={toolForm.purpose}
            multiline
            onChange={(value) =>
              setToolForm((current) => ({ ...current, purpose: value }))
            }
          />

          <PrimaryButton
            onClick={() => showToast("Tool saved")}
            icon={<Plus size={15} strokeWidth={2.3} />}
          >
            Save Tool
          </PrimaryButton>
        </div>
      </div>
    </div>
  );

  const renderDocs = () => (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-[22px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3.5">
        <div className="mb-3 text-sm font-semibold tracking-[-0.02em] text-white/92">
          Developer References
        </div>

        <div className="flex flex-col gap-2">
          {[
            "Reward Signal Standard",
            "Game Build Requirements",
            "Webhook Payloads",
            "Review Checklist",
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => showToast(`${item} opened`)}
              className="flex h-12 items-center justify-between rounded-[16px] border border-white/10 bg-white/[0.04] px-3 text-left transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 text-[12px] font-semibold text-white/72">
                <FileCode2 size={15} strokeWidth={2.2} className="text-cyan-100/62" />
                {item}
              </div>

              <ExternalLink size={14} strokeWidth={2.2} className="text-white/34" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === "games") return renderGames();
    if (activeTab === "tools") return renderTools();
    if (activeTab === "docs") return renderDocs();

    return renderIntegrations();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <Toast message={toast} />

      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          Developers
        </div>

        <HeaderButton
          label="Developer status"
          onClick={() => showToast("Developer console active")}
        >
          <Code2 size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pb-6 pr-1">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/16 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.14),transparent_42%),radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.10),transparent_38%),linear-gradient(180deg,rgba(10,20,32,0.96),rgba(5,9,18,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

            <div className="relative flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-cyan-300/24 bg-cyan-400/12 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                <TerminalSquare size={20} strokeWidth={2.3} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[21px] font-semibold tracking-[-0.05em] text-white">
                  Developer Console
                </div>

                <div className="mt-1 text-[12px] font-medium leading-5 text-white/52">
                  Integrations, games, tools, and docs.
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <TabButton
              label="Integrations"
              active={activeTab === "integrations"}
              onClick={() => setActiveTab("integrations")}
            />
            <TabButton
              label="Games"
              active={activeTab === "games"}
              onClick={() => setActiveTab("games")}
            />
            <TabButton
              label="Tools"
              active={activeTab === "tools"}
              onClick={() => setActiveTab("tools")}
            />
            <TabButton
              label="Docs"
              active={activeTab === "docs"}
              onClick={() => setActiveTab("docs")}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <ActionCard
              icon={<KeyRound size={17} strokeWidth={2.2} />}
              title="Integrations"
              description="Keys, callback URLs, and event signals."
              onClick={() => setActiveTab("integrations")}
            />

            <ActionCard
              icon={<Gamepad2 size={17} strokeWidth={2.2} />}
              title="Games"
              description="Submit playable builds for review."
              onClick={() => setActiveTab("games")}
              tone="violet"
            />

            <ActionCard
              icon={<SlidersHorizontal size={17} strokeWidth={2.2} />}
              title="Tools"
              description="Creator utilities and system controls."
              onClick={() => setActiveTab("tools")}
              tone="violet"
            />

            <ActionCard
              icon={<BookOpen size={17} strokeWidth={2.2} />}
              title="Docs"
              description="Standards, payloads, and references."
              onClick={() => setActiveTab("docs")}
            />
          </div>

          {renderActiveTab()}

          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.88),rgba(6,10,18,0.98))] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100/78">
                <Boxes size={17} strokeWidth={2.2} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-[-0.02em] text-white/88">
                  Console State
                </div>

                <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-1">
                  {savedItems.map((item) => (
                    <StatusRow
                      key={item.label}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PrimaryButton
            onClick={() => showToast("Developer packet sent")}
            icon={<Send size={15} strokeWidth={2.3} />}
          >
            Send Developer Packet
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}