import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownUp, ArrowLeft, ChevronUp, Eye, FileText, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ProBadge, TierBadge } from "@/components/hendux/badges";
import { DocViewer, type OpenDoc } from "@/components/hendux/DocViewer";
import { useHendux } from "@/lib/hendux-store";
import { getCourseResources, getCourses, getExams } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources/$courseId")({
  head: ({ params }) => {
    const code = params.courseId.replace("-", " ").toUpperCase();
    return {
      meta: [
        { title: `${code} Resources · Hendux` },
        { name: "description", content: `Past questions with solutions, verified notes and community notes for ${code}.` },
        { property: "og:title", content: `${code} Resources · Hendux` },
        { property: "og:description", content: `Past questions, verified notes and community notes for ${code}.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CoursePage,
});

type Tab = "past" | "verified" | "community";

function CoursePage() {
  const { courseId } = Route.useParams();
  const { ctx } = useHendux();
  const course = getCourses(ctx).find((c) => c.id === courseId);
  const [tab, setTab] = useState<Tab>("past");
  const [newestFirst, setNewestFirst] = useState(true);
  const [solutions, setSolutions] = useState(true);
  const [doc, setDoc] = useState<OpenDoc | null>(null);
  const [votes, setVotes] = useState<Record<string, boolean>>({});

  if (!course) {
    return (
      <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-border">
        <p className="font-display text-lg font-bold">This course isn't in your current context</p>
        <p className="mt-1 text-sm text-muted-foreground">Switch your department or level, or pick from your course list.</p>
        <Link to="/resources" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to Resource Hub</Link>
      </div>
    );
  }

  const res = getCourseResources(course);
  const exam = getExams(ctx).find((e) => e.courseId === course.id);
  const pqs = [...res.pastQuestions].sort((a, b) => (newestFirst ? b.year - a.year : a.year - b.year));

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "past", label: "Past Questions", count: res.pastQuestions.length },
    { id: "verified", label: "Verified Notes", count: res.verifiedNotes.length },
    { id: "community", label: "Community", count: res.communityNotes.length },
  ];

  return (
    <div className="space-y-5">
      <Link to="/resources" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Resource Hub
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-ink-gradient p-5 text-ink-foreground sm:p-6">
        <div className="grid-dots pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="font-mono text-sm font-bold text-pro">{course.code}</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{course.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{course.lecturer} · {course.units} units · {course.venue}</p>
          {exam && (
            <p className="mt-3 inline-flex rounded-full bg-sidebar-accent px-3 py-1 text-xs font-semibold ring-1 ring-sidebar-border">
              Exam: {exam.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {exam.hall}
            </p>
          )}
        </div>
      </header>

      <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl bg-muted p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition", tab === t.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground")}
          >
            {t.label}
            <span className="rounded-full bg-muted px-1.5 text-[10px]">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "past" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setNewestFirst((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold ring-1 ring-border">
              <ArrowDownUp className="size-3.5" /> {newestFirst ? "Newest first" : "Oldest first"}
            </button>
            <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold ring-1 ring-border">
              Show solutions <Switch checked={solutions} onCheckedChange={setSolutions} aria-label="Show solutions" />
            </label>
          </div>
          <ul className="space-y-2">
            {pqs.map((pq) => (
              <li key={pq.id}>
                <button
                  onClick={() => setDoc({ title: pq.title, code: course.code, pages: pq.questions + 2, tier: "official", showSolutions: solutions && pq.hasSolution })}
                  className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border transition hover:ring-primary/40"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-ink-foreground">{pq.year}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{pq.title}</p>
                    <p className="text-xs text-muted-foreground">{pq.questions} questions · Answer any 5</p>
                    {solutions && (
                      <p className={cn("mt-1 text-[11px] font-semibold", pq.hasSolution ? "text-official" : "text-muted-foreground")}>
                        {pq.hasSolution ? "✓ Worked solutions available" : "Solutions in review"}
                      </p>
                    )}
                  </div>
                  <TierBadge tier="official" compact className="hidden sm:inline-flex" />
                  <Eye className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "verified" && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {res.verifiedNotes.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => setDoc({ title: n.title, code: course.code, pages: n.pages, tier: "verified", pro: n.pro })}
                className={cn("flex h-full w-full flex-col rounded-2xl bg-card p-4 text-left ring-1 transition hover:-translate-y-0.5", n.pro ? "ring-pro/50" : "ring-border hover:ring-primary/40")}
              >
                <div className="flex items-center gap-2">
                  <TierBadge tier="verified" />
                  {n.pro && <ProBadge />}
                </div>
                <FileText className={cn("mt-4 size-8", n.pro ? "text-pro" : "text-verified")} />
                <p className="mt-2 font-semibold">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.kind} · {n.pages} pages</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === "community" && (
        <ul className="space-y-2">
          {res.communityNotes.map((n) => {
            const voted = !!votes[n.id];
            return (
              <li key={n.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
                <button
                  onClick={() => setVotes((v) => ({ ...v, [n.id]: !v[n.id] }))}
                  className={cn("flex w-12 shrink-0 flex-col items-center rounded-xl py-1.5 text-xs font-bold ring-1 ring-inset transition", voted ? "bg-primary text-primary-foreground ring-primary" : "bg-muted ring-border")}
                  aria-pressed={voted}
                  aria-label="Upvote"
                >
                  <ChevronUp className="size-4" />
                  {n.upvotes + (voted ? 1 : 0)}
                </button>
                <button onClick={() => setDoc({ title: n.title, code: course.code, pages: n.pages, tier: "community" })} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">by {n.author} · {n.pages} pages</p>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("size-3", s <= Math.round(n.rating) ? "fill-pro text-pro" : "text-border")} />
                    ))}
                    <span className="ml-1 text-[11px] font-semibold">{n.rating.toFixed(1)}</span>
                  </div>
                </button>
                <TierBadge tier="community" compact />
              </li>
            );
          })}
        </ul>
      )}

      <DocViewer doc={doc} onClose={() => setDoc(null)} />
    </div>
  );
}
