import type { MouseEvent } from "react";

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
};

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      className={`theme-toggle${isDark ? " is-dark" : ""}`}
      type="button"
      data-theme-toggle
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={onToggle}
    >
      <span className="theme-toggle-icons" aria-hidden="true">
        <svg
          className="theme-icon theme-icon-sun"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
        <svg
          className="theme-icon theme-icon-moon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      </span>
    </button>
  );
}
