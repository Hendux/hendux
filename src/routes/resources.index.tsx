import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Search } from "lucide-react";
import { CourseRow } from "@/components/hendux/CourseTile";
import { WeekTimetable } from "@/components/hendux/Timetable";
import { AcademicCalendar } from "@/components/hendux/AcademicCalendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHendux } from "@/lib/hendux-store";
import { semesterLabel } from "@/lib/hendux-data";

export const Route = createFileRoute("/resources/")({
  head: () => ({
    meta: [
      { title: "Resources · Hendux" },
      { name: "description", content: "Your timetable, academic calendar and every course with past questions, verified notes and student uploads." },
      { property: "og:title", content: "Resources · Hendux" },
      { property: "og:description", content: "Timetable, academic calendar, past questions, verified notes and student uploads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { ctx, courses: mine } = useHendux();
  const [query, setQuery] = useState("");
  const [calOpen, setCalOpen] = useState(false);
  const courses = mine.filter((c) => `${c.code} ${c.title}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Resources</h1>
        <p className="mt-1 text-sm text-muted-foreground">{ctx.department} · {ctx.level} Level · {semesterLabel(ctx.semester)}</p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Timetable</h2>
          <button onClick={() => setCalOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            <CalendarDays className="size-3.5" /> Academic calendar
          </button>
        </div>
        <WeekTimetable />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">My courses</h2>
        <label className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 shadow-card ring-1 ring-border focus-within:ring-primary">
          <Search className="size-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your courses…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" aria-label="Search courses" />
        </label>
        {courses.length === 0 ? (
          <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-border">No course matches “{query}”.</p>
        ) : (
          <div className="grid gap-3">
            {courses.map((c) => (
              <CourseRow key={c.id} course={c} pqStyle="count" />
            ))}
          </div>
        )}
      </section>

      <Dialog open={calOpen} onOpenChange={setCalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Academic calendar</DialogTitle>
            <DialogDescription>Holidays, deadlines, events, your reminders and exams.</DialogDescription>
          </DialogHeader>
          <AcademicCalendar />
        </DialogContent>
      </Dialog>
    </div>
  );
}
