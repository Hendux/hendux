import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText, MapPin, Sparkles, ThumbsUp, User } from "lucide-react";
import { toast } from "sonner";
import { DocViewer, type OpenDoc } from "@/components/hendux/DocViewer";
import { TierBadge } from "@/components/hendux/badges";
import { useHendux } from "@/lib/hendux-store";
import { findCourse, getCourseResources, semesterLabel } from "@/lib/hendux-data";

export const Route = createFileRoute("/resources/$courseId")({
  loader: ({ params }) => {
    const course = findCourse(params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.course.code ?? "Course"} · Resources · Hendux` },
      { name: "description", content: `Past questions, verified notes and student uploads for ${loaderData?.course.title ?? "this course"}.` },
      { property: "og:title", content: `${loaderData?.course.code ?? "Course"} · Hendux` },
      { property: "og:description", content: `Past questions, verified notes and student uploads for ${loaderData?.course.title ?? "this course"}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  notFoundComponent: () => <p className="p-8 text-center text-sm text-muted-foreground">Course not found.</p>,
  component: CoursePage,
});

function CoursePage() {
  const { course } = Route.useLoaderData();
  const { openAI } = useHendux();
  const [doc, setDoc] = useState<OpenDoc | null>(null);
  const r = getCourseResources(course);

  return (
    <div className="space-y-6">
      <Link to="/resources" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Resources</Link>

      <section className="rounded-2xl bg-ink-gradient p-5 text-ink-foreground">
        <p className="font-mono text-xs font-bold text-ink-muted">{course.code} · {course.units} credit units · {course.level} Level · {semesterLabel(course.semester)}</p>
        <h1 className="mt-1 text-2xl font-extrabold">{course.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1"><User className="size-3.5" />{course.lecturer}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{course.venue}</span>
          <span className="inline-flex items-center gap-1"><FileText className="size-3.5" />{course.notes} notes</span>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Past questions</h2>
        {r.pastQuestions.length === 0 ? (
          <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">No past questions available for this course yet.</p>
        ) : (
          r.pastQuestions.map((pq) => (
            <button key={pq.id} onClick={() => setDoc({ title: pq.title, code: course.code, pages: pq.questions, tier: "official", showSolutions: pq.hasSolution })} className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left ring-1 ring-border hover:ring-primary/40">
              <span className="font-display text-lg font-bold text-primary">{pq.year}</span>
              <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-semibold">{pq.title}</span><span className="text-xs text-muted-foreground">{pq.questions} questions{pq.hasSolution ? " · with solutions" : ""}</span></span>
            </button>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Verified notes</h2>
        {r.verifiedNotes.map((n) => (
          <button key={n.id} onClick={() => setDoc({ title: n.title, code: course.code, pages: n.pages, tier: "verified" })} className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left ring-1 ring-border hover:ring-primary/40">
            <TierBadge tier="verified" />
            <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-semibold">{n.title}</span><span className="text-xs text-muted-foreground">{n.kind} · {n.pages} pages</span></span>
          </button>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Student-sourced PDFs and notes</h2>
        {r.studentFiles.map((f) => (
          <div key={f.id} className="rounded-xl bg-card p-3 ring-1 ring-border">
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="mt-0.5 inline-flex items-center gap-2 text-xs text-muted-foreground">{f.format} · {f.pages} pages · by {f.author} · <ThumbsUp className="size-3" />{f.upvotes}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button onClick={() => toast.success("Download started", { description: f.title })} className="inline-flex items-center justify-center gap-1 rounded-lg bg-muted px-2 py-2 text-xs font-semibold"><Download className="size-3.5" />Download</button>
              <button onClick={() => openAI(`Summarize "${f.title}"`)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-soft px-2 py-2 text-xs font-semibold text-accent-foreground"><Sparkles className="size-3.5" />Summarize</button>
              <button onClick={() => openAI(`Quiz me on "${f.title}"`)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-soft px-2 py-2 text-xs font-semibold text-accent-foreground"><Sparkles className="size-3.5" />Quiz</button>
            </div>
          </div>
        ))}
      </section>

      <DocViewer doc={doc} onClose={() => setDoc(null)} />
    </div>
  );
}
