import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ContinueCard, CourseTile } from "@/components/hendux/CourseTile";
import { ProBadge, TierBadge } from "@/components/hendux/badges";
import { useHendux } from "@/lib/hendux-store";
import { getCourses } from "@/lib/hendux-data";

export const Route = createFileRoute("/resources/")({
  head: () => ({
    meta: [
      { title: "Resource Hub · Hendux" },
      { name: "description", content: "Past questions, verified notes, formula sheets and community notes for every course you're enrolled in." },
      { property: "og:title", content: "Resource Hub · Hendux" },
      { property: "og:description", content: "Past questions, verified notes, formula sheets and community notes for your courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { ctx } = useHendux();
  const [query, setQuery] = useState("");
  const courses = getCourses(ctx).filter((c) => `${c.code} ${c.title}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Find</p>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Resource Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ctx.department} · {ctx.level} Level · {ctx.semester === 1 ? "1st" : "2nd"} Semester
        </p>
      </header>

      <ContinueCard />

      <label className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 shadow-card ring-1 ring-border focus-within:ring-primary">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your courses…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search courses"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Inside each course: <TierBadge tier="official" compact /> past questions <TierBadge tier="verified" compact /> notes <ProBadge /> formula sheets <TierBadge tier="community" compact /> notes
      </div>

      {courses.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-border">No course matches “{query}”.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {courses.map((c) => (
            <CourseTile key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
