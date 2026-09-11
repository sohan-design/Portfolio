import { useEffect, useState, type MouseEvent } from "react";
import {
  applyTheme,
  resolveTheme,
  setThemeFromPoint,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document === "undefined" ? "light" : resolveTheme(),
  );

  useEffect(() => {
    setTheme(applyTheme(resolveTheme()));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme()) return;
      setTheme(applyTheme(event.matches ? "dark" : "light"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = (event?: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const rect = event?.currentTarget.getBoundingClientRect();
    setThemeFromPoint(
      next,
      rect ? rect.left + rect.width / 2 : undefined,
      rect ? rect.top + rect.height / 2 : undefined,
    );
    setTheme(next);
  };

  return { theme, toggle, isDark: theme === "dark" };
}
