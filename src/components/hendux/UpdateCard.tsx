import { CalendarPlus, Clock, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useHendux } from "@/lib/hendux-store";
import { downloadCalendarEvent, shareToWhatsApp } from "@/lib/share";
import type { CampusUpdate } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";
import { TierBadge } from "./badges";

export const CATEGORY_LABEL = { academic: "Academic", faculty: "Faculty/Department", event: "Event" } as const;

export function UpdateCard({ u }: { u: CampusUpdate }) {
  const { openAI, addReminder, ctx } = useHendux();
  // Images only appear on posts from Hendux Verified and Officials.
  const showImage = !!u.image && u.tier !== "community";

  const addToCalendar = () => {
    const start = u.when?.start ?? new Date(2026, 10, 10, 9, 0);
    const end = u.when?.end ?? new Date(start.getTime() + 60 * 60 * 1000);
    addReminder({ title: u.title, date: start, detail: u.when ? `${u.when.label} · ${u.when.venue}` : u.source });
    toast.success("Saved to your Hendux calendar", {
      description: u.when?.label ?? u.title,
      action: {
        label: "Phone calendar",
        onClick: () => downloadCalendarEvent({ title: u.title, start, end, location: u.when?.venue ?? ctx.university, description: u.body }),
      },
    });
  };

  const share = () => {
    shareToWhatsApp(`📢 ${u.title}\n${u.when ? `🗓 ${u.when.label} · ${u.when.venue}\n` : ""}Source: ${u.source}\n\nvia Hendux`);
  };

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border">
      {showImage && (
        <div className="relative aspect-[16/7] overflow-hidden">
          <img src={u.image} alt="" loading="lazy" width={1088} height={608} className="size-full object-cover" />
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-ink-foreground backdrop-blur">{u.audience}</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">{CATEGORY_LABEL[u.category]}</span>
          <TierBadge tier={u.tier} />
          <span className="ml-auto text-[11px] font-medium text-muted-foreground">{u.posted}</span>
        </div>
        <h3 className="mt-2 text-base font-bold leading-snug">{u.title}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{u.body}</p>
        {u.when && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5 text-primary" />{u.when.label}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-primary" />{u.when.venue}</span>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          From <span className="font-semibold text-foreground">{u.source}</span>
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <CardAction onClick={addToCalendar} Icon={CalendarPlus} label="Calendar" />
          <CardAction onClick={share} Icon={MessageCircle} label="WhatsApp" />
          <CardAction onClick={() => openAI(`Tell me about ${u.title}`)} Icon={Sparkles} label="Ask AI" accent title="Ask AI what it's about" />
        </div>
      </div>
    </article>
  );
}

function CardAction({ onClick, Icon, label, accent, title }: { onClick: () => void; Icon: typeof Clock; label: string; accent?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title ?? label}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition",
        accent ? "bg-primary-soft text-accent-foreground hover:bg-primary hover:text-primary-foreground" : "bg-muted text-foreground hover:bg-secondary",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
