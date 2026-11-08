import { describe, expect, it } from "vitest";
import { findFocusClass, type ClassSlot } from "./timetable";

const base = { courseId: "c", code: "CSC", title: "T", lecturer: "L", venue: "V", kind: "Lecture" as const };
const day: ClassSlot[] = [
  { ...base, id: "a", day: 0, start: "08:00", end: "10:00" },
  { ...base, id: "b", day: 0, start: "10:00", end: "12:00" },
  { ...base, id: "c", day: 0, start: "13:00", end: "14:00", status: { type: "cancelled", text: "Cancelled", source: "Rep" } },
  { ...base, id: "d", day: 0, start: "15:00", end: "17:00" },
];

describe("findFocusClass", () => {
  it("highlights the class in session right now", () => {
    expect(findFocusClass(day, 10 * 60 + 15)).toEqual({ id: "b", kind: "now" });
  });

  it("highlights the next upcoming class between sessions, skipping cancelled ones", () => {
    expect(findFocusClass(day, 12 * 60 + 30)).toEqual({ id: "d", kind: "next" });
  });

  it("highlights nothing after the last class of the day", () => {
    expect(findFocusClass(day, 18 * 60)).toBeNull();
  });
});
