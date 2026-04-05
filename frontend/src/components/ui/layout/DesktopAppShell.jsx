import React, { useEffect } from "react";

const MOBILE_FRAME_WIDTH = 430;
const MOBILE_FRAME_HEIGHT = 900;

function tryResizeDesktopWindow() {
  if (typeof window === "undefined") return;

  const isWideDesktop = window.innerWidth >= 900;
  if (!isWideDesktop) return;

  const alreadyAttempted =
    sessionStorage.getItem("zwap_desktop_resize_attempted") === "1";

  if (alreadyAttempted) return;

  sessionStorage.setItem("zwap_desktop_resize_attempted", "1");

  try {
    const targetWidth = Math.min(MOBILE_FRAME_WIDTH, window.screen.availWidth);
    const targetHeight = Math.min(MOBILE_FRAME_HEIGHT, window.screen.availHeight);

    const left = Math.max(0, Math.floor((window.screen.availWidth - targetWidth) / 2));
    const top = Math.max(0, Math.floor((window.screen.availHeight - targetHeight) / 2));

    window.resizeTo(targetWidth, targetHeight);
    window.moveTo(left, top);
  } catch (error) {
    console.log("Desktop window resize not allowed:", error);
  }
}

export default function DesktopAppShell({ children }) {
  useEffect(() => {
    tryResizeDesktopWindow();
  }, []);

  return (
    <div className="min-h-full bg-[#050510] text-white">
      <div className="mx-auto w-full max-w-[430px] px-3 pb-4 pt-2 sm:px-4">
        <div className="w-full rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_20px_60px_rgba(0,0,0,0.28)] overflow-hidden">
          <div className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-4 px-1 py-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}