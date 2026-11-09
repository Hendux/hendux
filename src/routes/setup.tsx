import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHendux } from "@/lib/hendux-store";
import { FACULTIES, findDepartment, getCatalog, levelsFor, searchAllCourses, searchUniversities, semesterLabel, type Course, type University } from "@/lib/hendux-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up your account · Hendux" },
      { name: "description", content: "Choose your university, department, level, semester and courses." },
      { property: "og:title", content: "Set up your account · Hendux" },
      { property: "og:description", content: "Choose your university, department, level, semester and courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SetupPage,
});

const Label = ({ children }: { children: string }) => <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">{children}</span>;

function SetupPage() {
  const { ctx, courseIds, completeSetup, onboarded } = useHendux();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uni, setUni] = useState<University | null>(onboarded ? { id: "", name: ctx.university, short: ctx.universityShort } : null);
  const [uniQuery, setUniQuery] = useState(onboarded ? ctx.university : "");
  const [dept, setDept] = useState<string | null>(onboarded ? ctx.department : null);
  const [deptQuery, setDeptQuery] = useState("");
  const [level, setLevel] = useState<number | null>(onboarded ? ctx.level : null);
  const [semester, setSemester] = useState<1 | 2 | null>(onboarded ? ctx.semester : null);
  const [picked, setPicked] = useState<Set<string> | null>(null);
  const [extra, setExtra] = useState<Course[]>([]);
  const [courseQuery, setCourseQuery] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);

  const catalog = useMemo(() => (dept && level && semester ? getCatalog(dept, level, semester) : []), [dept, level, semester]);
  const list = [...catalog, ...extra.filter((e) => !catalog.some((c) => c.id === e.id))];
  const selected = picked ?? new Set(onboarded && catalog.some((c) => courseIds.includes(c.id)) ? courseIds : catalog.map((c) => c.id));

  const canNext = (step === 1 && uni) || (step === 2 && dept) || (step === 3 && level && semester) || step === 4;

  const finish = () => {
    const found = findDepartment(dept!)!;
    completeSetup(
      { university: uni!.name, universityShort: uni!.short, faculty: found.faculty.name, facultyShort: found.faculty.short, department: dept!, departmentShort: found.department.short, level: level!, semester: semester! },
      list.filter((c) => selected.has(c.id)).map((c) => c.id),
    );
    navigate({ to: "/" });
  };

  const toggle = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setPicked(s);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
      <div className="grid grid-cols-4 gap-1.5" aria-label={`Step ${step} of 4`}>
        {[1, 2, 3, 4].map((i) => <span key={i} className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />)}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Step {step} of 4</p>

      <div className="mt-6 flex-1 space-y-4">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold">Where do you study?</h1>
            <p className="text-sm text-muted-foreground">Select your university.</p>
            <div className="relative">
              <label className="flex items-center gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary">
                <Search className="size-4 text-muted-foreground" />
                <input value={uniQuery} onChange={(e) => { setUniQuery(e.target.value); setUni(null); }} placeholder="Type a name or acronym" className="flex-1 bg-transparent text-sm outline-none" aria-label="Search universities" />
              </label>
              {!uni && (
                <ul className="mt-2 max-h-72 overflow-y-auto rounded-xl bg-card p-1 ring-1 ring-border" role="listbox">
                  {searchUniversities(uniQuery).map((u) => (
                    <li key={u.id}><button onClick={() => { setUni(u); setUniQuery(u.name); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted"><span>{u.name}</span><span className="text-xs text-muted-foreground">{u.short}</span></button></li>
                  ))}
                  {searchUniversities(uniQuery).length === 0 && <li className="px-3 py-2.5 text-sm text-muted-foreground">No registered university matches.</li>}
                </ul>
              )}
              {uni && <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><Check className="size-4" />{uni.name}</p>}
            </div>
            <p className="text-sm text-muted-foreground">Can't find yours? <button onClick={() => setRequestOpen(true)} className="font-semibold text-primary">Request.</button></p>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold">Faculty and Department</h1>
            <p className="text-sm text-muted-foreground">Choose the one you belong to.</p>
            <div className="flex flex-wrap gap-2"><Label>{uni!.name}</Label></div>
            <label className="flex items-center gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-border">
              <Search className="size-4 text-muted-foreground" />
              <input value={deptQuery} onChange={(e) => setDeptQuery(e.target.value)} placeholder="Find a department" className="flex-1 bg-transparent text-sm outline-none" aria-label="Search departments" />
            </label>
            <div className="max-h-[50vh] space-y-4 overflow-y-auto">
              {FACULTIES.map((f) => {
                const ds = f.departments.filter((d) => d.name.toLowerCase().includes(deptQuery.toLowerCase()));
                if (ds.length === 0) return null;
                return (
                  <div key={f.name}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {ds.map((d) => (
                        <button key={d.name} onClick={() => { setDept(d.name); setLevel(null); setPicked(null); }} className={cn("rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-inset", dept === d.name ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border")}>{d.name}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-extrabold">Level and Semester</h1>
            <p className="text-sm text-muted-foreground">This decides which courses and updates you see.</p>
            <div className="flex flex-wrap gap-2"><Label>{uni!.name}</Label><Label>{dept!}</Label></div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</p>
            <div className="grid gap-2">
              {levelsFor(dept!).map((l) => (
                <button key={l} onClick={() => { setLevel(l); setPicked(null); }} className={cn("rounded-xl px-4 py-3 text-left text-sm font-semibold ring-1 ring-inset", level === l ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border")}>{l} Level</button>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Semester</p>
            <div className="grid grid-cols-2 gap-2">
              {([1, 2] as const).map((s) => (
                <button key={s} onClick={() => { setSemester(s); setPicked(null); }} className={cn("rounded-xl px-4 py-3 text-sm font-semibold ring-1 ring-inset", semester === s ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border")}>{semesterLabel(s, true)}</button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-2xl font-extrabold">Your Courses</h1>
            <p className="text-sm text-muted-foreground">We found these for you. Untick any you don't take.</p>
            <div className="flex flex-wrap gap-2"><Label>{uni!.name}</Label><Label>{dept!}</Label><Label>{`${level} Level`}</Label></div>
            <label className="flex items-center gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-border">
              <Search className="size-4 text-muted-foreground" />
              <input value={courseQuery} onChange={(e) => setCourseQuery(e.target.value)} placeholder="Find another course by code, e.g. MTH 301" className="flex-1 bg-transparent text-sm outline-none" aria-label="Search course code" />
            </label>
            {courseQuery && (
              <ul className="rounded-xl bg-card p-1 ring-1 ring-border">
                {searchAllCourses(courseQuery, semester!).map((c) => (
                  <li key={c.id}><button onClick={() => { setExtra((x) => [...x, c]); setPicked(new Set([...selected, c.id])); setCourseQuery(""); }} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"><span className="font-mono text-xs font-bold text-primary">{c.code}</span> {c.title}</button></li>
                ))}
              </ul>
            )}
            <ul className="space-y-2">
              {list.map((c) => (
                <li key={c.id}>
                  <button onClick={() => toggle(c.id)} className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left ring-1 ring-border" role="checkbox" aria-checked={selected.has(c.id)}>
                    <span className={cn("grid size-5 place-items-center rounded-md ring-1", selected.has(c.id) ? "bg-primary text-primary-foreground ring-primary" : "ring-border")}>{selected.has(c.id) && <Check className="size-3.5" />}</span>
                    <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
                    <span className="flex-1 text-sm">{c.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2">
        {step > 1 && <button onClick={() => setStep((s) => s - 1)} className="rounded-xl px-5 py-3 text-sm font-semibold ring-1 ring-border">Previous</button>}
        {step < 4 ? (
          <button disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="ml-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">Next</button>
        ) : (
          <button disabled={selected.size === 0} onClick={finish} className="ml-auto flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">Create</button>
        )}
      </div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Request your university</DialogTitle>
            <DialogDescription>Tell us where you study and we'll let you know when it's added.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setRequestOpen(false); toast.success("Request sent. We'll email you when it's added."); }}>
            <input required placeholder="University name" className="w-full rounded-xl px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary" />
            <input required placeholder="Country" className="w-full rounded-xl px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary" />
            <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Send request</button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
