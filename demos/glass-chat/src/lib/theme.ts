const STORAGE_KEY = "portfolio-theme";

export type Theme = "dark" | "light";

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function systemPrefersDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function resolveTheme(): Theme {
  return getStoredTheme() ?? (systemPrefersDark() ? "dark" : "light");
}

export function applyTheme(theme: Theme) {
  const next: Theme = theme === "dark" ? "dark" : "light";
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  root.style.colorScheme = next;
  root.classList.toggle("dark", next === "dark");
  return next;
}

export function setThemeFromPoint(theme: Theme, x?: number, y?: number) {
  const root = document.documentElement;
  const originX = typeof x === "number" ? x : window.innerWidth / 2;
  const originY = typeof y === "number" ? y : window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY),
  );

  root.style.setProperty("--theme-origin-x", `${originX}px`);
  root.style.setProperty("--theme-origin-y", `${originY}px`);
  root.style.setProperty("--theme-radius", `${Math.ceil(radius)}px`);
  root.style.setProperty("--theme-x", `${originX}px`);
  root.style.setProperty("--theme-y", `${originY}px`);

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const run = () => {
    applyTheme(theme);
    storeTheme(theme);
  };

  const clearFlags = () => {
    root.removeAttribute("data-theme-transition");
    root.removeAttribute("data-theme-animating");
    root.classList.remove("theme-animating");
  };

  if (!reduce && typeof document.startViewTransition === "function") {
    root.setAttribute("data-theme-transition", theme);
    root.setAttribute("data-theme-animating", "");
    root.classList.add("theme-animating");
    const transition = document.startViewTransition(run);
    Promise.resolve(transition.finished).then(clearFlags, clearFlags);
    return;
  }

  run();
}
