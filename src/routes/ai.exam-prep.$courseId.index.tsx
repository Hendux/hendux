import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ChevronRight, Crown, Lock, Timer } from "lucide-react";
import { toast } from "sonner";
import { MockExamDialog, type MockQuestion } from "@/components/hendux/MockExamDialog";
import { ExamWeight, ReadinessBar, ReadinessRing, StudyLoop, readinessTone, useCourseReadiness } from "@/components/hendux/Readiness";
import { UnlockDialog } from "@/components/hendux/UnlockDialog";
import { DEMO_NOW, findCourse } from "@/lib/hendux-data";
import { EXAM_PERIOD_START, daysUntil, getTopics, mockMinutes } from "@/lib/exam-prep";
import { useHendux } from "@/lib/hendux-store";
import { recordMock } from "@/lib/readiness";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai/exam-prep/$courseId/")({
  loader: ({ params }) => {
    const course = findCourse(params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.course.code} readiness · Exam Preparation · Hendux` : "Exam Preparation · Hendux" },
      { name: "description", content: loaderData ? `Your readiness for ${loaderData.course.title}, topic by topic, with weak areas and a general mock exam.` : "Course readiness, topic by topic." },
      { property: "og:title", content: loaderData ? `${loaderData.course.code} · Exam Preparation` : "Exam Preparation · Hendux" },
      { property: "og:description", content: "Course readiness, weak areas and a general mock exam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  notFoundComponent: () => <p className="p-8 text-center text-sm text-muted-foreground">Course not found.</p>,
  component: CourseReadinessPage,
});

function CourseReadinessPage() {
  const { course } = Route.useLoaderData();
  const { unlocked } = useHendux();
  const [unlockOpen, setUnlockOpen] = useState(false);

  if (!unlocked.includes(course.id)) {
    return (
      <div className="space-y-6">
        <BackLink />
        <section className="rounded-3xl bg-card p-8 text-center ring-1 ring-border">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-pro-soft text-pro-foreground">
            <Lock className="size-6" />
          </span>
          <p className="mt-4 font-mono text-xs font-bold text-primary">{course.code}</p>
          <h1 className="mt-1 text-2xl font-extrabold">{course.title}</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">Unlock this course to see your readiness, topics and the general mock exam.</p>
          <button onClick={() => setUnlockOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-3 text-sm font-extrabold text-pro-foreground shadow-gold">
            <Crown className="size-4" /> Unlock {course.code}
          </button>
        </section>
        <UnlockDialog course={course} open={unlockOpen} onOpenChange={setUnlockOpen} />
      </div>
    );
  }
  return <Unlocked />;
}

function BackLink() {
  return (
    <Link to="/ai/exam-prep" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-3.5" /> Exam Preparation
    </Link>
  );
}

function Unlocked() {
  const { course } = Route.useLoaderData();
  const { topicSignals, setTopicSignals } = useHendux();
  const { topics, overall, started, weak } = useCourseReadiness(course);
  const [mockOpen, setMockOpen] = useState(false);
  const days = daysUntil(EXAM_PERIOD_START, DEMO_NOW);

  const mockQuestions = useMemo<MockQuestion[]>(
    () => getTopics(course).flatMap((t) => t.quiz.slice(0, 2).map((q) => ({ ...q, topicId: t.id }))),
    [course],
  );
  const minutes = mockMinutes(mockQuestions.length);

  const finishMock = (results: { topicId: string; correct: boolean }[]) => {
    const before = overall;
    for (const t of getTopics(course)) {
      const mine = results.filter((r) => r.topicId === t.id);
      if (mine.length === 0) continue;
      setTopicSignals(course.id, t.id, recordMock(topicSignals(course.id, t), mine.filter((r) => r.correct).length, mine.length));
    }
    const right = results.filter((r) => r.correct).length;
    toast.success(`General mock: ${right} / ${results.length}`, { description: `Course readiness was ${before}%. Topics you missed have been lowered.` });
  };

  return (
    <div className="space-y-6">
      <BackLink />

      {/* Course readiness */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-gradient p-5 text-ink-foreground">
        <span className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-gold-gradient opacity-20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-2">
          <p className="font-mono text-xs font-bold text-ink-muted">{course.code}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-gradient px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-pro-foreground">
            <Crown className="size-3" /> Unlocked
          </span>
        </div>
        <h1 className="relative mt-1 text-2xl font-extrabold leading-tight">{course.title}</h1>
        <div className="relative mt-5 flex items-center gap-5">
          <ReadinessRing value={overall} size={120} stroke={10} track="var(--ink-line)" brand>
            <div>
              <p className="font-display text-3xl font-extrabold leading-none">{overall}%</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">readiness</p>
            </div>
          </ReadinessRing>
          <dl className="grid flex-1 gap-2.5 text-sm">
            <div>
              <dt className="text-[11px] text-ink-muted">Topics started</dt>
              <dd className="font-display text-lg font-bold leading-tight">{started} <span className="text-sm text-ink-muted">of {topics.length}</span></dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-muted">Weak areas</dt>
              <dd className={cn("font-display text-lg font-bold leading-tight", weak.length && "text-urgent")}>{weak.length}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-muted">Exam period</dt>
              <dd className="font-display text-lg font-bold leading-tight">in {days} days</dd>
            </div>
          </dl>
        </div>
        <p className="relative mt-4 text-[11px] leading-relaxed text-ink-muted">
          Average of your topic scores, weighted by how heavily each topic is examined. This is readiness from your practice, not a grade prediction.
        </p>
      </section>

      {weak.length > 0 && (
        <section className="rounded-2xl bg-urgent-soft p-4 ring-1 ring-urgent/20">
          <p className="flex items-center gap-2 text-sm font-bold text-urgent">
            <AlertTriangle className="size-4" /> Weak areas to revise first
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {weak.map((w) => (
              <Link
                key={w.topic.id}
                to="/ai/exam-prep/$courseId/$topicId"
                params={{ courseId: course.id, topicId: w.topic.id }}
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold ring-1 ring-urgent/30 transition hover:ring-urgent"
              >
                {w.topic.title} <span className="font-mono text-urgent">{w.readiness}%</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Topics */}
      <section>
        <h2 className="mb-2.5 text-lg font-bold">Topics</h2>
        <ol className="grid gap-2.5">
          {topics.map(({ topic, readiness }, i) => {
            const tone = readinessTone(readiness);
            return (
              <li key={topic.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  to="/ai/exam-prep/$courseId/$topicId"
                  params={{ courseId: course.id, topicId: topic.id }}
                  className={cn("group flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card ring-1 transition hover:ring-primary/50", tone.label === "Weak area" ? "ring-urgent/30" : "ring-border")}
                >
                  <span className="font-mono text-xs font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-display font-bold">{topic.title}</span>
                      {tone.label === "Weak area" && <span className="shrink-0 rounded-full bg-urgent-soft px-1.5 py-px text-[10px] font-bold text-urgent">Weak area</span>}
                    </span>
                    <ExamWeight weight={topic.weight} className="mt-1" />
                    <span className="mt-2 flex items-center gap-2">
                      <ReadinessBar value={readiness} className="flex-1" />
                      <span className={cn("w-20 text-right text-xs font-bold", tone.text)}>{readiness === null ? "Not started" : `${readiness}%`}</span>
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* General mock */}
      <section className="relative overflow-hidden rounded-2xl bg-card p-5 ring-2 ring-pro/60">
        <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gold-gradient opacity-20 blur-2xl" />
        <p className="relative text-[11px] font-bold uppercase tracking-wider text-pro-foreground">Covers the whole course</p>
        <h2 className="relative mt-1 text-xl font-extrabold">General Mock Exam</h2>
        <p className="relative mt-1 text-sm text-muted-foreground">
          {mockQuestions.length} questions across all {topics.length} topics. Wrong answers lower the topic they came from, so your weak areas update themselves.
        </p>
        <div className="relative mt-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 font-mono text-xs font-bold">
            <Timer className="size-3.5 text-pro" /> {minutes} min
          </span>
          <button onClick={() => setMockOpen(true)} className="ml-auto rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-extrabold text-pro-foreground shadow-gold">
            Start mock
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold text-muted-foreground">The study loop</h2>
        <StudyLoop />
      </section>

      <MockExamDialog open={mockOpen} onOpenChange={setMockOpen} title="General Mock Exam" code={course.code} questions={mockQuestions} minutes={minutes} onFinish={finishMock} />
    </div>
  );
}
