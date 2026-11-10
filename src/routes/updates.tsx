import { createFileRoute } from "@tanstack/react-router";
import { TIER_META } from "@/components/hendux/badges";
import { UpdatesFeed } from "@/components/hendux/UpdatesFeed";
import { useHendux } from "@/lib/hendux-store";
import { semesterLabel, type Tier } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Campus Updates · Hendux" },
      { name: "description", content: "Official notices, Hendux Verified news and course rep posts for your university, faculty, department and level." },
      { property: "og:title", content: "Campus Updates · Hendux" },
      { property: "og:description", content: "Every post shows where it came from, so you know what to trust." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UpdatesPage,
});

const KEY_ORDER: Tier[] = ["verified", "official", "community"];
const KEY_ACCENT: Record<Tier, string> = {
  verified: "bg-verified",
  official: "bg-official",
  community: "bg-community",
};

function UpdatesPage() {
  const { ctx } = useHendux();
  return (
    <div className="space-y-5">
      <p className="truncate font-mono text-[11px] font-medium text-muted-foreground" title="Your academic details">
        {ctx.universityShort} · {ctx.facultyShort} · {ctx.departmentShort} · {ctx.level}L · {semesterLabel(ctx.semester)}
      </p>

      <header>
        <h1 className="text-[28px] font-extrabold leading-tight sm:text-4xl">Campus Updates</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Every post shows where it came from, so you know what to trust.</p>
      </header>

      <section aria-label="What each source means" className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <ul className="divide-y divide-border">
          {KEY_ORDER.map((tier) => {
            const meta = TIER_META[tier];
            return (
              <li key={tier} className="relative flex items-start gap-3 py-3 pl-4 pr-3">
                <span className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", KEY_ACCENT[tier])} />
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl ring-1 ring-inset", meta.className)}>
                  <meta.Icon className="size-4" />
                </span>
                <p className="text-sm leading-snug">
                  <span className="font-bold">{meta.label}</span>
                  <span className="text-muted-foreground"> · {meta.desc}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <UpdatesFeed />
    </div>
  );
}
