import { useEffect, useRef, useState } from "react";
import ThinkingState from "@/components/primitives/Thinking";
import StreamingText from "@/components/primitives/StreamingText";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { replyForPrompt, type DummyReply, SIDEBAR_RECENTS } from "@/lib/dummyReplies";

type Phase = "idle" | "loading" | "streaming" | "done";

export type Turn = {
  id: string;
  prompt: string;
  reply: DummyReply;
  phase: Phase;
  runId: number;
};

/** Survives ChatWorkspace remounts so switching threads never restarts mid-reply */
const turnCache = new Map<string, Turn[]>();
const seededThreads = new Set<string>();

type ChatWorkspaceProps = {
  /** Stable id for this conversation — keeps React state when switching away */
  threadId: string | null;
  /** First prompt when opening a thread for the first time */
  seedPrompt?: string | null;
  onBusyChange?: (busy: boolean) => void;
  onTitleChange?: (title: string | null) => void;
  /** Empty-state compose created a brand-new thread */
  onCreateThread?: (threadId: string, title: string, prompt: string) => void;
};

export default function ChatWorkspace({
  threadId,
  seedPrompt = null,
  onBusyChange,
  onTitleChange,
  onCreateThread,
}: ChatWorkspaceProps) {
  const [turns, setTurns] = useState<Turn[]>(() =>
    threadId ? (turnCache.get(threadId) ?? []) : [],
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const runCounter = useRef(0);

  const startTurn = (prompt: string) => {
    const reply = replyForPrompt(prompt);
    runCounter.current += 1;
    const turn: Turn = {
      id: `${Date.now()}-${runCounter.current}`,
      prompt,
      reply,
      phase: "loading",
      runId: runCounter.current,
    };
    onTitleChange?.(reply.label);
    setTurns((current) => {
      const next = [...current, turn];
      if (threadId) turnCache.set(threadId, next);
      return next;
    });
    return reply;
  };

  // Seed once per thread id (cache-aware — survives remounts)
  useEffect(() => {
    if (!threadId || !seedPrompt) return;
    if (seededThreads.has(threadId) || (turnCache.get(threadId)?.length ?? 0) > 0) {
      seededThreads.add(threadId);
      return;
    }
    seededThreads.add(threadId);
    startTurn(seedPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, seedPrompt]);

  useEffect(() => {
    if (threadId) turnCache.set(threadId, turns);
  }, [threadId, turns]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  const updatePhase = (id: string, phase: Phase) => {
    setTurns((current) => {
      const next = current.map((turn) =>
        turn.id === id && turn.phase !== phase ? { ...turn, phase } : turn,
      );
      if (threadId) turnCache.set(threadId, next);
      return next;
    });
  };

  const regenerate = (turn: Turn) => {
    runCounter.current += 1;
    setTurns((current) => {
      const next = current.map((item) =>
        item.id === turn.id
          ? {
              ...item,
              phase: "loading" as const,
              runId: runCounter.current,
              reply: replyForPrompt(item.prompt),
            }
          : item,
      );
      if (threadId) turnCache.set(threadId, next);
      return next;
    });
  };

  const empty = !threadId;
  const queryRunning = turns.some(
    (turn) => turn.phase === "loading" || turn.phase === "streaming",
  );

  useEffect(() => {
    if (!threadId) {
      onBusyChange?.(false);
      return;
    }
    onBusyChange?.(queryRunning);
  }, [queryRunning, onBusyChange, threadId]);

  const openFromPrompt = (prompt: string) => {
    const reply = replyForPrompt(prompt);
    const recent = SIDEBAR_RECENTS.find(
      (entry) =>
        entry.prompt.toLowerCase() === prompt.toLowerCase() ||
        entry.label.toLowerCase() === reply.label.toLowerCase() ||
        entry.id === reply.id,
    );
    const id = recent?.id ?? reply.id ?? `chat-${Date.now()}`;
    onCreateThread?.(id, recent?.label ?? reply.label, recent?.prompt ?? prompt);
  };

  const handleSend = (message: string) => {
    const prompt = message.trim();
    if (!prompt) return;

    if (!threadId) {
      openFromPrompt(prompt);
      return;
    }

    startTurn(prompt);
  };

  const handleSuggestion = (suggestion: string) => {
    openFromPrompt(suggestion);
  };

  return (
    <div className="gpt-main flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      {empty ? (
        <div className="gpt-empty-state relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-4">
          <div
            className="relative z-10 flex w-full max-w-[500px] flex-col items-center"
            style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <h1 className="gpt-empty-heading mb-8 text-center text-[28px] font-medium tracking-[-0.02em] sm:text-[32px]">
              What&apos;s on your mind today?
            </h1>

            <div className="mb-6 flex w-full max-w-md flex-col">
              {[
                "Compare mint chip to last summer",
                "Find waffle cone suppliers",
                "Analyze our competitors",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="gpt-empty-suggest group flex w-full items-center gap-2.5 py-1.5 text-left"
                >
                  <span className="gpt-empty-suggest-icon flex size-4 shrink-0 items-center justify-center" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="10.5" cy="10.5" r="6.25" stroke="currentColor" strokeWidth="1.7" />
                      <path d="m15.2 15.2 4.3 4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      <path
                        d="M17.2 4.2 17.7 5.6 19.1 6.1 17.7 6.6 17.2 8 16.7 6.6 15.3 6.1 16.7 5.6z"
                        fill="currentColor"
                      />
                      <path
                        d="M20.1 7.4 20.4 8.2 21.2 8.5 20.4 8.8 20.1 9.6 19.8 8.8 19 8.5 19.8 8.2z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="gpt-empty-suggest-label min-w-0 flex-1 text-[14.5px] leading-snug tracking-[-0.01em]">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-full">
              <PromptInputBox placeholder="Ask anything" onSend={handleSend} />
            </div>

            <p className="gpt-empty-footnote mt-3 text-center text-[11.5px]">
              Veda AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-4">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6 pb-10">
              {turns.map((turn) => {
                const thinkingVariant = turn.reply.thinkingVariant ?? "Steps";

                return (
                  <div key={`${turn.id}-${turn.runId}`} className="flex flex-col gap-6">
                    <div className="flex justify-end">
                      <div className="gpt-user-bubble px-4 py-2.5 text-[15px] leading-[1.5]">
                        {turn.prompt}
                      </div>
                    </div>

                    <div className="gpt-thread-prose flex flex-col gap-3">
                      <ThinkingState
                        key={`think-${turn.id}-${turn.runId}`}
                        variant={thinkingVariant}
                        fill
                        settled={turn.phase !== "loading"}
                        onDone={() => updatePhase(turn.id, "streaming")}
                      />

                      {(turn.phase === "streaming" || turn.phase === "done") && (
                        <StreamingText
                          key={`stream-${turn.id}-${turn.runId}`}
                          content={turn.reply.tokens}
                          followUps={turn.reply.followUps}
                          loop={false}
                          fill
                          labels={{ sources: "Sources", followUps: "Ask anything" }}
                          onDone={() => updatePhase(turn.id, "done")}
                          onFollowUp={(text) => startTurn(text)}
                          onAction={(key, plainText) => {
                            if (key === "copy") void navigator.clipboard?.writeText(plainText);
                            if (key === "retry") regenerate(turn);
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="gpt-composer-dock shrink-0 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
            <div
              className={`mx-auto w-full transition-[max-width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                queryRunning ? "max-w-3xl" : "max-w-2xl"
              }`}
            >
              <PromptInputBox
                placeholder="Ask anything"
                isLoading={queryRunning}
                onSend={handleSend}
              />
              <p className="mt-2 text-center text-[11.5px] text-ink-3">
                Veda AI can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
