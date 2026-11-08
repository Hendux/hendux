import { createFileRoute } from "@tanstack/react-router";
import { TierBadge } from "@/components/hendux/badges";
import { UpdatesFeed } from "@/components/hendux/UpdatesFeed";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Campus Updates · Hendux" },
      { name: "description", content: "Official notices, Hendux-verified news and course rep updates for UNILAG Faculty of Science students." },
      { property: "og:title", content: "Campus Updates · Hendux" },
      { property: "og:description", content: "Official notices, verified news and course rep updates — each with a clear credibility badge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Know</p>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Campus Updates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every post shows where it came from, so you know what to trust.</p>
      </header>
      <div className="grid gap-2 sm:grid-cols-3">
        {([
          ["official", "Senate, Registry, Dean & Department offices"],
          ["verified", "Confirmed by the Hendux campus desk"],
          ["community", "Posted by course reps and students"],
        ] as const).map(([tier, desc]) => (
          <div key={tier} className="rounded-xl bg-card p-3 ring-1 ring-border">
            <TierBadge tier={tier} />
            <p className="mt-1.5 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <UpdatesFeed columns={2} />
    </div>
  );
}
