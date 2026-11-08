import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Lock, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDocContent, type Tier } from "@/lib/hendux-data";
import { useHendux } from "@/lib/hendux-store";
import { cn } from "@/lib/utils";
import { ProBadge, TierBadge } from "./badges";

export type OpenDoc = { title: string; code: string; pages: number; tier: Tier; pro?: boolean; startPage?: number; showSolutions?: boolean };

export function DocViewer({ doc, onClose }: { doc: OpenDoc | null; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const { openAI } = useHendux();
  useEffect(() => {
    if (doc) {
      setPage(doc.startPage ?? 1);
      setZoom(1);
    }
  }, [doc]);
  const content = doc ? getDocContent(doc.title, doc.code) : null;
  const locked = !!doc?.pro;

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {doc && content && (
          <>
            <DialogHeader className="border-b border-border p-4 text-left">
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <TierBadge tier={doc.tier} />
                {doc.pro && <ProBadge />}
                <span className="font-mono text-xs font-semibold text-primary">{doc.code}</span>
              </div>
              <DialogTitle className="mt-1.5 pr-8 font-display text-lg leading-snug">{doc.title}</DialogTitle>
              <DialogDescription className="text-xs">{doc.pages} pages · Preview</DialogDescription>
            </DialogHeader>

            <div className="relative flex-1 overflow-y-auto bg-muted p-4 sm:p-6">
              <div
                className={cn("mx-auto max-w-lg origin-top rounded-lg bg-card p-6 shadow-card ring-1 ring-border transition-transform sm:p-8", locked && "select-none")}
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="flex items-center justify-between border-b border-border pb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>University of Lagos · {doc.code}</span>
                  <span>Page {page}</span>
                </div>
                <h4 className="mt-4 font-display text-xl font-bold">{content.title}</h4>
                <div className={cn("mt-4 space-y-4", locked && page > 1 && "blur-sm")}>
                  {content.sections.map((s) => (
                    <div key={s.h}>
                      <p className="text-sm font-bold">{s.h}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
                    </div>
                  ))}
                  {doc.showSolutions && (
                    <div className="rounded-lg bg-official-soft p-3 text-sm">
                      <p className="font-bold text-official">Solution guide</p>
                      <p className="mt-1 text-muted-foreground">Step 1: state the definition. Step 2: draw the reference string table. Step 3: count faults per column — 6 marks total.</p>
                    </div>
                  )}
                </div>
              </div>
              {locked && page > 1 && (
                <div className="absolute inset-x-4 bottom-6 mx-auto max-w-sm rounded-2xl bg-card p-4 text-center shadow-glow ring-1 ring-pro/40">
                  <Lock className="mx-auto size-5 text-pro" />
                  <p className="mt-1 font-semibold">Unlock with Hendux Pro</p>
                  <p className="text-xs text-muted-foreground">Verified formula sheets, summaries and full solutions.</p>
                  <button onClick={() => toast("Hendux Pro checkout isn't part of this prototype")} className="mt-3 w-full rounded-xl bg-pro px-3 py-2 text-sm font-bold text-pro-foreground">
                    Go Pro · ₦1,500/month
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-border p-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="grid size-9 place-items-center rounded-lg ring-1 ring-border hover:bg-muted" aria-label="Previous page"><ChevronLeft className="size-4" /></button>
              <span className="min-w-16 text-center text-xs font-semibold">{page} / {doc.pages}</span>
              <button onClick={() => setPage((p) => Math.min(doc.pages, p + 1))} className="grid size-9 place-items-center rounded-lg ring-1 ring-border hover:bg-muted" aria-label="Next page"><ChevronRight className="size-4" /></button>
              <div className="mx-1 h-6 w-px bg-border" />
              <button onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))} className="grid size-9 place-items-center rounded-lg ring-1 ring-border hover:bg-muted" aria-label="Zoom out"><ZoomOut className="size-4" /></button>
              <button onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))} className="hidden size-9 place-items-center rounded-lg ring-1 ring-border hover:bg-muted sm:grid" aria-label="Zoom in"><ZoomIn className="size-4" /></button>
              <button onClick={() => toast.success("Saved for offline reading")} className="ml-auto grid size-9 place-items-center rounded-lg ring-1 ring-border hover:bg-muted" aria-label="Save offline"><Download className="size-4" /></button>
              <button
                onClick={() => {
                  onClose();
                  openAI(doc.code === "CSC 301" ? "Explain virtual memory" : `Find ${doc.code} past questions`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Sparkles className="size-3.5" /> Ask AI
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
