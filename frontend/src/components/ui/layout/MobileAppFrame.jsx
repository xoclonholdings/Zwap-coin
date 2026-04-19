import React, { useEffect } from "react";

const MOBILE_WIDTH = 430;
const MOBILE_HEIGHT = 900;

function attemptDesktopResize() {
  if (typeof window === "undefined") return;

  const isDesktop = window.innerWidth >= 900;
  if (!isDesktop) return;

  const alreadyTried =
    sessionStorage.getItem("zwap_resize_attempted") === "1";

  if (alreadyTried) return;

  sessionStorage.setItem("zwap_resize_attempted", "1");

  try {
    const width = Math.min(MOBILE_WIDTH, window.screen.availWidth);
    const height = Math.min(MOBILE_HEIGHT, window.screen.availHeight);

    const left = Math.max(
      0,
      Math.floor((window.screen.availWidth - width) / 2)
    );

    const top = Math.max(
      0,
      Math.floor((window.screen.availHeight - height) / 2)
    );

    window.resizeTo(width, height);
    window.moveTo(left, top);
  } catch (error) {
    console.log("Resize blocked:", error);
  }
}

export default function MobileAppFrame({ children }) {
  useEffect(() => {
    attemptDesktopResize();
  }, []);

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#050510] text-white">
      <div className="mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden md:px-0">
        <div className="relative isolate flex h-full w-full transform-gpu flex-col overflow-hidden border-x border-white/5 bg-[#0a0b1e] shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        {children}
        </div>
      </div>
    </div>
  );
}
