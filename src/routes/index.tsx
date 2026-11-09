import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { TodayClasses, useMyTimetable } from "@/components/hendux/Timetable";
import { UpdatesFeed } from "@/components/hendux/UpdatesFeed";
import { ContinueCard, CourseRow } from "@/components/hendux/CourseTile";
import { Avatar } from "@/components/hendux/badges";
import { useHendux } from "@/lib/hendux-store";
import { DEMO_DAY, DEMO_NOW, SEMESTER_WEEK, semesterLabel } from "@/lib/hendux-data";
import { DAY_SHORT, classesForDay } from "@/lib/timetable";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · Hendux" },
      { name: "description", content: "Your day at university: today's classes, campus updates, courses and where you left off studying." },
      { property: "og:title", content: "Today · Hendux" },
      { property: "og:description", content: "Today's classes, campus updates, courses and where you left off studying." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function SectionHead({ title, to, cta }: { title: string; to: "/updates" | "/resources"; cta: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
        {cta} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Home() {
  const { ctx, profile, courses } = useHendux();
  const slots = useMyTimetable();
  const todayCount = classesForDay(slots, DEMO_DAY).length;
  const monday = new Date(DEMO_NOW);
  monday.setDate(DEMO_NOW.getDate() - DEMO_DAY);

  return (
    <div className="space-y-6">
      {/* 8.2 Greeting card */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-gradient p-5 text-ink-foreground">
        <div className="grid-dots pointer-events-none absolute inset-0" />
        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold sm:text-3xl">Good morning, {profile.name.split(" ")[0]} 👋</h1>
              <p className="mt-1 text-sm text-ink-muted">
                {ctx.university} · {ctx.department} · {ctx.level} Level · {semesterLabel(ctx.semester)}
              </p>
            </div>
            <Avatar name={profile.name} photo={profile.photo} className="size-12 ring-2 ring-sidebar-border" />
          </div>
          <p className="mt-4 text-xs font-medium text-ink-muted">
            {DEMO_NOW.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · Week {SEMESTER_WEEK.week} of {SEMESTER_WEEK.of}
          </p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {DAY_SHORT.slice(0, 5).map((d, i) => {
              const date = new Date(monday);
              date.setDate(monday.getDate() + i);
              return (
                <div key={d} className={cn("rounded-xl py-2 text-center", i === DEMO_DAY ? "bg-primary text-primary-foreground" : "bg-sidebar-accent")}>
                  <p className="text-[10px] font-semibold uppercase">{d}</p>
                  <p className="font-display text-lg font-bold leading-none">{date.getDate()}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm font-semibold">You have {todayCount} class{todayCount === 1 ? "" : "es"} today</p>
        </div>
      </section>

      {/* 8.3 Today's timetable */}
      <section>
        <SectionHead title="Today's timetable" to="/resources" cta="Resources" />
        <Link to="/resources" className="block" aria-label="Open Resources">
          <TodayClasses />
        </Link>
      </section>

      {/* 8.4 Continue studying */}
      <ContinueCard />

      {/* 8.5 Campus updates */}
      <section>
        <SectionHead title="Campus updates" to="/updates" cta="See more" />
        <UpdatesFeed limit={3} showFilters={false} />
      </section>

      {/* 8.6 My courses */}
      <section>
        <SectionHead title="My courses" to="/resources" cta="All courses" />
        <div className="grid gap-3">
          {courses.map((c, i) => (
            <CourseRow key={c.id} course={c} showProgress={i < 4} />
          ))}
        </div>
      </section>
    </div>
  );
}
