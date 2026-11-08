import { useEffect, useState } from "react";
import { Flag, Timer } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOCK_EXAM } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

export function MockExamDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [seconds, setSeconds] = useState(MOCK_EXAM.minutes * 60);
  const [picked, setPicked] = useState<number | null>(null);
  const [flagged, setFlagged] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSeconds(MOCK_EXAM.minutes * 60);
    setPicked(null);
    const t = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [open]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="bg-ink-gradient p-5 text-left text-ink-foreground">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <p className="font-mono text-xs font-semibold text-ink-muted">{MOCK_EXAM.code} · Preview</p>
              <DialogTitle className="font-display text-lg text-ink-foreground">{MOCK_EXAM.title}</DialogTitle>
              <DialogDescription className="text-xs text-ink-muted">Question 1 of {MOCK_EXAM.questions}</DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-sidebar-accent px-3 py-2 font-mono text-lg font-bold">
              <Timer className="size-4 text-pro" /> {mm}:{ss}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-10 gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full", i === 0 ? "bg-pro" : "bg-sidebar-accent")} />
            ))}
          </div>
        </DialogHeader>
        <div className="p-5">
          <p className="font-semibold">{MOCK_EXAM.sample.q}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {MOCK_EXAM.sample.options.map((o, i) => (
              <button
                key={o}
                onClick={() => setPicked(i)}
                className={cn("rounded-xl px-3 py-3 text-sm font-semibold ring-1 ring-inset transition", picked === i ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border hover:ring-primary/50")}
              >
                {String.fromCharCode(65 + i)}. {o}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button onClick={() => setFlagged((f) => !f)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ring-1", flagged ? "bg-warning-soft text-warning ring-warning/40" : "ring-border")}>
              <Flag className="size-3.5" /> {flagged ? "Flagged" : "Flag for review"}
            </button>
            <button
              onClick={() => {
                toast("The full 40-question mock unlocks in the complete app");
                onOpenChange(false);
              }}
              className="ml-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Next question
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
