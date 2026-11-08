import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, ChevronDown, GraduationCap, Home, Megaphone, Sparkles, Target, User } from "lucide-react";
import type { ReactNode } from "react";
import { useHendux } from "@/lib/hendux-store";
import { DEFAULT_CONTEXT, isDefaultContext } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";
import { HenduxMark } from "./badges";
import { ContextSwitcher } from "./ContextSwitcher";
import { AIAssistant } from "./AIAssistant";

const NAV: { to: "/" | "/updates" | "/resources" | "/prepare" | "/profile"; label: string; layer?: string; Icon: typeof Home }[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/updates", label: "Updates", layer: "Know", Icon: Megaphone },
  { to: "/resources", label: "Resources", layer: "Find", Icon: BookOpen },
  { to: "/prepare", label: "Prepare", layer: "Prepare", Icon: Target },
  { to: "/profile", label: "Profile", Icon: User },
];

export function ContextPill({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { ctx, setSwitcherOpen } = useHendux();
  const parts = [ctx.universityShort, ctx.facultyShort, ctx.departmentShort, `${ctx.level}L`, ctx.semester === 1 ? "1st Sem" : "2nd Sem"];
  return (
    <button
      type="button"
      onClick={() => setSwitcherOpen(true)}
      className={cn(
        "group inline-flex max-w-full items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-semibold transition",
        tone === "light"
          ? "bg-card text-foreground shadow-card ring-1 ring-border hover:ring-primary/40"
          : "bg-sidebar-accent text-sidebar-foreground ring-1 ring-sidebar-border hover:bg-sidebar-accent/80",
        className,
      )}
      aria-label="Switch academic context"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <GraduationCap className="size-3.5" />
      </span>
      <span className="truncate">
        {parts.map((p, i) => (
          <span key={p}>
            {i > 0 && <span className="mx-1 opacity-40">•</span>}
            {p}
          </span>
        ))}
      </span>
      {!isDefaultContext(ctx) && <span className="size-1.5 shrink-0 rounded-full bg-pro" aria-label="Previewing another context" />}
      <ChevronDown className="size-3.5 shrink-0 opacity-60 transition group-hover:translate-y-0.5" />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { openAI, ctx, setCtx } = useHendux();
  const previewing = !isDefaultContext(ctx);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-gradient p-5 text-sidebar-foreground lg:flex">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex items-center gap-3">
          <HenduxMark />
          <div>
            <p className="font-display text-xl font-bold leading-none">Hendux</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-muted">Know · Find · Prepare</p>
          </div>
        </div>
        <nav className="relative mt-10 flex flex-col gap-1">
          {NAV.map(({ to, label, layer, Icon }) => (
            <Link
              key={label}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-foreground"
            >
              <Icon className="size-[18px]" />
              <span className="flex-1">{label}</span>
              {layer && (
                <span className="rounded-md bg-sidebar-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {layer}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="relative mt-auto rounded-2xl bg-sidebar-accent p-4 ring-1 ring-sidebar-border">
          <Sparkles className="size-5 text-pro" />
          <p className="mt-2 font-display text-base font-semibold">Ask Hendux AI</p>
          <p className="mt-1 text-xs text-ink-muted">Classes, notices, past questions and topic explanations — with sources.</p>
          <button
            onClick={() => openAI()}
            className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Open assistant
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 lg:px-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="Hendux home">
              <HenduxMark className="size-8 text-base" />
              <span className="font-display text-lg font-bold">Hendux</span>
            </Link>
            <ContextPill className="hidden sm:inline-flex" />
            <div className="ml-auto flex items-center gap-2">
              <button className="relative grid size-9 place-items-center rounded-full bg-card ring-1 ring-border transition hover:ring-primary/40" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-urgent ring-2 ring-card" />
              </button>
              <Link to="/profile" className="grid size-9 place-items-center rounded-full bg-ink text-xs font-bold text-ink-foreground" aria-label="Profile">
                PN
              </Link>
            </div>
          </div>
          <div className="px-4 pb-3 sm:hidden">
            <ContextPill className="w-full justify-start" />
          </div>
        </header>

        {previewing && (
          <div className="border-b border-pro/30 bg-pro-soft">
            <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2 text-xs font-medium text-pro-foreground lg:px-8">
              <span>
                Previewing {ctx.department} {ctx.level}L · {ctx.semester === 1 ? "1st" : "2nd"} Semester
              </span>
              <button onClick={() => setCtx(DEFAULT_CONTEXT)} className="ml-auto font-semibold underline underline-offset-2">
                Back to my courses
              </button>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-5xl px-4 pb-36 pt-5 lg:px-8 lg:pb-20">{children}</main>
      </div>

      {/* Floating AI button */}
      <button
        onClick={() => openAI()}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-primary-gradient py-3 pl-3 pr-4 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.03] lg:bottom-8 lg:right-8"
        aria-label="Open Hendux AI assistant"
      >
        <span className="grid size-7 place-items-center rounded-full bg-primary-foreground/20 animate-pulse-ring">
          <Sparkles className="size-4" />
        </span>
        Ask AI
      </button>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map(({ to, label, Icon }) => (
            <Link
              key={label}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition data-[status=active]:text-primary"
            >
              <span className="grid h-7 w-12 place-items-center rounded-full transition group-data-[status=active]:bg-primary-soft">
                <Icon className="size-5" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <ContextSwitcher />
      <AIAssistant />
    </div>
  );
}
