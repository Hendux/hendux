// Scripted sample answers for the Hendux AI prototype.
import { DAY_NAMES, classesForDay, findFocusClass, formatTime } from "./timetable";
import {
  DEMO_DAY,
  DEMO_MINUTES,
  UPDATES,
  getExams,
  getTimetable,
  type AcademicContext,
  type Tier,
} from "./hendux-data";

export type AIMode = "campus" | "resource" | "study";
export type Citation = { label: string; tier: Tier };
export type AIReply = {
  mode: AIMode;
  text: string;
  bullets?: string[];
  citations: Citation[];
  link?: { label: string; to: "/resources" | "/prepare" | "/updates"; };
};

export const MODE_LABEL: Record<AIMode, string> = {
  campus: "Campus Assistant",
  resource: "Resource Assistant",
  study: "Study Assistant",
};

export const QUICK_PROMPTS = [
  "What's my next class?",
  "Which events are for me?",
  "Explain virtual memory",
  "Find CSC 305 past questions",
  "When is my first exam?",
];

export function answer(prompt: string, ctx: AcademicContext): AIReply {
  const p = prompt.toLowerCase();
  const level = `${ctx.department} ${ctx.level}L`;

  if (p.includes("next class") || p.includes("class today") || p.includes("timetable")) {
    const today = classesForDay(getTimetable(ctx), DEMO_DAY);
    const focus = findFocusClass(today, DEMO_MINUTES);
    const cls = today.find((c) => c.id === focus?.id);
    if (!cls) return { mode: "campus", text: "You have no more classes today. Enjoy the break!", citations: [] };
    const after = today.filter((c) => c.start > cls.start && c.status?.type !== "cancelled");
    return {
      mode: "campus",
      text: `${focus?.kind === "now" ? "You're in" : "Up next:"} ${cls.code} ${cls.title} (${cls.kind}), ${formatTime(cls.start)} – ${formatTime(cls.end)} at ${cls.venue} with ${cls.lecturer}.${cls.status ? ` Heads up: ${cls.status.text.toLowerCase()}.` : ""}`,
      bullets: after.map((c) => `${formatTime(c.start)} · ${c.code} ${c.title} — ${c.venue}`),
      citations: [
        { label: `${ctx.department} ${ctx.level}L timetable (${DAY_NAMES[DEMO_DAY]})`, tier: "official" },
        ...(cls.status ? [{ label: cls.status.source, tier: "community" as Tier }] : []),
      ],
    };
  }

  if (p.includes("event")) {
    const events = UPDATES.filter((u) => u.event);
    return {
      mode: "campus",
      text: `Based on your profile (${level}), these upcoming events are a strong match:`,
      bullets: events.map((e) => `${e.title} — ${e.event!.date}, ${e.event!.time} at ${e.event!.venue}`),
      citations: events.map((e) => ({ label: e.source, tier: e.tier })),
      link: { label: "Open Events", to: "/updates" },
    };
  }

  if (p.includes("virtual memory") || p.includes("paging") || p.includes("explain")) {
    return {
      mode: "study",
      text: "Virtual memory gives every process its own large, private address space. The OS keeps only the pages currently in use in RAM and stores the rest on disk.",
      bullets: [
        "Paging: memory is split into fixed-size pages (logical) and frames (physical). A page table maps one to the other.",
        "Page fault: the page you need isn't in RAM, so the OS loads it from disk, evicting a victim page with FIFO, LRU or Optimal if needed.",
        "Thrashing: too many processes, too few frames — the CPU spends its time swapping pages instead of working.",
        "Exam tip: CSC 301 asked you to trace LRU vs FIFO page faults in 2023, 2024 and 2025.",
      ],
      citations: [
        { label: "CSC 301 Verified Notes · Virtual Memory, p.12", tier: "verified" },
        { label: "Dr. A. Adewale · Lecture 7 slides", tier: "official" },
      ],
      link: { label: "Practise this topic", to: "/prepare" },
    };
  }

  if (p.includes("past question") || p.includes("pq") || p.includes("find") || p.includes("note")) {
    return {
      mode: "resource",
      text: "Here's what I found in the Resource Hub for CSC 305 Database Systems:",
      bullets: [
        "Past questions 2021 – 2025 (4 of 5 with worked solutions)",
        "Hendux Verified lecture notes — 48 pages",
        "Pro: CSC 305 formula & definitions sheet",
        "Top community note: Adaeze N.'s handwritten notes (★ 4.8, 214 upvotes)",
      ],
      citations: [
        { label: "Hendux Resource Hub · CSC 305", tier: "verified" },
        { label: "Department past question archive", tier: "official" },
      ],
      link: { label: "Open Resources", to: "/resources" },
    };
  }

  if (p.includes("exam")) {
    const [first] = getExams(ctx);
    return {
      mode: "campus",
      text: `Your first paper is ${first.code} ${first.title} on ${first.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}, ${formatTime(first.start)} at ${first.hall} (${first.seats}).`,
      bullets: ["Arrive 30 minutes early with your ID card and exam docket.", "Your weakest CSC 301 topic is Virtual Memory (46%). Want a quick quiz?"],
      citations: [{ label: "Registrar · First Semester Exam Timetable", tier: "official" }],
      link: { label: "Go to Exam Prep", to: "/prepare" },
    };
  }

  if (p.includes("tell me about")) {
    const match = UPDATES.find((u) => p.includes(u.title.toLowerCase()));
    if (match) {
      return {
        mode: "campus",
        text: match.body,
        bullets: match.event ? [`When: ${match.event.date}, ${match.event.time}`, `Where: ${match.event.venue}`, `For: ${match.audience}`] : [`Audience: ${match.audience}`, `Posted ${match.posted}`],
        citations: [{ label: match.source, tier: match.tier }],
      };
    }
  }

  return {
    mode: "study",
    text: `I'm your Hendux assistant for ${ctx.universityShort} ${level}. I can tell you about classes and campus notices, find past questions and notes, or explain a topic from your courses.`,
    bullets: ["Try: \u201cWhat's my next class?\u201d", "Try: \u201cExplain virtual memory\u201d", "Try: \u201cFind CSC 305 past questions\u201d"],
    citations: [],
  };
}
