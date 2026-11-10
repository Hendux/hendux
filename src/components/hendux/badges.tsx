import { BadgeCheck, Crown, Landmark, Users } from "lucide-react";
import logo from "@/assets/hendux-logo.jpg.asset.json";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/hendux-data";

export const TIER_META: Record<Tier, { label: string; desc: string; className: string; Icon: typeof Landmark }> = {
  verified: { label: "Hendux Verified", desc: "Posted by Hendux Administration.", className: "bg-verified-soft text-verified ring-verified/25", Icon: BadgeCheck },
  official: { label: "Officials", desc: "From the Senate, Registry, Deans and department offices, and the Student Union Government.", className: "bg-official-soft text-official ring-official/25", Icon: Landmark },
  community: { label: "Rep/Student", desc: "Posted by course reps and students.", className: "bg-community-soft text-community ring-community/25", Icon: Users },
};

export function TierBadge({ tier, className, compact }: { tier: Tier; className?: string; compact?: boolean }) {
  const meta = TIER_META[tier];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold ring-1 ring-inset",
        compact ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-[11px]",
        meta.className,
        className,
      )}
    >
      <meta.Icon className="size-3" aria-hidden />
      {meta.label}
    </span>
  );
}

export function ProBadge({ className, label = "Paid" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-pro px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pro-foreground",
        className,
      )}
    >
      <Crown className="size-3" aria-hidden />
      {label}
    </span>
  );
}

/** The user's Hendux logo, shown exactly as supplied. */
export function HenduxLogo({ className }: { className?: string }) {
  return <img src={logo.url} alt="Hendux logo" width={255} height={272} className={cn("h-9 w-auto shrink-0 rounded-lg", className)} />;
}

export function Avatar({ name, photo, className }: { name: string; photo?: string | undefined; className?: string }) {
  const init = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return photo ? (
    <img src={photo} alt={name} className={cn("size-9 shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground", className)} aria-label={name}>
      {init || "H"}
    </span>
  );
}
