import { describe, expect, it } from "vitest";
import { courseReadiness, isWeak, recordMock, recordQuiz, topicReadiness, type TopicSignals } from "./readiness";

const base: TopicSignals = { mock: null, coverage: 0, consistency: null, quizzes: [], daysSinceReview: 0 };

describe("topic readiness", () => {
  it('reads "Not started" until the first quiz, however much was read', () => {
    expect(topicReadiness({ ...base, coverage: 100 })).toBeNull();
  });

  it("blends mock 40%, coverage 25%, consistency 20% and quiz accuracy 15%", () => {
    const s = { ...base, mock: 50, coverage: 80, consistency: 60, quizzes: [{ score: 40, daysAgo: 0 }] };
    // 0.4*50 + 0.25*80 + 0.2*60 + 0.15*40 = 20 + 20 + 12 + 6
    expect(topicReadiness(s)).toBe(58);
  });

  it("cannot pass 40% from reading alone", () => {
    const s = { ...base, coverage: 100, quizzes: [{ score: 0, daysAgo: 0 }] };
    expect(topicReadiness(s)!).toBeLessThanOrEqual(40);
  });

  it("counts recent quiz attempts more than old ones", () => {
    const recentGood = topicReadiness({ ...base, quizzes: [{ score: 100, daysAgo: 0 }, { score: 0, daysAgo: 21 }] })!;
    const recentBad = topicReadiness({ ...base, quizzes: [{ score: 0, daysAgo: 0 }, { score: 100, daysAgo: 21 }] })!;
    expect(recentGood).toBeGreaterThan(recentBad);
  });

  it("slowly decays when a topic is not revisited", () => {
    const s = { ...base, mock: 80, coverage: 80, consistency: 80, quizzes: [{ score: 80, daysAgo: 0 }] };
    expect(topicReadiness({ ...s, daysSinceReview: 20 })!).toBeLessThan(topicReadiness(s)!);
  });

  it("drops after wrong answers in a quiz or a general mock", () => {
    const s = { ...base, mock: 70, coverage: 60, consistency: 70, quizzes: [{ score: 70, daysAgo: 1 }] };
    expect(topicReadiness(recordQuiz(s, 0, 3))!).toBeLessThan(topicReadiness(s)!);
    expect(topicReadiness(recordMock(s, 0, 1))!).toBeLessThan(topicReadiness(s)!);
  });

  it("marks topics below 50% as weak areas", () => {
    expect(isWeak(49)).toBe(true);
    expect(isWeak(50)).toBe(false);
    expect(isWeak(null)).toBe(false);
  });
});

describe("course readiness", () => {
  it("averages topics by how heavily each is examined, with not-started topics as 0", () => {
    expect(courseReadiness([
      { weight: 3, readiness: 80 },
      { weight: 1, readiness: 40 },
      { weight: 1, readiness: null },
    ])).toBe(56); // (240 + 40 + 0) / 5
  });
});
