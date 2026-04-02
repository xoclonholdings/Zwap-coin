import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { useApp } from "@/app/AppProvider";
import SectionHeader from "@/components/learn/SectionHeader";
import ModuleCard from "@/components/learn/ModuleCard";
import { learnModules } from "@/data/learnModules";

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
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-400 hover:text-white"
            data-testid="learn-back-button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Learn</h1>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-10 px-4 max-w-lg mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Crypto Made Simple
            </span>
          </h2>

          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Start with the essentials, then explore the deeper parts of Web3,
            tokens, wallets, and how{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 font-semibold">
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
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-cyan-300" />
            </div>

            <div>
              <h3 className="text-white font-semibold mb-1">Start here first</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                New to crypto or Web3? Begin with the first three modules below.
                They cover the minimum you need before the rest of the page
                starts making deeper sense.
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

          <div
            className="space-y-3"
            data-testid="learn-explore-more-list"
          >
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
          className="text-center text-gray-600 text-xs mt-8"
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