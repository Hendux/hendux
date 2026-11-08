// Pure timetable helpers. Days are 0 = Monday ... 6 = Sunday.

export type LiveStatus = {
  type: "moved" | "cancelled" | "delayed";
  text: string;
  source: string;
};

export type ClassSlot = {
  id: string;
  day: number;
  start: string; // "HH:MM" 24h
  end: string;
  courseId: string;
  code: string;
  title: string;
  lecturer: string;
  venue: string;
  kind: "Lecture" | "Lab" | "Tutorial";
  status?: LiveStatus | undefined;
};

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function toMinutes(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function classesForDay(slots: ClassSlot[], day: number): ClassSlot[] {
  return slots
    .filter((s) => s.day === day)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

/**
 * The class to highlight: the one in session right now, otherwise the next one
 * still to start today. Cancelled classes are never highlighted.
 */
export function findFocusClass(
  dayClasses: ClassSlot[],
  nowMinutes: number,
): { id: string; kind: "now" | "next" } | null {
  const active = dayClasses.filter((c) => c.status?.type !== "cancelled");
  const current = active.find(
    (c) => toMinutes(c.start) <= nowMinutes && nowMinutes < toMinutes(c.end),
  );
  if (current) return { id: current.id, kind: "now" };
  const next = active.find((c) => toMinutes(c.start) > nowMinutes);
  if (next) return { id: next.id, kind: "next" };
  return null;
}
