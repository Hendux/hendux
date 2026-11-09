import { useEffect, useState } from "react";
import { CheckCircle2, Timer, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { QuizQuestion } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

export type MockQuestion = QuizQuestion & { topicId: string };

/** Timed mock exam. Reports right/wrong per question so readiness can update per topic. */
export function MockExamDialog({
  open,
  onOpenChange,
  title,
  code,
  questions,
  minutes,
  onFinish,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  code: string;
  questions: MockQuestion[];
  minutes: number;
  onFinish: (results: { topicId: string; correct: boolean }[]) => void;
}) {
  const [seconds, setSeconds] = useState(minutes * 60);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSeconds(minutes * 60);
    setIndex(0);
    setAnswers(questions.map(() => null));
    setDone(false);
    const t = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [open, minutes, questions]);

  const q = questions[index];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const correctCount = answers.filter((a, i) => a === questions[i]?.answer).length;

  const submit = () => {
    setDone(true);
    onFinish(questions.map((qq, i) => ({ topicId: qq.topicId, correct: answers[i] === qq.answer })));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="bg-ink-gradient p-5 text-left text-ink-foreground">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <p className="font-mono text-xs font-semibold text-ink-muted">{code}</p>
              <DialogTitle className="font-display text-lg text-ink-foreground">{title}</DialogTitle>
              <DialogDescription className="text-xs text-ink-muted">{done ? "Results" : `Question ${index + 1} of ${questions.length}`}</DialogDescription>
            </div>
            {!done && (
              <div className="flex items-center gap-1.5 rounded-xl bg-sidebar-accent px-3 py-2 font-mono text-lg font-bold">
                <Timer className="size-4 text-pro" /> {mm}:{ss}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-1">
            {questions.map((_, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", answers[i] !== null && answers[i] !== undefined ? "bg-pro" : i === index ? "bg-pro/50" : "bg-sidebar-accent")} />
            ))}
          </div>
        </DialogHeader>

        {done ? (
          <div className="space-y-3 p-5">
            <p className="font-display text-3xl font-extrabold">{correctCount} / {questions.length}</p>
            <p className="text-sm text-muted-foreground">Your readiness has been updated. Topics you got wrong have been lowered and may now show as weak areas.</p>
            <ul className="space-y-2">
              {questions.map((qq, i) => {
                const ok = answers[i] === qq.answer;
                return (
                  <li key={i} className="flex gap-2 rounded-xl bg-muted p-3 text-sm">
                    {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-official" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-urgent" />}
                    <span>{qq.q}</span>
                  </li>
                );
              })}
            </ul>
            <button onClick={() => onOpenChange(false)} className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">See my readiness</button>
          </div>
        ) : (
          q && (
            <div className="p-5">
              <p className="font-semibold">{q.q}</p>
              <div className="mt-4 grid gap-2">
                {q.options.map((o, i) => (
                  <button
                    key={o}
                    onClick={() => setAnswers((a) => a.map((v, j) => (j === index ? i : v)))}
                    className={cn("rounded-xl px-3 py-3 text-left text-sm font-medium ring-1 ring-inset transition", answers[index] === i ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border hover:ring-primary/50")}
                  >
                    {String.fromCharCode(65 + i)}. {o}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2">
                <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)} className="rounded-lg px-4 py-2 text-xs font-semibold ring-1 ring-border disabled:opacity-40">
                  Previous
                </button>
                {index < questions.length - 1 ? (
                  <button onClick={() => setIndex((i) => i + 1)} className="ml-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                    Next question
                  </button>
                ) : (
                  <button onClick={submit} className="ml-auto rounded-lg bg-pro px-4 py-2 text-xs font-bold text-pro-foreground">
                    Submit mock
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
