import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, BookOpen, Home, Megaphone, Sparkles, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHendux } from "@/lib/hendux-store";
import { getUpdates } from "@/lib/hendux-data";
import { Avatar, HenduxLogo } from "./badges";
import { AIAssistant } from "./AIAssistant";

type NavTo = "/" | "/updates" | "/resources" | "/ai" | "/profile";
const NAV: { to: NavTo; label: string; short: string; Icon: typeof Home }[] = [
  { to: "/", label: "Home", short: "Home", Icon: Home },
  { to: "/updates", label: "Campus Updates", short: "Updates", Icon: Megaphone },
  { to: "/resources", label: "Resources", short: "Resources", Icon: BookOpen },
  { to: "/ai", label: "Hendux AI", short: "Hendux AI", Icon: Sparkles },
  { to: "/profile", label: "Profile", short: "Profile", Icon: User },
];


export function SplashMark() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <HenduxLogo className="h-20 animate-pulse" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { hydrated, signedIn, onboarded, openAI, profile, ctx, courses } = useHendux();
  const notifications = getUpdates(ctx, courses).slice(0, 3);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAIScreen = pathname === "/ai" || pathname.startsWith("/ai/");

  useEffect(() => {
    if (!hydrated) return;
    if (!signedIn) navigate({ to: "/welcome", replace: true });
    else if (!onboarded) navigate({ to: "/setup", replace: true });
  }, [hydrated, signedIn, onboarded, navigate]);

  if (!hydrated || !signedIn || !onboarded) return <SplashMark />;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-gradient p-5 text-sidebar-foreground lg:flex">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-60" />
        <Link to="/" className="relative flex items-center gap-3">
          <HenduxLogo className="h-10" />
          <div>
            <p className="font-display text-xl font-bold leading-none">Hendux</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-muted">Know · Find · Prepare</p>
          </div>
        </Link>
        <nav className="relative mt-10 flex flex-col gap-1">
          {NAV.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-foreground"
            >
              <Icon className="size-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 lg:px-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="Hendux home">
              <HenduxLogo className="h-8" />
              <span className="font-display text-lg font-bold">Hendux</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative grid size-9 place-items-center rounded-full bg-card ring-1 ring-border transition hover:ring-primary/40" aria-label="Notifications">
                    <Bell className="size-4" />
                    <span className="absolute right-2 top-2 size-2 rounded-full bg-urgent ring-2 ring-card" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-2">
                  <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</p>
                  {notifications.map((n) => (
                    <Link key={n.id} to="/updates" className="block rounded-lg px-2 py-2 hover:bg-muted">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.posted} · {n.source}</p>
                    </Link>
                  ))}
                </PopoverContent>
              </Popover>
              <Link to="/profile" aria-label="Profile" className="rounded-full ring-1 ring-border transition hover:ring-primary/40">
                <Avatar name={profile.name} photo={profile.photo} />
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 pb-36 pt-5 lg:px-8 lg:pb-20">{children}</main>
      </div>

      {!onAIScreen && (
        <button
          onClick={() => openAI()}
          className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-primary-gradient py-3 pl-3 pr-4 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.03] lg:bottom-8 lg:right-8"
          aria-label="Open Hendux AI chat"
        >
          <span className="grid size-7 place-items-center rounded-full bg-primary-foreground/20 animate-pulse-ring">
            <Sparkles className="size-4" />
          </span>
          Hendux AI
        </button>
      )}

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map(({ to, label, short, Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition data-[status=active]:text-primary"
            >
              <span className="grid h-7 w-12 place-items-center rounded-full transition group-data-[status=active]:bg-primary-soft">
                <Icon className="size-5" />
              </span>
              {short}
            </Link>
          ))}
        </div>
      </nav>

      <AIAssistant />
    </div>
  );
}
