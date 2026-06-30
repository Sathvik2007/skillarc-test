// app/dashboard/students/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, User, BookOpen, Briefcase, Brain, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, Badge, Skeleton, StatCard } from "@/components/ui";
import { ApexAreaChart, ApexBarChart, ApexLineChart } from "@/components/charts";
import { fmt, pct } from "@/lib/utils";
import type { Student } from "@/types";

interface SemesterData {
  semester: number;
  sgpa: number;
  backlogs: number;
  attendance: number;
}

interface StudentDetail extends Student {
  semesters: SemesterData[];
  subjects?: unknown[];
}

type Tab = "overview" | "academics" | "skills" | "placements" | "ai";

const STATUS_V: Record<string, "success" | "danger" | "neutral"> = {
  Placed: "success", Rejected: "danger", "Not Placed": "neutral",
};

export default function StudentProfilePage() {
  const { id }           = useParams<{ id: string }>();
  const [data,   setData]  = useState<StudentDetail | null>(null);
  const [tab,    setTab]   = useState<Tab>("overview");
  const [ai,     setAi]    = useState("");
  const [aiLoad, setAiL]   = useState(false);
  const [loading,setLoad]  = useState(true);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then(r => r.json())
      .then(j => { setData(j.data); setLoad(false); });
  }, [id]);

  async function getAiInsight() {
    if (!data) return;
    setAiL(true);
    const r = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Analyse this student for placement readiness:
Name: ${data.name}, Branch: ${data.branch}, Status: ${data.status}
Skills: ${data.skills}, Hackathons: ${data.hackathons}, Papers: ${data.papers}
Semesters: ${JSON.stringify(data.semesters ?? [])}
Give: strengths, weaknesses, top 3 improvements, placement probability estimate.`,
      }),
    });
    const j = await r.json();
    setAi(j.text);
    setAiL(false);
  }

  if (loading) return <div className="space-y-4">{Array(6).fill(0).map((_,i)=><Skeleton key={i} className="h-20"/>)}</div>;
  if (!data)   return <p className="text-text-secondary">Student not found.</p>;

  const sems      = data.semesters ?? [];
  const sgpaData  = sems.map((s: SemesterData) => ({ sem: `S${s.semester}`, sgpa: s.sgpa ?? 0 }));
  const attData   = sems.map((s: SemesterData) => ({ sem: `S${s.semester}`, att: s.attendance ?? 0 }));
  const avgSgpa   = sems.length ? sems.reduce((a: number, s: SemesterData) => a + (s.sgpa ?? 0), 0) / sems.length : 0;
  const totBack   = sems.reduce((a: number, s: SemesterData) => a + (s.backlogs ?? 0), 0);
  const avgAtt    = sems.length ? sems.reduce((a: number, s: SemesterData) => a + (s.attendance ?? 0), 0) / sems.length : 0;
  const skills    = (data.skills ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview",   label: "Overview",   icon: <User       size={14}/> },
    { key: "academics",  label: "Academics",  icon: <BookOpen   size={14}/> },
    { key: "skills",     label: "Skills",     icon: <Trophy     size={14}/> },
    { key: "placements", label: "Placements", icon: <Briefcase  size={14}/> },
    { key: "ai",         label: "AI Insights",icon: <Brain      size={14}/> },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* ── Back + header ──────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/students" className="btn-ghost p-2 mt-0.5">
          <ArrowLeft size={16}/>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{data.name}</h1>
            <Badge variant={STATUS_V[data.status] ?? "neutral"}>{data.status}</Badge>
          </div>
          <p className="page-subtitle">{data.student_id} · {data.branch} · Year {data.year}</p>
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-background-border">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Avg SGPA"    value={fmt(avgSgpa)}          accent="bg-primary/10 text-primary"/>
            <StatCard label="Backlogs"    value={totBack}               accent={totBack > 0 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}/>
            <StatCard label="Attendance"  value={pct(avgAtt)}           accent="bg-accent-teal/10 text-accent-teal"/>
            <StatCard label="Skills"      value={skills.length}         accent="bg-accent-amber/10 text-accent-amber"/>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Hackathons"  value={data.hackathons  ?? 0}/>
            <StatCard label="Papers"      value={data.papers      ?? 0}/>
            <StatCard label="Conferences" value={data.conferences ?? 0}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-sm font-medium text-text-primary mb-3">SGPA trend</p>
              <ApexAreaChart data={sgpaData} dataKey="sgpa" xKey="sem" color="#6366f1"/>
            </Card>
            <Card>
              <p className="text-sm font-medium text-text-primary mb-3">Attendance trend</p>
              <ApexAreaChart data={attData} dataKey="att" xKey="sem" color="#14b8a6"/>
            </Card>
          </div>

          {/* Skills chips */}
          <Card>
            <p className="text-sm font-medium text-text-primary mb-3">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: string) => (
                <span key={s} className="badge-info text-xs px-2.5 py-1">{s}</span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── ACADEMICS ──────────────────────────────────────────── */}
      {tab === "academics" && (
        <div className="space-y-4">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Semester</th><th>SGPA</th><th>Backlogs</th><th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {sems.map((s: SemesterData) => (
                  <tr key={s.semester}>
                    <td className="font-medium text-text-primary">Semester {s.semester}</td>
                    <td>
                      <span className={s.sgpa >= 8 ? "text-success" : s.sgpa >= 6.5 ? "text-accent-amber" : "text-danger"}>
                        {fmt(s.sgpa ?? 0)}
                      </span>
                    </td>
                    <td>
                      {(s.backlogs ?? 0) > 0
                        ? <Badge variant="danger">{s.backlogs}</Badge>
                        : <Badge variant="success">0</Badge>}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-background-muted rounded-full overflow-hidden max-w-24">
                          <div
                            className="h-full bg-accent-teal rounded-full"
                            style={{ width: `${Math.min(s.attendance ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary">{fmt(s.attendance ?? 0, 1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card>
            <p className="text-sm font-medium text-text-primary mb-3">SGPA vs class</p>
            <ApexLineChart
              data={sgpaData}
              lines={[
                { key: "sgpa", label: "Student SGPA", color: "#6366f1" },
              ]}
              xKey="sem"
            />
          </Card>
        </div>
      )}

      {/* ── SKILLS & ACTIVITIES ────────────────────────────────── */}
      {tab === "skills" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-medium text-text-primary mb-4">Skill profile</p>
            <ApexBarChart
              data={skills.map((s: string, i: number) => ({ skill: s, level: 75 + i * 5 }))}
              dataKey="level"
              xKey="skill"
              color="#6366f1"
            />
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Hackathons"  value={data.hackathons  ?? 0} accent="bg-primary/10 text-primary"/>
            <StatCard label="Papers"      value={data.papers      ?? 0} accent="bg-accent-teal/10 text-accent-teal"/>
            <StatCard label="Conferences" value={data.conferences ?? 0} accent="bg-accent-amber/10 text-accent-amber"/>
            <StatCard label="Sports"      value={data.sports      ?? 0} accent="bg-success/10 text-success"/>
          </div>

          {/* Strength meter */}
          <Card>
            <p className="text-sm font-medium text-text-primary mb-3">Overall strength index</p>
            {(() => {
              const strength = Math.min(
                skills.length * 10 +
                (data.hackathons ?? 0) * 8 +
                (data.papers ?? 0) * 10 +
                (data.conferences ?? 0) * 6, 100
              );
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Extracurricular score</span>
                    <span className="font-medium text-text-primary">{strength}%</span>
                  </div>
                  <div className="h-2 bg-background-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent-teal rounded-full transition-all"
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {/* ── PLACEMENTS ─────────────────────────────────────────── */}
      {tab === "placements" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Status"  value={data.status}         accent={data.status === "Placed" ? "bg-success/10 text-success" : "bg-background-border text-text-secondary"}/>
            <StatCard label="Company" value={data.company ?? "—"}/>
            <StatCard label="Package" value={data.package ? `₹${data.package} L` : "—"} accent="bg-accent-amber/10 text-accent-amber"/>
          </div>

          {data.placed_date && (
            <Card>
              <p className="text-sm text-text-secondary">
                Placed on <span className="text-text-primary font-medium">{new Date(data.placed_date).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
              </p>
            </Card>
          )}

          {/* Selection probability estimator */}
          <Card>
            <p className="text-sm font-medium text-text-primary mb-3">Selection probability by company tier</p>
            {[
              { tier: "Tier 1 (Google, Amazon)", prob: Math.max(0, Math.round(avgSgpa * 8 - totBack * 5 - 20)) },
              { tier: "Tier 2 (TCS, Infosys)",   prob: Math.min(95, Math.round(avgSgpa * 8 - totBack * 3 + 10)) },
              { tier: "Tier 3 (Startups)",        prob: Math.min(99, Math.round(avgSgpa * 7 + skills.length * 3)) },
            ].map(({ tier, prob }) => (
              <div key={tier} className="flex items-center gap-3 mb-3">
                <span className="text-xs text-text-secondary w-44 shrink-0">{tier}</span>
                <div className="flex-1 h-1.5 bg-background-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.max(0, prob)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-text-primary w-10 text-right">{Math.max(0, prob)}%</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── AI INSIGHTS ────────────────────────────────────────── */}
      {tab === "ai" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-medium text-text-primary mb-3">AI Placement Analyst</p>
            <p className="text-sm text-text-secondary mb-4">
              Generate a personalised placement readiness report for {data.name}.
            </p>
            <button className="btn-primary" onClick={getAiInsight} disabled={aiLoad}>
              {aiLoad ? "Analysing…" : "Generate AI Report"}
            </button>
            {ai && (
              <div className="mt-4 p-4 rounded-lg bg-background-muted border border-background-border
                              text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {ai}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
