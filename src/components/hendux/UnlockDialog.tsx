import { useState } from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTopics } from "@/lib/exam-prep";
import type { Course } from "@/lib/hendux-data";
import { useHendux } from "@/lib/hendux-store";

const INCLUDED = [
  "Readiness for the whole course and every topic",
  "Hendux Verified notes you can highlight and ask AI about",
  "Key Points, plus what students often overlook",
  "Topic quizzes and timed topic mocks",
  "A General Mock Exam covering the whole course",
];

/** Pay-to-unlock step for one course. Price and payment method are not decided yet, so no charge is taken. */
export function UnlockDialog({ course, open, onOpenChange, onUnlocked }: { course: Course | null; open: boolean; onOpenChange: (o: boolean) => void; onUnlocked?: (c: Course) => void }) {
  const { unlockCourse } = useHendux();
  const [busy, setBusy] = useState(false);
  if (!course) return null;
  const topics = getTopics(course).length;

  const unlock = () => {
    setBusy(true);
    window.setTimeout(() => {
      unlockCourse(course.id);
      setBusy(false);
      onOpenChange(false);
      toast.success(`${course.code} unlocked`, { description: "Exam Preparation is ready. Start with your weakest topic." });
      onUnlocked?.(course);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="relative overflow-hidden bg-ink-gradient p-5 text-left text-ink-foreground">
          <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold-gradient opacity-30 blur-2xl" />
          <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-pro-foreground">
            <Crown className="size-3" /> Exam Preparation
          </span>
          <DialogTitle className="relative mt-3 font-display text-2xl leading-tight text-ink-foreground">
            Unlock {course.code}
          </DialogTitle>
          <DialogDescription className="relative text-sm text-ink-muted">
            {course.title} · {topics} topics
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-5">
          <ul className="space-y-2.5">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-pro-soft text-pro-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Price</p>
              <p className="font-display text-lg font-bold">To be confirmed</p>
            </div>
            <p className="max-w-[11rem] text-right text-[11px] leading-snug text-muted-foreground">Sample app: unlocking is free while pricing is decided.</p>
          </div>
          <button
            onClick={unlock}
            disabled={busy}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gold-gradient px-4 py-3.5 text-sm font-extrabold text-pro-foreground shadow-gold transition hover:brightness-105 disabled:opacity-80"
          >
            <span className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-card/40" />
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Crown className="size-4" />}
            {busy ? "Unlocking…" : `Unlock ${course.code}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
