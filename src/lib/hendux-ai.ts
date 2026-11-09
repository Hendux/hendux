// Scripted sample answers for the Hendux AI prototype.
import { DAY_NAMES, classesForDay, findFocusClass, formatTime } from "./timetable";
import { DEMO_DAY, DEMO_MINUTES, UPDATES, getTimetable, type AcademicContext, type Course, type Tier } from "./hendux-data";

export type AIMode = "campus" | "resource" | "study";
export type Citation = { label: string; tier: Tier };
export type AIReply = {
  mode: AIMode;
  text: string;
  bullets?: string[];
  citations: Citation[];
  link?: { label: string; to: "/resources" | "/ai" | "/updates" | "/ai/exam-prep" };
};

export const MODE_LABEL: Record<AIMode, string> = {
  campus: "Campus Assistant",
  resource: "Resource Assistant",
  study: "Study Assistant",
};

export const QUICK_PROMPTS = ["What's my next class?", "Which events are for me?", "Explain virtual memory", "Find CSC 305 past questions", "When is my first exam?"];

/** A believable summary for an uploaded or listed document. */
export function summarizeDoc(name: string): { title: string; bullets: string[] } {
  const clean = name.replace(/\.pdf$/i, "");
  return {
    title: clean,
    bullets: [
      `Main idea: ${clean} sets out the core definitions and the method examiners expect you to follow.`,
      "Section 1 defines the key terms and links them to the course outline.",
      "Section 2 works through two examples step by step, showing where marks are given.",
      "Section 3 lists common mistakes: skipping units, missing assumptions and incomplete conclusions.",
      "Revise next: the worked examples, then try a 5-question quiz on this document.",
    ],
  };
}

export function answer(prompt: string, ctx: AcademicContext, courses: Course[]): AIReply {
  const p = prompt.toLowerCase();
  const level = `${ctx.department} ${ctx.level}L`;

  if (p.startsWith("summarize") || p.startsWith("summarise")) {
    const name = prompt.replace(/^summari[sz]e\s*/i, "").replace(/^["“]|["”]$/g, "") || "this document";
    const s = summarizeDoc(name);
    return { mode: "resource", text: `Here's a short summary of “${s.title}”:`, bullets: s.bullets, citations: [{ label: s.title, tier: "community" }] };
  }

  if (p.startsWith("quiz me") || p.includes("create a quiz")) {
    return {
      mode: "study",
      text: "Here are three questions from that document. Answer them in your head, then check the notes:",
      bullets: ["1. Define the main term in your own words.", "2. Work through the second example without looking.", "3. Name one common mistake and how to avoid it."],
      citations: [],
      link: { label: "Open quiz tools in Hendux AI", to: "/ai" },
    };
  }

  if (p.includes("next class") || p.includes("class today") || p.includes("timetable")) {
    const today = classesForDay(getTimetable(courses), DEMO_DAY);
    const focus = findFocusClass(today, DEMO_MINUTES);
    const cls = today.find((c) => c.id === focus?.id);
    if (!cls) return { mode: "campus", text: "You have no more classes today. Enjoy the break!", citations: [] };
    const after = today.filter((c) => c.start > cls.start && c.status?.type !== "cancelled");
    return {
      mode: "campus",
      text: `${focus?.kind === "now" ? "You're in" : "Up next:"} ${cls.code} ${cls.title} (${cls.kind}), ${formatTime(cls.start)} – ${formatTime(cls.end)} at ${cls.venue} with ${cls.lecturer}.${cls.status ? ` Heads up: ${cls.status.text.toLowerCase()}.` : ""}`,
      bullets: after.map((c) => `${formatTime(c.start)} · ${c.code} ${c.title} · ${c.venue}`),
      citations: [
        { label: `${level} timetable (${DAY_NAMES[DEMO_DAY]})`, tier: "official" },
        ...(cls.status ? [{ label: cls.status.source, tier: "community" as Tier }] : []),
      ],
    };
  }

  if (p.includes("event")) {
    const events = UPDATES.filter((u) => u.category === "event" && u.when);
    return {
      mode: "campus",
      text: `Based on your profile (${level}), these upcoming events are a strong match:`,
      bullets: events.map((e) => `${e.title} · ${e.when!.label} at ${e.when!.venue}`),
      citations: events.map((e) => ({ label: e.source, tier: e.tier })),
      link: { label: "Open Campus Updates", to: "/updates" },
    };
  }

  if (p.includes("virtual memory") || p.includes("paging") || p.includes("explain")) {
    return {
      mode: "study",
      text: "Virtual memory gives every process its own large, private address space. The OS keeps only the pages currently in use in RAM and stores the rest on disk.",
      bullets: [
        "Paging: memory is split into fixed-size pages (logical) and frames (physical). A page table maps one to the other.",
        "Page fault: the page you need isn't in RAM, so the OS loads it from disk, evicting a victim page with FIFO, LRU or Optimal if needed.",
        "Thrashing: too many processes, too few frames, so the CPU spends its time swapping pages instead of working.",
        "Exam tip: CSC 301 asked you to trace LRU vs FIFO page faults in 2023, 2024 and 2025.",
      ],
      citations: [
        { label: "CSC 301 Verified Notes · Virtual Memory, p.12", tier: "verified" },
        { label: "Dr. Elena Marsh · Lecture 7 slides", tier: "official" },
      ],
      link: { label: "Practise in Exam Preparation", to: "/ai/exam-prep" },
    };
  }

  if (p.includes("past question") || p.includes("find") || p.includes("note")) {
    return {
      mode: "resource",
      text: "Here's what I found in Resources for CSC 305 Database Systems:",
      bullets: ["Past questions 2021 – 2025 (4 of 5 with worked solutions)", "Hendux Verified lecture notes, 48 pages", "CSC 305 formula & definitions sheet", "Top student upload: Adaeze N.'s scanned notes (214 upvotes)"],
      citations: [
        { label: "Hendux Resources · CSC 305", tier: "verified" },
        { label: "Department past question archive", tier: "official" },
      ],
      link: { label: "Open Resources", to: "/resources" },
    };
  }

  if (p.includes("exam")) {
    return {
      mode: "campus",
      text: "The first semester exam timetable isn't out yet. The Registry has confirmed it will be released on Monday 23 November, and it will appear in your academic calendar automatically.",
      bullets: ["Your weakest CSC 301 topic right now is Virtual Memory & Paging. Want to practise it?"],
      citations: [{ label: "Office of the Registrar · release date notice", tier: "official" }],
      link: { label: "Go to Exam Preparation", to: "/ai/exam-prep" },
    };
  }

  if (p.includes("tell me about") || p.includes("what is it about") || p.includes("what's it about")) {
    const match = UPDATES.find((u) => p.includes(u.title.toLowerCase()));
    if (match) {
      return {
        mode: "campus",
        text: match.body,
        bullets: match.when ? [`When: ${match.when.label}`, `Where: ${match.when.venue}`, `For: ${match.audience}`] : [`Audience: ${match.audience}`, `Posted ${match.posted}`],
        citations: [{ label: match.source, tier: match.tier }],
      };
    }
  }

  return {
    mode: "study",
    text: `I'm your Hendux assistant for ${ctx.universityShort} ${level}. I can tell you about classes and campus notices, find past questions and notes, summarise a PDF or explain a topic from your courses.`,
    bullets: ["Try: \u201cWhat's my next class?\u201d", "Try: \u201cExplain virtual memory\u201d", "Try: \u201cFind CSC 305 past questions\u201d"],
    citations: [],
  };
}
