import React, { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";

function InputField({ label, value, onChange, placeholder = "" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-[44px] w-full rounded-[14px]
          border border-white/10
          bg-white/[0.04]
          px-3
          text-[14px] font-medium text-white
          outline-none
          focus:border-cyan-300/30 focus:bg-white/[0.06]
        "
      />
    </div>
  );
}

export default function EditProfileView({
  onBack,
  onSave,
  username = "",
  email = "",
}) {
  const [localUsername, setLocalUsername] = useState(username);
  const [localEmail, setLocalEmail] = useState(email);

  const handleSave = () => {
    onSave?.({
      username: localUsername,
      email: localEmail,
    });

    onBack?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      
      {/* Header */}
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          Edit Profile
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-full
            border border-cyan-300/20
            bg-cyan-400/10
            text-cyan-100
            shadow-[0_0_18px_rgba(34,211,238,0.14)]
            active:scale-[0.97]
          "
          aria-label="Save profile"
        >
          <Check size={16} strokeWidth={2.4} />
        </button>
      </div>

      {/* Body */}
      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          
          {/* Username */}
          <InputField
            label="Username"
            value={localUsername}
            onChange={setLocalUsername}
            placeholder="Enter username"
          />

          {/* Email */}
          <InputField
            label="Email"
            value={localEmail}
            onChange={setLocalEmail}
            placeholder="Enter email"
          />

          {/* Avatar note (V1 placeholder, no new system added) */}
          <div className="mt-2 text-[11px] text-white/40">
            Avatar editing will be available in a later update.
          </div>
        </div>
      </div>
    </div>
  );
}