"use client";

import { useState } from "react";
import GlideMenu from "@/components/primitives/GlideMenu";

/* ─────────────────────────────────────────────────────────
 * SEARCH — command search with live filtering.
 * The field, clear action, and results are directly usable.
 * ───────────────────────────────────────────────────────── */

export type SearchItem = string;

export type SearchListLabels = {
  placeholder: string;
  ariaLabel: string;
  emptyTitle: string;
  emptyHint: string;
};

const ITEMS: SearchItem[] = [
  "Forecast summer demand",
  "Find waffle cone suppliers",
  "Compare seasonal flavors",
  "Draft flavor launch plan",
  "Check cold-chain status",
  "Audit sugar costs",
  "Retire low sellers",
];

const LABELS: SearchListLabels = {
  placeholder: "Search chats…",
  ariaLabel: "Search chats",
  emptyTitle: "No results found",
  emptyHint: "Adjust your search to try again",
};

export default function SearchList({
  items = ITEMS,
  labels = LABELS,
  onSelect,
  fill = false,
}: {
  items?: SearchItem[];
  labels?: SearchListLabels;
  variant?: string;
  fill?: boolean;
  onSelect?: (item: string) => void;
} = {}) {
  const [query, setQuery] = useState("");
  const results = query
    ? items.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
    : items.slice(0, 5);
  const empty = query.length > 2 && results.length === 0;

  return (
    <div className={`flex w-full flex-col items-stretch ${fill ? "" : "min-h-[248px] max-w-72"}`}>
      <div className="w-full self-start overflow-hidden rounded-card bg-surface shadow-raised">
        <div className="flex h-10 items-center gap-2 border-b border-line px-3 transition-colors duration-100 hover:bg-hover">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-3)"
            strokeWidth="2"
            strokeLinecap="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.placeholder}
            aria-label={labels.ariaLabel}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
          {query && (
            <button
              aria-label="Clear search"
              type="button"
              onClick={() => setQuery("")}
              className="flex size-6 items-center justify-center rounded-full text-ink-3
                transition-colors duration-100 hover:bg-line/70 hover:text-ink"
              style={{ animation: "fade-in 150ms ease-out both" }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {empty ? (
          <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <p className="text-[13px] font-medium text-ink">{labels.emptyTitle}</p>
            <p className="text-[12px] text-ink-3">{labels.emptyHint}</p>
          </div>
        ) : (
          <GlideMenu
            rowSelector="[data-menu-row]"
            highlightClassName="inset-x-1 rounded-[6px] bg-hover"
            className="flex flex-col gap-px p-1"
          >
            {results.map((item) => (
              <button
                key={item}
                data-menu-row
                type="button"
                onClick={() => onSelect?.(item)}
                className="relative z-10 flex h-8 w-full items-center rounded-[6px] px-2 text-left text-[13px] text-ink"
                style={{ animation: "fade-in 200ms ease-out both" }}
              >
                {item}
              </button>
            ))}
          </GlideMenu>
        )}
      </div>
    </div>
  );
}
