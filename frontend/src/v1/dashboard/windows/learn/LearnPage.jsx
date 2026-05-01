import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

import { useApp } from "@/app/AppProvider";
import { learnModules } from "@/data/learnModules";
import ModuleCard from "./ModuleCard";
import SectionHeader from "./SectionHeader";

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

  // Progression ordering (no hardcoded IDs)
  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const levelOrder = ["beginner", "intermediate", "advanced", "expert"];

      const aIndex = levelOrder.indexOf(a.level);
      const bIndex = levelOrder.indexOf(b.level);

      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [modules]);

  // Current focus = first module (can evolve later)
  const currentModule = orderedModules[0];

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* HEADER */}
      <div className="fixed left-0 right-0 top-0 z-40 border-b border-cyan-500/20 bg-[#0a0b1e]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Learn</h1>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="mx-auto max-w-lg px-4 pb-10 pt-20">
        {/* HERO */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="mb-2 text-xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Build Your Foundation
            </span>
          </h2>

          <p className="mx-auto max-w-md text-sm text-gray-400">
            Wellness. Discipline. Ownership. Learn how everything connects.
          </p>
        </motion.div>

        {/* MODULES */}
        <section className="mb-8">
          <SectionHeader
            icon={BookOpen}
            title="Modules"
            subtitle="Progress through structured learning."
            colorClass="text-cyan-300"
          />

          <div className="space-y-3">
            {orderedModules.map((module, i) => (
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

        {/* RECOMMENDED (STRUCTURE ONLY) */}
        <section>
          <SectionHeader
            icon={Sparkles}
            title="Recommended for You"
            subtitle="Based on your current learning path."
            colorClass="text-purple-300"
          />

          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* Empty placeholders — will be filled via admin/data later */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[140px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="h-[90px] rounded-xl bg-white/5 mb-2" />
                <div className="h-3 w-24 bg-white/10 rounded mb-1" />
                <div className="h-2 w-16 bg-white/10 rounded" />
              </div>
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