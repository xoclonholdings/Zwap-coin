import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLoginWithEmail, usePrivy } from "@privy-io/react-auth";

import { useApp } from "@/app/AppProvider";
import api from "@/lib/api";

const REVIEW_EMAIL = "review@zwap.app";
const REVIEW_PASSWORD = "ZwapReview2026!";

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

function GradientText({ children }) {
  return (
    <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
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
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
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

function ReviewerModal({
  reviewEmail,
  reviewPassword,
  setReviewEmail,
  setReviewPassword,
  onClose,
  onSubmit,
  statusText,
  isWorking,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-[340px] rounded-[30px] border border-cyan-300/20 bg-[#050814]/95 p-6 shadow-[0_0_60px_rgba(34,211,238,0.22)]"
      >
        <div className="mb-5 text-center">
          <div className="text-2xl font-black tracking-[-0.055em] text-white">
            Reviewer Login
          </div>
          <div className="mt-2 text-xs font-bold leading-relaxed text-white/45">
            App review access only.
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Field
            value={reviewEmail}
            onChange={(e) => setReviewEmail(e.currentTarget.value)}
            placeholder="Reviewer email"
            type="email"
            inputMode="email"
          />

          <Field
            value={reviewPassword}
            onChange={(e) => setReviewPassword(e.currentTarget.value)}
            placeholder="Reviewer password"
            type="password"
          />

          <PrimaryButton onClick={onSubmit} disabled={isWorking}>
            {isWorking ? "Opening..." : "Enter Review Mode"}
          </PrimaryButton>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-black uppercase tracking-[0.14em] text-white/40"
          >
            Cancel
          </button>

          {statusText ? (
            <div className="text-center text-xs font-bold leading-relaxed text-pink-200/80">
              {statusText}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SignIn({ onSuccess }) {
  const { ready, authenticated } = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { completeEmailAuth } = useApp();

  const [phase, setPhase] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [statusText, setStatusText] = useState("");
  const [reviewStatusText, setReviewStatusText] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewPassword, setReviewPassword] = useState("");

  useEffect(() => {
    if (!ready) return;

    if (authenticated) {
      setPhase("returning");
    }
  }, [ready, authenticated]);

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
      setPhase("success");

      window.setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (error) {
      setStatusText(error?.message || "That code did not work. Try again.");
    } finally {
      setIsWorking(false);
    }
  };

  const handleReviewerLogin = async () => {
    const cleanEmail = reviewEmail.trim().toLowerCase();
    const cleanPassword = reviewPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      setReviewStatusText("Enter reviewer email and password.");
      return;
    }

    if (cleanEmail !== REVIEW_EMAIL || cleanPassword !== REVIEW_PASSWORD) {
      setReviewStatusText("Reviewer credentials did not match.");
      return;
    }

    try {
      setIsWorking(true);
      setReviewStatusText("");

      const reviewUser = await api.createOrUpdateEmailUser(REVIEW_EMAIL, {
        username: "Reviewer",
      });

      completeEmailAuth?.({
        ...reviewUser,
        email: REVIEW_EMAIL,
        authProvider: "review",
      });

      setIsReviewerModalOpen(false);
      setPhase("success");

      window.setTimeout(() => {
        onSuccess?.();
      }, 700);
    } catch (error) {
      setReviewStatusText(
        error?.message || "Reviewer login failed. Try again."
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Shell>
      <AnimatePresence mode="wait">
        {phase === "returning" && (
          <Panel key="returning">
            <div className="text-center text-[2.15rem] font-black leading-[1.03] tracking-[-0.065em] text-white">
              Welcome back to <GradientText>ZWAP!</GradientText>
            </div>

            <div className="max-w-[280px] text-center text-sm font-bold leading-relaxed tracking-[-0.02em] text-white/55">
              You’re already signed in. Continue when you’re ready.
            </div>

            <PrimaryButton onClick={onSuccess}>
              Continue to Dashboard
            </PrimaryButton>
          </Panel>
        )}

        {phase === "email" && (
          <Panel key="email">
            <div className="text-center text-[2.15rem] font-black leading-[1.03] tracking-[-0.065em] text-white">
              Welcome back to <GradientText>ZWAP!</GradientText>
            </div>

            <div className="max-w-[280px] text-center text-sm font-bold leading-relaxed tracking-[-0.02em] text-white/55">
              Sign in to reopen your dashboard and keep your progress moving.
            </div>

            <Field
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="Email address"
              type="email"
              inputMode="email"
            />

            <PrimaryButton onClick={handleSendCode} disabled={isWorking}>
              {isWorking ? "Sending..." : "Send Sign In Code"}
            </PrimaryButton>

            <button
              type="button"
              onClick={() => {
                setReviewEmail("");
                setReviewPassword("");
                setReviewStatusText("");
                setIsReviewerModalOpen(true);
              }}
              className="text-xs font-black uppercase tracking-[0.16em] text-white/38 underline decoration-cyan-300/25 underline-offset-4 transition hover:text-cyan-100"
            >
              Reviewer Login
            </button>

            {statusText ? (
              <div className="text-xs font-bold leading-relaxed text-pink-200/80">
                {statusText}
              </div>
            ) : null}
          </Panel>
        )}

        {phase === "code" && (
          <Panel key="code">
            <div className="text-center text-[2.15rem] font-black leading-[1.03] tracking-[-0.065em] text-white">
              Enter your code.
            </div>

            <div className="max-w-[280px] text-center text-sm font-bold leading-relaxed tracking-[-0.02em] text-white/55">
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
              {isWorking ? "Verifying..." : "Sign In"}
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
            <div className="text-center text-[2.3rem] font-black leading-[1.03] tracking-[-0.065em] text-white">
              You’re back.
            </div>

            <div className="text-center text-lg font-black tracking-[-0.04em] text-cyan-200">
              Opening your dashboard...
            </div>
          </Panel>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewerModalOpen ? (
          <ReviewerModal
            reviewEmail={reviewEmail}
            reviewPassword={reviewPassword}
            setReviewEmail={setReviewEmail}
            setReviewPassword={setReviewPassword}
            onClose={() => {
              setIsReviewerModalOpen(false);
              setReviewStatusText("");
            }}
            onSubmit={handleReviewerLogin}
            statusText={reviewStatusText}
            isWorking={isWorking}
          />
        ) : null}
      </AnimatePresence>
    </Shell>
  );
}