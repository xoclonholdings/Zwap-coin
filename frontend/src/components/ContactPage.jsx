import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const navigate = useNavigate();

  const contactOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help with your account",
      action: "support@zwap.app",
      href: "mailto:support@zwap.app",
      color: "cyan"
    },
    {
      icon: MessageCircle,
      title: "General Inquiries",
      description: "Business and partnership questions",
      action: "hello@zwap.app",
      href: "mailto:hello@zwap.app",
      color: "purple"
    },
    {
      icon: Twitter,
      title: "Twitter / X",
      description: "Follow us for updates",
      action: "@ZWAPcoin",
      href: "https://twitter.com/ZWAPcoin",
      color: "blue"
    },
    {
      icon: Globe,
      title: "Website",
      description: "Learn more about ZWAP!",
      action: "zwap.app",
      href: "https://zwap.app",
      color: "pink"
    }
  ];

  const colorClasses = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    purple: "bg-purple-500/20 text-purple-400",
    blue: "bg-blue-500/20 text-blue-400",
    pink: "bg-pink-500/20 text-pink-400"
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Contact Us</h1>
        </div>
      </div>

      <div className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        {/* Intro */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 pulse-glow">
            <Mail className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
          <p className="text-gray-400">We're here to help! Reach out through any channel below.</p>
        </motion.div>

        {/* Contact Options */}
        <div className="space-y-4">
          {contactOptions.map((option, i) => {
            const Icon = option.icon;
            return (
              <motion.a
                key={i}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block glass-card p-4 rounded-xl hover:border-cyan-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${colorClasses[option.color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{option.title}</h3>
                    <p className="text-gray-500 text-sm">{option.description}</p>
                    <p className={`text-sm ${colorClasses[option.color].split(' ')[1]} mt-1`}>{option.action}</p>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Response Time */}
        <motion.div 
          className="glass-card p-4 rounded-xl mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 text-sm">
            ⚡ Typical response time: <span className="text-cyan-400">24-48 hours</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
