import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLoginWithEmail, usePrivy } from "@privy-io/react-auth";

function Shell({ children }) {
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="absolute inset-x-5 top-1/2 h-[min(78dvh,680px)] -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

function GradientText({ children, variant = "zwap" }) {
  const gradient =
    variant === "zpts"
      ? "from-lime-200 via-cyan-300 to-emerald-300"
      : "from-cyan-300 via-purple-300 to-pink-300";

  return (
    <span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]`}
    >
      {children}
    </span>
  );
}

function Panel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
      transition={{ duration: 0.55 }}
      className="flex w-full flex-col items-center gap-5"
    >
      {children}
    </motion.div>
  );
}

function Field({ value, onChange, placeholder, type = "text", inputMode }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      inputMode={inputMode}
      className="w-full rounded-[20px] border border-cyan-300/18 bg-black/30 px-5 py-4 text-center text-base font-bold tracking-[-0.02em] text-white outline-none shadow-[0_0_28px_rgba(34,211,238,0.08)] placeholder:text-white/28 focus:border-cyan-300/45 focus:bg-cyan-300/[0.06]"
    />
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-4 text-lg font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)] transition disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </motion.button>
  );
}

export default function SignupOnboarding({
  onAuthSuccess,
  navigate,
  dashboardRoute = "/v1/dashboard",
}) {
  const { ready, authenticated } = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail();

  const [phase, setPhase] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!ready || !authenticated) return;

    setPhase("success");

    const timer = window.setTimeout(() => {
      if (typeof onAuthSuccess === "function") {
        onAuthSuccess();
        return;
      }

      if (typeof navigate === "function") {
        navigate(dashboardRoute);
      }
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [ready, authenticated, onAuthSuccess, navigate, dashboardRoute]);

  const handleSendCode = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setStatusText("Enter your email first.");
      return;
    }

    try {
      setIsWorking(true);
      setStatusText("");
      await sendCode({ email: cleanEmail });
      setPhase("code");
    } catch (error) {
      setStatusText(error?.message || "Could not send code. Try again.");
    } finally {
      setIsWorking(false);
    }
  };

  const handleVerifyCode = async () => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      setStatusText("Enter the code from your email.");
      return;
    }

    try {
      setIsWorking(true);
      setStatusText("");
      await loginWithCode({ code: cleanCode });
    } catch (error) {
      setStatusText(error?.message || "That code did not work. Try again.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Shell>
      <AnimatePresence mode="wait">
        {phase === "email" && (
          <Panel key="email">
            <div className="text-center text-[clamp(2.15rem,9vw,3.25rem)] font-black leading-[1.03] tracking-[-0.065em] text-white">
              Create your <GradientText>ZWAP!</GradientText> account.
            </div>

            <div className="text-center text-sm font-bold leading-relaxed tracking-[-0.02em] text-white/55">
              Save your <GradientText variant="zpts">zPts</GradientText>, protect
              your progress, and unlock your dashboard.
            </div>

            <Field
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="Email address"
              type="email"
              inputMode="email"
            />

            <PrimaryButton onClick={handleSendCode} disabled={isWorking}>
              {isWorking ? "Sending..." : "Send Code"}
            </PrimaryButton>

            {statusText ? (
              <div className="text-xs font-bold leading-relaxed text-pink-200/80">
                {statusText}
              </div>
            ) : null}
          </Panel>
        )}

        {phase === "code" && (
          <Panel key="code">
            <div className="text-center text-[clamp(2.15rem,9vw,3.25rem)] font-black leading-[1.03] tracking-[-0.065em] text-white">
              Check your code.
            </div>

            <div className="text-center text-sm font-bold leading-relaxed tracking-[-0.02em] text-white/55">
              We sent a sign-in code to{" "}
              <span className="text-cyan-200">{email.trim()}</span>
            </div>

            <Field
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              placeholder="Enter code"
              inputMode="numeric"
            />

            <PrimaryButton onClick={handleVerifyCode} disabled={isWorking}>
              {isWorking ? "Verifying..." : "Verify + Continue"}
            </PrimaryButton>

            <button
              type="button"
              onClick={() => {
                setCode("");
                setPhase("email");
                setStatusText("");
              }}
              className="text-xs font-black tracking-[0.12em] text-white/45"
            >
              CHANGE EMAIL
            </button>

            {statusText ? (
              <div className="text-xs font-bold leading-relaxed text-pink-200/80">
                {statusText}
              </div>
            ) : null}
          </Panel>
        )}

        {phase === "success" && (
          <Panel key="success">
            <div className="text-center text-[clamp(2.3rem,9vw,3.4rem)] font-black leading-[1.03] tracking-[-0.065em] text-white">
              You’re in.
            </div>

            <div className="text-center text-lg font-black tracking-[-0.04em] text-cyan-200">
              Opening your dashboard...
            </div>
          </Panel>
        )}
      </AnimatePresence>
    </Shell>
  );
}