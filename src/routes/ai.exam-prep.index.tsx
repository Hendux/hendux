import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Crown, Lock, Sparkles } from "lucide-react";
import { ReadinessRing, useCourseReadiness } from "@/components/hendux/Readiness";
import { UnlockDialog } from "@/components/hendux/UnlockDialog";
import { DEMO_NOW, type Course } from "@/lib/hendux-data";
import { EXAM_PERIOD_START, daysUntil, getTopics } from "@/lib/exam-prep";
import { useHendux } from "@/lib/hendux-store";
import { READING_CAP, WEAK_THRESHOLD, WEIGHTS } from "@/lib/readiness";

export const Route = createFileRoute("/ai/exam-prep/")({
  head: () => ({
    meta: [
      { title: "Exam Preparation · Hendux AI" },
      { name: "description", content: "Pick a course, unlock it and track your readiness topic by topic with verified notes, Key Points, quizzes and mock exams." },
      { property: "og:title", content: "Exam Preparation · Hendux" },
      { property: "og:description", content: "Course-by-course readiness, Key Points, quizzes and a general mock exam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExamPrepHome,
});

function ExamPrepHome() {
  const { courses, unlocked } = useHendux();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Course | null>(null);
  const days = daysUntil(EXAM_PERIOD_START, DEMO_NOW);
  const mineUnlocked = courses.filter((c) => unlocked.includes(c.id));
  const locked = courses.filter((c) => !unlocked.includes(c.id));

  return (
    <div className="space-y-6">
      <Link to="/ai" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Hendux AI
      </Link>

      <section className="relative overflow-hidden rounded-3xl bg-ink-gradient p-5 text-ink-foreground">
        <span className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold-gradient opacity-25 blur-3xl" />
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-pro-foreground">
          <Crown className="size-3" /> Exam Preparation
        </span>
        <h1 className="relative mt-3 text-[28px] font-extrabold leading-[1.1]">Pick a course. See exactly where you stand.</h1>
        <p className="relative mt-2 text-sm text-ink-muted">Unlock a course once to get readiness for every topic, verified notes, Key Points, quizzes and a general mock.</p>
        <div className="relative mt-4 flex items-center gap-3 rounded-2xl bg-sidebar-accent px-4 py-3 ring-1 ring-ink-line">
          <p className="font-display text-3xl font-extrabold leading-none text-gold-gradient">{days}</p>
          <p className="text-xs leading-snug text-ink-muted">
            days until the exam period is expected to start. The exam timetable comes out on <span className="font-semibold text-ink-foreground">Mon 23 Nov</span>.
          </p>
        </div>
      </section>

      {mineUnlocked.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-lg font-bold">Your unlocked courses</h2>
          <div className="grid gap-2.5">
            {mineUnlocked.map((c) => (
              <UnlockedRow key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-lg font-bold">{mineUnlocked.length ? "Unlock another course" : "Choose a course to unlock"}</h2>
          <div className="grid gap-2.5">
            {locked.map((c) => (
              <button
                key={c.id}
                onClick={() => setPending(c)}
                className="group flex items-center gap-3 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border transition hover:ring-pro"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground transition group-hover:bg-pro-soft group-hover:text-pro-foreground">
                  <Lock className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-mono text-[11px] font-bold text-primary">{c.code}</span>
                  <span className="block truncate font-display font-bold">{c.title}</span>
                  <span className="text-[11px] text-muted-foreground">{getTopics(c).length} topics · general mock exam</span>
                </span>
                <span className="shrink-0 rounded-full bg-gold-gradient px-3 py-1.5 text-[11px] font-extrabold text-pro-foreground">Unlock</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Sparkles className="size-4 text-primary" /> How readiness works
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {([
            ["Mock exams", WEIGHTS.mock],
            ["Coverage", WEIGHTS.coverage],
            ["Consistency", WEIGHTS.consistency],
            ["Quiz accuracy", WEIGHTS.quiz],
          ] as const).map(([label, w]) => (
            <div key={label} className="rounded-xl bg-muted p-3">
              <p className="font-display text-2xl font-extrabold text-primary">{Math.round(w * 100)}%</p>
              <p className="text-xs font-semibold">{label}</p>
            </div>
          ))}
        </div>
        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <li>• A topic reads “Not started” until your first quiz.</li>
          <li>• Reading alone can't push a topic past about {READING_CAP}%.</li>
          <li>• Scores slowly drop if you stop revisiting a topic.</li>
          <li>• Topics under {WEAK_THRESHOLD}% are flagged as weak areas.</li>
          <li>• It shows readiness from your practice. It is not a grade prediction.</li>
        </ul>
      </section>

      <UnlockDialog
        course={pending}
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        onUnlocked={(c) => navigate({ to: "/ai/exam-prep/$courseId", params: { courseId: c.id } })}
      />
    </div>
  );
}

function UnlockedRow({ course }: { course: Course }) {
  const { overall, weak, started, topics } = useCourseReadiness(course);
  return (
    <Link
      to="/ai/exam-prep/$courseId"
      params={{ courseId: course.id }}
      className="group flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card ring-1 ring-pro/40 transition hover:ring-pro"
    >
      <ReadinessRing value={started ? overall : null} size={56} stroke={6} brand>
        <span className="font-display text-sm font-extrabold">{started ? `${overall}%` : "—"}</span>
      </ReadinessRing>
      <span className="min-w-0 flex-1">
        <span className="font-mono text-[11px] font-bold text-primary">{course.code}</span>
        <span className="block truncate font-display font-bold">{course.title}</span>
        <span className="text-[11px] text-muted-foreground">
          {started === 0 ? `${topics.length} topics · not started` : weak.length ? <span className="font-semibold text-urgent">{weak.length} weak area{weak.length > 1 ? "s" : ""}</span> : "No weak areas"}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
    </Link>
  );
}
