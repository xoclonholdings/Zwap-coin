import React, { useState } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import SubmissionForm from "./SubmissionForm";
import SubmissionSuccess from "./SubmissionSuccess";

export default function PlaySubmissionPortal({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);

    try {
      // replace with real API later
      console.log("SUBMIT GAME:", form);

      setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0b0f1a] to-[#081017] p-4 shadow-xl">
          {/* Header */}
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="mr-3 p-2 rounded-xl bg-white/10"
            >
              <ChevronLeft />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="text-violet-300" />
              <h1 className="text-lg font-semibold">
                Submit Game
              </h1>
            </div>
          </div>

          {/* Content */}
          {submitted ? (
            <SubmissionSuccess onClose={onBack} />
          ) : (
            <SubmissionForm onSubmit={handleSubmit} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}