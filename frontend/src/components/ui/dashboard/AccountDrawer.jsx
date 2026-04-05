import React from "react";
import { Sheet, SheetContent } from "../sheet";
import AccountPanelContent from "@/components/user/AccountPanelContent";

export default function AccountDrawer({
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
        className="h-full w-[calc(100vw-20px)] max-w-[420px] border-l border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] p-0 text-white sm:w-[400px] lg:w-[420px]"
      >
        <AccountPanelContent
          showHeader={true}
          onClose={handleClose}
        />
      </SheetContent>
    </Sheet>
  );
}