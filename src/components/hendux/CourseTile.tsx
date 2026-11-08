import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, FileClock, PlayCircle } from "lucide-react";
import { CONTINUE_READING, type Course } from "@/lib/hendux-data";

const TONE_BG: Record<Course["tone"], string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

export function CourseTile({ course }: { course: Course }) {
  return (
    <Link
      to="/resources/$courseId"
      params={{ courseId: course.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card p-4 shadow-card ring-1 ring-border transition hover:-translate-y-0.5 hover:ring-primary/40"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${TONE_BG[course.tone]}`} />
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs font-bold text-primary">{course.code}</span>
        <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
      </div>
      <p className="mt-1 font-display text-base font-bold leading-snug">{course.title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{course.lecturer} · {course.units} units</p>
      <div className="mt-4 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1"><FileClock className="size-3.5" />5 PQs</span>
        <span className="inline-flex items-center gap-1"><BookOpen className="size-3.5" />6 notes</span>
      </div>
      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full ${TONE_BG[course.tone]}`} style={{ width: `${course.progress}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{course.progress}% of materials covered</p>
      </div>
    </Link>
  );
}

export function ContinueCard() {
  const c = CONTINUE_READING;
  const pct = Math.round((c.page / c.pages) * 100);
  return (
    <Link
      to="/resources/$courseId"
      params={{ courseId: c.courseId }}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-ink-gradient p-4 text-ink-foreground shadow-card"
    >
      <div className="grid-dots pointer-events-none absolute inset-0" />
      <div className="relative grid size-14 shrink-0 place-items-center rounded-xl bg-sidebar-accent ring-1 ring-sidebar-border">
        <PlayCircle className="size-7 text-pro" />
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Continue where you left off</p>
        <p className="truncate font-semibold">{c.code} · {c.doc}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sidebar-accent">
            <div className="h-full rounded-full bg-pro" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] text-ink-muted">p.{c.page}/{c.pages}</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-muted">{c.lastOpened}</p>
      </div>
    </Link>
  );
}
