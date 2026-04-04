import React from "react";
import { useNavigate } from "react-router-dom";

export default function AccountDrawer({
  open = false,
  onOpenChange,
  trigger,
}) {
  const navigate = useNavigate();

  const closeDrawer = () => {
    onOpenChange?.(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeDrawer();
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => onOpenChange?.(true)}>
          {trigger}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDrawer}
          />

          <div className="relative ml-auto w-72 border-l border-cyan-500/10 bg-[#0a0b1e] p-4">
            <h2 className="mb-4 text-lg text-white">Account</h2>

            <button
              onClick={() => handleNavigate("/profile")}
              className="w-full py-2 text-left text-cyan-400"
            >
              Profile
            </button>

            <button
              onClick={() => handleNavigate("/plus")}
              className="w-full py-2 text-left text-cyan-400"
            >
              ZWAP+
            </button>

            <button
              onClick={() => handleNavigate("/contact")}
              className="w-full py-2 text-left text-cyan-400"
            >
              Contact
            </button>

            <button
              onClick={() => handleNavigate("/privacy")}
              className="w-full py-2 text-left text-cyan-400"
            >
              Privacy
            </button>

            <button
              onClick={() => handleNavigate("/terms")}
              className="w-full py-2 text-left text-cyan-400"
            >
              Terms
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}