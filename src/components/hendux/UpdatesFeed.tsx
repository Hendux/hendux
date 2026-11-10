import { useMemo, useState } from "react";
import { Target } from "lucide-react";
import { getUpdates, type UpdateCategory } from "@/lib/hendux-data";
import { useHendux } from "@/lib/hendux-store";
import { cn } from "@/lib/utils";
import { UpdateCard } from "./UpdateCard";

export const UPDATE_FILTERS: { id: "all" | UpdateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "faculty", label: "Faculty/Department" },
  { id: "event", label: "Event" },
];

export function UpdatesFeed({ limit, showFilters = true }: { limit?: number; showFilters?: boolean }) {
  const { ctx, courses } = useHendux();
  const [filter, setFilter] = useState<(typeof UPDATE_FILTERS)[number]["id"]>("all");
  const all = useMemo(() => getUpdates(ctx, courses), [ctx, courses]);
  const items = all.filter((u) => filter === "all" || u.category === filter).slice(0, limit);

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="sticky top-[61px] z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl">
          <div className="scrollbar-none flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filter updates">
            {UPDATE_FILTERS.map((f) => {
              const count = all.filter((u) => f.id === "all" || u.category === f.id).length;
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold ring-1 ring-inset transition",
                    active ? "bg-ink text-ink-foreground ring-ink" : "bg-card text-muted-foreground ring-border hover:text-foreground",
                  )}
                >
                  {f.label}
                  <span className={cn("rounded-full px-1.5 py-px font-mono text-[10px]", active ? "bg-primary text-primary-foreground" : "bg-muted")}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {showFilters && filter === "faculty" && (
        <p className="flex items-start gap-2 rounded-xl bg-primary-soft px-3 py-2.5 text-xs font-medium text-accent-foreground">
          <Target className="mt-px size-3.5 shrink-0" />
          <span>
            Only posts for <b>{ctx.faculty}</b>, <b>{ctx.department}</b>, <b>{ctx.level} Level</b> and your courses.
          </span>
        </p>
      )}
      {showFilters && filter === "academic" && (
        <p className="rounded-xl bg-muted px-3 py-2.5 text-xs font-medium text-muted-foreground">University-wide notices for every student at {ctx.university}.</p>
      )}
      <div className="grid gap-4">
        {items.map((u, i) => (
          <div key={u.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}>
            <UpdateCard u={u} />
          </div>
        ))}
      </div>
    </div>
  );
}
