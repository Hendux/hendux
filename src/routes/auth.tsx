import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { HenduxLogo } from "@/components/hendux/badges";
import { useHendux } from "@/lib/hendux-store";
import { cn } from "@/lib/utils";

type View = "login" | "signup" | "forgot" | "verify" | "reset";
const VIEWS: View[] = ["login", "signup", "forgot", "verify", "reset"];

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { view?: View | undefined; email?: string | undefined } => ({
    view: VIEWS.includes(s["view"] as View) ? (s["view"] as View) : undefined,
    email: typeof s["email"] === "string" ? s["email"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log in · Hendux" },
      { name: "description", content: "Log in or create your Hendux account." },
      { property: "og:title", content: "Log in · Hendux" },
      { property: "og:description", content: "Log in or create your Hendux account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const inputCls = "w-full rounded-xl bg-card px-3.5 py-3 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-primary";
const btnCls = "w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">{label}</span>
      {children}
    </label>
  );
}

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <p className="text-center text-xs text-muted-foreground">or continue with</p>
      <button type="button" onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-semibold ring-1 ring-border hover:bg-muted">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>
        Google
      </button>
    </>
  );
}

function AuthPage() {
  const { view = "login", email: emailParam } = Route.useSearch();
  const navigate = useNavigate();
  const { signIn, startSignUp } = useHendux();
  const go = (v: View, email?: string) => navigate({ to: "/auth", search: { view: v, email } });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const doLogin = () => {
    signIn(email || undefined);
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
      <div className="flex justify-center"><HenduxLogo className="h-14" /></div>

      {(view === "login" || view === "signup") && (
        <>
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist">
            {(["login", "signup"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={view === t} onClick={() => go(t)} className={cn("rounded-lg py-2 text-sm font-semibold transition", view === t ? "bg-card shadow-card" : "text-muted-foreground")}>
                {t === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {view === "login" ? (
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); doLogin(); }}>
              <p className="text-sm text-muted-foreground">Welcome back. Good to see you.</p>
              <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@university.edu" /></Field>
              <Field label="Password"><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" /></Field>
              <div className="-mt-2 text-right"><button type="button" onClick={() => go("forgot")} className="text-xs text-muted-foreground hover:text-primary">Forgot password?</button></div>
              <button className={btnCls}>Sign in</button>
              <GoogleButton onClick={doLogin} />
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); startSignUp({ name: name.trim(), email: email.trim() }); navigate({ to: "/setup" }); }}>
              <div>
                <h1 className="text-2xl font-extrabold">Hello there,</h1>
                <p className="text-sm text-muted-foreground">We are excited to have you here.</p>
              </div>
              <Field label="Name"><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your full name" /></Field>
              <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@university.edu" /></Field>
              <Field label="Password"><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="At least 8 characters" /></Field>
              <button className={btnCls}>Create account</button>
              <GoogleButton onClick={() => { startSignUp({ name: "Prosper Nduka", email: "prosper.nduka@gmail.com" }); navigate({ to: "/setup" }); }} />
            </form>
          )}
        </>
      )}

      {view === "forgot" && (
        <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); go("verify", email); }}>
          <BackLink onClick={() => go("login")} />
          <h1 className="text-2xl font-extrabold">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">Fill in your email and we'll send a code to reset your password.</p>
          <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@university.edu" /></Field>
          <button className={btnCls}>Confirm</button>
        </form>
      )}

      {view === "verify" && <Verify email={emailParam ?? "....@email.com"} onBack={() => go("forgot")} onDone={() => go("reset")} />}

      {view === "reset" && <ResetPassword onDone={() => { toast.success("Password updated. Please log in."); go("login"); }} />}
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><ArrowLeft className="size-3.5" />Back</button>;
}

function Verify({ email, onBack, onDone }: { email: string; onBack: () => void; onDone: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [left, setLeft] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      const next = clean.slice(0, 6).split("");
      setDigits(Array.from({ length: 6 }, (_, j) => next[j] ?? ""));
      refs.current[Math.min(5, next.length)]?.focus();
      return;
    }
    setDigits((d) => d.map((x, j) => (j === i ? clean : x)));
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); onDone(); }}>
      <BackLink onClick={onBack} />
      <h1 className="text-2xl font-extrabold">Verification</h1>
      <p className="text-sm text-muted-foreground">We sent a reference code to your email <span className="font-semibold text-foreground">{email}</span></p>
      <div className="flex justify-between gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
            className="h-12 w-11 rounded-xl bg-card text-center font-display text-xl font-bold ring-1 ring-border outline-none focus:ring-2 focus:ring-primary"
          />
        ))}
      </div>
      <p className="text-center text-sm">
        {left > 0 ? <span className="text-muted-foreground">Resend in {left}s</span> : <button type="button" onClick={() => { setLeft(60); toast.success("A new code is on its way"); }} className="font-semibold text-primary">Resend code</button>}
      </p>
      <button disabled={digits.some((d) => !d)} className={btnCls}>Verify</button>
    </form>
  );
}

function ResetPassword({ onDone }: { onDone: () => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const mismatch = b.length > 0 && a !== b;
  return (
    <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); if (a.length >= 8 && a === b) onDone(); }}>
      <h1 className="text-2xl font-extrabold">Create New Password</h1>
      <Field label="Password"><input type="password" minLength={8} required value={a} onChange={(e) => setA(e.target.value)} className={inputCls} placeholder="At least 8 characters" /></Field>
      <Field label="Confirm password"><input type="password" required value={b} onChange={(e) => setB(e.target.value)} className={inputCls} /></Field>
      {mismatch && <p className="text-xs text-urgent">Passwords don't match.</p>}
      <button disabled={a.length < 8 || a !== b} className={btnCls}>Done</button>
    </form>
  );
}
