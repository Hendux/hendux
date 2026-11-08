import { useState } from "react";
import { AlarmClock, ChevronDown, FileWarning } from "lucide-react";
import { URGENT_ITEMS } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

export function UrgencyStrip() {
  const [expanded, setExpanded] = useState(false);
  const first = URGENT_ITEMS[0]!;
  const rest = URGENT_ITEMS.slice(1);
  const items = expanded ? URGENT_ITEMS : [first];

  return (
    <section aria-label="Today's urgent items" className="overflow-hidden rounded-2xl bg-urgent-soft ring-1 ring-urgent/25">
      {items.map((item, i) => {
        const Icon = item.kind === "deadline" ? AlarmClock : FileWarning;
        return (
          <div key={item.id} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-urgent/15")}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-urgent text-primary-foreground">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-urgent">
                {i === 0 ? "Today" : "Admin notice"} <span className="font-semibold normal-case tracking-normal opacity-80">· {item.due}</span>
              </p>
              <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
            </div>
            {i === 0 && rest.length > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-urgent ring-1 ring-urgent/25"
                aria-expanded={expanded}
              >
                {expanded ? "Less" : `+${rest.length}`}
                <ChevronDown className={cn("size-3 transition", expanded && "rotate-180")} />
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}
