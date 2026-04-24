import { useEffect, useState } from "react";

export default function useLandingSequence() {
  const [phase, setPhase] = useState(null);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (skipped) return;

    let cancelled = false;
    let timer;

    const wait = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const run = async () => {
      // PHASE 0
      setPhase(0);
      await wait(900);    // fade in
      if (cancelled) return;
      await wait(1200);   // hold

      setPhase(null);     // CLEAR
      await wait(450);

      // PHASE 1
      setPhase(1);
      await wait(1500);

      setPhase(null);
      await wait(500);

      // PHASE 2
      setPhase(2);
      await wait(1900);

      setPhase(null);
      await wait(550);

      // PHASE 3
      setPhase(3);
      await wait(1600);

      setPhase(null);
      await wait(500);

      // ACTION
      setPhase(4);
    };

    run();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [skipped]);

  const skip = () => {
    setSkipped(true);
    setPhase(4);
  };

  return { phase, skip, skipped };
}