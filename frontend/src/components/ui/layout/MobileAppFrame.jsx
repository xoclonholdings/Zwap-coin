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
  } catch (e) {
    console.log("Resize blocked:", e);
  }
}

export default function MobileAppFrame({ children }) {
  useEffect(() => {
    attemptDesktopResize();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050510] text-white">
      {/* CENTERED MOBILE FRAME */}
      <div className="mx-auto w-full max-w-[430px] min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}