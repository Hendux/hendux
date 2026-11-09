import { Link } from "@tanstack/react-router";
import { ChevronRight, FileClock, FileText, PlayCircle, User } from "lucide-react";
import { CONTINUE_STUDYING, findCourse, type Course } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

export const TONE_BG: Record<Course["tone"], string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

/** One course in "My courses". Study percentage is optional (dashboard shows it for the top four). */
export function CourseRow({ course, showProgress = true, pqStyle = "available" }: { course: Course; showProgress?: boolean; pqStyle?: "available" | "count" }) {
  const pqText =
    course.pastQuestions === 0
      ? "No past questions yet"
      : pqStyle === "count"
        ? `${course.pastQuestions} past question${course.pastQuestions > 1 ? "s" : ""}`
        : "Past questions available";
  return (
    <Link
      to="/resources/$courseId"
      params={{ courseId: course.id }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-card p-4 pl-5 shadow-card ring-1 ring-border transition hover:ring-primary/40"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", TONE_BG[course.tone])} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-primary">{course.code}</span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{course.units} credit units</span>
        </div>
        <p className="mt-0.5 truncate font-display text-base font-bold leading-snug">{course.title}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="size-3" />{course.lecturer}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1"><FileText className="size-3.5" />{course.notes} notes</span>
          <span className={cn("inline-flex items-center gap-1", course.pastQuestions === 0 && "text-urgent")}><FileClock className="size-3.5" />{pqText}</span>
        </div>
        {showProgress && (
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", TONE_BG[course.tone])} style={{ width: `${course.progress}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">{course.progress}% studied</span>
          </div>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export function ContinueCard() {
  const c = CONTINUE_STUDYING;
  const course = findCourse(c.courseId);
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
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Continue studying</p>
        <p className="truncate font-semibold">{c.code} · {course?.title}</p>
        <p className="truncate text-xs text-ink-muted">{c.doc}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sidebar-accent">
            <div className="h-full rounded-full bg-pro" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] text-ink-muted">p.{c.page}/{c.pages}</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-muted">Stopped {c.stoppedAt.toLowerCase()} · pick up where you left off</p>
      </div>
      <ChevronRight className="relative size-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5" />
    </Link>
  );
}
