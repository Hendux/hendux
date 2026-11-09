import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HenduxLogo } from "@/components/hendux/badges";
import { useHendux } from "@/lib/hendux-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Hendux · Your University Life, In One Place" },
      { name: "description", content: "Hendux brings your timetable, campus updates, resources and exam preparation into one place." },
      { property: "og:title", content: "Hendux · Your University Life, In One Place" },
      { property: "og:description", content: "Timetable, campus updates, resources and exam preparation in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const { hydrated, signedIn, onboarded } = useHendux();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const fade = window.setTimeout(() => setLeaving(true), 2000);
    const go = window.setTimeout(() => navigate({ to: signedIn ? (onboarded ? "/" : "/setup") : "/auth", replace: true }), 2500);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(go);
    };
  }, [hydrated, signedIn, onboarded, navigate]);

  return (
    <div className={cn("grid min-h-screen place-items-center bg-background px-6 transition-opacity duration-500", leaving && "opacity-0")}>
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-90 duration-700">
        <HenduxLogo className="h-28 rounded-3xl shadow-glow" />
        <p className="mt-5 font-display text-4xl font-extrabold">Hendux</p>
        <p className="mt-2 text-sm text-muted-foreground">Your University Life, In One Place.</p>
        <div className="mt-8 flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
