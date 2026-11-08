import { CalendarPlus, Clock, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useHendux } from "@/lib/hendux-store";
import { downloadCalendarEvent, shareToWhatsApp } from "@/lib/share";
import type { CampusUpdate } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";
import { TierBadge } from "./badges";

const CATEGORY_LABEL = { academic: "Academic", faculty: "Faculty/Dept", events: "Event" };

export function UpdateCard({ u }: { u: CampusUpdate }) {
  const { openAI } = useHendux();

  const addToCalendar = () => {
    const start = u.event?.start ?? new Date(2026, 10, 10, 9, 0);
    const end = u.event?.end ?? new Date(start.getTime() + 60 * 60 * 1000);
    downloadCalendarEvent({ title: u.title, start, end, location: u.event?.venue ?? "University of Lagos", description: u.body });
    toast.success("Calendar invite downloaded", { description: u.title });
  };

  const share = () => {
    shareToWhatsApp(`📢 ${u.title}\n${u.event ? `🗓 ${u.event.date}, ${u.event.time} · ${u.event.venue}\n` : ""}Source: ${u.source}\n\nvia Hendux`);
  };

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border">
      {u.event && (
        <div className="relative aspect-[16/7] overflow-hidden">
          <img src={u.event.image} alt="" loading="lazy" width={1088} height={608} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="grid place-items-center rounded-xl bg-card px-3 py-1.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{u.event.date.split(",")[0]}</span>
              <span className="font-display text-lg font-bold leading-none">{u.event.date.split(" ")[1]}</span>
            </div>
            <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-ink-foreground backdrop-blur">{u.audience}</span>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={u.tier} />
          <span className="text-[11px] font-medium text-muted-foreground">{CATEGORY_LABEL[u.category]} · {u.posted}</span>
        </div>
        <h3 className="mt-2 text-base font-bold leading-snug">{u.title}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{u.body}</p>
        {u.event && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5 text-primary" />{u.event.date}, {u.event.time}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-primary" />{u.event.venue}</span>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          From <span className="font-semibold text-foreground">{u.source}</span>
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <CardAction onClick={addToCalendar} Icon={CalendarPlus} label="Calendar" />
          <CardAction onClick={share} Icon={MessageCircle} label="WhatsApp" />
          <CardAction onClick={() => openAI(`Tell me about ${u.title}`)} Icon={Sparkles} label="Ask AI" accent />
        </div>
      </div>
    </article>
  );
}

function CardAction({ onClick, Icon, label, accent }: { onClick: () => void; Icon: typeof Clock; label: string; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
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
