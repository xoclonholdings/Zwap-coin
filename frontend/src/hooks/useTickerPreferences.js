import { useEffect, useMemo, useState } from "react";
import {
  OPTIONAL_CATEGORIES,
  STORAGE_KEY,
} from "@/lib/ticker/constants";
import { buildEnabledCategories } from "@/lib/ticker/utils";

const defaultPreferences = OPTIONAL_CATEGORIES.reduce((acc, category) => {
  acc[category] = true;
  return acc;
}, {});

export default function useTickerPreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      setPreferences((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch (error) {
      console.error("Failed to load ticker preferences:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save ticker preferences:", error);
    }
  }, [preferences]);

  const enabledCategories = useMemo(
    () => buildEnabledCategories(preferences),
    [preferences]
  );

  const toggleCategory = (category) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return {
    preferences,
    enabledCategories,
    toggleCategory,
  };
}
