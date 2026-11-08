import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Clock, ListChecks, MapPin, Sparkles, Timer, Zap } from "lucide-react";
import { PracticeQuiz } from "@/components/hendux/PracticeQuiz";
import { MockExamDialog } from "@/components/hendux/MockExamDialog";
import { useHendux } from "@/lib/hendux-store";
import { DEMO_NOW, MASTERY, MOCK_EXAM, getExams } from "@/lib/hendux-data";
import { formatTime } from "@/lib/timetable";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prepare")({
  head: () => ({
    meta: [
      { title: "Exam Prep · Hendux" },
      { name: "description", content: "Exam countdown, topic mastery, weak-area tracking, practice quizzes and timed mock exams." },
      { property: "og:title", content: "Exam Prep · Hendux" },
      { property: "og:description", content: "Countdown, topic mastery, practice quizzes and timed mock exams for your courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreparePage,
});

function useCountdown(target: Date) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = window.setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => window.clearInterval(t);
  }, []);
  const ms = Math.max(0, target.getTime() - DEMO_NOW.getTime() - elapsed);
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

function PreparePage() {
  const { ctx, openAI } = useHendux();
  const [next] = getExams(ctx);
  const cd = useCountdown(next.date);
  const [mockOpen, setMockOpen] = useState(false);
  const avg = Math.round(MASTERY.reduce((s, m) => s + m.score, 0) / MASTERY.length);
  const weak = MASTERY.filter((m) => m.score < 50);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Prepare</p>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Exam Prep</h1>
      </header>

      {/* Countdown */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-gradient p-5 text-ink-foreground sm:p-6">
        <div className="grid-dots pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Next exam</p>
            <p className="mt-1 font-display text-xl font-bold"><span className="font-mono text-pro">{next.code}</span> · {next.title}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{next.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}, {formatTime(next.start)}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{next.hall} · {next.seats}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {([["Days", cd.days], ["Hrs", cd.hours], ["Min", cd.minutes], ["Sec", cd.seconds]] as const).map(([l, v]) => (
              <div key={l} className="min-w-16 rounded-xl bg-sidebar-accent px-2 py-2.5 text-center ring-1 ring-sidebar-border">
                <p className="font-display text-2xl font-extrabold tabular-nums">{String(v).padStart(2, "0")}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Mastery */}
        <section className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ListChecks className="size-5 text-primary" />Topic mastery</h2>
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-accent-foreground">Readiness {avg}%</span>
          </div>
          <ul className="mt-4 space-y-3">
            {MASTERY.map((m) => {
              const tone = m.score >= 70 ? "bg-official" : m.score >= 50 ? "bg-pro" : "bg-urgent";
              return (
                <li key={m.topic}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{m.topic} <span className="font-mono text-[11px] text-muted-foreground">{m.code}</span></span>
                    <span className="font-semibold tabular-nums">{m.score}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", tone)} style={{ width: `${m.score}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 rounded-xl bg-urgent-soft p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-urgent"><AlertTriangle className="size-3.5" />Weak areas</p>
            <div className="mt-2 space-y-2">
              {weak.map((w) => (
                <div key={w.topic} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 font-medium">{w.topic}</span>
                  <button onClick={() => openAI(w.topic === "Virtual Memory" ? "Explain virtual memory" : `Explain ${w.topic}`)} className="inline-flex items-center gap-1 rounded-lg bg-card px-2.5 py-1 text-xs font-semibold ring-1 ring-border">
                    <Sparkles className="size-3 text-primary" /> Explain
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-5">
          {/* Practice quiz */}
          <section className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Zap className="size-5 text-pro" />Quick practice</h2>
              <span className="text-xs text-muted-foreground">Virtual Memory · 3 Qs</span>
            </div>
            <PracticeQuiz />
          </section>

          {/* Mock exam */}
          <section className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-border">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Timer className="size-5 text-primary" />Timed mock exam</h2>
            <p className="mt-1 text-sm text-muted-foreground">{MOCK_EXAM.title} — built from 5 years of past questions.</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[[`${MOCK_EXAM.questions}`, "Questions"], [`${MOCK_EXAM.minutes}m`, "Duration"], ["3", "Sections"]].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-muted py-2">
                  <p className="font-display text-lg font-bold">{v}</p>
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {MOCK_EXAM.sections.map((s) => (
                <li key={s.name} className="flex justify-between"><span>{s.name}</span><span className="font-semibold text-foreground">{s.count}</span></li>
              ))}
            </ul>
            <button onClick={() => setMockOpen(true)} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              Preview mock exam <ArrowRight className="size-4" />
            </button>
          </section>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Upcoming papers</h2>
        <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {getExams(ctx).map((e) => (
            <Link key={e.courseId} to="/resources/$courseId" params={{ courseId: e.courseId }} className="w-52 shrink-0 rounded-2xl bg-card p-4 ring-1 ring-border transition hover:ring-primary/40">
              <p className="font-mono text-xs font-bold text-primary">{e.code}</p>
              <p className="truncate font-semibold">{e.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">{e.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {formatTime(e.start)}</p>
              <p className="text-xs text-muted-foreground">{e.hall}</p>
            </Link>
          ))}
        </div>
      </section>

      <MockExamDialog open={mockOpen} onOpenChange={setMockOpen} />
    </div>
  );
}
