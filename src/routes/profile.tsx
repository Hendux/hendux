import { useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, LogOut, X } from "lucide-react";
import { Avatar } from "@/components/hendux/badges";
import { useHendux } from "@/lib/hendux-store";
import { semesterLabel } from "@/lib/hendux-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Hendux" },
      { name: "description", content: "Your Hendux profile, academic details and courses." },
      { property: "og:title", content: "Profile · Hendux" },
      { property: "og:description", content: "Your Hendux profile, academic details and courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, ctx, courses, courseIds, setCourseIds, updateProfile, logOut } = useHendux();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-card ring-1 ring-border">
        <button onClick={() => fileRef.current?.click()} className="relative" aria-label="Change profile picture">
          <Avatar name={profile.name} photo={profile.photo} className="size-16 text-lg" />
          <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Camera className="size-3.5" /></span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => updateProfile({ photo: String(reader.result) });
          reader.readAsDataURL(f);
        }} />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">{profile.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Academic details</h2>
          <button onClick={() => navigate({ to: "/setup" })} className="text-xs font-semibold text-primary">Edit</button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          {[["University", ctx.university], ["Faculty", ctx.faculty], ["Department", ctx.department], ["Level", `${ctx.level} Level`], ["Semester", semesterLabel(ctx.semester)]].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h2 className="font-bold">My courses</h2>
        <ul className="mt-3 space-y-2">
          {courses.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2 text-sm">
              <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
              <span className="flex-1 truncate">{c.title}</span>
              <button onClick={() => setCourseIds(courseIds.filter((id) => id !== c.id))} aria-label={`Remove ${c.code}`} className="text-muted-foreground hover:text-urgent"><X className="size-4" /></button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">To add courses, tap Edit above and pick them on the last step.</p>
      </section>

      <button onClick={() => { logOut(); navigate({ to: "/auth" }); }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-urgent ring-1 ring-urgent/40">
        <LogOut className="size-4" /> Log out
      </button>
    </div>
  );
}
