import { useState } from "react";
import TermSheet from "@/components/ui/TermSheet";

export default function TermTrigger({
  term,
  children,
  className = "",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center underline decoration-dotted underline-offset-4 text-cyan-300 hover:text-cyan-200 transition-colors ${className}`}
      >
        {children}
      </button>

      <TermSheet
        term={term}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}