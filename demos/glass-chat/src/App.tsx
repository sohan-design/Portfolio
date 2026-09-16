import { useCallback, useEffect, useState } from "react";
import SidebarNav from "@/components/primitives/SidebarNav";
import SearchList from "@/components/primitives/SearchList";
import ChatWorkspace from "@/components/ChatWorkspace";
import ThemeToggle from "@/components/ThemeToggle";
import { SEARCH_ITEMS, SIDEBAR_RECENTS } from "@/lib/dummyReplies";
import { useTheme } from "@/lib/useTheme";

type ThreadMeta = {
  id: string;
  label: string;
  prompt: string;
};

export default function App() {
  const { isDark, toggle } = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const openThread = useCallback((id: string, label: string, prompt: string) => {
    setThreads((current) =>
      current.some((thread) => thread.id === id)
        ? current
        : [...current, { id, label, prompt }],
    );
    setActiveId(id);
    setActiveTitle(label);
    setSearchOpen(false);
  }, []);

  const bootThread = (id: string, label: string, prompt?: string) => {
    openThread(id, label, prompt ?? label);
  };

  const newChat = () => {
    setActiveId(null);
    setActiveTitle(null);
    setSearchOpen(false);
  };

  const onCreateThread = useCallback(
    (threadId: string, title: string, prompt: string) => {
      openThread(threadId, title, prompt);
    },
    [openThread],
  );

  const onBusyChange = useCallback((threadId: string, busy: boolean) => {
    setBusyIds((current) => {
      const has = current.includes(threadId);
      if (busy && !has) return [...current, threadId];
      if (!busy && has) return current.filter((id) => id !== threadId);
      return current;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sidebarRecents = [
    ...threads
      .filter((thread) => !SIDEBAR_RECENTS.some((recent) => recent.id === thread.id))
      .map((thread) => ({ id: thread.id, label: thread.label, prompt: thread.prompt })),
    ...SIDEBAR_RECENTS,
  ];

  return (
    <div className="gpt-shell flex h-full overflow-hidden text-ink">
      <div className="flex h-full w-full overflow-hidden">
        <SidebarNav
          fill
          className="gpt-sidebar"
          activeTitle={activeTitle}
          busyIds={busyIds}
          recents={sidebarRecents}
          onNewChat={newChat}
          onPick={(id, label, prompt) => bootThread(id, label, prompt)}
          themeToggle={<ThemeToggle isDark={isDark} onToggle={toggle} />}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className={`absolute inset-0 flex ${
              activeId === null ? "z-10" : "pointer-events-none hidden"
            }`}
          >
            <ChatWorkspace
              threadId={null}
              onCreateThread={onCreateThread}
              onTitleChange={setActiveTitle}
            />
          </div>

          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`absolute inset-0 flex ${
                activeId === thread.id ? "z-10" : "pointer-events-none hidden"
              }`}
            >
              <ChatWorkspace
                threadId={thread.id}
                seedPrompt={thread.prompt}
                onBusyChange={(busy) => onBusyChange(thread.id, busy)}
                onTitleChange={(title) => {
                  if (title) {
                    setThreads((current) =>
                      current.map((entry) =>
                        entry.id === thread.id ? { ...entry, label: title } : entry,
                      ),
                    );
                  }
                  if (activeId === thread.id) setActiveTitle(title);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[14vh] backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg"
            style={{ animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <SearchList
              fill
              items={SEARCH_ITEMS}
              onSelect={(item) => {
                const recent = SIDEBAR_RECENTS.find(
                  (entry) => entry.label === item || entry.prompt === item,
                );
                bootThread(
                  recent?.id ?? `search-${Date.now()}`,
                  recent?.label ?? item,
                  recent?.prompt ?? item,
                );
              }}
            />
            <p className="mt-2 text-center text-[12px] text-ink-3">
              Esc to close · ⌘K / Ctrl+K to toggle
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
