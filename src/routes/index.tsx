import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Sparkles, Target } from "lucide-react";
import { Timetable } from "@/components/hendux/Timetable";
import { UrgencyStrip } from "@/components/hendux/UrgencyStrip";
import { UpdatesFeed } from "@/components/hendux/UpdatesFeed";
import { ContinueCard, CourseTile } from "@/components/hendux/CourseTile";
import { useHendux } from "@/lib/hendux-store";
import { DEMO_NOW, MASTERY, STUDENT, getCourses, getExams } from "@/lib/hendux-data";
import { QUICK_PROMPTS } from "@/lib/hendux-ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · Hendux" },
      { name: "description", content: "Your day at UNILAG: live timetable, urgent deadlines, verified campus updates and exam countdown." },
      { property: "og:title", content: "Today · Hendux" },
      { property: "og:description", content: "Live timetable, urgent deadlines, verified campus updates and exam countdown." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function SectionHead({ title, layer, to, cta }: { title: string; layer?: string; to: "/updates" | "/resources" | "/prepare"; cta: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {layer && <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{layer}</p>}
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
        {cta} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Home() {
  const { ctx, openAI } = useHendux();
  const courses = getCourses(ctx);
  const [nextExam] = getExams(ctx);
  const daysToExam = Math.ceil((nextExam.date.getTime() - DEMO_NOW.getTime()) / 86400000);
  const weakest = [...MASTERY].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-gradient p-5 text-ink-foreground sm:p-7">
        <div className="grid-dots pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <CalendarDays className="size-3.5" /> Monday, 9 November · Week 9 of 15
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Good morning, {STUDENT.firstName} 👋</h1>
          <p className="mt-1 text-sm text-ink-muted">4 classes today · 1 deadline tonight · first exam in {daysToExam} days</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[ctx.university, ctx.faculty, ctx.department].map((b) => (
              <span key={b} className="rounded-full bg-sidebar-accent px-3 py-1 text-xs font-semibold ring-1 ring-sidebar-border">{b}</span>
            ))}
            <span className="rounded-full bg-pro px-3 py-1 text-xs font-bold text-pro-foreground">{ctx.level} Level</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="lg:col-start-1">
          <Timetable />
        </div>

        <aside className="space-y-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <UrgencyStrip />

          {/* Docked AI bar */}
          <section className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
            <button onClick={() => openAI()} className="flex w-full items-center gap-3 rounded-xl bg-muted px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:ring-1 hover:ring-primary/40">
              <Sparkles className="size-4 text-primary" />
              Ask Hendux anything…
            </button>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.slice(0, 3).map((p) => (
                <button key={p} onClick={() => openAI(p)} className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:bg-primary hover:text-primary-foreground">
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* Prep snapshot */}
          <Link to="/prepare" className="block rounded-2xl bg-card p-4 shadow-card ring-1 ring-border transition hover:ring-primary/40">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Prepare</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="font-display text-5xl font-extrabold leading-none">{daysToExam}</p>
              <p className="pb-1 text-sm text-muted-foreground">days to <span className="font-semibold text-foreground">{nextExam.code}</span><br />{nextExam.title}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-urgent-soft px-3 py-2 text-xs">
              <Target className="size-4 text-urgent" />
              <span>Weakest: <span className="font-semibold">{weakest.topic}</span> ({weakest.score}%)</span>
            </div>
          </Link>

          <ContinueCard />
        </aside>

        <section className="lg:col-start-1">
          <SectionHead title="Campus Updates" layer="Know" to="/updates" cta="All updates" />
          <UpdatesFeed limit={3} />
        </section>
      </div>

      <section>
        <SectionHead title="Your courses" layer="Find" to="/resources" cta="Resource Hub" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {courses.slice(0, 3).map((c) => (
            <CourseTile key={c.id} course={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
