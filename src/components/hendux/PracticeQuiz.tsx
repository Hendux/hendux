import { useState } from "react";
import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

/** A short multiple-choice quiz. Calls onFinish once with the score. */
export function PracticeQuiz({
  questions,
  label,
  onFinish,
  resultText,
}: {
  questions: QuizQuestion[];
  label?: string;
  onFinish?: (correct: number, total: number) => void;
  resultText?: (correct: number, total: number) => string;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[index];

  if (!q) return null;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (index === questions.length - 1) {
      setDone(true);
      onFinish?.(score, questions.length);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };
  const reset = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-pro-soft text-pro"><Trophy className="size-7" /></span>
        <p className="mt-3 font-display text-2xl font-bold">{score} / {questions.length}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {resultText ? resultText(score, questions.length) : score === questions.length ? "Perfect score!" : "Nice effort. Review the explanations and try again."}
        </p>
        <button onClick={reset} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <RotateCcw className="size-4" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {questions.map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < index ? "bg-primary" : i === index ? "bg-primary/50" : "bg-muted")} />
        ))}
      </div>
      <p className="text-xs font-semibold text-muted-foreground">Question {index + 1} of {questions.length}{label ? ` · ${label}` : ""}</p>
      <p className="mt-1 font-semibold">{q.q}</p>
      <div className="mt-3 grid gap-2">
        {q.options.map((o, i) => {
          const correct = picked !== null && i === q.answer;
          const wrong = picked === i && i !== q.answer;
          return (
            <button
              key={o}
              onClick={() => pick(i)}
              disabled={picked !== null}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ring-1 ring-inset transition",
                correct ? "bg-official-soft text-foreground ring-official" : wrong ? "bg-urgent-soft ring-urgent" : "bg-card ring-border hover:ring-primary/50",
                picked !== null && !correct && !wrong && "opacity-60",
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold">{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">{o}</span>
              {correct && <CheckCircle2 className="size-4 text-official" />}
              {wrong && <XCircle className="size-4 text-urgent" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 rounded-xl bg-verified-soft p-3 text-sm">
          <p className="font-semibold text-verified">{picked === q.answer ? "Correct!" : "Not quite."}</p>
          <p className="mt-0.5 text-muted-foreground">{q.explain}</p>
          <button onClick={next} className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {index === questions.length - 1 ? "See results" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}
