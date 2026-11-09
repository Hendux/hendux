import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONTEXT, DEMO_USER, findCourse, getCatalog, type AcademicContext, type CalendarEntry, type Course } from "./hendux-data";
import type { Topic } from "./exam-prep";
import type { TopicSignals } from "./readiness";

export type Profile = { name: string; email: string; photo?: string | undefined };

type Persisted = {
  signedIn: boolean;
  onboarded: boolean;
  profile: Profile;
  ctx: AcademicContext;
  courseIds: string[];
  unlocked: string[];
  signals: Record<string, TopicSignals>;
  reminders: { id: string; date: string; title: string; detail?: string | undefined }[];
  chats: { id: string; title: string; when: string; prompt: string }[];
};

const STORAGE_KEY = "hendux:v2";

const defaultCourseIds = () => getCatalog(DEFAULT_CONTEXT.department, DEFAULT_CONTEXT.level, DEFAULT_CONTEXT.semester).map((c) => c.id);

const INITIAL: Persisted = {
  signedIn: false,
  onboarded: false,
  profile: { ...DEMO_USER },
  ctx: DEFAULT_CONTEXT,
  courseIds: defaultCourseIds(),
  unlocked: [],
  signals: {},
  reminders: [],
  chats: [],
};

type HenduxState = Persisted & {
  hydrated: boolean;
  courses: Course[];
  calendarReminders: CalendarEntry[];
  signIn: (email?: string) => void;
  startSignUp: (profile: Profile) => void;
  completeSetup: (ctx: AcademicContext, courseIds: string[]) => void;
  logOut: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  updateAcademics: (ctx: AcademicContext) => void;
  setCourseIds: (ids: string[]) => void;
  addReminder: (r: { title: string; date: Date; detail?: string | undefined }) => void;
  unlockCourse: (courseId: string) => void;
  topicSignals: (courseId: string, topic: Topic) => TopicSignals;
  setTopicSignals: (courseId: string, topicId: string, s: TopicSignals) => void;
  addChat: (title: string) => void;
  aiOpen: boolean;
  aiSeed: { text: string; nonce: number } | null;
  openAI: (prompt?: string) => void;
  closeAI: () => void;
};

const HenduxContext = createContext<HenduxState | null>(null);

export function HenduxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState<{ text: string; nonce: number } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL, ...(JSON.parse(raw) as Partial<Persisted>) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full (e.g. large photo) — keep in memory */
    }
  }, [state, hydrated]);

  const patch = useCallback((p: Partial<Persisted> | ((s: Persisted) => Partial<Persisted>)) => {
    setState((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) }));
  }, []);

  const openAI = useCallback((prompt?: string) => {
    if (prompt) setAiSeed({ text: prompt, nonce: Date.now() });
    setAiOpen(true);
  }, []);
  const closeAI = useCallback(() => setAiOpen(false), []);

  const value = useMemo<HenduxState>(() => {
    const courses = state.courseIds.map(findCourse).filter((c): c is Course => !!c);
    return {
      ...state,
      hydrated,
      courses,
      calendarReminders: state.reminders.map((r) => ({ id: r.id, date: new Date(r.date), title: r.title, kind: "reminder", detail: r.detail })),
      signIn: (email) =>
        patch((s) => ({
          signedIn: true,
          // A returning account keeps its setup; a brand-new browser signs in as the demo student.
          onboarded: true,
          profile: email && !s.onboarded ? { ...s.profile, email } : s.profile,
        })),
      startSignUp: (profile) => patch({ signedIn: true, onboarded: false, profile, ctx: DEFAULT_CONTEXT, courseIds: [], unlocked: [], signals: {}, reminders: [], chats: [] }),
      completeSetup: (ctx, courseIds) => patch({ ctx, courseIds, onboarded: true }),
      logOut: () => patch({ signedIn: false }),
      updateProfile: (p) => patch((s) => ({ profile: { ...s.profile, ...p } })),
      updateAcademics: (ctx) => patch({ ctx, courseIds: getCatalog(ctx.department, ctx.level, ctx.semester).map((c) => c.id) }),
      setCourseIds: (ids) => patch({ courseIds: ids }),
      addReminder: (r) => patch((s) => ({ reminders: [...s.reminders, { id: `r-${Date.now()}`, date: r.date.toISOString(), title: r.title, detail: r.detail }] })),
      unlockCourse: (id) => patch((s) => ({ unlocked: s.unlocked.includes(id) ? s.unlocked : [...s.unlocked, id] })),
      topicSignals: (courseId, topic) => state.signals[`${courseId}:${topic.id}`] ?? topic.seed,
      setTopicSignals: (courseId, topicId, sig) => patch((s) => ({ signals: { ...s.signals, [`${courseId}:${topicId}`]: sig } })),
      addChat: (title) => patch((s) => ({ chats: [{ id: `ch-${Date.now()}`, title, when: "Just now", prompt: title }, ...s.chats].slice(0, 10) })),
      aiOpen,
      aiSeed,
      openAI,
      closeAI,
    };
  }, [state, hydrated, patch, aiOpen, aiSeed, openAI, closeAI]);

  return <HenduxContext.Provider value={value}>{children}</HenduxContext.Provider>;
}

export function useHendux() {
  const v = useContext(HenduxContext);
  if (!v) throw new Error("useHendux must be used inside HenduxProvider");
  return v;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
