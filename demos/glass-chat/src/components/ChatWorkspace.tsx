import { useEffect, useRef, useState } from "react";
import LoadingState from "@/components/primitives/LoadingState";
import StreamingText from "@/components/primitives/StreamingText";
import PromptBar from "@/components/primitives/PromptBar";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { replyForPrompt, type DummyReply } from "@/lib/dummyReplies";

type Phase = "idle" | "loading" | "streaming" | "done";

type Turn = {
  id: string;
  prompt: string;
  reply: DummyReply;
  phase: Phase;
  runId: number;
};

type ChatWorkspaceProps = {
  seedPrompt?: string | null;
  resetToken?: number;
};

const EMPTY_GRADIENT =
  "radial-gradient(125% 125% at 50% 101%, rgba(245,87,2,1) 10.5%, rgba(245,120,2,1) 16%, rgba(245,140,2,1) 17.5%, rgba(245,170,100,1) 25%, rgba(238,174,202,1) 40%, rgba(202,179,214,1) 65%, rgba(148,201,233,1) 100%)";

export default function ChatWorkspace({
  seedPrompt = null,
  resetToken = 0,
}: ChatWorkspaceProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
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
    setActiveTitle(reply.label);
    setTurns((current) => [...current, turn]);
  };

  useEffect(() => {
    setTurns([]);
    setActiveTitle(null);
    if (seedPrompt) startTurn(seedPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  useEffect(() => {
    const loading = turns.find((turn) => turn.phase === "loading");
    if (!loading) return;
    // Pixel-grid loader stays up for most of the wait (~7s), then reply streams.
    const t = setTimeout(() => {
      setTurns((current) =>
        current.map((turn) =>
          turn.id === loading.id ? { ...turn, phase: "streaming" } : turn,
        ),
      );
    }, 7000);
    return () => clearTimeout(t);
  }, [turns]);

  const updatePhase = (id: string, phase: Phase) => {
    setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, phase } : turn)));
  };

  const regenerate = (turn: Turn) => {
    runCounter.current += 1;
    setTurns((current) =>
      current.map((item) =>
        item.id === turn.id
          ? {
              ...item,
              phase: "loading",
              runId: runCounter.current,
              reply: replyForPrompt(item.prompt),
            }
          : item,
      ),
    );
  };

  const empty = turns.length === 0;

  return (
    <div className="gpt-main flex h-full min-w-0 flex-1 flex-col">
      {empty ? (
        <div
          className="relative flex min-h-0 flex-1 w-full items-center justify-center overflow-hidden px-4"
          style={{ backgroundImage: EMPTY_GRADIENT }}
        >
          <div
            className="relative z-10 flex w-full max-w-[500px] flex-col items-center"
            style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <h1 className="mb-3 text-center text-[28px] font-medium tracking-[-0.02em] text-[#1a1a1a] sm:text-[32px]">
              What&apos;s on your mind today?
            </h1>
            <p className="mb-8 max-w-md text-center text-[14px] leading-relaxed text-[#1a1a1a]/70">
              Dummy replies with Beautiful UI loaders — no backend required.
            </p>

            <div className="mb-6 grid w-full gap-3 sm:grid-cols-3">
              {[
                "Compare mint chip to last summer",
                "Find waffle cone suppliers",
                "Analyze our competitors",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => startTurn(suggestion)}
                  className="rounded-2xl border border-black/10 bg-white/55 px-4 py-3 text-left text-[13.5px] leading-snug text-[#1a1a1a] backdrop-blur-sm transition-colors hover:bg-white/75"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="w-full">
              <PromptInputBox
                placeholder="Ask anything"
                onSend={(message) => {
                  if (message.trim()) startTurn(message.trim());
                }}
              />
            </div>

            <p className="mt-3 text-center text-[11.5px] text-[#1a1a1a]/55">
              Veda AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-4">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6 pb-10">
              {turns.map((turn) => (
                <div key={`${turn.id}-${turn.runId}`} className="flex flex-col gap-6">
                  <div className="flex justify-end">
                    <div className="gpt-user-bubble px-4 py-2.5 text-[15px] leading-[1.5]">
                      {turn.prompt}
                    </div>
                  </div>

                  <div className="gpt-thread-prose flex flex-col gap-3">
                    {turn.phase === "loading" && (
                      <LoadingState label="Thinking" variant="Drive" />
                    )}

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
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="gpt-composer-dock shrink-0 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
            <div className="mx-auto w-full max-w-3xl">
              <PromptBar
                demo={false}
                variant="Pill"
                placeholder="Ask anything"
                onSend={(text) => startTurn(text)}
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
