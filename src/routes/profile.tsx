import { createFileRoute } from "@tanstack/react-router";
import { Bell, Crown, GraduationCap, MessageCircle, Moon, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ContextPill } from "@/components/hendux/AppShell";
import { TierBadge } from "@/components/hendux/badges";
import { useHendux } from "@/lib/hendux-store";
import { STUDENT } from "@/lib/hendux-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Hendux" },
      { name: "description", content: "Your Hendux student profile, academic context, notification preferences and Pro membership." },
      { property: "og:title", content: "Profile · Hendux" },
      { property: "og:description", content: "Student profile, academic context and preferences on Hendux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { ctx } = useHendux();
  const [prefs, setPrefs] = useState({ live: true, whatsapp: false, official: true, dark: false });
  const toggle = (k: keyof typeof prefs) => (v: boolean) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    if (k === "dark") document.documentElement.classList.toggle("dark", v);
  };

  const rows: { k: keyof typeof prefs; Icon: typeof Bell; title: string; desc: string }[] = [
    { k: "live", Icon: Bell, title: "Live class updates", desc: "Venue changes, cancellations and delays" },
    { k: "official", Icon: ShieldCheck, title: "Official notices only for alerts", desc: "Only push Registry, Senate and Dean notices" },
    { k: "whatsapp", Icon: MessageCircle, title: "Daily WhatsApp digest", desc: "A 7 AM summary of your day" },
    { k: "dark", Icon: Moon, title: "Dark mode", desc: "Easier on the eyes for late-night reading" },
  ];

  return (
    <div className="space-y-5">
      <section className="flex flex-col items-start gap-4 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border sm:flex-row sm:items-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-ink font-display text-xl font-bold text-ink-foreground">{STUDENT.initials}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{STUDENT.firstName} {STUDENT.lastName}</h1>
          <p className="text-sm text-muted-foreground">Matric No. {STUDENT.matric} · {ctx.department}, {ctx.level} Level</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-official-soft px-2.5 py-1 text-xs font-semibold text-official"><GraduationCap className="size-3.5" />Verified UNILAG student</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h2 className="text-base font-bold">Academic context</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tap to preview another level or department.</p>
        <ContextPill className="mt-3" />
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-pro-soft p-5 ring-1 ring-pro/40">
        <Crown className="size-6 text-pro" />
        <h2 className="mt-2 text-lg font-bold">Hendux Pro</h2>
        <p className="mt-1 text-sm text-muted-foreground">Verified formula sheets, exam summaries, full solutions and unlimited mock exams.</p>
        <button onClick={() => toast("Hendux Pro checkout isn't part of this prototype")} className="mt-3 rounded-xl bg-pro px-4 py-2 text-sm font-bold text-pro-foreground">Upgrade · ₦1,500/month</button>
      </section>

      <section className="divide-y divide-border rounded-2xl bg-card ring-1 ring-border">
        {rows.map(({ k, Icon, title, desc }) => (
          <label key={k} className="flex cursor-pointer items-center gap-3 p-4">
            <span className="grid size-9 place-items-center rounded-xl bg-muted"><Icon className="size-4" /></span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-xs text-muted-foreground">{desc}</span>
            </span>
            <Switch checked={prefs[k]} onCheckedChange={toggle(k)} />
          </label>
        ))}
      </section>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h2 className="text-base font-bold">How Hendux rates information</h2>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="flex items-start gap-3"><TierBadge tier="official" /><span className="text-muted-foreground">Published by Senate, Registry, a Dean or a Department office.</span></li>
          <li className="flex items-start gap-3"><TierBadge tier="verified" /><span className="text-muted-foreground">Checked and confirmed by the Hendux campus desk.</span></li>
          <li className="flex items-start gap-3"><TierBadge tier="community" /><span className="text-muted-foreground">Shared by a course rep or student. Useful, but double-check.</span></li>
        </ul>
      </section>
    </div>
  );
}
