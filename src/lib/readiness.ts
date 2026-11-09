// Exam readiness rules. Pure functions so they can be tested and reused.
// Always call the result "readiness", never a grade prediction.

export type QuizAttempt = { score: number; daysAgo: number }; // score 0–100

export type TopicSignals = {
  mock: number | null; // 0–100 performance on mock exams for this topic
  coverage: number; // 0–100 share of notes and Key Points gone through
  consistency: number | null; // 0–100 getting questions right again on repeat attempts
  quizzes: QuizAttempt[];
  daysSinceReview: number;
};

export const WEIGHTS = { mock: 0.4, coverage: 0.25, consistency: 0.2, quiz: 0.15 } as const;
/** Reading alone can never push a topic past this. */
export const READING_CAP = 40;
export const WEAK_THRESHOLD = 50;
/** Days a topic can sit untouched before it starts to decay. */
export const DECAY_GRACE_DAYS = 7;
const DECAY_PER_DAY = 0.01;
const DECAY_FLOOR = 0.7;

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Quiz accuracy with recent attempts counting more (weight halves every 7 days). */
export function quizAccuracy(quizzes: QuizAttempt[]): number | null {
  if (quizzes.length === 0) return null;
  let sum = 0;
  let weights = 0;
  for (const q of quizzes) {
    const w = Math.pow(0.5, q.daysAgo / 7);
    sum += w * q.score;
    weights += w;
  }
  return sum / weights;
}

export function decayFactor(daysSinceReview: number): number {
  if (daysSinceReview <= DECAY_GRACE_DAYS) return 1;
  return Math.max(DECAY_FLOOR, 1 - DECAY_PER_DAY * (daysSinceReview - DECAY_GRACE_DAYS));
}

/** Topic readiness 0–100, or null while the topic is "Not started" (no quiz yet). */
export function topicReadiness(s: TopicSignals): number | null {
  const quiz = quizAccuracy(s.quizzes);
  if (quiz === null) return null;
  const reading = Math.min(WEIGHTS.coverage * clamp(s.coverage), READING_CAP);
  const recall = WEIGHTS.mock * clamp(s.mock ?? 0) + WEIGHTS.consistency * clamp(s.consistency ?? 0) + WEIGHTS.quiz * clamp(quiz);
  return Math.round(clamp((reading + recall) * decayFactor(s.daysSinceReview)));
}

export function isWeak(readiness: number | null): boolean {
  return readiness !== null && readiness < WEAK_THRESHOLD;
}

/** Course readiness: topic readiness averaged by how heavily each topic is examined. Not-started topics count as 0. */
export function courseReadiness(topics: { weight: number; readiness: number | null }[]): number {
  const total = topics.reduce((a, t) => a + t.weight, 0);
  if (total === 0) return 0;
  return Math.round(topics.reduce((a, t) => a + t.weight * (t.readiness ?? 0), 0) / total);
}

/** Apply a finished topic quiz. Wrong answers pull quiz accuracy (and consistency) down. */
export function recordQuiz(s: TopicSignals, correct: number, total: number): TopicSignals {
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const last = s.quizzes[0];
  const consistency = last ? Math.round(((s.consistency ?? last.score) + Math.min(last.score, score)) / 2) : s.consistency;
  return { ...s, quizzes: [{ score, daysAgo: 0 }, ...s.quizzes], consistency, daysSinceReview: 0 };
}

/** Apply this topic's share of a mock exam (topic quiz or general mock). */
export function recordMock(s: TopicSignals, correct: number, total: number): TopicSignals {
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const mock = s.mock === null ? score : Math.round((s.mock + score) / 2);
  return { ...s, mock, daysSinceReview: 0 };
}

/** Mark part of the notes or Key Points as read. */
export function recordCoverage(s: TopicSignals, amount: number): TopicSignals {
  return { ...s, coverage: clamp(s.coverage + amount), daysSinceReview: 0 };
}
