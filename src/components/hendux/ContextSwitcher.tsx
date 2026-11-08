import { useEffect, useState } from "react";
import { Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHendux } from "@/lib/hendux-store";
import { DEPARTMENTS, LEVELS, type AcademicContext } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-inset transition",
        active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-border hover:ring-primary/40",
      )}
    >
      {active && <Check className="size-3.5" />}
      {children}
    </button>
  );
}

export function ContextSwitcher() {
  const { ctx, setCtx, switcherOpen, setSwitcherOpen } = useHendux();
  const [draft, setDraft] = useState<AcademicContext>(ctx);

  useEffect(() => {
    if (switcherOpen) setDraft(ctx);
  }, [switcherOpen, ctx]);

  const apply = () => {
    setCtx(draft);
    setSwitcherOpen(false);
    toast.success(`Now viewing ${draft.departmentShort} ${draft.level}L · ${draft.semester === 1 ? "1st" : "2nd"} Sem`);
  };

  return (
    <Dialog open={switcherOpen} onOpenChange={setSwitcherOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Academic context</DialogTitle>
          <DialogDescription>Everything in Hendux — timetable, notices, resources and prep — follows this context.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">University & Faculty</p>
            <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5 text-sm">
              <span className="font-medium">University of Lagos · Faculty of Science</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" /> Verified
              </span>
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</p>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((d) => (
                <Chip key={d.name} active={draft.department === d.name} onClick={() => setDraft({ ...draft, department: d.name, departmentShort: d.short })}>
                  {d.name}
                </Chip>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Level</p>
            <div className="grid grid-cols-4 gap-2">
              {LEVELS.map((l) => (
                <Chip key={l} active={draft.level === l} onClick={() => setDraft({ ...draft, level: l })}>
                  {l}L
                </Chip>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semester</p>
            <div className="grid grid-cols-2 gap-2">
              {([1, 2] as const).map((s) => (
                <Chip key={s} active={draft.semester === s} onClick={() => setDraft({ ...draft, semester: s })}>
                  {s === 1 ? "1st Semester" : "2nd Semester"}
                </Chip>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-2 flex gap-2">
          <button onClick={() => setSwitcherOpen(false)} className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-border transition hover:bg-muted">
            Cancel
          </button>
          <button onClick={apply} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Apply context
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
