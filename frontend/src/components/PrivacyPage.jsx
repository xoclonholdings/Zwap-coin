import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information you provide directly to us, including:
      
• Wallet address when you connect your wallet
• Step count data when using the MOVE feature
• Game activity and scores
• Transaction history within the app

We do not collect personal identification information such as your name, email, or phone number unless you choose to provide it through our contact form.`
    },
    {
      title: "How We Use Your Information",
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and track rewards
• Display leaderboards and rankings
• Communicate with you about your account
• Detect and prevent fraud or abuse`
    },
    {
      title: "Data Security",
      content: `We implement appropriate security measures to protect your information:

• All data is encrypted in transit and at rest
• Wallet connections use industry-standard protocols
• We do not store private keys
• Regular security audits are conducted`
    },
    {
      title: "Blockchain Data",
      content: `When you connect your wallet and perform transactions:

• Your wallet address is publicly visible on the blockchain
• Transaction data is immutable and permanent
• We do not control blockchain data
• Smart contract interactions are transparent`
    },
    {
      title: "Third-Party Services",
      content: `We may use third-party services that collect information:

• Analytics providers to understand app usage
• Payment processors for subscriptions
• Blockchain networks for transactions

These services have their own privacy policies.`
    },
    {
      title: "Your Rights",
      content: `You have the right to:

• Access your data
• Request data deletion
• Disconnect your wallet at any time
• Opt out of promotional communications

Note: Blockchain transactions cannot be deleted due to the nature of distributed ledgers.`
    },
    {
      title: "Updates to This Policy",
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      <div className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 pulse-glow">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Privacy Policy</h2>
          <p className="text-gray-400 text-sm">Last updated: January 2025</p>
        </motion.div>

        {/* Content */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              className="glass-card p-5 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-3">{section.title}</h3>
              <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div 
          className="glass-card p-4 rounded-xl mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 text-sm">
            Questions? Contact us at <a href="mailto:privacy@zwap.app" className="text-cyan-400 hover:underline">privacy@zwap.app</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
