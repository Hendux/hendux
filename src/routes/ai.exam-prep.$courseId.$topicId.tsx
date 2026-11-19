import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Timer } from "lucide-react";
import { toast } from "sonner";
import { MockExamDialog, type MockQuestion } from "@/components/hendux/MockExamDialog";
import { PracticeQuiz } from "@/components/hendux/PracticeQuiz";
import { ReadinessRing, SignalBreakdown, readinessTone } from "@/components/hendux/Readiness";
import { findCourse } from "@/lib/hendux-data";
import { findTopic, mockMinutes } from "@/lib/exam-prep";
import { useHendux } from "@/lib/hendux-store";
import { recordCoverage, recordMock, recordQuiz, topicReadiness } from "@/lib/readiness";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai/exam-prep/$courseId/$topicId")({
  loader: ({ params }) => {
    const course = findCourse(params.courseId);
    const topic = course ? findTopic(course, params.topicId) : null;
    if (!course || !topic) throw notFound();
    return { course, topic };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.topic.title} · ${loaderData.course.code} · Hendux` : "Topic · Hendux" },
      { name: "description", content: "Verified notes, Key Points and practice for one topic, with live readiness." },
      { property: "og:title", content: loaderData ? `${loaderData.topic.title} · Exam Preparation` : "Topic · Hendux" },
      { property: "og:description", content: "Notes, Key Points, quizzes and topic mocks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  notFoundComponent: () => <p className="p-8 text-center text-sm text-muted-foreground">Topic not found.</p>,
  component: TopicPage,
});

type Tab = "notes" | "key" | "practice";

function TopicPage() {
  const { course, topic } = Route.useLoaderData();
  const { topicSignals, setTopicSignals, readMarks, markRead, openAI } = useHendux();
  const [tab, setTab] = useState<Tab>("notes");
  const [mockOpen, setMockOpen] = useState(false);
  const signals = topicSignals(course.id, topic);
  const readiness = topicReadiness(signals);
  const tone = readinessTone(readiness);
  const mockQs = useMemo<MockQuestion[]>(() => topic.quiz.map((q) => ({ ...q, topicId: topic.id })), [topic]);

  const read = (key: string, amount: number) => {
    const k = `${course.id}:${topic.id}:${key}`;
    if (readMarks.includes(k)) return;
    markRead(k);
    setTopicSignals(course.id, topic.id, recordCoverage(signals, amount));
  };
  const report = (label: string, next: typeof signals) => {
    setTopicSignals(course.id, topic.id, next);
    const after = topicReadiness(next);
    toast.success(label, { description: `Readiness ${readiness ?? "not started"}${readiness !== null ? "%" : ""} → ${after ?? "not started"}${after !== null ? "%" : ""}` });
  };

  return (
    <div className="space-y-5">
      <Link to="/ai/exam-prep/$courseId" params={{ courseId: course.id }} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> {course.code} readiness
      </Link>
      <section className="rounded-3xl bg-ink-gradient p-5 text-ink-foreground">
        <div className="flex items-center gap-4">
          <ReadinessRing value={readiness} size={84} stroke={8} track="var(--ink-line)" brand>
            <span className="font-display text-lg font-extrabold">{readiness === null ? "—" : `${readiness}%`}</span>
          </ReadinessRing>
          <div className="min-w-0">
            <p className="font-mono text-xs text-ink-muted">{course.code}</p>
            <h1 className="text-2xl font-extrabold leading-tight">{topic.title}</h1>
            <p className="mt-1 text-xs font-semibold text-ink-muted">{tone.label}</p>
          </div>
        </div>
        <div className="mt-4"><SignalBreakdown signals={signals} dark /></div>
      </section>

      <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {([["notes", "Notes"], ["key", "Key Points"], ["practice", "Practice"]] as const).map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("rounded-lg py-2 text-xs font-bold", tab === id ? "bg-card shadow-card" : "text-muted-foreground")}>{l}</button>
        ))}
      </div>

      {tab === "notes" && (
        <div className="space-y-3">
          {topic.notes.map((n, i) => {
            const done = readMarks.includes(`${course.id}:${topic.id}:n${i}`);
            return (
              <article key={n.h} className="rounded-2xl bg-card p-4 ring-1 ring-border">
                <h3 className="font-bold">{n.h}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.p}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => read(`n${i}`, 75 / topic.notes.length)} disabled={done} className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold disabled:text-official"><Check className="size-3.5" />{done ? "Read" : "Mark as read"}</button>
                  <button onClick={() => openAI(`Explain this passage (from ${course.code} ${topic.title}): "${n.p}"`)} className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-accent-foreground"><Sparkles className="size-3.5" />Ask AI</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === "key" && (
        <div className="space-y-3">
          <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <h3 className="font-bold">Main ideas</h3>
            <ul className="mt-2 space-y-1.5 text-sm">{topic.keyPoints.main.map((k) => <li key={k}>• {k}</li>)}</ul>
          </section>
          <section className="rounded-2xl bg-warning-soft p-4">
            <h3 className="font-bold text-warning">Often overlooked</h3>
            <ul className="mt-2 space-y-1.5 text-sm">{topic.keyPoints.overlooked.map((k) => <li key={k}>• {k}</li>)}</ul>
          </section>
          <button onClick={() => read("key", 25)} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">I've gone through these</button>
        </div>
      )}

      {tab === "practice" && (
        <div className="space-y-4">
          <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <h3 className="mb-3 font-bold">Topic quiz</h3>
            <PracticeQuiz questions={topic.quiz} onFinish={(c, t) => report(`Quiz: ${c} / ${t}`, recordQuiz(signals, c, t))} />
          </section>
          <section className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-2 ring-pro/60">
            <div className="flex-1"><h3 className="font-bold">Timed topic mock</h3><p className="text-xs text-muted-foreground">{mockQs.length} questions</p></div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold"><Timer className="size-3.5 text-pro" />{mockMinutes(mockQs.length)} min</span>
            <button onClick={() => setMockOpen(true)} className="rounded-xl bg-gold-gradient px-4 py-2 text-sm font-extrabold text-pro-foreground">Start</button>
          </section>
        </div>
      )}

      <MockExamDialog open={mockOpen} onOpenChange={setMockOpen} title={`${topic.title} mock`} code={course.code} questions={mockQs} minutes={mockMinutes(mockQs.length)}
        onFinish={(r) => report(`Mock: ${r.filter((x) => x.correct).length} / ${r.length}`, recordMock(signals, r.filter((x) => x.correct).length, r.length))} />
    </div>
  );
}
