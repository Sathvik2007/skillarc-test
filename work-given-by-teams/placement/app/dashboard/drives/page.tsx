// app/dashboard/drives/page.tsx
"use client";
import { useState } from "react";
import { Card, SectionHeader, Badge } from "@/components/ui";
import { CheckCircle } from "lucide-react";

const BRANCHES  = ["CSE","IT","ECE","EEE","Mechanical","Civil","AI & DS"];
const ROUNDS    = ["Online Test","Coding Test","Group Discussion","Technical Interview","HR Interview"];

export default function DrivesPage() {
  const [saved,    setSaved]   = useState(false);
  const [loading,  setLoad]    = useState(false);
  const [form,     setForm]    = useState({
    company_name:      "",
    job_title:         "",
    job_type:          "Full Time",
    ctc:               "",
    vacancies:         "1",
    min_cgpa:          "6.5",
    backlogs_allowed:  "0",
    skills_required:   "",
    interview_mode:    "Online",
    drive_status:      "Upcoming",
    eligible_branches: [] as string[],
    rounds:            [] as string[],
    ppt_date:          "",
    test_date:         "",
    interview_date:    "",
    offer_date:        "",
    joining_date:      "",
    applied:           "0",
    shortlisted:       "0",
    selected:          "0",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleArr(key: "eligible_branches" | "rounds", val: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoad(true);
    await fetch("/api/drives", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        ...form,
        ctc:       parseFloat(form.ctc),
        vacancies: parseInt(form.vacancies),
        min_cgpa:  parseFloat(form.min_cgpa),
        applied:   parseInt(form.applied),
        shortlisted: parseInt(form.shortlisted),
        selected:  parseInt(form.selected),
      }),
    });
    setLoad(false);
    setSaved(true);
    setForm({
      company_name:      "",
      job_title:         "",
      job_type:          "Full Time",
      ctc:               "",
      vacancies:         "1",
      min_cgpa:          "6.5",
      backlogs_allowed:  "0",
      skills_required:   "",
      interview_mode:    "Online",
      drive_status:      "Upcoming",
      eligible_branches: [],
      rounds:            [],
      ppt_date:          "",
      test_date:         "",
      interview_date:    "",
      offer_date:        "",
      joining_date:      "",
      applied:           "0",
      shortlisted:       "0",
      selected:          "0",
    });
    setTimeout(() => setSaved(false), 4000);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <SectionHeader title="Register Drive" subtitle="Add a new company placement drive"/>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
          <CheckCircle size={16}/>
          Drive registered successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Company info ──────────────────────────────────────── */}
        <Card>
          <p className="section-title">Company information</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company name" required>
              <input className="input" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} required/>
            </Field>
            <Field label="Job title" required>
              <input className="input" value={form.job_title} onChange={(e) => set("job_title", e.target.value)} required/>
            </Field>
            <Field label="Job type">
              <select className="input" value={form.job_type} onChange={(e) => set("job_type", e.target.value)}>
                <option>Full Time</option><option>Internship</option><option>Internship + PPO</option>
              </select>
            </Field>
            <Field label="CTC (LPA)">
              <input className="input" type="number" step="0.5" value={form.ctc} onChange={(e) => set("ctc", e.target.value)}/>
            </Field>
            <Field label="Vacancies">
              <input className="input" type="number" min="1" value={form.vacancies} onChange={(e) => set("vacancies", e.target.value)}/>
            </Field>
            <Field label="Interview mode">
              <select className="input" value={form.interview_mode} onChange={(e) => set("interview_mode", e.target.value)}>
                <option>Online</option><option>Offline</option>
              </select>
            </Field>
          </div>
        </Card>

        {/* ── Eligibility ────────────────────────────────────────── */}
        <Card>
          <p className="section-title">Eligibility</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Field label="Min CGPA">
              <input className="input" type="number" step="0.1" min="0" max="10" value={form.min_cgpa} onChange={(e) => set("min_cgpa", e.target.value)}/>
            </Field>
            <Field label="Backlogs allowed">
              <input className="input" type="number" min="0" value={form.backlogs_allowed} onChange={(e) => set("backlogs_allowed", e.target.value)}/>
            </Field>
          </div>

          <p className="label">Eligible branches</p>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <button
                key={b} type="button"
                onClick={() => toggleArr("eligible_branches", b)}
                className={`badge cursor-pointer transition-colors ${
                  form.eligible_branches.includes(b) ? "badge-info" : "badge-neutral"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <p className="label mt-4">Required skills</p>
          <input className="input" placeholder="Python, SQL, Java…" value={form.skills_required} onChange={(e) => set("skills_required", e.target.value)}/>
        </Card>

        {/* ── Process ────────────────────────────────────────────── */}
        <Card>
          <p className="section-title">Selection rounds</p>
          <div className="flex flex-wrap gap-2">
            {ROUNDS.map((r) => (
              <button
                key={r} type="button"
                onClick={() => toggleArr("rounds", r)}
                className={`badge cursor-pointer transition-colors ${
                  form.rounds.includes(r) ? "badge-info" : "badge-neutral"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </Card>

        {/* ── Schedule ───────────────────────────────────────────── */}
        <Card>
          <p className="section-title">Schedule</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Pre-placement talk", "ppt_date"],
              ["Online test",        "test_date"],
              ["Interview",          "interview_date"],
              ["Offer release",      "offer_date"],
              ["Joining",            "joining_date"],
            ].map(([label, key]) => (
              <Field key={key} label={label}>
                <input className="input" type="date" value={(form as Record<string,string>)[key]} onChange={(e) => set(key, e.target.value)}/>
              </Field>
            ))}
            <Field label="Drive status">
              <select className="input" value={form.drive_status} onChange={(e) => set("drive_status", e.target.value)}>
                <option>Upcoming</option><option>Ongoing</option><option>Completed</option>
              </select>
            </Field>
          </div>
        </Card>

        {/* ── Tracking ───────────────────────────────────────────── */}
        <Card>
          <p className="section-title">Internal tracking</p>
          <div className="grid grid-cols-3 gap-3">
            {[["Applied","applied"],["Shortlisted","shortlisted"],["Selected","selected"]].map(([l,k]) => (
              <Field key={k} label={l}>
                <input className="input" type="number" min="0" value={(form as Record<string,string>)[k]} onChange={(e) => set(k, e.target.value)}/>
              </Field>
            ))}
          </div>
        </Card>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Saving…" : "Register drive"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-danger ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
