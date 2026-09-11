import { useEffect, useState } from "react";
import SidebarNav from "@/components/primitives/SidebarNav";
import SearchList from "@/components/primitives/SearchList";
import ChatWorkspace from "@/components/ChatWorkspace";
import ThemeToggle from "@/components/ThemeToggle";
import { SEARCH_ITEMS, SIDEBAR_RECENTS } from "@/lib/dummyReplies";
import { useTheme } from "@/lib/useTheme";

export default function App() {
  const { isDark, toggle } = useTheme();
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [seedPrompt, setSeedPrompt] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  const bootThread = (label: string, prompt?: string) => {
    setActiveTitle(label);
    setSeedPrompt(prompt ?? label);
    setResetToken((value) => value + 1);
    setSearchOpen(false);
  };

  const newChat = () => {
    setActiveTitle(null);
    setSeedPrompt(null);
    setResetToken((value) => value + 1);
    setSearchOpen(false);
  };

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

  return (
    <div className="gpt-shell flex h-full overflow-hidden text-ink">
      <div className="flex h-full w-full overflow-hidden">
        <SidebarNav
          fill
          className="gpt-sidebar"
          activeTitle={activeTitle}
          recents={SIDEBAR_RECENTS}
          onNewChat={newChat}
          onPick={(_id, label, prompt) => bootThread(label, prompt)}
          themeToggle={<ThemeToggle isDark={isDark} onToggle={toggle} />}
        />

        <ChatWorkspace seedPrompt={seedPrompt} resetToken={resetToken} />
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
              onSelect={(item) => bootThread(item, item)}
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
