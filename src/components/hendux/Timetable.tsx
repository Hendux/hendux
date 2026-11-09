import { useMemo, useState } from "react";
import { AlertTriangle, Ban, Coffee, MapPin, Timer, User } from "lucide-react";
import { useHendux } from "@/lib/hendux-store";
import { DEMO_DAY, DEMO_MINUTES, getTimetable } from "@/lib/hendux-data";
import { DAY_NAMES, DAY_SHORT, classesForDay, findFocusClass, formatTime, type ClassSlot } from "@/lib/timetable";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  moved: { className: "bg-warning-soft text-warning ring-warning/30", Icon: AlertTriangle },
  delayed: { className: "bg-warning-soft text-warning ring-warning/30", Icon: Timer },
  cancelled: { className: "bg-urgent-soft text-urgent ring-urgent/30", Icon: Ban },
};

export function ClassRow({ c, focus }: { c: ClassSlot; focus: "now" | "next" | null }) {
  const cancelled = c.status?.type === "cancelled";
  const status = c.status ? STATUS_STYLE[c.status.type] : null;
  return (
    <li
      className={cn(
        "relative flex gap-3 rounded-2xl p-3 ring-1 ring-inset transition",
        focus ? "bg-card shadow-glow ring-primary/60" : "bg-card ring-border",
        cancelled && "opacity-70",
      )}
    >
      <div className="w-16 shrink-0 text-right">
        <p className={cn("font-display text-sm font-bold", cancelled && "line-through")}>{formatTime(c.start)}</p>
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

export function EmptyDay({ day }: { day: number }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-8 text-center ring-1 ring-border">
      <span className="grid size-11 place-items-center rounded-2xl bg-official-soft text-official">
        <Coffee className="size-5" />
      </span>
      <p className="mt-3 font-display text-base font-semibold">No classes on {DAY_NAMES[day]}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">A good day to catch up on notes or take a short practice quiz.</p>
    </div>
  );
}

export function useMyTimetable() {
  const { courses } = useHendux();
  return useMemo(() => getTimetable(courses), [courses]);
}

/** Today's classes, lined up with the current time. */
export function TodayClasses() {
  const slots = useMyTimetable();
  const today = classesForDay(slots, DEMO_DAY);
  const focus = findFocusClass(today, DEMO_MINUTES);
  if (today.length === 0) return <EmptyDay day={DEMO_DAY} />;
  return (
    <ol className="space-y-2.5">
      {today.map((c) => (
        <ClassRow key={c.id} c={c} focus={focus?.id === c.id ? focus.kind : null} />
      ))}
    </ol>
  );
}

/** Full week view with day picker. */
export function WeekTimetable() {
  const slots = useMyTimetable();
  const [day, setDay] = useState(DEMO_DAY);
  const dayClasses = classesForDay(slots, day);
  const focus = day === DEMO_DAY ? findFocusClass(dayClasses, DEMO_MINUTES) : null;
  return (
    <div className="space-y-3">
      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {DAY_SHORT.slice(0, 5).map((d, i) => {
          const count = classesForDay(slots, i).length;
          return (
            <button
              key={d}
              onClick={() => setDay(i)}
              className={cn(
                "flex min-w-14 flex-1 flex-col items-center rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-inset transition",
                day === i ? "bg-ink text-ink-foreground ring-ink" : "bg-card ring-border hover:ring-primary/40",
              )}
            >
              {d}
              <span className={cn("mt-1 text-[10px] font-medium", day === i ? "text-ink-muted" : "text-muted-foreground")}>{count ? `${count} class${count > 1 ? "es" : ""}` : "Free"}</span>
              {i === DEMO_DAY && <span className="mt-1 size-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      {dayClasses.length === 0 ? (
        <EmptyDay day={day} />
      ) : (
        <ol className="space-y-2.5">
          {dayClasses.map((c) => (
            <ClassRow key={c.id} c={c} focus={focus?.id === c.id ? focus.kind : null} />
          ))}
        </ol>
      )}
    </div>
  );
}
