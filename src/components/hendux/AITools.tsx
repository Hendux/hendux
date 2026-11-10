import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, FileText, Layers, ListChecks, Plus, RotateCw, Sparkles, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTopics } from "@/lib/exam-prep";
import { summarizeDoc } from "@/lib/hendux-ai";
import { findCourse, getCourseResources, type Course } from "@/lib/hendux-data";
import { useHendux } from "@/lib/hendux-store";
import { cn } from "@/lib/utils";
import { PracticeQuiz } from "./PracticeQuiz";

export type AITool = "summarize" | "quiz" | "flashcards";
export type SourceDoc = { title: string; courseId: string | null; code: string; pages: number; origin: "verified" | "student" | "upload" };

export const TOOL_META: Record<AITool, { title: string; hint: string; Icon: typeof FileText }> = {
  summarize: { title: "Summarize", hint: "Upload a PDF, get the key points", Icon: FileText },
  quiz: { title: "Generate quiz", hint: "Turn a PDF into questions", Icon: ListChecks },
  flashcards: { title: "Flashcards", hint: "Create cards and flip through them", Icon: Layers },
};

function useCourseDocs(): SourceDoc[] {
  const { courses } = useHendux();
  return useMemo(
    () =>
      courses.slice(0, 4).flatMap((c) => {
        const r = getCourseResources(c);
        const v = r.verifiedNotes[0]!;
        const s = r.studentFiles[0]!;
        return [
          { title: v.title, courseId: c.id, code: c.code, pages: v.pages, origin: "verified" as const },
          { title: s.title, courseId: c.id, code: c.code, pages: s.pages, origin: "student" as const },
        ];
      }),
    [courses],
  );
}

/** Upload a PDF or pick one of the student's course files. */
function DocPicker({ onPick, cta }: { onPick: (d: SourceDoc) => void; cta: string }) {
  const docs = useCourseDocs();
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary-soft/50 px-4 py-6 text-center transition hover:border-primary hover:bg-primary-soft"
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground shadow-glow transition group-hover:scale-105">
          <Upload className="size-5" />
        </span>
        <span className="text-sm font-bold">Upload a PDF</span>
        <span className="text-xs text-muted-foreground">{cta}</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        aria-label="Upload a PDF"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick({ title: f.name.replace(/\.pdf$/i, ""), courseId: null, code: "Your upload", pages: Math.max(4, Math.round(f.size / 40_000)), origin: "upload" });
          e.target.value = "";
        }}
      />
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Or pick from your courses</p>
        <ul className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
          {docs.map((d) => (
            <li key={d.title}>
              <button onClick={() => onPick(d)} className="flex w-full items-center gap-3 rounded-xl bg-card p-2.5 text-left ring-1 ring-border transition hover:ring-primary/50">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", d.origin === "verified" ? "bg-verified-soft text-verified" : "bg-community-soft text-community")}>
                  {d.origin === "verified" ? <BadgeCheck className="size-4" /> : <Users className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{d.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{d.code} · {d.pages} pages</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Short "reading the PDF" moment so results don't appear out of nowhere. */
function Reading({ doc, onDone }: { doc: SourceDoc; onDone: () => void }) {
  const [pct, setPct] = useState(8);
  useEffect(() => {
    const t1 = window.setTimeout(() => setPct(100), 30);
    const t2 = window.setTimeout(onDone, 1100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);
  return (
    <div className="py-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Sparkles className="size-5 animate-pulse" />
      </span>
      <p className="mt-3 text-sm font-bold">Reading {doc.pages} pages…</p>
      <p className="mx-auto mt-0.5 max-w-xs truncate text-xs text-muted-foreground">{doc.title}</p>
      <div className="mx-auto mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary-gradient transition-[width] duration-1000 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function courseFor(doc: SourceDoc, courses: Course[]): Course | null {
  return (doc.courseId ? findCourse(doc.courseId) : null) ?? courses[0] ?? null;
}

function SummarizeTool({ onSwitch, onClose }: { onSwitch: (tool: AITool, doc: SourceDoc) => void; onClose: () => void }) {
  const [doc, setDoc] = useState<SourceDoc | null>(null);
  const [ready, setReady] = useState(false);
  const { openAI } = useHendux();
  const done = useMemo(() => () => setReady(true), []);
  if (!doc) return <DocPicker onPick={(d) => { setDoc(d); setReady(false); }} cta="We'll pull out the main ideas in seconds" />;
  if (!ready) return <Reading doc={doc} onDone={done} />;
  const s = summarizeDoc(doc.title);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-muted p-4">
        <p className="font-mono text-[10px] font-semibold text-muted-foreground">{doc.code} · {doc.pages} pages</p>
        <p className="mt-0.5 font-display text-base font-bold leading-snug">{s.title}</p>
        <ol className="mt-3 space-y-2.5">
          {s.bullets.map((b, i) => (
            <li key={b} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-card font-mono text-[10px] font-bold text-primary ring-1 ring-border">{i + 1}</span>
              <span>{b}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onSwitch("quiz", doc)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground">
          <ListChecks className="size-4" /> Quiz me on this
        </button>
        <button onClick={() => onSwitch("flashcards", doc)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-soft px-3 py-2.5 text-xs font-bold text-accent-foreground">
          <Layers className="size-4" /> Make flashcards
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setDoc(null)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Summarize another PDF</button>
        <button
          onClick={() => {
            onClose();
            openAI(`Summarize "${doc.title}"`);
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary"
        >
          Continue in chat <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function QuizTool({ initial }: { initial?: SourceDoc | null }) {
  const { courses } = useHendux();
  const [doc, setDoc] = useState<SourceDoc | null>(initial ?? null);
  const [ready, setReady] = useState(!!initial);
  const done = useMemo(() => () => setReady(true), []);
  if (!doc) return <DocPicker onPick={(d) => { setDoc(d); setReady(false); }} cta="We'll write questions from what's inside" />;
  if (!ready) return <Reading doc={doc} onDone={done} />;
  const course = courseFor(doc, courses);
  const questions = course ? getTopics(course).slice(0, 3).map((t) => t.quiz[0]!) : [];
  return (
    <div className="space-y-4">
      <p className="truncate rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">From: {doc.title}</p>
      <PracticeQuiz
        questions={questions}
        resultText={(c, t) => (c === t ? "Perfect. To make it count towards readiness, practise this course in Exam Preparation." : "Review the explanations, then try again or practise this course in Exam Preparation.")}
      />
      <button onClick={() => setDoc(null)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Use a different PDF</button>
    </div>
  );
}

function FlashcardsTool({ initial }: { initial?: SourceDoc | null }) {
  const { flashcards, addFlashcards, removeFlashcard, courses } = useHendux();
  const [mode, setMode] = useState<"study" | "create" | "pdf">(initial ? "pdf" : flashcards.length ? "study" : "create");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const card = flashcards[Math.min(index, flashcards.length - 1)];

  const fromDoc = (d: SourceDoc) => {
    const course = courseFor(d, courses);
    if (!course) return;
    const cards = getTopics(course)
      .slice(0, 3)
      .map((t) => ({ front: `${t.title}: what's the key idea?`, back: t.keyPoints.main[0]!, deck: `${course.code} · ${d.title}` }));
    addFlashcards(cards);
    setIndex(0);
    setFlipped(false);
    setMode("study");
    toast.success(`${cards.length} flashcards added`, { description: d.title });
  };

  useEffect(() => {
    if (initial) fromDoc(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {([["study", `Study (${flashcards.length})`], ["create", "Create"], ["pdf", "From a PDF"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)} className={cn("rounded-lg py-1.5 text-xs font-bold transition", mode === id ? "bg-card shadow-card" : "text-muted-foreground")}>
            {label}
          </button>
        ))}
      </div>

      {mode === "study" &&
        (card ? (
          <div className="space-y-3">
            <button onClick={() => setFlipped((f) => !f)} className="block w-full perspective-[1200px]" aria-label={flipped ? "Show question" : "Show answer"}>
              <div className={cn("relative h-52 transition-transform duration-500 transform-3d", flipped && "rotate-y-180")}>
                <div className="absolute inset-0 flex flex-col rounded-2xl bg-ink-gradient p-5 text-left text-ink-foreground backface-hidden">
                  <p className="font-mono text-[10px] text-ink-muted">{card.deck}</p>
                  <p className="my-auto font-display text-xl font-bold leading-snug">{card.front}</p>
                  <p className="inline-flex items-center gap-1 text-[11px] text-ink-muted"><RotateCw className="size-3" /> Tap to flip</p>
                </div>
                <div className="absolute inset-0 flex flex-col rounded-2xl bg-card p-5 text-left ring-2 ring-primary rotate-y-180 backface-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Answer</p>
                  <p className="my-auto text-base font-semibold leading-relaxed">{card.back}</p>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => { setIndex((i) => (i - 1 + flashcards.length) % flashcards.length); setFlipped(false); }} className="grid size-10 place-items-center rounded-xl ring-1 ring-border" aria-label="Previous card"><ArrowLeft className="size-4" /></button>
              <p className="flex-1 text-center font-mono text-xs font-semibold">{Math.min(index, flashcards.length - 1) + 1} / {flashcards.length}</p>
              <button onClick={() => { removeFlashcard(card.id); setFlipped(false); }} className="grid size-10 place-items-center rounded-xl text-muted-foreground ring-1 ring-border hover:text-urgent" aria-label="Delete card"><Trash2 className="size-4" /></button>
              <button onClick={() => { setIndex((i) => (i + 1) % flashcards.length); setFlipped(false); }} className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground" aria-label="Next card"><ArrowRight className="size-4" /></button>
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">No cards yet. Create one or make some from a PDF.</p>
        ))}

      {mode === "create" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!front.trim() || !back.trim()) return;
            addFlashcards([{ front: front.trim(), back: back.trim(), deck: "My cards" }]);
            setFront("");
            setBack("");
            setIndex(0);
            toast.success("Flashcard added");
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-bold">Front (question or term)</span>
            <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="e.g. What is a TLB?" className="w-full rounded-xl bg-card px-3.5 py-3 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold">Back (answer)</span>
            <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={3} placeholder="e.g. A small cache of recent page-table entries." className="w-full resize-none rounded-xl bg-card px-3.5 py-3 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary" />
          </label>
          <button type="submit" disabled={!front.trim() || !back.trim()} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-40">
            <Plus className="size-4" /> Add card
          </button>
        </form>
      )}

      {mode === "pdf" && <DocPicker onPick={fromDoc} cta="We'll turn its key ideas into cards" />}
    </div>
  );
}

/** One dialog that hosts the three Hendux AI tools and lets them hand a PDF to each other. */
export function AIToolDialog({ tool, onClose }: { tool: AITool | null; onClose: () => void }) {
  const [active, setActive] = useState<{ tool: AITool; doc: SourceDoc | null; key: number } | null>(null);
  useEffect(() => {
    setActive(tool ? { tool, doc: null, key: Date.now() } : null);
  }, [tool]);
  const current = tool ? (active?.tool ?? tool) : null;
  const meta = current ? TOOL_META[current] : null;

  return (
    <Dialog open={!!tool} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        {meta && current && (
          <>
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-gradient text-primary-foreground">
                  <meta.Icon className="size-5" />
                </span>
                <div>
                  <DialogTitle className="font-display text-xl">{meta.title}</DialogTitle>
                  <DialogDescription className="text-xs">{meta.hint}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {current === "summarize" && <SummarizeTool key={active?.key} onClose={onClose} onSwitch={(t, d) => setActive({ tool: t, doc: d, key: Date.now() })} />}
            {current === "quiz" && <QuizTool key={active?.key} initial={active?.doc ?? null} />}
            {current === "flashcards" && <FlashcardsTool key={active?.key} initial={active?.doc ?? null} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
