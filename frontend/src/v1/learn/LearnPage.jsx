import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Sparkles,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

import { useApp } from "@/app/AppProvider";
import { learnModules } from "@/data/learnModules";

function SectionHeader({ icon: Icon, title, subtitle, colorClass }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </div>

      <div>
        <h3 className="text-sm font-black tracking-[-0.03em] text-white">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-5 text-white/45">{subtitle}</p>
      </div>
    </div>
  );
}

function ModuleCard({ module, index, defaultOpen = false, walletAddress }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.25) }}
      className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] shadow-[0_14px_34px_rgba(0,0,0,0.3)]"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
          <BookOpen size={18} strokeWidth={2.3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100/50">
            {module?.level || "beginner"} · {module?.category || "learn"}
          </div>

          <div className="mt-1 text-[16px] font-black tracking-[-0.04em] text-white">
            {module?.title || "Learn Module"}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/48">
            {module?.short_description || module?.core || "Open this module to learn more."}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={[
            "mt-1 shrink-0 text-white/40 transition",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open ? (
        <div className="border-t border-white/8 px-4 pb-4 pt-3">
          <p className="text-sm leading-6 text-white/68">
            {module?.core || "This module is being prepared."}
          </p>

          {module?.analogy ? (
            <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 p-3 text-xs leading-5 text-white/52">
              {module.analogy}
            </div>
          ) : null}

          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-black tracking-[-0.03em] text-cyan-100"
            disabled={!walletAddress}
          >
            {walletAddress ? "Mark Complete" : "Connect to Complete"}
          </button>
        </div>
      ) : null}
    </motion.div>
  );
}

export default function LearnPage() {
  const navigate = useNavigate();
  const { walletAddress } = useApp();

  const modules = useMemo(() => {
    if (Array.isArray(learnModules)) return learnModules;

    return [
      ...(learnModules?.beginner || []),
      ...(learnModules?.intermediate || []),
      ...(learnModules?.advanced || []),
      ...(learnModules?.expert || []),
    ];
  }, []);

  const startHereIds = useMemo(
    () => ["web3-basics", "utility-token-basics", "zwap-token-utility"],
    []
  );

  const startHereModules = modules.filter((m) => startHereIds.includes(m.id));
  const exploreModules = modules.filter((m) => !startHereIds.includes(m.id));

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="fixed left-0 right-0 top-0 z-40 border-b border-cyan-500/20 bg-[#0a0b1e]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-400 hover:text-white"
            data-testid="learn-back-button"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Learn</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-10 pt-20">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="mb-2 text-xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Crypto Made Simple
            </span>
          </h2>

          <p className="mx-auto max-w-md text-sm text-gray-400">
            Start with the essentials, then explore Web3, tokens, wallets, and
            how{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text font-semibold text-transparent">
              ZWAP!
            </span>{" "}
            fits together.
          </p>
        </motion.div>

        <motion.div
          className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
              <GraduationCap className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-white">Start here first</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                New to crypto or Web3? Begin with the first three modules below.
              </p>
            </div>
          </div>
        </motion.div>

        <section className="mb-8">
          <SectionHeader
            icon={Sparkles}
            title="Start Here"
            subtitle="The beginner runway. These are the essentials."
            colorClass="text-cyan-300"
          />

          <div className="space-y-3" data-testid="learn-start-here-list">
            {startHereModules.map((module, i) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={i}
                defaultOpen={i === 0}
                walletAddress={walletAddress}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            icon={Compass}
            title="Explore More"
            subtitle="Deeper context you can open whenever you're ready."
            colorClass="text-purple-300"
          />

          <div className="space-y-3" data-testid="learn-explore-more-list">
            {exploreModules.map((module, i) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={i + startHereModules.length}
                walletAddress={walletAddress}
              />
            ))}
          </div>
        </section>

        <motion.p
          className="mt-8 text-center text-xs text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Learn first. Move with confidence after.
        </motion.p>
      </div>
    </div>
  );
}