import React from "react";
import { useNavigate } from "react-router-dom";

export default function AccountDrawer({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-72 bg-[#0a0b1e] border-l border-cyan-500/10 p-4">
        <h2 className="text-white text-lg mb-4">Account</h2>

        <button
          onClick={() => {
            navigate("/profile");
            onClose();
          }}
          className="w-full text-left text-cyan-400 py-2"
        >
          Profile
        </button>

        <button
          onClick={() => {
            navigate("/plus");
            onClose();
          }}
          className="w-full text-left text-cyan-400 py-2"
        >
          ZWAP+
        </button>

        <button
          onClick={() => {
            navigate("/contact");
            onClose();
          }}
          className="w-full text-left text-cyan-400 py-2"
        >
          Contact
        </button>

        <button
          onClick={() => {
            navigate("/privacy");
            onClose();
          }}
          className="w-full text-left text-cyan-400 py-2"
        >
          Privacy
        </button>

        <button
          onClick={() => {
            navigate("/terms");
            onClose();
          }}
          className="w-full text-left text-cyan-400 py-2"
        >
          Terms
        </button>
      </div>
    </div>
  );
}