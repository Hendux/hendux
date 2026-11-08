import { BadgeCheck, Crown, Landmark, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/hendux-data";

const TIER_META: Record<Tier, { label: string; className: string; Icon: typeof Landmark }> = {
  official: { label: "Official Notice", className: "bg-official-soft text-official ring-official/25", Icon: Landmark },
  verified: { label: "Hendux-Verified", className: "bg-verified-soft text-verified ring-verified/25", Icon: BadgeCheck },
  community: { label: "Rep / Student", className: "bg-community-soft text-community ring-community/25", Icon: Users },
};

export function TierBadge({ tier, className, compact }: { tier: Tier; className?: string; compact?: boolean }) {
  const meta = TIER_META[tier];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        meta.className,
        className,
      )}
    >
      <meta.Icon className="size-3" aria-hidden />
      {compact ? meta.label.split(" ")[0] : meta.label}
    </span>
  );
}

export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-pro px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pro-foreground",
        className,
      )}
    >
      <Crown className="size-3" aria-hidden />
      Pro
    </span>
  );
}

export function HenduxMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 place-items-center rounded-xl bg-primary-gradient font-display text-lg font-extrabold text-primary-foreground shadow-glow",
        className,
      )}
      aria-hidden
    >
      H
    </span>
  );
}
