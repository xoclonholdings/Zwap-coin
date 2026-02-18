import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Coins, Blocks, Wallet, Zap, Star, ArrowRightLeft, BookOpen, Lightbulb } from "lucide-react";
import educationModules from "@/data/education";

const iconMap = {
  coins: Coins,
  blocks: Blocks,
  wallet: Wallet,
  zap: Zap,
  star: Star,
  arrows: ArrowRightLeft,
};

const colorMap = {
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400", iconBg: "bg-cyan-500/20", analogyBg: "bg-cyan-500/10", analogyBorder: "border-cyan-500/20", analogyText: "text-cyan-300" },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", iconBg: "bg-purple-500/20", analogyBg: "bg-purple-500/10", analogyBorder: "border-purple-500/20", analogyText: "text-purple-300" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/20", analogyBg: "bg-blue-500/10", analogyBorder: "border-blue-500/20", analogyText: "text-blue-300" },
  green: { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-400", iconBg: "bg-green-500/20", analogyBg: "bg-green-500/10", analogyBorder: "border-green-500/20", analogyText: "text-green-300" },
};

function ModuleCard({ module, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[module.icon] || BookOpen;
  const colors = colorMap[module.color] || colorMap.cyan;

  return (
    <motion.div
      className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
        data-testid={`learn-module-${module.id}`}
      >
        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Module {index + 1}</p>
          <h3 className="text-white font-bold text-sm">{module.title}</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Core Explanation */}
              <div>
                <p className="text-gray-300 text-sm leading-relaxed">{module.core}</p>
              </div>

              {/* Analogy */}
              <div className={`p-3 rounded-xl ${colors.analogyBg} border ${colors.analogyBorder}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Think of it this way
                </p>
                <p className={`${colors.analogyText} text-sm italic`}>"{module.analogy}"</p>
              </div>

              {/* Did You Know */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Did You Know?</p>
                <ul className="space-y-1.5">
                  {module.didYouKnow.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                      <span className={`${colors.text} mt-0.5`}>*</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Quiz Preview */}
              <div className="pt-2 border-t border-gray-800/50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick Check</p>
                <p className={`text-sm ${colors.text} font-medium`}>
                  Q: {module.trivia[0].question}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  A: {module.trivia[0].answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LearnPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-400 hover:text-white" data-testid="learn-back-button">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Learn</h1>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        {/* Intro */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Crypto Made Simple
            </span>
          </h2>
          <p className="text-gray-400 text-sm">
            Everything you need to know about cryptocurrency, wallets, and ZWAP! — explained in plain language.
          </p>
        </motion.div>

        {/* Modules */}
        <div className="space-y-3" data-testid="learn-modules-list">
          {educationModules.map((module, i) => (
            <ModuleCard key={module.id} module={module} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          className="text-center text-gray-600 text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          This knowledge also powers trivia games and ticker facts throughout the app.
        </motion.p>
      </div>
    </div>
  );
}
