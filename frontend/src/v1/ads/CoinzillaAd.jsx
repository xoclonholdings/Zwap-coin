import React, { useEffect, useRef } from "react";

/**
 * Coinzilla Ad Banner — Scaffolding
 * -----------------------------------
 * Loads the Coinzilla ad script and renders a banner ad.
 * Configure zone IDs from your Coinzilla dashboard: https://coinzilla.com
 *
 * Props:
 *   zoneId   — Coinzilla zone ID (required for live ads)
 *   size     — "banner" (320x50) | "leaderboard" (728x90) | "rectangle" (300x250)
 *   fallback — Optional React element to show when ad fails or zone not configured
 */

const AD_SIZES = {
  banner: { width: 320, height: 50 },
  leaderboard: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
};

let scriptLoaded = false;

function loadCoinzillaScript() {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://coinzillatag.com/lib/display.js";
    s.async = true;
    s.onload = () => { scriptLoaded = true; resolve(); };
    s.onerror = () => reject(new Error("Coinzilla script failed to load"));
    document.head.appendChild(s);
  });
}

export default function CoinzillaAd({ zoneId, size = "banner", fallback = null }) {
  const containerRef = useRef(null);
  const dims = AD_SIZES[size] || AD_SIZES.banner;

  useEffect(() => {
    if (!zoneId) {
      console.log(`[Ad] Coinzilla zone not configured for "${size}" placement`);
      return;
    }

    loadCoinzillaScript()
      .then(() => {
        if (containerRef.current && window.coinzilla_display) {
          window.coinzilla_display.push({ zone: zoneId, width: dims.width, height: dims.height });
        }
      })
      .catch(() => console.log("[Ad] Coinzilla script blocked or unavailable"));
  }, [zoneId, dims.width, dims.height, size]);

  // No zone configured — show placeholder or fallback
  if (!zoneId) {
    if (fallback) return fallback;
    return null; // Silent — no ad placeholder in production
  }

  return (
    <div
      ref={containerRef}
      data-testid={`coinzilla-ad-${size}`}
      className="flex items-center justify-center mx-auto"
      style={{ width: dims.width, height: dims.height, maxWidth: "100%" }}
    >
      <div className={`coinzilla`} data-zone={zoneId} />
    </div>
  );
}

// Convenience exports for common placements
export const BannerAd = (props) => <CoinzillaAd size="banner" {...props} />;
export const RectangleAd = (props) => <CoinzillaAd size="rectangle" {...props} />;
