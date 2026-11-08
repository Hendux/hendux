import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONTEXT, type AcademicContext } from "./hendux-data";

type HenduxState = {
  ctx: AcademicContext;
  setCtx: (c: AcademicContext) => void;
  switcherOpen: boolean;
  setSwitcherOpen: (v: boolean) => void;
  aiOpen: boolean;
  aiSeed: { text: string; nonce: number } | null;
  openAI: (prompt?: string) => void;
  closeAI: () => void;
};

const HenduxContext = createContext<HenduxState | null>(null);

export function HenduxProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<AcademicContext>(DEFAULT_CONTEXT);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState<{ text: string; nonce: number } | null>(null);

  const openAI = useCallback((prompt?: string) => {
    if (prompt) setAiSeed({ text: prompt, nonce: Date.now() });
    setAiOpen(true);
  }, []);
  const closeAI = useCallback(() => setAiOpen(false), []);

  const value = useMemo(
    () => ({ ctx, setCtx, switcherOpen, setSwitcherOpen, aiOpen, aiSeed, openAI, closeAI }),
    [ctx, switcherOpen, aiOpen, aiSeed, openAI, closeAI],
  );
  return <HenduxContext.Provider value={value}>{children}</HenduxContext.Provider>;
}

export function useHendux() {
  const v = useContext(HenduxContext);
  if (!v) throw new Error("useHendux must be used inside HenduxProvider");
  return v;
}
