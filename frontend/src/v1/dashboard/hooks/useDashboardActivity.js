import { useEffect, useState } from "react";
import { getActivityDashboard } from "../activity/activityApi";

export default function useDashboardActivity({ resolvedEmail }) {
  const [activitySnapshot, setActivitySnapshot] = useState(null);
  const [activitySignal, setActivitySignal] = useState(null);

  const refreshActivitySnapshot = async () => {
    if (!resolvedEmail) return null;

    try {
      const data = await getActivityDashboard(resolvedEmail);

      setActivitySnapshot(data || null);
      setActivitySignal(data?.latestActivitySignal || null);

      return data;
    } catch (error) {
      console.error("Activity snapshot failed:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadActivity() {
      if (!resolvedEmail) {
        setActivitySnapshot(null);
        setActivitySignal(null);
        return;
      }

      try {
        const data = await getActivityDashboard(resolvedEmail);

        if (!mounted) return;

        setActivitySnapshot(data || null);
        setActivitySignal(data?.latestActivitySignal || null);
      } catch (error) {
        if (!mounted) return;

        console.error("Activity load failed:", error);
        setActivitySnapshot(null);
        setActivitySignal(null);
      }
    }

    loadActivity();

    return () => {
      mounted = false;
    };
  }, [resolvedEmail]);

  return {
    activitySnapshot,
    activitySignal,
    setActivitySignal,
    refreshActivitySnapshot,
  };
}