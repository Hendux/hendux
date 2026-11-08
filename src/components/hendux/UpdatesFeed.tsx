import { useState } from "react";
import { UPDATES, type UpdateCategory } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";
import { UpdateCard } from "./UpdateCard";

const FILTERS: { id: "all" | UpdateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "faculty", label: "Faculty/Dept" },
  { id: "events", label: "Events" },
];

export function UpdatesFeed({ limit, columns = 1 }: { limit?: number; columns?: 1 | 2 }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const items = UPDATES.filter((u) => filter === "all" || u.category === filter).slice(0, limit);

  return (
    <div className="space-y-4">
      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Filter updates">
        {FILTERS.map((f) => {
          const count = UPDATES.filter((u) => f.id === "all" || u.category === f.id).length;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition",
                filter === f.id ? "bg-ink text-ink-foreground ring-ink" : "bg-card text-muted-foreground ring-border hover:text-foreground",
              )}
            >
              {f.label}
              <span className={cn("rounded-full px-1.5 text-[10px]", filter === f.id ? "bg-sidebar-accent" : "bg-muted")}>{count}</span>
            </button>
          );
        })}
      </div>
      <div className={cn("grid gap-4", columns === 2 && "md:grid-cols-2")}>
        {items.map((u) => (
          <UpdateCard key={u.id} u={u} />
        ))}
      </div>
    </div>
  );
}
