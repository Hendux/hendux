import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { useHendux } from "@/lib/hendux-store";
import { ACADEMIC_CALENDAR, DEMO_NOW, getExams, type CalendarKind } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

const KIND: Record<CalendarKind, { label: string; dot: string }> = {
  holiday: { label: "Holiday", dot: "bg-official" },
  deadline: { label: "Deadline", dot: "bg-urgent" },
  event: { label: "Event", dot: "bg-primary" },
  reminder: { label: "My reminder", dot: "bg-pro" },
  exam: { label: "Exam", dot: "bg-verified" },
};

export function AcademicCalendar() {
  const { calendarReminders, courses } = useHendux();
  const [showExams, setShowExams] = useState(false);
  const exams = showExams
    ? getExams(courses).map((e) => ({ id: `ex-${e.courseId}`, date: e.date, title: `${e.code} exam`, kind: "exam" as const, detail: `${e.hall} · ${e.seats}` }))
    : [];
  const entries = [...ACADEMIC_CALENDAR, ...calendarReminders, ...exams]
    .filter((e) => e.date >= new Date(DEMO_NOW.getFullYear(), DEMO_NOW.getMonth(), DEMO_NOW.getDate()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(KIND).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className={cn("size-2 rounded-full", v.dot)} />{v.label}</span>
        ))}
      </div>
      {!showExams && (
        <div className="flex items-start gap-3 rounded-xl bg-warning-soft p-3 text-sm">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="font-semibold">Exam timetable is not out yet</p>
            <p className="text-xs text-muted-foreground">The Registry will release it on Mon 23 Nov. It will appear here automatically.</p>
            <button onClick={() => setShowExams(true)} className="mt-1 text-xs font-semibold text-primary underline">Preview once released</button>
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="flex gap-3 rounded-xl bg-card p-3 ring-1 ring-border">
            <div className="grid w-12 shrink-0 place-items-center rounded-lg bg-muted py-1.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">{e.date.toLocaleDateString("en-GB", { month: "short" })}</span>
              <span className="font-display text-lg font-bold leading-none">{e.date.getDate()}</span>
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"><span className={cn("size-2 rounded-full", KIND[e.kind].dot)} />{KIND[e.kind].label}</p>
              <p className="text-sm font-semibold">{e.title}</p>
              {e.detail && <p className="text-xs text-muted-foreground">{e.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
