import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using the ZWAP! application ("App"), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this App.`
    },
    {
      title: "2. Description of Service",
      content: `ZWAP! is a cryptocurrency rewards application that allows users to:

• Earn ZWAP! Coin through physical activity (walking)
• Earn rewards by playing games
• Exchange tokens through our swap feature
• Purchase items in our marketplace

The App operates on blockchain technology and requires a compatible cryptocurrency wallet to access certain features.`
    },
    {
      title: "3. Eligibility",
      content: `You must be at least 18 years old to use this App. By using the App, you represent and warrant that:

• You are at least 18 years of age
• You have the legal capacity to enter into binding agreements
• Your use complies with all applicable laws in your jurisdiction
• Cryptocurrency activities are legal in your country of residence`
    },
    {
      title: "4. Account and Wallet",
      content: `• You are responsible for maintaining the security of your wallet
• We do not store your private keys
• Lost wallet access cannot be recovered by us
• You are responsible for all activities under your account
• One wallet address per user account`
    },
    {
      title: "5. ZWAP! Coin and Z Points",
      content: `• ZWAP! Coin is a utility token within our ecosystem
• Z Points are non-transferable loyalty credits
• Token values may fluctuate
• Rewards are subject to daily and monthly caps
• We reserve the right to modify reward rates`
    },
    {
      title: "6. Subscriptions",
      content: `Plus subscriptions:

• Are billed monthly at $12.99
• Can be cancelled at any time
• Benefits remain active until the end of the billing period
• No refunds for partial months
• Prices may change with 30 days notice`
    },
    {
      title: "7. Prohibited Activities",
      content: `You agree not to:

• Use bots, scripts, or automated tools
• Manipulate step counts or game scores
• Create multiple accounts
• Attempt to exploit bugs or vulnerabilities
• Use the App for money laundering
• Violate any applicable laws`
    },
    {
      title: "8. Intellectual Property",
      content: `• All content, trademarks, and IP belong to XOCLON HOLDINGS INC.
• You may not copy, modify, or distribute our content
• User-generated content remains yours but you grant us a license to use it
• ZWAP! branding may not be used without permission`
    },
    {
      title: "9. Disclaimer of Warranties",
      content: `THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:

• Continuous, uninterrupted service
• Accuracy of token prices
• Future value of ZWAP! Coin
• Compatibility with all devices

Cryptocurrency investments carry risk. Only invest what you can afford to lose.`
    },
    {
      title: "10. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZWAP! AND ITS AFFILIATES SHALL NOT BE LIABLE FOR:

• Loss of funds or tokens
• Service interruptions
• Third-party actions
• Market fluctuations
• Indirect or consequential damages`
    },
    {
      title: "11. Changes to Terms",
      content: `We may modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms. Material changes will be notified through the App.`
    },
    {
      title: "12. Governing Law",
      content: `These terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.`
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
          <h1 className="text-lg font-bold text-white">Terms of Use</h1>
        </div>
      </div>

      <div className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 pulse-glow-purple">
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Terms of Use</h2>
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
              transition={{ delay: i * 0.03 }}
            >
              <h3 className="text-lg font-bold text-purple-400 mb-3">{section.title}</h3>
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
            Questions? Contact us at <a href="mailto:legal@zwap.app" className="text-purple-400 hover:underline">legal@zwap.app</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
