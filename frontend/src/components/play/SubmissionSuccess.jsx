import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SubmissionSuccess({ onClose }) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle2 className="h-10 w-10 text-green-400" />
      </div>

      <h2 className="text-lg font-semibold text-white">
        Submission Received
      </h2>

      <p className="text-sm text-white/60">
        Your game will be reviewed before going live.
      </p>

      <Button
        onClick={onClose}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 text-black"
      >
        Back to Play
      </Button>
    </div>
  );
}