// Sample data for the Hendux prototype. Everything here is illustrative.
import hackathonImg from "@/assets/event-hackathon.jpg";
import careerFairImg from "@/assets/event-careerfair.jpg";
import aiLectureImg from "@/assets/event-ai-lecture.jpg";
import type { ClassSlot, LiveStatus } from "./timetable";

// ---------- Demo clock ----------
// The prototype runs on a fixed "now" so the experience is the same at any hour.
export const DEMO_NOW = new Date(2026, 10, 9, 10, 15); // Mon 9 Nov 2026, 10:15
export const DEMO_DAY = 0; // Monday
export const DEMO_MINUTES = 10 * 60 + 15;
export const STUDENT = { firstName: "Prosper", lastName: "Nduka", matric: "190805042", initials: "PN" };

// ---------- Academic context ----------
export type AcademicContext = {
  university: string;
  universityShort: string;
  faculty: string;
  facultyShort: string;
  department: string;
  departmentShort: string;
  level: number;
  semester: 1 | 2;
};

export const DEFAULT_CONTEXT: AcademicContext = {
  university: "University of Lagos",
  universityShort: "UNILAG",
  faculty: "Faculty of Science",
  facultyShort: "Science",
  department: "Computer Science",
  departmentShort: "Comp Sci",
  level: 300,
  semester: 1,
};

export const DEPARTMENTS = [
  { name: "Computer Science", short: "Comp Sci", prefix: "CSC" },
  { name: "Mathematics", short: "Maths", prefix: "MTH" },
  { name: "Physics", short: "Physics", prefix: "PHY" },
  { name: "Biochemistry", short: "Biochem", prefix: "BCH" },
] as const;

export const LEVELS = [100, 200, 300, 400] as const;

export function isDefaultContext(c: AcademicContext) {
  return c.department === DEFAULT_CONTEXT.department && c.level === DEFAULT_CONTEXT.level && c.semester === DEFAULT_CONTEXT.semester;
}

// ---------- Courses ----------
export type Course = {
  id: string;
  code: string;
  title: string;
  lecturer: string;
  units: number;
  venue: string;
  tone: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
  progress: number;
};

const LECTURERS = ["Dr. A. Adewale", "Prof. F. Okonkwo", "Dr. B. Ibrahim", "Dr. C. Eze", "Dr. T. Bello", "Prof. K. Afolabi"];
const VENUES = ["LT 1, Science Complex", "CSC Lab 1", "Main Auditorium Annex", "LT 3, Science Complex", "CSC Seminar Room", "LT 2, Science Complex"];
const TONES: Course["tone"][] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-1"];
const PROGRESS = [68, 42, 55, 30, 74, 18];

const CORE_CSC_300_1: [string, string][] = [
  ["CSC 301", "Operating Systems"],
  ["CSC 305", "Database Systems"],
  ["MTH 311", "Numerical Analysis"],
  ["CSC 303", "Data Communication & Networks"],
  ["CSC 307", "Software Engineering"],
  ["CSC 309", "Compiler Construction"],
];

const DEPT_TITLES: Record<string, string[]> = {
  CSC: ["Programming Fundamentals", "Data Structures", "Discrete Structures", "Computer Architecture", "Algorithms", "Systems Analysis"],
  MTH: ["Real Analysis", "Linear Algebra", "Abstract Algebra", "Differential Equations", "Complex Analysis", "Mathematical Methods"],
  PHY: ["Classical Mechanics", "Electromagnetism", "Quantum Physics", "Thermal Physics", "Electronics", "Optics & Waves"],
  BCH: ["Biomolecules", "Enzymology", "Metabolism", "Molecular Biology", "Bioenergetics", "Clinical Biochemistry"],
};

export function getCourses(ctx: AcademicContext): Course[] {
  const dept = DEPARTMENTS.find((d) => d.name === ctx.department) ?? DEPARTMENTS[0];
  const pairs: [string, string][] = isDefaultContext(ctx)
    ? CORE_CSC_300_1
    : DEPT_TITLES[dept.prefix].map((title, i) => {
        const n = ctx.semester === 1 ? 2 * i + 1 : 2 * i + 2;
        return [`${dept.prefix} ${ctx.level / 100}${String(n).padStart(2, "0")}`, title];
      });
  return pairs.map(([code, title], i) => ({
    id: code.toLowerCase().replace(" ", "-"),
    code,
    title,
    lecturer: LECTURERS[i],
    units: i === 2 ? 2 : 3,
    venue: VENUES[i],
    tone: TONES[i],
    progress: PROGRESS[i],
  }));
}

// ---------- Timetable ----------
type TemplateSlot = { day: number; start: string; end: string; c: number; kind: ClassSlot["kind"]; venue?: string; status?: LiveStatus };

const TEMPLATE: TemplateSlot[] = [
  { day: 0, start: "08:00", end: "10:00", c: 0, kind: "Lecture" },
  {
    day: 0, start: "10:00", end: "12:00", c: 1, kind: "Lab", venue: "CSC Lab 2",
    status: { type: "moved", text: "Moved to Lab 2", source: "Course Rep · 25 min ago" },
  },
  { day: 0, start: "13:00", end: "14:00", c: 2, kind: "Lecture" },
  { day: 0, start: "15:00", end: "17:00", c: 4, kind: "Tutorial" },
  { day: 1, start: "09:00", end: "11:00", c: 3, kind: "Lecture" },
  {
    day: 1, start: "12:00", end: "14:00", c: 5, kind: "Lecture",
    status: { type: "cancelled", text: "Cancelled by Lecturer", source: "Dept. Office · Official" },
  },
  { day: 1, start: "14:00", end: "16:00", c: 2, kind: "Tutorial" },
  { day: 2, start: "08:00", end: "10:00", c: 1, kind: "Lecture" },
  { day: 2, start: "11:00", end: "13:00", c: 0, kind: "Lab", venue: "CSC Lab 1" },
  { day: 2, start: "14:00", end: "15:00", c: 4, kind: "Lecture" },
  { day: 3, start: "10:00", end: "12:00", c: 5, kind: "Lecture" },
  { day: 3, start: "13:00", end: "15:00", c: 3, kind: "Lab", venue: "Networking Lab" },
  { day: 4, start: "08:00", end: "10:00", c: 2, kind: "Lecture" },
  {
    day: 4, start: "10:30", end: "11:30", c: 0, kind: "Tutorial",
    status: { type: "delayed", text: "Starts 30 min late", source: "Hendux-Verified" },
  },
];

export function getTimetable(ctx: AcademicContext): ClassSlot[] {
  const courses = getCourses(ctx);
  return TEMPLATE.map((t, i) => {
    const course = courses[t.c]!;
    return {
      id: `slot-${i}`,
      day: t.day,
      start: t.start,
      end: t.end,
      courseId: course.id,
      code: course.code,
      title: course.title,
      lecturer: course.lecturer,
      venue: t.venue ?? course.venue,
      kind: t.kind,
      status: t.status,
    };
  });
}

// ---------- Exams ----------
export type Exam = {
  courseId: string;
  code: string;
  title: string;
  date: Date;
  start: string;
  end: string;
  hall: string;
  seats: string;
};

const EXAM_PLAN = [
  { c: 0, d: 7, start: "09:00", end: "12:00", hall: "Main Auditorium", seats: "Seats A120 – A260" },
  { c: 1, d: 9, start: "13:00", end: "16:00", hall: "Science Complex Hall B", seats: "Seats B001 – B145" },
  { c: 2, d: 11, start: "09:00", end: "11:00", hall: "Engineering ER 1", seats: "Rows 4 – 12" },
  { c: 3, d: 14, start: "09:00", end: "12:00", hall: "Main Auditorium", seats: "Seats C010 – C190" },
  { c: 4, d: 16, start: "13:00", end: "15:00", hall: "Science Complex Hall A", seats: "Seats A001 – A130" },
  { c: 5, d: 18, start: "09:00", end: "12:00", hall: "J. F. Ade-Ajayi Auditorium", seats: "Block 2, Rows 1 – 9" },
];

export function getExams(ctx: AcademicContext): Exam[] {
  const courses = getCourses(ctx);
  return EXAM_PLAN.map((e) => {
    const course = courses[e.c]!;
    const [h = 0, m = 0] = e.start.split(":").map(Number);
    return {
      courseId: course.id,
      code: course.code,
      title: course.title,
      date: new Date(2026, 11, e.d, h, m),
      start: e.start,
      end: e.end,
      hall: e.hall,
      seats: e.seats,
    };
  });
}

// ---------- Urgency ----------
export const URGENT_ITEMS = [
  { id: "u1", kind: "deadline" as const, title: "CSC 305 Lab Report 3 due tonight", detail: "Submit on the department portal before 11:59 PM", due: "13h 44m left" },
  { id: "u2", kind: "notice" as const, title: "Course registration closes Friday", detail: "Registry: late registration attracts a ₦10,000 fee", due: "4 days left" },
];

// ---------- Campus updates ----------
export type Tier = "official" | "verified" | "community";
export type UpdateCategory = "academic" | "faculty" | "events";
export type CampusUpdate = {
  id: string;
  title: string;
  body: string;
  source: string;
  tier: Tier;
  category: UpdateCategory;
  posted: string;
  audience: string;
  event?: { image: string; date: string; time: string; venue: string; start: Date; end: Date };
};

export const UPDATES: CampusUpdate[] = [
  {
    id: "n1",
    title: "First Semester Examination Timetable Released",
    body: "The approved 2026/2027 first semester examination timetable is now available. Students should confirm hall allocations and seat numbers on the student portal at least 48 hours before each paper.",
    source: "Office of the Registrar",
    tier: "official",
    category: "academic",
    posted: "2h ago",
    audience: "All students",
  },
  {
    id: "n2",
    title: "CSC 305 lab moved to CSC Lab 2 today",
    body: "Today's Database Systems practical holds in CSC Lab 2 (ground floor) because of a power fault in Lab 1. Bring your ER diagrams from last week.",
    source: "Chidinma O. · CSC 300L Course Rep",
    tier: "community",
    category: "faculty",
    posted: "25 min ago",
    audience: "CSC 300L",
  },
  {
    id: "e1",
    title: "UNILAG x Google Developer Hackathon 2026",
    body: "48 hours, ₦3M in prizes and mentorship from Google engineers. Teams of 2–4. Build for education, health or fintech in Lagos.",
    source: "GDSC UNILAG",
    tier: "verified",
    category: "events",
    posted: "Yesterday",
    audience: "Science & Engineering",
    event: { image: hackathonImg, date: "Fri, 20 Nov", time: "6:00 PM", venue: "Faculty of Engineering Hall", start: new Date(2026, 10, 20, 18, 0), end: new Date(2026, 10, 22, 18, 0) },
  },
  {
    id: "n3",
    title: "Dean's Notice: Faculty of Science Matriculation Rehearsal",
    body: "All 100 Level students of the Faculty of Science must attend the matriculation rehearsal. Senior students serving as ushers should report to the Faculty Officer.",
    source: "Office of the Dean, Faculty of Science",
    tier: "official",
    category: "faculty",
    posted: "5h ago",
    audience: "Faculty of Science",
  },
  {
    id: "e2",
    title: "Tech & Data Career Fair",
    body: "Meet 30+ employers hiring interns and graduates — Flutterwave, Andela, Paystack, MTN and more. Bring printed CVs. SIWES placements available for 300L.",
    source: "UNILAG Career Services",
    tier: "official",
    category: "events",
    posted: "2 days ago",
    audience: "300L & 400L",
    event: { image: careerFairImg, date: "Wed, 18 Nov", time: "10:00 AM", venue: "Multipurpose Hall", start: new Date(2026, 10, 18, 10, 0), end: new Date(2026, 10, 18, 15, 0) },
  },
  {
    id: "n4",
    title: "CSC 309 Tuesday lecture cancelled",
    body: "Prof. Afolabi's Compiler Construction lecture on Tuesday is cancelled. A make-up class will be announced. Confirmed with the department office.",
    source: "Hendux Campus Desk",
    tier: "verified",
    category: "academic",
    posted: "3h ago",
    audience: "CSC 300L",
  },
  {
    id: "e3",
    title: "Public Lecture: AI in African Healthcare",
    body: "The Department of Computer Science hosts Dr. Ngozi Eke (DeepMind) on building responsible AI for clinics across West Africa. Q&A and networking after.",
    source: "Department of Computer Science",
    tier: "official",
    category: "events",
    posted: "3 days ago",
    audience: "All Science students",
    event: { image: aiLectureImg, date: "Thu, 12 Nov", time: "2:00 PM", venue: "LT 1, Science Complex", start: new Date(2026, 10, 12, 14, 0), end: new Date(2026, 10, 12, 16, 0) },
  },
  {
    id: "n5",
    title: "Study group for MTH 311 this Thursday",
    body: "We're revising Newton–Raphson and interpolation before the CA test. Faculty Library, 2nd floor, 4 PM. Everyone welcome.",
    source: "Tunde A. · Student",
    tier: "community",
    category: "academic",
    posted: "6h ago",
    audience: "MTH 311 students",
  },
];

// ---------- Resources ----------
export type PastQuestion = { id: string; year: number; title: string; questions: number; hasSolution: boolean };
export type VerifiedNote = { id: string; title: string; kind: "Notes" | "Formula sheet" | "Summary"; pages: number; pro: boolean };
export type CommunityNote = { id: string; title: string; author: string; upvotes: number; rating: number; pages: number };

export function getCourseResources(course: Course) {
  const pastQuestions: PastQuestion[] = [2025, 2024, 2023, 2022, 2021].map((year, i) => ({
    id: `${course.id}-pq-${year}`,
    year,
    title: `${course.code} ${year}/${year + 1 - 2000} First Semester Exam`,
    questions: 6 + (i % 3),
    hasSolution: i !== 3,
  }));
  const verifiedNotes: VerifiedNote[] = [
    { id: `${course.id}-vn-1`, title: `${course.title}: Complete Lecture Notes`, kind: "Notes", pages: 48, pro: false },
    { id: `${course.id}-vn-2`, title: `${course.code} Formula & Definitions Sheet`, kind: "Formula sheet", pages: 4, pro: true },
    { id: `${course.id}-vn-3`, title: `${course.code} Exam Summary — Top 20 Topics`, kind: "Summary", pages: 12, pro: true },
  ];
  const communityNotes: CommunityNote[] = [
    { id: `${course.id}-cn-1`, title: `My ${course.title} notes (handwritten, scanned)`, author: "Adaeze N.", upvotes: 214, rating: 4.8, pages: 36 },
    { id: `${course.id}-cn-2`, title: `${course.code} tutorial solutions weeks 1–6`, author: "Ibrahim K.", upvotes: 132, rating: 4.5, pages: 18 },
    { id: `${course.id}-cn-3`, title: `Quick revision mind-maps`, author: "Funmi O.", upvotes: 76, rating: 4.1, pages: 9 },
  ];
  return { pastQuestions, verifiedNotes, communityNotes };
}

export const CONTINUE_READING = {
  courseId: "csc-301",
  code: "CSC 301",
  doc: "Virtual Memory & Paging — Lecture Notes",
  page: 12,
  pages: 28,
  lastOpened: "Last night, 11:42 PM",
};

// Sample document content used by the in-app viewer.
export function getDocContent(title: string, code: string) {
  if (code === "CSC 301") {
    return {
      title,
      sections: [
        { h: "1. Why virtual memory?", p: "Virtual memory lets each process behave as if it owns a large, contiguous address space, while the OS maps only the pages in use to physical frames. This isolates processes and allows programs larger than RAM to run." },
        { h: "2. Paging", p: "The logical address space is split into fixed-size pages; physical memory into frames of the same size. A page table maps page numbers to frame numbers. Logical address = (page number, offset)." },
        { h: "3. Page faults", p: "When a referenced page is not in memory, the MMU raises a page fault. The OS finds a free frame (or evicts a victim using FIFO, LRU or Optimal), loads the page from disk and restarts the instruction." },
        { h: "4. Thrashing", p: "If the working sets of active processes exceed physical memory, the system spends more time paging than executing. Remedies: working-set model, page-fault frequency control, reducing degree of multiprogramming." },
      ],
    };
  }
  return {
    title,
    sections: [
      { h: "1. Overview", p: `This document covers the core ideas of ${code} as taught in the current session, organised to match the departmental course outline.` },
      { h: "2. Key definitions", p: "Each definition is stated as examiners expect it, followed by a short example. Memorise the boxed statements — they recur in past questions." },
      { h: "3. Worked examples", p: "Step-by-step solutions show the method, common mistakes and how marks are typically allocated." },
      { h: "4. Likely exam questions", p: "Based on five years of past papers, these topics appeared in at least three sessions." },
    ],
  };
}

// ---------- Prepare ----------
export const MASTERY = [
  { topic: "Process Scheduling", code: "CSC 301", score: 82 },
  { topic: "SQL Joins & Queries", code: "CSC 305", score: 88 },
  { topic: "File Systems", code: "CSC 301", score: 71 },
  { topic: "Normalisation (1NF–BCNF)", code: "CSC 305", score: 64 },
  { topic: "Deadlocks", code: "CSC 301", score: 58 },
  { topic: "Virtual Memory", code: "CSC 301", score: 46 },
  { topic: "Newton–Raphson Method", code: "MTH 311", score: 39 },
];

export type QuizQuestion = { q: string; options: string[]; answer: number; explain: string };

export const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    q: "Which page replacement algorithm suffers from Belady's anomaly?",
    options: ["LRU", "FIFO", "Optimal", "Clock with reference bit"],
    answer: 1,
    explain: "FIFO can produce more page faults when given more frames. Stack algorithms like LRU and Optimal never do.",
  },
  {
    q: "A system has 4 KB pages. What is the page offset size in bits?",
    options: ["10 bits", "12 bits", "14 bits", "16 bits"],
    answer: 1,
    explain: "4 KB = 4096 = 2¹² bytes, so 12 bits address a byte within a page.",
  },
  {
    q: "Thrashing is best described as…",
    options: [
      "A CPU scheduling starvation problem",
      "Excessive paging that leaves little time for useful work",
      "A deadlock between two I/O devices",
      "Fragmentation in contiguous allocation",
    ],
    answer: 1,
    explain: "When working sets exceed available frames, the CPU spends most of its time servicing page faults.",
  },
];

export const MOCK_EXAM = {
  code: "CSC 301",
  title: "Operating Systems — Timed Mock",
  minutes: 60,
  questions: 40,
  sections: [
    { name: "Section A · Objectives", count: 30 },
    { name: "Section B · Short answers", count: 8 },
    { name: "Section C · Theory", count: 2 },
  ],
  sample: {
    q: "Consider the reference string 7, 0, 1, 2, 0, 3, 0, 4 with 3 frames. How many page faults occur under LRU?",
    options: ["5", "6", "7", "8"],
  },
};
