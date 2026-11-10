import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUp, ChevronRight, Crown, MessageSquare, Plus, Sparkles } from "lucide-react";
import { AIToolDialog, TOOL_META, type AITool } from "@/components/hendux/AITools";
import { ReadinessRing, useCourseReadiness } from "@/components/hendux/Readiness";
import { QUICK_PROMPTS } from "@/lib/hendux-ai";
import { PREVIOUS_CHATS, findCourse, semesterLabel } from "@/lib/hendux-data";
import { useHendux } from "@/lib/hendux-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai/")({
  head: () => ({
    meta: [
      { title: "Hendux AI · Summaries, quizzes, flashcards and Exam Preparation" },
      { name: "description", content: "Summarize a PDF, generate a quiz, make flashcards, pick up earlier chats and prepare for exams with readiness tracking." },
      { property: "og:title", content: "Hendux AI" },
      { property: "og:description", content: "Summaries, quizzes, flashcards and Exam Preparation for your courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AIPage,
});

const TOOL_STYLE: Record<AITool, string> = {
  summarize: "bg-primary-gradient text-primary-foreground",
  quiz: "bg-sky text-ink",
  flashcards: "bg-ink text-ink-foreground",
};

function AIPage() {
  const { profile, ctx, chats, openAI, flashcards, unlocked, courses } = useHendux();
  const [text, setText] = useState("");
  const [tool, setTool] = useState<AITool | null>(null);

  const history = [...chats, ...PREVIOUS_CHATS.filter((p) => !chats.some((c) => c.prompt === p.prompt))].slice(0, 6);
  const firstUnlocked = unlocked.map(findCourse).find((c) => !!c && courses.some((m) => m.id === c.id)) ?? null;
  const unlockedMine = courses.filter((c) => unlocked.includes(c.id)).length;

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <Sparkles className="size-3.5" /> Hendux AI
        </p>
        <h1 className="mt-1.5 text-[28px] font-extrabold leading-[1.1] sm:text-4xl">What are we working on, {profile.name.split(" ")[0]}?</h1>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">
          Tuned to {ctx.universityShort} · {ctx.departmentShort} · {ctx.level}L · {semesterLabel(ctx.semester)}
        </p>
      </header>

      {/* Ask */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          openAI(text.trim());
          setText("");
        }}
        className="rounded-2xl bg-card p-2 shadow-card ring-1 ring-border focus-within:ring-2 focus-within:ring-primary"
      >
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask about a class, a topic or a notice…"
            aria-label="Ask Hendux AI"
            className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" disabled={!text.trim()} aria-label="Send" className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-gradient text-primary-foreground transition disabled:opacity-40">
            <ArrowUp className="size-4" />
          </button>
        </div>
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto px-1 pb-1 pt-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} type="button" onClick={() => openAI(p)} className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:bg-primary-soft hover:text-accent-foreground">
              {p}
            </button>
          ))}
        </div>
      </form>

      {/* Tools */}
      <section aria-label="AI tools" className="grid grid-cols-3 gap-2.5">
        {(Object.keys(TOOL_META) as AITool[]).map((id, i) => {
          const m = TOOL_META[id];
          return (
            <button
              key={id}
              onClick={() => setTool(id)}
              className="group animate-rise flex flex-col items-start rounded-2xl bg-card p-3 text-left shadow-card ring-1 ring-border transition hover:-translate-y-0.5 hover:ring-primary/40"
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <span className={cn("grid size-10 place-items-center rounded-xl transition group-hover:scale-105", TOOL_STYLE[id])}>
                <m.Icon className="size-5" />
              </span>
              <span className="mt-3 text-sm font-extrabold leading-tight">{m.title}</span>
              <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{id === "flashcards" ? `${flashcards.length} card${flashcards.length === 1 ? "" : "s"} saved` : m.hint}</span>
            </button>
          );
        })}
      </section>

      {/* Exam Preparation (paid) */}
      <Link
        to="/ai/exam-prep"
        className="group relative block overflow-hidden rounded-3xl bg-ink-gradient p-5 text-ink-foreground shadow-gold ring-1 ring-pro/50"
      >
        <span className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-gold-gradient opacity-25 blur-3xl" />
        <span className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-pro/10" />
        <div className="relative flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-pro-foreground">
              <Crown className="size-3" /> Exam Preparation
            </span>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight">
              Know how <span className="text-gold-gradient">ready</span> you are, topic by topic.
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">Verified notes, Key Points, quizzes and a general mock for each course you unlock.</p>
          </div>
          {firstUnlocked && <CardRing courseId={firstUnlocked.id} />}
        </div>
        <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-ink-line pt-4">
          <p className="text-xs text-ink-muted">
            <span className="font-bold text-ink-foreground">{unlockedMine}</span> of {courses.length} courses unlocked
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-xs font-extrabold text-pro-foreground transition group-hover:gap-2.5">
            Open <ArrowRight className="size-3.5" />
          </span>
        </div>
      </Link>

      {/* Previous chats */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Previous chats</h2>
          <button onClick={() => openAI()} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-accent-foreground">
            <Plus className="size-3.5" /> New chat
          </button>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border">
          {history.map((c) => (
            <li key={c.id}>
              <button onClick={() => openAI(c.prompt)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <MessageSquare className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{c.title}</span>
                  <span className="text-[11px] text-muted-foreground">{c.when}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <AIToolDialog tool={tool} onClose={() => setTool(null)} />
    </div>
  );
}

function CardRing({ courseId }: { courseId: string }) {
  const course = findCourse(courseId)!;
  const { overall } = useCourseReadiness(course);
  return (
    <div className="flex flex-col items-center gap-1">
      <ReadinessRing value={overall} size={68} stroke={6} track="var(--ink-line)" brand>
        <span className="font-display text-base font-extrabold">{overall}%</span>
      </ReadinessRing>
      <span className="font-mono text-[10px] text-ink-muted">{course.code}</span>
    </div>
  );
}
