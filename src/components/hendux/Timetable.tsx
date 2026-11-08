import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Ban, Clock, Coffee, GraduationCap, MapPin, Timer, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useHendux } from "@/lib/hendux-store";
import { DEMO_DAY, DEMO_MINUTES, DEMO_NOW, getExams, getTimetable } from "@/lib/hendux-data";
import { DAY_NAMES, DAY_SHORT, classesForDay, findFocusClass, formatTime, type ClassSlot } from "@/lib/timetable";
import { cn } from "@/lib/utils";

type View = "today" | "tomorrow" | "week";

const STATUS_STYLE = {
  moved: { className: "bg-warning-soft text-warning ring-warning/30", Icon: AlertTriangle },
  delayed: { className: "bg-warning-soft text-warning ring-warning/30", Icon: Timer },
  cancelled: { className: "bg-urgent-soft text-urgent ring-urgent/30", Icon: Ban },
};

function ClassRow({ c, focus }: { c: ClassSlot; focus: "now" | "next" | null }) {
  const cancelled = c.status?.type === "cancelled";
  const status = c.status ? STATUS_STYLE[c.status.type] : null;
  return (
    <li
      className={cn(
        "relative flex gap-3 rounded-2xl p-3 ring-1 ring-inset transition sm:gap-4 sm:p-4",
        focus ? "bg-card shadow-glow ring-primary/60" : "bg-card ring-border",
        cancelled && "opacity-70",
      )}
    >
      <div className="w-16 shrink-0 text-right sm:w-20">
        <p className={cn("font-display text-sm font-bold sm:text-base", cancelled && "line-through")}>{formatTime(c.start)}</p>
        <p className="text-xs text-muted-foreground">{formatTime(c.end)}</p>
      </div>
      <div className={cn("w-1 shrink-0 rounded-full", focus ? "bg-primary" : "bg-border")} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-primary">{c.code}</span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.kind}</span>
          {focus && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
              {focus === "now" ? "In session" : "Up next"}
            </span>
          )}
        </div>
        <p className={cn("mt-0.5 truncate font-semibold", cancelled && "line-through")}>{c.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><User className="size-3" />{c.lecturer}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{c.venue}</span>
        </div>
        {c.status && status && (
          <div className={cn("mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset", status.className)}>
            <status.Icon className="size-3.5" />
            {c.status.text}
            <span className="font-normal opacity-75">· {c.status.source}</span>
          </div>
        )}
      </div>
    </li>
  );
}

function EmptyDay({ day }: { day: number }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-10 text-center ring-1 ring-border">
      <span className="grid size-12 place-items-center rounded-2xl bg-official-soft text-official">
        <Coffee className="size-6" />
      </span>
      <p className="mt-3 font-display text-lg font-semibold">No classes {day >= 5 ? "this " + DAY_NAMES[day] : "today"}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">Rest up, catch up on notes, or try a 5-minute practice quiz when you're ready.</p>
      <Link to="/prepare" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Light revision <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function ExamList() {
  const { ctx } = useHendux();
  const exams = getExams(ctx);
  return (
    <ul className="space-y-2.5">
      {exams.map((e, i) => {
        const days = Math.ceil((e.date.getTime() - DEMO_NOW.getTime()) / 86400000);
        return (
          <li key={e.courseId} className={cn("flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-inset sm:flex-row sm:items-center", i === 0 ? "ring-primary/60 shadow-glow" : "ring-border")}>
            <div className="flex items-center gap-3 sm:w-56">
              <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-ink py-2 text-ink-foreground">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{e.date.toLocaleDateString("en-GB", { month: "short" })}</span>
                <span className="font-display text-xl font-bold leading-none">{e.date.getDate()}</span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-primary">{e.code}</p>
                <p className="truncate font-semibold">{e.title}</p>
                <p className="text-xs text-muted-foreground">in {days} days</p>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted-foreground">Time</p><p className="font-semibold">{formatTime(e.start)} – {formatTime(e.end)}</p></div>
              <div><p className="text-muted-foreground">Hall</p><p className="font-semibold">{e.hall}</p></div>
              <div><p className="text-muted-foreground">Seat range</p><p className="font-semibold">{e.seats}</p></div>
            </div>
            <Link
              to="/resources/$courseId"
              params={{ courseId: e.courseId }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Revise Past Questions <ArrowRight className="size-3.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Timetable() {
  const { ctx } = useHendux();
  const [view, setView] = useState<View>("today");
  const [weekDay, setWeekDay] = useState(DEMO_DAY);
  const [examMode, setExamMode] = useState(false);
  const slots = useMemo(() => getTimetable(ctx), [ctx]);

  const day = view === "today" ? DEMO_DAY : view === "tomorrow" ? (DEMO_DAY + 1) % 7 : weekDay;
  const dayClasses = classesForDay(slots, day);
  const focus = day === DEMO_DAY ? findFocusClass(dayClasses, DEMO_MINUTES) : null;
  const liveCount = dayClasses.filter((c) => c.status).length;

  return (
    <section aria-labelledby="tt-title" className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 id="tt-title" className="flex items-center gap-2 text-lg font-bold">
            {examMode ? <GraduationCap className="size-5 text-primary" /> : <Clock className="size-5 text-primary" />}
            {examMode ? "Exam schedule" : "Timetable"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {examMode ? "First Semester examinations · Registrar approved" : `${DAY_NAMES[day]}${day === DEMO_DAY ? " · Today, 10:15 AM" : ""}${liveCount ? ` · ${liveCount} live update${liveCount > 1 ? "s" : ""}` : ""}`}
          </p>
        </div>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold ring-1 ring-border">
          Exam Mode
          <Switch checked={examMode} onCheckedChange={setExamMode} aria-label="Toggle exam mode" />
        </label>
      </div>

      {!examMode && (
        <>
          <div className="inline-flex rounded-xl bg-muted p-1" role="tablist">
            {(["today", "tomorrow", "week"] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn("rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition", view === v ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground")}
              >
                {v === "week" ? "Full Week" : v}
              </button>
            ))}
          </div>

          {view === "week" && (
            <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1">
              {DAY_SHORT.map((d, i) => {
                const count = classesForDay(slots, i).length;
                return (
                  <button
                    key={d}
                    onClick={() => setWeekDay(i)}
                    className={cn(
                      "flex min-w-14 flex-col items-center rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-inset transition",
                      weekDay === i ? "bg-ink text-ink-foreground ring-ink" : "bg-card ring-border hover:ring-primary/40",
                    )}
                  >
                    {d}
                    <span className={cn("mt-1 text-[10px] font-medium", weekDay === i ? "text-ink-muted" : "text-muted-foreground")}>{count ? `${count} class${count > 1 ? "es" : ""}` : "Free"}</span>
                    {i === DEMO_DAY && <span className="mt-1 size-1 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          )}

          {dayClasses.length === 0 ? (
            <EmptyDay day={day} />
          ) : (
            <ol className="space-y-2.5">
              {dayClasses.map((c) => (
                <ClassRow key={c.id} c={c} focus={focus?.id === c.id ? focus.kind : null} />
              ))}
            </ol>
          )}
        </>
      )}

      {examMode && <ExamList />}
    </section>
  );
}
