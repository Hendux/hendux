// Sample data for the Hendux prototype. Everything here is illustrative and
// deliberately not tied to any one country.
import hackathonImg from "@/assets/event-hackathon.jpg";
import careerFairImg from "@/assets/event-careerfair.jpg";
import aiLectureImg from "@/assets/event-ai-lecture.jpg";
import examHallImg from "@/assets/notice-exam-hall.jpg";
import facultyImg from "@/assets/notice-faculty-building.jpg";
import theatreImg from "@/assets/notice-lecture-theatre.jpg";
import { DAY_NAMES, formatTime, type ClassSlot, type LiveStatus } from "./timetable";

// ---------- Demo clock ----------
// The prototype runs on a fixed "now" so the experience is the same at any hour.
export const DEMO_NOW = new Date(2026, 10, 9, 10, 15); // Mon 9 Nov 2026, 10:15
export const DEMO_DAY = 0; // Monday
export const DEMO_MINUTES = 10 * 60 + 15;
export const SEMESTER_WEEK = { week: 9, of: 15 };

// ---------- Universities & departments ----------
export type University = { id: string; name: string; short: string };

export const UNIVERSITIES: University[] = [
  { id: "rmu", name: "Rivermount University", short: "RMU" },
  { id: "amu", name: "Aldermoor University", short: "AMU" },
  { id: "bit", name: "Brightwater Institute of Technology", short: "BIT" },
  { id: "cvu", name: "Cedar Valley University", short: "CVU" },
  { id: "emu", name: "Eastmere University", short: "EMU" },
  { id: "gsu", name: "Greystone University", short: "GSU" },
  { id: "hvu", name: "Harborview University", short: "HVU" },
  { id: "kbu", name: "Kingsbridge University", short: "KBU" },
  { id: "lcu", name: "Lakecrest University", short: "LCU" },
  { id: "nfp", name: "Northfield Polytechnic", short: "NFP" },
  { id: "rsu", name: "Redwood State University", short: "RSU" },
  { id: "slu", name: "Silverline University", short: "SLU" },
  { id: "wbu", name: "Westbridge University", short: "WBU" },
].sort((a, b) => a.name.localeCompare(b.name));

/** Universities whose name or acronym matches the query, alphabetical. */
export function searchUniversities(query: string): University[] {
  const q = query.trim().toLowerCase();
  if (!q) return UNIVERSITIES;
  return UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(q) || u.short.toLowerCase().startsWith(q));
}

export type Department = { name: string; short: string; prefix: string; levels: number };
export type Faculty = { name: string; short: string; departments: Department[] };

export const FACULTIES: Faculty[] = [
  {
    name: "Faculty of Science",
    short: "Science",
    departments: [
      { name: "Computer Science", short: "Comp Sci", prefix: "CSC", levels: 4 },
      { name: "Mathematics", short: "Maths", prefix: "MTH", levels: 4 },
      { name: "Physics", short: "Physics", prefix: "PHY", levels: 4 },
      { name: "Chemistry", short: "Chem", prefix: "CHM", levels: 4 },
      { name: "Biochemistry", short: "Biochem", prefix: "BCH", levels: 4 },
    ],
  },
  {
    name: "Faculty of Engineering",
    short: "Engineering",
    departments: [
      { name: "Electrical & Electronic Engineering", short: "EEE", prefix: "EEE", levels: 5 },
      { name: "Mechanical Engineering", short: "Mech Eng", prefix: "MEE", levels: 5 },
      { name: "Civil Engineering", short: "Civil Eng", prefix: "CVE", levels: 5 },
    ],
  },
  {
    name: "Faculty of Social Sciences",
    short: "Social Sci",
    departments: [
      { name: "Economics", short: "Econs", prefix: "ECO", levels: 4 },
      { name: "Psychology", short: "Psych", prefix: "PSY", levels: 4 },
      { name: "Political Science", short: "Pol Sci", prefix: "POL", levels: 4 },
    ],
  },
  {
    name: "Faculty of Business",
    short: "Business",
    departments: [
      { name: "Accounting", short: "Accounting", prefix: "ACC", levels: 4 },
      { name: "Business Administration", short: "Bus Admin", prefix: "BUS", levels: 4 },
    ],
  },
  {
    name: "Faculty of Arts",
    short: "Arts",
    departments: [
      { name: "English & Literary Studies", short: "English", prefix: "ENG", levels: 4 },
      { name: "History", short: "History", prefix: "HIS", levels: 4 },
    ],
  },
];

export function findDepartment(name: string) {
  for (const f of FACULTIES) {
    const d = f.departments.find((x) => x.name === name);
    if (d) return { faculty: f, department: d };
  }
  return null;
}

export function levelsFor(departmentName: string): number[] {
  const d = findDepartment(departmentName)?.department;
  return Array.from({ length: d?.levels ?? 4 }, (_, i) => (i + 1) * 100);
}

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
  university: "Rivermount University",
  universityShort: "RMU",
  faculty: "Faculty of Science",
  facultyShort: "Science",
  department: "Computer Science",
  departmentShort: "Comp Sci",
  level: 300,
  semester: 1,
};

export const DEMO_USER = { name: "Prosper Nduka", email: "prosper.nduka@rivermount.edu" };

export function semesterLabel(s: 1 | 2, long = false) {
  if (long) return s === 1 ? "First Semester" : "Second Semester";
  return s === 1 ? "1st Semester" : "2nd Semester";
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
  notes: number;
  pastQuestions: number;
  level: number;
  semester: 1 | 2;
  department: string;
};

const LECTURERS = ["Dr. Elena Marsh", "Prof. Daniel Osei", "Dr. Priya Raman", "Dr. Lucas Ferreira", "Prof. Hannah Kim", "Dr. Omar Haddad"];
const VENUES = ["Lecture Theatre 1", "Computing Lab A", "Science Block, Room 204", "Main Auditorium", "Seminar Room 3", "Lecture Theatre 2"];
const TONES: Course["tone"][] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-1"];
const PROGRESS = [68, 42, 55, 30, 74, 18];
const NOTES = [14, 9, 11, 6, 8, 5];
const PQ_COUNT = [5, 5, 4, 3, 0, 4];

const TITLE_POOL: Record<string, string[]> = {
  CSC: ["Programming Fundamentals", "Data Structures", "Discrete Structures", "Computer Architecture", "Algorithms", "Systems Analysis", "Artificial Intelligence", "Computer Graphics"],
  MTH: ["Real Analysis", "Linear Algebra", "Abstract Algebra", "Differential Equations", "Complex Analysis", "Mathematical Methods", "Probability Theory", "Numerical Methods"],
  PHY: ["Classical Mechanics", "Electromagnetism", "Quantum Physics", "Thermal Physics", "Electronics", "Optics & Waves", "Solid State Physics", "Nuclear Physics"],
  CHM: ["General Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry", "Spectroscopy", "Polymer Chemistry", "Environmental Chemistry"],
  BCH: ["Biomolecules", "Enzymology", "Metabolism", "Molecular Biology", "Bioenergetics", "Clinical Biochemistry", "Immunochemistry", "Plant Biochemistry"],
  EEE: ["Circuit Theory", "Signals & Systems", "Electromagnetic Fields", "Digital Electronics", "Power Systems", "Control Engineering", "Communication Systems", "Microprocessors"],
  MEE: ["Engineering Drawing", "Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Machine Design", "Heat Transfer", "Manufacturing Processes", "Dynamics of Machines"],
  CVE: ["Engineering Surveying", "Structural Analysis", "Soil Mechanics", "Hydraulics", "Reinforced Concrete Design", "Highway Engineering", "Construction Management", "Water Resources"],
  ECO: ["Principles of Economics", "Microeconomic Theory", "Macroeconomic Theory", "Econometrics", "Public Finance", "Development Economics", "International Trade", "Monetary Economics"],
  PSY: ["Introduction to Psychology", "Developmental Psychology", "Social Psychology", "Cognitive Psychology", "Research Methods", "Abnormal Psychology", "Biological Psychology", "Statistics for Psychology"],
  POL: ["Introduction to Political Science", "Political Theory", "Comparative Politics", "International Relations", "Public Administration", "Political Economy", "Research Methods", "Foreign Policy Analysis"],
  ACC: ["Financial Accounting", "Cost Accounting", "Management Accounting", "Auditing", "Taxation", "Corporate Finance", "Accounting Theory", "Public Sector Accounting"],
  BUS: ["Principles of Management", "Marketing", "Organisational Behaviour", "Business Statistics", "Human Resource Management", "Operations Management", "Business Law", "Strategic Management"],
  ENG: ["Introduction to Literature", "English Grammar", "Poetry", "The Novel", "Drama", "Phonetics & Phonology", "Literary Theory", "Creative Writing"],
  HIS: ["Introduction to History", "World Civilisations", "Historiography", "Economic History", "History of Science", "Modern World History", "Colonial & Post-colonial Histories", "Public History"],
};

type CuratedCourse = [code: string, title: string];
const CURATED: Record<string, CuratedCourse[]> = {
  "CSC-300-1": [
    ["CSC 301", "Operating Systems"],
    ["CSC 305", "Database Systems"],
    ["MTH 311", "Numerical Analysis"],
    ["CSC 303", "Data Communication & Networks"],
    ["CSC 307", "Software Engineering"],
    ["CSC 309", "Compiler Construction"],
  ],
};

function buildCourse(code: string, title: string, i: number, level: number, semester: 1 | 2, department: string): Course {
  return {
    id: code.toLowerCase().replace(" ", "-"),
    code,
    title,
    lecturer: LECTURERS[i % 6]!,
    units: i % 3 === 2 ? 2 : 3,
    venue: VENUES[i % 6]!,
    tone: TONES[i % 6]!,
    progress: PROGRESS[i % 6]!,
    notes: NOTES[i % 6]!,
    pastQuestions: PQ_COUNT[i % 6]!,
    level,
    semester,
    department,
  };
}

/** Every course offered to a department at a level and semester. */
export function getCatalog(department: string, level: number, semester: 1 | 2): Course[] {
  const dept = findDepartment(department)?.department ?? FACULTIES[0]!.departments[0]!;
  const curated = CURATED[`${dept.prefix}-${level}-${semester}`];
  if (curated) return curated.map(([code, title], i) => buildCourse(code, title, i, level, semester, dept.name));
  const pool = TITLE_POOL[dept.prefix] ?? [];
  const levelIdx = level / 100 - 1;
  return Array.from({ length: 5 }, (_, i) => {
    const n = level + (semester === 1 ? 2 * i + 1 : 2 * i + 2);
    const title = pool[(levelIdx * 2 + (semester - 1) * 3 + i) % pool.length] ?? `Course ${n}`;
    return buildCourse(`${dept.prefix} ${n}`, title, i, level, semester, dept.name);
  });
}

/** Look a course up by id (e.g. "csc-301"), across every department and level. */
export function findCourse(id: string): Course | null {
  for (const [key, list] of Object.entries(CURATED)) {
    const i = list.findIndex(([code]) => code.toLowerCase().replace(" ", "-") === id);
    if (i >= 0) {
      const [prefix, level, sem] = key.split("-");
      const dept = FACULTIES.flatMap((f) => f.departments).find((d) => d.prefix === prefix)!;
      const [code, title] = list[i]!;
      return buildCourse(code, title, i, Number(level), Number(sem) as 1 | 2, dept.name);
    }
  }
  const m = /^([a-z]{3})-(\d{3})$/.exec(id);
  if (!m) return null;
  const dept = FACULTIES.flatMap((f) => f.departments).find((d) => d.prefix === m[1]!.toUpperCase());
  if (!dept) return null;
  const num = Number(m[2]);
  const level = Math.floor(num / 100) * 100;
  const rem = num % 100;
  const semester: 1 | 2 = rem % 2 === 1 ? 1 : 2;
  if (level < 100 || level > dept.levels * 100) return null;
  return getCatalog(dept.name, level, semester).find((c) => c.id === id) ?? null;
}

/** Courses from any department whose code or title matches, for adding extra courses. */
export function searchAllCourses(query: string, semester: 1 | 2): Course[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, "");
  if (q.length < 2) return [];
  const out: Course[] = [];
  for (const f of FACULTIES)
    for (const d of f.departments)
      for (let l = 100; l <= d.levels * 100; l += 100)
        for (const c of getCatalog(d.name, l, semester))
          if (c.code.toLowerCase().replace(/\s+/g, "").includes(q) || c.title.toLowerCase().includes(query.trim().toLowerCase())) out.push(c);
  return out.slice(0, 8);
}

// ---------- Timetable ----------
type TemplateSlot = { day: number; start: string; end: string; c: number; kind: ClassSlot["kind"]; venue?: string; status?: LiveStatus };

const TEMPLATE: TemplateSlot[] = [
  { day: 0, start: "08:00", end: "10:00", c: 0, kind: "Lecture" },
  {
    day: 0, start: "10:00", end: "12:00", c: 1, kind: "Lab", venue: "Lab B, ground floor",
    status: { type: "moved", text: "Moved to Lab B", source: "Course Rep · 25 min ago" },
  },
  { day: 0, start: "13:00", end: "14:00", c: 2, kind: "Lecture" },
  { day: 0, start: "15:00", end: "17:00", c: 4, kind: "Tutorial" },
  { day: 1, start: "09:00", end: "11:00", c: 3, kind: "Lecture" },
  {
    day: 1, start: "12:00", end: "14:00", c: 5, kind: "Lecture",
    status: { type: "cancelled", text: "Cancelled by Lecturer", source: "Dept. Office · Officials" },
  },
  { day: 1, start: "14:00", end: "16:00", c: 2, kind: "Tutorial" },
  { day: 2, start: "08:00", end: "10:00", c: 1, kind: "Lecture" },
  { day: 2, start: "11:00", end: "13:00", c: 0, kind: "Lab", venue: "Computing Lab A" },
  { day: 2, start: "14:00", end: "15:00", c: 4, kind: "Lecture" },
  { day: 3, start: "10:00", end: "12:00", c: 5, kind: "Lecture" },
  { day: 3, start: "13:00", end: "15:00", c: 3, kind: "Lab", venue: "Networks Lab" },
  { day: 4, start: "08:00", end: "10:00", c: 2, kind: "Lecture" },
  {
    day: 4, start: "10:30", end: "11:30", c: 0, kind: "Tutorial",
    status: { type: "delayed", text: "Starts 30 min late", source: "Hendux Verified" },
  },
];

export function getTimetable(courses: Course[]): ClassSlot[] {
  if (courses.length === 0) return [];
  return TEMPLATE.map((t, i) => {
    const course = courses[t.c % courses.length]!;
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
export type Exam = { courseId: string; code: string; title: string; date: Date; start: string; end: string; hall: string; seats: string };

const EXAM_PLAN = [
  { d: 7, start: "09:00", end: "12:00", hall: "Main Examination Hall", seats: "Seats A120 – A260" },
  { d: 9, start: "13:00", end: "16:00", hall: "Science Block Hall B", seats: "Seats B001 – B145" },
  { d: 11, start: "09:00", end: "11:00", hall: "Engineering Hall 1", seats: "Rows 4 – 12" },
  { d: 14, start: "09:00", end: "12:00", hall: "Main Examination Hall", seats: "Seats C010 – C190" },
  { d: 16, start: "13:00", end: "15:00", hall: "Science Block Hall A", seats: "Seats A001 – A130" },
  { d: 18, start: "09:00", end: "12:00", hall: "Great Hall", seats: "Block 2, Rows 1 – 9" },
];

export function getExams(courses: Course[]): Exam[] {
  return courses.slice(0, EXAM_PLAN.length).map((course, i) => {
    const e = EXAM_PLAN[i]!;
    const [h = 0, m = 0] = e.start.split(":").map(Number);
    return { courseId: course.id, code: course.code, title: course.title, date: new Date(2026, 11, e.d, h, m), start: e.start, end: e.end, hall: e.hall, seats: e.seats };
  });
}

// ---------- Academic calendar ----------
export type CalendarKind = "holiday" | "deadline" | "event" | "reminder" | "exam";
export type CalendarEntry = { id: string; date: Date; title: string; kind: CalendarKind; detail?: string | undefined };

export const ACADEMIC_CALENDAR: CalendarEntry[] = [
  { id: "c1", date: new Date(2026, 10, 9), title: "CSC 305 Lab Report 3 due", kind: "deadline", detail: "Submit on the department portal by 11:59 PM" },
  { id: "c2", date: new Date(2026, 10, 13), title: "Course registration closes", kind: "deadline", detail: "Registry · late registration attracts a fee" },
  { id: "c3", date: new Date(2026, 10, 12), title: "Public Lecture: Responsible AI", kind: "event", detail: "Lecture Theatre 1 · 2:00 PM" },
  { id: "c4", date: new Date(2026, 10, 18), title: "Tech & Data Career Fair", kind: "event", detail: "Multipurpose Hall · 10:00 AM" },
  { id: "c5", date: new Date(2026, 10, 20), title: "Hendux Campus Hackathon", kind: "event", detail: "Engineering Hall · 6:00 PM" },
  { id: "c6", date: new Date(2026, 10, 23), title: "Mid-semester break begins", kind: "holiday", detail: "No lectures until Wed 25 Nov" },
  { id: "c7", date: new Date(2026, 10, 24), title: "Mid-semester break", kind: "holiday" },
  { id: "c8", date: new Date(2026, 10, 27), title: "CSC 307 project proposal due", kind: "deadline", detail: "Groups of 4 · upload to the course page" },
  { id: "c9", date: new Date(2026, 11, 4), title: "Lectures end for the semester", kind: "deadline" },
  { id: "c10", date: new Date(2026, 11, 25), title: "National holiday", kind: "holiday", detail: "Campus closed" },
  { id: "c11", date: new Date(2027, 0, 1), title: "National holiday · New Year's Day", kind: "holiday", detail: "Campus closed" },
];

// ---------- Campus updates ----------
export type Tier = "official" | "verified" | "community";
/** Academic = university-wide. Faculty/Department = the student's own faculty, department, level or courses. */
export type UpdateCategory = "academic" | "faculty" | "event";
/** Who a post is meant for. Faculty/Department posts are always scoped to the student. */
export type UpdateScope = "university" | "faculty" | "department" | "level" | "course";
export type CampusUpdate = {
  id: string;
  title: string;
  body: string;
  source: string;
  tier: Tier;
  category: UpdateCategory;
  scope: UpdateScope;
  posted: string;
  audience: string;
  image?: string;
  when?: { label: string; venue: string; start: Date; end: Date };
};

/**
 * The campus feed for one student. University-wide posts are the same for everyone;
 * faculty, department, level and course posts are built from the student's own
 * academic details and timetable, so they always match who is reading.
 */
export function getUpdates(ctx: AcademicContext, courses: Course[]): CampusUpdate[] {
  const prefix = findDepartment(ctx.department)?.department.prefix ?? ctx.departmentShort.toUpperCase();
  const deptLevel = `${ctx.department} · ${ctx.level}L`;
  const slots = getTimetable(courses);
  const moved = slots.find((s) => s.status?.type === "moved");
  const cancelled = slots.find((s) => s.status?.type === "cancelled");
  const studyCourse = courses[2] ?? courses[0];
  const isComputing = prefix === "CSC";
  const out: CampusUpdate[] = [];

  if (moved) {
    out.push({
      id: "dept-moved",
      title: `${moved.code} ${moved.kind.toLowerCase()} moved to ${moved.venue.split(",")[0]} today`,
      body: `Today's ${moved.title} ${moved.kind.toLowerCase()} at ${formatTime(moved.start)} holds in ${moved.venue} because of a power fault in the usual room. Bring last week's work.`,
      source: `Chidinma O. · ${prefix} ${ctx.level}L Course Rep`,
      tier: "community",
      category: "faculty",
      scope: "level",
      posted: "25 min ago",
      audience: deptLevel,
    });
  }

  out.push({
    id: "uni-exam-timetable",
    title: `${semesterLabel(ctx.semester, true)} examination timetable: release date confirmed`,
    body: "The Registry will publish the approved examination timetable on Monday 23 November. Hall allocations and seat ranges will appear in each student's Hendux calendar automatically.",
    source: "Office of the Registrar",
    tier: "official",
    category: "academic",
    scope: "university",
    posted: "2h ago",
    audience: "All students",
    image: examHallImg,
    when: { label: "Mon 23 Nov, 9:00 AM", venue: "Online · Registry portal", start: new Date(2026, 10, 23, 9, 0), end: new Date(2026, 10, 23, 10, 0) },
  });

  if (cancelled) {
    out.push({
      id: "dept-cancelled",
      title: `${cancelled.code} ${DAY_NAMES[cancelled.day]} ${cancelled.kind.toLowerCase()} cancelled`,
      body: `${cancelled.lecturer}'s ${cancelled.title} ${cancelled.kind.toLowerCase()} on ${DAY_NAMES[cancelled.day]} at ${formatTime(cancelled.start)} is cancelled. A make-up class will be announced. Confirmed with the Department of ${ctx.department} office.`,
      source: "Hendux Administration",
      tier: "verified",
      category: "faculty",
      scope: "level",
      posted: "3h ago",
      audience: deptLevel,
      image: theatreImg,
    });
  }

  out.push({
    id: "fac-course-forms",
    title: `Dean's notice: ${ctx.faculty} course-form deadline`,
    body: `All ${ctx.faculty} students must submit signed course forms to their department office before Friday. Late forms will not be processed this semester.`,
    source: `Office of the Dean, ${ctx.faculty}`,
    tier: "official",
    category: "faculty",
    scope: "faculty",
    posted: "5h ago",
    audience: ctx.faculty,
    image: facultyImg,
    when: { label: "Fri 13 Nov, 4:00 PM", venue: "Department offices", start: new Date(2026, 10, 13, 16, 0), end: new Date(2026, 10, 13, 17, 0) },
  });

  if (studyCourse) {
    out.push({
      id: "course-study-group",
      title: `Study group for ${studyCourse.code} this Thursday`,
      body: `We're revising the hardest parts of ${studyCourse.title} before the test. Faculty Library, 2nd floor, 4 PM. Everyone in the class is welcome.`,
      source: "Tunde A. · Student",
      tier: "community",
      category: "faculty",
      scope: "course",
      posted: "6h ago",
      audience: `${studyCourse.code} students`,
      when: { label: "Thu 12 Nov, 4:00 PM", venue: "Faculty Library", start: new Date(2026, 10, 12, 16, 0), end: new Date(2026, 10, 12, 18, 0) },
    });
  }

  out.push(
    {
      id: "uni-hackathon",
      title: "Hendux Campus Hackathon 2026",
      body: "48 hours, mentors from leading tech companies and prizes for the top three teams. Teams of 2–4 from any faculty. Build tools that make student life easier.",
      source: "Hendux Administration",
      tier: "verified",
      category: "event",
      scope: "university",
      posted: "Yesterday",
      audience: "All faculties",
      image: hackathonImg,
      when: { label: "Fri 20 Nov, 6:00 PM", venue: "Engineering Hall", start: new Date(2026, 10, 20, 18, 0), end: new Date(2026, 10, 22, 18, 0) },
    },
    {
      id: "uni-library-hours",
      title: "Main Library opens 24 hours from 23 November",
      body: "The Main Library will stay open around the clock through the examination period. Bring your student ID after 10 PM.",
      source: "Hendux Administration",
      tier: "verified",
      category: "academic",
      scope: "university",
      posted: "Yesterday",
      audience: "All students",
    },
    {
      id: "uni-career-fair",
      title: "Careers & Internships Fair",
      body: "Meet 30+ employers hiring interns and graduates across every faculty. Bring printed CVs. Internship placements open to 300 Level and above.",
      source: "Student Union Government",
      tier: "official",
      category: "event",
      scope: "university",
      posted: "2 days ago",
      audience: "All levels",
      image: careerFairImg,
      when: { label: "Wed 18 Nov, 10:00 AM", venue: "Multipurpose Hall", start: new Date(2026, 10, 18, 10, 0), end: new Date(2026, 10, 18, 15, 0) },
    },
    {
      id: "dept-seminar",
      title: isComputing ? "Public Lecture: Responsible AI in Healthcare" : `${ctx.department} seminar: research & careers`,
      body: isComputing
        ? "The Department of Computer Science hosts a guest researcher on building safe, fair AI for clinics. Q&A and networking after."
        : `The Department of ${ctx.department} hosts alumni and researchers on where the field is heading. Q&A and networking after.`,
      source: `Department of ${ctx.department}`,
      tier: "official",
      category: "event",
      scope: "department",
      posted: "3 days ago",
      audience: `${ctx.department} students`,
      image: isComputing ? aiLectureImg : theatreImg,
      when: { label: "Thu 12 Nov, 2:00 PM", venue: "Lecture Theatre 1", start: new Date(2026, 10, 12, 14, 0), end: new Date(2026, 10, 12, 16, 0) },
    },
  );

  return out;
}

// ---------- Resources ----------
export type PastQuestion = { id: string; year: number; title: string; questions: number; hasSolution: boolean };
export type VerifiedNote = { id: string; title: string; kind: "Notes" | "Formula sheet" | "Summary"; pages: number };
export type StudentFile = { id: string; title: string; author: string; upvotes: number; pages: number; format: "PDF" | "Notes" };

export function getCourseResources(course: Course) {
  const years = [2025, 2024, 2023, 2022, 2021].slice(0, course.pastQuestions);
  const pastQuestions: PastQuestion[] = years.map((year, i) => ({
    id: `${course.id}-pq-${year}`,
    year,
    title: `${course.code} ${year}/${year + 1 - 2000} ${semesterLabel(course.semester, true)} Exam`,
    questions: 6 + (i % 3),
    hasSolution: i !== 3,
  }));
  const verifiedNotes: VerifiedNote[] = [
    { id: `${course.id}-vn-1`, title: `${course.title}: Complete Lecture Notes`, kind: "Notes", pages: 48 },
    { id: `${course.id}-vn-2`, title: `${course.code} Formula & Definitions Sheet`, kind: "Formula sheet", pages: 4 },
    { id: `${course.id}-vn-3`, title: `${course.code} Exam Summary: Top 20 Topics`, kind: "Summary", pages: 12 },
  ];
  const studentFiles: StudentFile[] = [
    { id: `${course.id}-sf-1`, title: `My ${course.title} notes (scanned)`, author: "Adaeze N.", upvotes: 214, pages: 36, format: "PDF" },
    { id: `${course.id}-sf-2`, title: `${course.code} tutorial solutions, weeks 1–6`, author: "Mateo R.", upvotes: 132, pages: 18, format: "PDF" },
    { id: `${course.id}-sf-3`, title: "Quick revision mind-maps", author: "Aisha K.", upvotes: 76, pages: 9, format: "Notes" },
  ];
  return { pastQuestions, verifiedNotes, studentFiles };
}

export const CONTINUE_STUDYING = {
  courseId: "csc-301",
  code: "CSC 301",
  doc: "Virtual Memory & Paging: Lecture Notes",
  page: 12,
  pages: 28,
  stoppedAt: "Last night, 11:42 PM",
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
      { h: "1. Overview", p: `This document covers the core ideas of ${code} as taught this session, organised to match the departmental course outline.` },
      { h: "2. Key definitions", p: "Each definition is stated as examiners expect it, followed by a short example. Memorise the boxed statements: they recur in past questions." },
      { h: "3. Worked examples", p: "Step-by-step solutions show the method, common mistakes and how marks are typically allocated." },
      { h: "4. Likely exam questions", p: "Based on five years of past papers, these topics appeared in at least three sessions." },
    ],
  };
}

// ---------- Hendux AI ----------
export const PREVIOUS_CHATS = [
  { id: "pc1", title: "Explain virtual memory", when: "Yesterday", prompt: "Explain virtual memory" },
  { id: "pc2", title: "CSC 305 past questions", when: "Sat", prompt: "Find CSC 305 past questions" },
  { id: "pc3", title: "When is the exam timetable out?", when: "Fri", prompt: "When is my first exam?" },
  { id: "pc4", title: "Events for 300L this month", when: "Last week", prompt: "Which events are for me?" },
];

export type QuizQuestion = { q: string; options: string[]; answer: number; explain: string };

export const SAMPLE_FLASHCARDS = [
  { front: "What is a page fault?", back: "An interrupt raised when a process references a page that is not in physical memory." },
  { front: "Belady's anomaly", back: "More frames can cause more page faults — happens with FIFO, never with LRU or Optimal." },
  { front: "Thrashing", back: "Excessive paging: the CPU spends more time swapping pages than doing useful work." },
];
