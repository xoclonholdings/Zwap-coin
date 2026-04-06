import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PlaySubmissionPortal from "./PlaySubmissionPortal";

export default function DeveloperSubmissionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#0a0b1e]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-400 transition hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-white">Developer Portal</h1>
            <p className="text-xs text-gray-400">
              Submit a game for review and expansion into ZWAP.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        <PlaySubmissionPortal />
      </div>
    </div>
  );
}