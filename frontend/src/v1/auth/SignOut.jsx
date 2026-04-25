// frontend/src/v1/auth/SignOut.jsx

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Shell({ children }) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="absolute left-1/2 top-1/2 h-[560px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <div className="relative z-10 flex min-h-[560px] w-full max-w-[460px] flex-col items-center justify-center px-10 text-center">
        {children}
      </div>
    </div>
  );
}

export default function SignOut({ nextRoute = "/v1/signin" }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(nextRoute, { replace: true });
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate, nextRoute]);

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        className="flex flex-col items-center gap-4"
      >
        <div className="text-[2.2rem] font-black tracking-[-0.06em] text-white">
          You’re signed out.
        </div>

        <div className="text-sm font-bold text-white/55">
          See you next time.
        </div>
      </motion.div>
    </Shell>
  );
}