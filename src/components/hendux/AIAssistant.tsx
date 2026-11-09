import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Brain, Building2, Paperclip, Send, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useHendux } from "@/lib/hendux-store";
import { MODE_LABEL, answer, type AIMode, type AIReply } from "@/lib/hendux-ai";
import { cn } from "@/lib/utils";
import { HenduxLogo, TierBadge } from "./badges";

type Msg = { id: number; role: "user" } & { text: string } | { id: number; role: "ai"; reply: AIReply };

const MODES: { id: AIMode; Icon: typeof Brain; prompts: string[] }[] = [
  { id: "campus", Icon: Building2, prompts: ["What's my next class?", "Which events are for me?", "When is my first exam?"] },
  { id: "resource", Icon: BookOpen, prompts: ["Find CSC 305 past questions", "Best notes for CSC 301"] },
  { id: "study", Icon: Brain, prompts: ["Explain virtual memory", "Explain paging and page faults"] },
];

export function AIAssistant() {
  const { aiOpen, closeAI, aiSeed, ctx, courses, profile, addChat } = useHendux();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AIMode>("campus");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSeed = useRef<number | null>(null);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    if (messages.length === 0) addChat(t);
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: t }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const reply = answer(t, ctx, courses);
      setMode(reply.mode);
      setMessages((m) => [...m, { id: Date.now() + 1, role: "ai", reply }]);
      setTyping(false);
    }, 850);
  };

  useEffect(() => {
    if (aiOpen && aiSeed && aiSeed.nonce !== lastSeed.current) {
      lastSeed.current = aiSeed.nonce;
      send(aiSeed.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiOpen, aiSeed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const activeMode = MODES.find((m) => m.id === mode)!;

  return (
    <Sheet open={aiOpen} onOpenChange={(o) => !o && closeAI()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="bg-ink-gradient p-5 text-ink-foreground">
          <div className="flex items-center gap-3">
            <HenduxLogo className="h-10" />
            <div className="text-left">
              <SheetTitle className="font-display text-lg text-ink-foreground">Hendux AI</SheetTitle>
              <SheetDescription className="text-xs text-ink-muted">
                {ctx.universityShort} · {ctx.departmentShort} {ctx.level}L · answers cite their sources
              </SheetDescription>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-sidebar-accent p-1">
            {MODES.map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition",
                  mode === id ? "bg-card text-foreground" : "text-ink-muted hover:text-ink-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {MODE_LABEL[id].split(" ")[0]}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-background p-4">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
              <p className="font-display text-base font-semibold">Hi {profile.name.split(" ")[0]} 👋</p>
              <p className="mt-1 text-sm text-muted-foreground">
                I'm your {MODE_LABEL[mode]}. Ask me anything, attach a PDF to summarise, or start with a suggestion below.
              </p>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.text}</p>
              </div>
            ) : (
              <div key={m.id} className="max-w-[92%] rounded-2xl rounded-bl-md bg-card p-4 text-sm shadow-card ring-1 ring-border">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary">{MODE_LABEL[m.reply.mode]}</p>
                <p className="leading-relaxed">{m.reply.text}</p>
                {m.reply.bullets && (
                  <ul className="mt-2 space-y-1.5">
                    {m.reply.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-muted-foreground">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {m.reply.citations.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sources</p>
                    <div className="space-y-1.5">
                      {m.reply.citations.map((c, i) => (
                        <div key={c.label + i} className="flex items-center gap-2 text-xs">
                          <TierBadge tier={c.tier} compact />
                          <span className="truncate text-muted-foreground">{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {m.reply.link && (
                  <Link to={m.reply.link.to} onClick={closeAI} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {m.reply.link.label} <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            ),
          )}
          {typing && (
            <div className="inline-flex gap-1 rounded-2xl bg-card px-4 py-3 shadow-card ring-1 ring-border" aria-label="Hendux is typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card p-3">
          <div className="scrollbar-none mb-2 flex gap-2 overflow-x-auto">
            {activeMode.prompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="shrink-0 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 rounded-xl bg-muted p-1.5 pl-1.5"
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) send(`Summarize "${f.name}"`);
                e.target.value = "";
              }}
            />
            <button type="button" onClick={() => fileRef.current?.click()} className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground" aria-label="Attach a PDF">
              <Paperclip className="size-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask the ${MODE_LABEL[mode]}…`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Message Hendux AI"
            />
            <button type="submit" disabled={!input.trim() || typing} className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground transition disabled:opacity-40" aria-label="Send">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
