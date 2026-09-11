"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import GlideMenu from "@/components/primitives/GlideMenu";

function Icon({ children, size = 18, className = "" }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

const I = {
  home: (size = 18) => <Icon size={size}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></Icon>,
  userAdd: (size = 18) => <Icon size={size}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></Icon>,
  edit: (size = 18) => <Icon size={size}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>,
  search: (size = 18) => <Icon size={size}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>,
  cross: (size = 18) => <Icon size={size}><path d="M18 6 6 18M6 6l12 12" /></Icon>,
  chevron: (size = 18) => <Icon size={size}><path d="m6 9 6 6 6-6" /></Icon>,
  sidebar: (size = 18, className = "") => <Icon size={size} className={className}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></Icon>,
  check: (size = 18) => <Icon size={size}><path d="m5 12 5 5L20 7" /></Icon>,
  plus: (size = 18) => <Icon size={size}><path d="M12 5v14M5 12h14" /></Icon>,
  gear: (size = 18) => <Icon size={size}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></Icon>,
  logout: (size = 18) => <Icon size={size}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></Icon>,
  popsicle: (size = 18) => <Icon size={size}><path d="M8 3h8v11a4 4 0 0 1-8 0Z" /><path d="M12 14v7" /></Icon>,
};


/* ─────────────────────────────────────────────────────────
 * SIDEBAR NAV
 * Shared by the design-system preview and the harness shell:
 * compact workspace switcher, primary navigation, searchable
 * chat history, and a collapse that preserves icon alignment.
 * ───────────────────────────────────────────────────────── */

const WORKSPACE = { key: "veda-ai", name: "Veda AI", monogram: "V" };

const NAV_ITEMS = [
  { key: "home", label: "Library", icon: I.home() },
  { key: "invite", label: "GPTs", icon: I.userAdd() },
];

export type SidebarRecent = {
  id: string;
  label: string;
  prompt?: string;
};

const DEFAULT_RECENTS: SidebarRecent[] = [
  { id: "suppliers", label: "Supplier records" },
  { id: "todos", label: "Urgent to-dos this morning" },
  { id: "flavor", label: "Flavor page ticket" },
  { id: "workload", label: "Workload summary" },
  { id: "offboarding", label: "Off-board a supplier" },
  { id: "restock", label: "Batch restock function" },
  { id: "edits", label: "Propose flavor edits" },
  { id: "subway", label: "Subway surfing" },
];

type SidebarNavProps = {
  activeTitle?: string | null;
  className?: string;
  fill?: boolean;
  onNewChat?: () => void;
  onPick?: (id: string, label: string, prompt?: string) => void;
  /** controlled primary-nav selection (e.g. "home" | "invite") */
  activeNav?: string;
  onNavigate?: (key: string) => void;
  recents?: SidebarRecent[];
  variant?: string;
  themeToggle?: ReactNode;
};

const SIDEBAR_MOTION = {
  expandedWidth: 260,
  collapsedWidth: 52,
  duration: 280,
  copyDuration: 180,
  copyOffset: 8,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

/* ─────────────────────────────────────────────────────────
 * CHAT SEARCH STORYBOARD
 *
 *   0ms   search is triggered; Chats label begins fading
 *   0ms   field grows right → left from the search control
 * 180ms   field fills the row; cursor is focused and ready
 * ───────────────────────────────────────────────────────── */
const CHAT_SEARCH_MOTION = {
  duration: 180,
  closedWidth: 28,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

function GlideGroup({ children }: { children: ReactNode }) {
  return (
    <GlideMenu
      rowSelector="[data-row]"
      highlightClassName="sidebar-glide-highlight rounded-[7px] bg-hover-2"
      className="group/glide flex flex-col gap-px"
    >
      {children}
    </GlideMenu>
  );
}

function RailButton({
  icon,
  label,
  active = false,
  count,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  count?: string;
  onClick?: () => void;
}) {
  return (
    <button
      data-row
      type="button"
      onClick={onClick}
      className={`sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left
        transition-[width,background-color,color,transform] duration-150 active:scale-[0.98]
        ${active ? "bg-hover-2 group-hover/glide:bg-transparent" : ""}`}
    >
      <span className={`flex size-5 shrink-0 items-center justify-center ${active ? "text-ink" : "text-ink-2"}`}>
        {icon}
      </span>
      <span className={`sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[14px] font-medium ${active ? "text-ink" : "text-ink-2"}`}>
        {label}
      </span>
      {count && (
        <span className="sidebar-copy mr-2 shrink-0 text-[12px] font-medium tabular-nums text-ink-3">
          {count}
        </span>
      )}
    </button>
  );
}

function WorkspaceMenu({
  position,
  onClose,
}: {
  position: { top: number; left: number };
  onClose: () => void;
}) {
  return createPortal(
    <div
      data-workspace-menu
      className="fixed z-50 w-64 rounded-[14px] bg-surface p-1.5 shadow-overlay"
      style={{
        top: position.top,
        left: position.left,
        animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both",
        transformOrigin: "top left",
      }}
    >
      <GlideMenu className="flex flex-col gap-px" highlightClassName="inset-x-0 rounded-[8px] bg-hover-2">
        <button
          data-menu-row
          type="button"
          onClick={onClose}
          className="relative z-10 flex h-10 w-full items-center gap-1.5 rounded-[8px] px-2 text-left"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-ink text-[11px] font-semibold text-surface">
            {WORKSPACE.monogram}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">{WORKSPACE.name}</span>
          <span className="shrink-0 text-ink">{I.check()}</span>
        </button>
        <div className="my-1 h-px bg-line" />
        {[
          { label: "New workspace", icon: I.plus(16) },
          { label: "Workspace settings", icon: I.gear(16) },
          { label: "Invite team members", icon: I.userAdd(16) },
        ].map((item) => (
          <button
            key={item.label}
            data-menu-row
            type="button"
            onClick={onClose}
            className="relative z-10 flex h-9 w-full items-center gap-1.5 rounded-[8px] px-2 text-left"
          >
            <span className="flex size-5 shrink-0 items-center justify-center text-ink-2">{item.icon}</span>
            <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{item.label}</span>
          </button>
        ))}
        <div className="my-1 h-px bg-line" />
        <button
          data-menu-row
          type="button"
          onClick={onClose}
          className="relative z-10 flex h-9 w-full items-center gap-1.5 rounded-[8px] px-2 text-left"
        >
          <span className="flex size-5 shrink-0 items-center justify-center text-ink-2">{I.logout(16)}</span>
          <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">Sign out</span>
        </button>
      </GlideMenu>
    </div>,
    document.body,
  );
}

export default function SidebarNav({
  activeTitle,
  className = "",
  fill = false,
  onNewChat,
  onPick,
  activeNav,
  onNavigate,
  recents = DEFAULT_RECENTS,
  themeToggle,
}: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [internalNav, setInternalNav] = useState("chats");
  const currentNav = activeNav ?? internalNav;
  const selectNav = (key: string) => {
    setInternalNav(key);
    onNavigate?.(key);
  };
  const [demoActiveTitle, setDemoActiveTitle] = useState<string | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspacePosition, setWorkspacePosition] = useState({ top: 0, left: 0 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const workspaceButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedTitle = activeTitle === undefined ? demoActiveTitle : activeTitle;
  const visibleRecents = recents.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!workspaceOpen) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-workspace-trigger]") && !target.closest("[data-workspace-menu]")) {
        setWorkspaceOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [workspaceOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const collapse = () => {
    setCollapsed(true);
    setWorkspaceOpen(false);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <aside
      data-sidebar-collapsed={collapsed}
      aria-label="Workspace navigation"
      className={`relative flex shrink-0 overflow-hidden transition-[width] ${fill ? "h-full" : "h-[600px]"} ${className}`}
      style={{
        width: collapsed ? SIDEBAR_MOTION.collapsedWidth : SIDEBAR_MOTION.expandedWidth,
        transitionDuration: `${SIDEBAR_MOTION.duration}ms`,
        transitionTimingFunction: SIDEBAR_MOTION.easing,
        "--sidebar-copy-duration": `${SIDEBAR_MOTION.copyDuration}ms`,
        "--sidebar-copy-offset": `${SIDEBAR_MOTION.copyOffset}px`,
        "--sidebar-easing": SIDEBAR_MOTION.easing,
      } as CSSProperties}
    >
      <div className="flex min-h-0 w-[260px] shrink-0 flex-col">
        <div className="relative mb-2.5 h-10 shrink-0">
          <button
            ref={workspaceButtonRef}
            data-workspace-trigger
            type="button"
            aria-expanded={workspaceOpen}
            aria-hidden={collapsed}
            tabIndex={collapsed ? -1 : 0}
            onClick={() => {
              if (!workspaceOpen && workspaceButtonRef.current) {
                const rect = workspaceButtonRef.current.getBoundingClientRect();
                setWorkspacePosition({ top: rect.bottom + 6, left: rect.left });
              }
              setWorkspaceOpen((open) => !open);
            }}
            className="sidebar-workspace-control absolute left-2 top-1 flex h-8 w-[200px] items-center rounded-[10px] px-2 text-left transition-[background-color,transform] duration-100 hover:bg-hover-2 active:scale-[0.99]"
          >
            <span className="sidebar-logo flex size-5 shrink-0 items-center justify-center text-ink">
              {I.popsicle()}
            </span>
            <span className="sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[14px] font-medium text-ink-2">
              {WORKSPACE.name}
            </span>
            <span className="sidebar-copy ml-1 flex shrink-0 text-ink-3">
              {I.chevron(16)}
            </span>
          </button>

          {workspaceOpen && <WorkspaceMenu position={workspacePosition} onClose={() => setWorkspaceOpen(false)} />}

          <button
            type="button"
            aria-label="Collapse sidebar"
            aria-hidden={collapsed}
            tabIndex={collapsed ? -1 : 0}
            onClick={collapse}
            className="sidebar-collapse-control absolute right-2 top-1 flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink"
          >
            {I.sidebar()}
          </button>
          <button
            type="button"
            aria-label="Expand sidebar"
            aria-hidden={!collapsed}
            tabIndex={collapsed ? 0 : -1}
            onClick={() => setCollapsed(false)}
            className="sidebar-expand-control absolute left-2 top-0.5 flex size-9 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink"
          >
            {I.sidebar(18, "rotate-180")}
          </button>
        </div>

        <GlideGroup>
          <RailButton
            icon={I.edit()}
            label="New chat"
            onClick={() => {
              if (activeTitle === undefined) setDemoActiveTitle(null);
              selectNav("chats");
              onNewChat?.();
            }}
          />
          {NAV_ITEMS.map((item) => (
            <RailButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              count={item.count}
              active={currentNav === item.key}
              onClick={() => selectNav(item.key)}
            />
          ))}
        </GlideGroup>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          <div className="sidebar-copy relative mx-2 mb-1 h-8">
            <div
              aria-hidden={searchOpen}
              className={`absolute inset-0 flex items-center gap-1.5 px-2 text-[12.5px] font-medium text-ink-3 transition-[opacity,transform] ${searchOpen ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100"}`}
              style={{ transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms`, transitionTimingFunction: CHAT_SEARCH_MOTION.easing }}
            >
              {I.chevron(16)}
              <span>Chats</span>
            </div>

            <button
              type="button"
              aria-label="Search chats"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className={`absolute right-0 top-0 z-10 flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color,transform] hover:bg-hover-2 hover:text-ink active:scale-[0.96] ${searchOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
              style={{ transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms` }}
            >
              {I.search(16)}
            </button>

            <div
              className={`absolute right-0 top-0 z-20 flex h-8 items-center overflow-hidden rounded-[8px] bg-field text-ink-3 shadow-hairline transition-[width,opacity] focus-within:text-ink-2 ${searchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
              style={{
                width: searchOpen ? "100%" : CHAT_SEARCH_MOTION.closedWidth,
                transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms`,
                transitionTimingFunction: CHAT_SEARCH_MOTION.easing,
              }}
            >
              <span className="ml-2 flex shrink-0 items-center justify-center">
                {I.search(15)}
              </span>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search chats"
                aria-label="Search chat history"
                className="ml-1.5 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink outline-none placeholder:text-ink-3"
              />
              <button
                type="button"
                aria-label="Close chat search"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover-2 hover:text-ink active:scale-[0.96]"
              >
                {I.cross(16)}
              </button>
            </div>
          </div>

          <GlideGroup>
            {visibleRecents.map((item) => {
              const active = item.label === selectedTitle;
              return (
                <button
                  key={item.id}
                  data-row
                  type="button"
                  title={item.label}
                  onClick={() => {
                    selectNav("chats");
                    if (activeTitle === undefined) setDemoActiveTitle(item.label);
                    onPick?.(item.id, item.label, item.prompt);
                  }}
                  className={`sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left transition-[width,background-color,color,transform] duration-150 active:scale-[0.98] ${
                    active ? "bg-hover-2 group-hover/glide:bg-transparent" : ""
                  }`}
                >
                  <span className={`sidebar-copy min-w-0 flex-1 truncate text-[14px] font-medium ${active ? "text-ink" : "text-ink-2"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            {query && visibleRecents.length === 0 && (
              <div className="sidebar-copy mx-2 px-2 py-2 text-[12.5px] text-ink-3">No chats found</div>
            )}
          </GlideGroup>
        </div>

        {themeToggle && (
          <div className="mt-auto flex shrink-0 items-center px-2 pb-3 pt-2">
            <div className="flex size-8 items-center justify-center">
              {themeToggle}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
