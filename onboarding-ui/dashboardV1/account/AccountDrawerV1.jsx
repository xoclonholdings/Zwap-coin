import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AccountPanelContentV1 from "./AccountPanelContentV1";

export default function AccountDrawerV1({
  open = false,
  onOpenChange,
  trigger,
}) {
  const handleOpen = () => {
    onOpenChange?.(true);
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <div onClick={handleOpen} className="cursor-pointer">
          {trigger}
        </div>
      ) : null}

      <SheetContent
        side="right"
        className="
          h-full
          w-[calc(100vw-18px)]
          max-w-[410px]
          border-l border-white/10
          bg-[linear-gradient(180deg,rgba(8,10,22,0.98)_0%,rgba(10,12,28,0.985)_28%,rgba(7,9,20,1)_100%)]
          p-0
          text-white
          shadow-[-24px_0_60px_rgba(0,0,0,0.45)]
          backdrop-blur-xl
          sm:w-[390px]
        "
      >
        <div className="relative flex h-full flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_70%)]" />
            <div className="absolute right-0 top-24 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-fuchsia-500/5 blur-3xl" />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <AccountPanelContentV1 onClose={handleClose} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}