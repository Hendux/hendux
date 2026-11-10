import { useId, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { getTopics, type Topic } from "@/lib/exam-prep";
import type { Course } from "@/lib/hendux-data";
import { useHendux } from "@/lib/hendux-store";
import { READING_CAP, WEIGHTS, courseReadiness, decayFactor, isWeak, quizAccuracy, topicReadiness, type TopicSignals } from "@/lib/readiness";
import { cn } from "@/lib/utils";

export function readinessTone(v: number | null) {
  if (v === null) return { text: "text-muted-foreground", bg: "bg-muted-foreground/50", stroke: "var(--muted-foreground)", label: "Not started" };
  if (isWeak(v)) return { text: "text-urgent", bg: "bg-urgent", stroke: "var(--urgent)", label: "Weak area" };
  if (v < 70) return { text: "text-warning", bg: "bg-warning", stroke: "var(--warning)", label: "Building" };
  return { text: "text-official", bg: "bg-official", stroke: "var(--official)", label: "Strong" };
}

/** Circular readiness gauge. `brand` paints it in the Hendux blue→sky gradient instead of the status colour. */
export function ReadinessRing({
  value,
  size = 64,
  stroke = 7,
  track = "var(--border)",
  brand,
  className,
  children,
}: {
  value: number | null;
  size?: number;
  stroke?: number;
  track?: string;
  brand?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value ?? 0));
  const tone = readinessTone(value);
  return (
    <div className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--sky)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={brand ? `url(#g-${id})` : tone.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children ?? <span className="font-display text-sm font-extrabold">{value === null ? "—" : `${value}%`}</span>}
      </div>
    </div>
  );
}

/** Thin readiness bar for topic lists. */
export function ReadinessBar({ value, className }: { value: number | null; className?: string }) {
  const tone = readinessTone(value);
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-700", tone.bg)} style={{ width: `${value ?? 0}%` }} />
    </div>
  );
}

/** How heavily a topic is examined, shown as four ticks. */
export function ExamWeight({ weight, className }: { weight: number; className?: string }) {
  const label = weight >= 4 ? "Heavily examined" : weight >= 3 ? "Often examined" : "Sometimes examined";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground", className)} title={label}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-2.5 w-1 rounded-full", i <= weight ? "bg-primary" : "bg-border")} />
        ))}
      </span>
      {label}
    </span>
  );
}

export type TopicState = { topic: Topic; signals: TopicSignals; readiness: number | null };

/** Every topic of a course with its live readiness, plus the course score. */
export function useCourseReadiness(course: Course) {
  const { topicSignals } = useHendux();
  const topics: TopicState[] = getTopics(course).map((topic) => {
    const signals = topicSignals(course.id, topic);
    return { topic, signals, readiness: topicReadiness(signals) };
  });
  const overall = courseReadiness(topics.map((t) => ({ weight: t.topic.weight, readiness: t.readiness })));
  return {
    topics,
    overall,
    started: topics.filter((t) => t.readiness !== null).length,
    weak: topics.filter((t) => isWeak(t.readiness)),
  };
}

const SIGNALS: { key: "mock" | "coverage" | "consistency" | "quiz"; label: string; what: string }[] = [
  { key: "mock", label: "Mock exams", what: "How you do on mock exams" },
  { key: "coverage", label: "Coverage", what: "Notes and Key Points gone through" },
  { key: "consistency", label: "Consistency", what: "Right again on repeat attempts" },
  { key: "quiz", label: "Quiz accuracy", what: "Recent quizzes count more" },
];

/** The four signals behind a topic's readiness, with their weights. */
export function SignalBreakdown({ signals, dark }: { signals: TopicSignals; dark?: boolean }) {
  const values = {
    mock: signals.mock,
    coverage: signals.coverage,
    consistency: signals.consistency,
    quiz: quizAccuracy(signals.quizzes),
  };
  const decaying = decayFactor(signals.daysSinceReview) < 1;
  return (
    <div className="space-y-2.5">
      {SIGNALS.map((s) => {
        const v = values[s.key];
        return (
          <div key={s.key}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold">
                {s.label} <span className={cn("font-mono text-[10px]", dark ? "text-ink-muted" : "text-muted-foreground")}>{Math.round(WEIGHTS[s.key] * 100)}%</span>
              </span>
              <span className={cn("font-mono text-[11px]", dark ? "text-ink-muted" : "text-muted-foreground")}>{v === null ? "—" : `${Math.round(v)}%`}</span>
            </div>
            <div className={cn("mt-1 h-1.5 overflow-hidden rounded-full", dark ? "bg-ink-line" : "bg-muted")}>
              <div className="h-full rounded-full bg-primary-gradient transition-[width] duration-700" style={{ width: `${v ?? 0}%` }} />
            </div>
          </div>
        );
      })}
      <p className={cn("pt-1 text-[11px] leading-relaxed", dark ? "text-ink-muted" : "text-muted-foreground")}>
        {signals.quizzes.length === 0
          ? "Take the first quiz to start this topic's readiness. Reading alone can't push it past about " + READING_CAP + "%."
          : decaying
            ? `Not revisited for ${signals.daysSinceReview} days, so readiness is slowly dropping. A quick quiz brings it back.`
            : `Reading alone can't push a topic past about ${READING_CAP}%. Proving recall in quizzes and mocks moves it further.`}
      </p>
    </div>
  );
}

const LOOP = ["Read", "Ask AI", "Key Points", "Quiz", "Readiness moves", "Weak areas flagged", "Revise", "General mock"];

/** The study loop from the spec, as a scrollable strip. */
export function StudyLoop({ active }: { active?: number }) {
  return (
    <div className="scrollbar-none -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1">
      {LOOP.map((step, i) => (
        <span key={step} className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
              i === active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-muted-foreground ring-border",
            )}
          >
            <span className="font-mono text-[10px] opacity-70">{String(i + 1).padStart(2, "0")}</span>
            {step}
          </span>
          {i < LOOP.length - 1 && <ArrowRight className="size-3 text-border" aria-hidden />}
        </span>
      ))}
    </div>
  );
}
