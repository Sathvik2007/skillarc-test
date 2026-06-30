// app/dashboard/companies/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Search, Building2, Plus, X } from "lucide-react";
import { Card, Badge, StatCard, SectionHeader, Skeleton, EmptyState } from "@/components/ui";
import { ApexBarChart, ApexPieChart } from "@/components/charts";
import { fmt } from "@/lib/utils";
import type { Company, CompanyStat } from "@/types";

export default function CompaniesPage() {
  const [companies,  setCompanies]  = useState<Company[]>([]);
  const [stats,      setStats]      = useState<CompanyStat[]>([]);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState<string | null>(null);
  const [loading,    setLoad]        = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [newCo,      setNewCo]      = useState({ name: "", industry: "IT", location: "", email: "" });
  const [saving,     setSaving]     = useState(false);
  const [aiQ,        setAiQ]        = useState("");
  const [aiA,        setAiA]        = useState("");
  const [aiLoad,     setAiL]        = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/companies").then(r => r.json()),
      fetch("/api/analytics").then(r => r.json()),
    ]).then(([co, an]) => {
      setCompanies(co.data ?? []);
      setStats(an.data?.company_stats ?? []);
      setLoad(false);
    });
  }, []);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStats = stats.find(s => s.company === selected);

  async function saveCompany(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCo),
    });
    const j = await r.json();
    if (j.data) setCompanies(prev => [...prev, j.data]);
    setSaving(false);
    setShowForm(false);
    setNewCo({ name: "", industry: "IT", location: "", email: "" });
  }

  async function askAI() {
    if (!aiQ.trim() || !selected) return;
    setAiL(true);
    const compData = stats.find(s => s.company === selected);
    const r = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Company: ${selected}
Stats: ${JSON.stringify(compData ?? {})}
Question: ${aiQ}
Answer as a placement analytics expert. Be concise.`,
      }),
    });
    const j = await r.json();
    setAiA(j.text);
    setAiL(false);
  }

  if (loading) return <div className="space-y-4">{Array(5).fill(0).map((_,i)=><Skeleton key={i} className="h-16"/>)}</div>;

  const topByHires   = [...stats].sort((a,b) => b.selected - a.selected).slice(0, 8);
  const topByPkg     = [...stats].sort((a,b) => b.avg_package - a.avg_package).slice(0, 8);
  const pieData      = topByHires.slice(0,6).map(s => ({ name: s.company, value: s.selected }));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Companies"
        subtitle={`${companies.length} registered companies`}
        action={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15}/> Add company
          </button>
        }
      />

      {/* ── Add company modal ───────────────────────────────────── */}
      {showForm && (
        <Card className="border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-text-primary">Register new company</p>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={15}/></button>
          </div>
          <form onSubmit={saveCompany} className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company name *</label>
              <input className="input" required value={newCo.name} onChange={e => setNewCo(p=>({...p,name:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Industry</label>
              <select className="input" value={newCo.industry} onChange={e => setNewCo(p=>({...p,industry:e.target.value}))}>
                {["IT","Finance","Consulting","Manufacturing","Healthcare","Other"].map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={newCo.location} onChange={e => setNewCo(p=>({...p,location:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Contact email</label>
              <input className="input" type="email" value={newCo.email} onChange={e => setNewCo(p=>({...p,email:e.target.value}))}/>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Company list ────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
            <input className="input pl-8" placeholder="Search companies…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto no-scrollbar">
            {filtered.length === 0
              ? <EmptyState message="No companies found" icon={<Building2 size={28}/>}/>
              : filtered.map(c => {
                  const cStat = stats.find(s => s.company === c.name);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c.name === selected ? null : c.name)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selected === c.name
                          ? "border-primary/40 bg-primary/5"
                          : "border-background-border bg-background-card hover:border-background-border/80 hover:bg-background-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-text-primary">{c.name}</p>
                        <Badge variant="neutral">{c.industry}</Badge>
                      </div>
                      {cStat && (
                        <p className="text-xs text-text-muted mt-1">
                          {cStat.selected} placed · ₹{fmt(cStat.avg_package)} L avg
                        </p>
                      )}
                    </button>
                  );
                })
            }
          </div>
        </div>

        {/* ── Company detail ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <Card className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Building2 size={32} className="text-text-muted mx-auto mb-2"/>
                <p className="text-sm text-text-secondary">Select a company to view details</p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Applicants"    value={selectedStats?.applicants   ?? "—"}/>
                <StatCard label="Selected"      value={selectedStats?.selected     ?? "—"} accent="bg-success/10 text-success"/>
                <StatCard label="Success rate"  value={selectedStats ? `${selectedStats.selection_rate}%` : "—"} accent="bg-primary/10 text-primary"/>
                <StatCard label="Avg package"   value={selectedStats ? `₹${fmt(selectedStats.avg_package)} L` : "—"} accent="bg-accent-amber/10 text-accent-amber"/>
              </div>

              {/* AI ask */}
              <Card>
                <p className="text-sm font-medium text-text-primary mb-2">Ask AI about {selected}</p>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="e.g. Which branch performs best in this company?"
                    value={aiQ}
                    onChange={e => setAiQ(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && askAI()}
                  />
                  <button className="btn-primary shrink-0" onClick={askAI} disabled={aiLoad}>
                    {aiLoad ? "…" : "Ask"}
                  </button>
                </div>
                {aiA && (
                  <div className="mt-3 p-3 rounded-lg bg-background-muted border border-background-border text-sm text-text-secondary leading-relaxed">
                    {aiA}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      {/* ── Overview charts ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <p className="text-sm font-medium text-text-primary mb-3">Top companies by hires</p>
          <ApexBarChart data={topByHires} dataKey="selected" xKey="company" horizontal color="#6366f1"/>
        </Card>
        <Card>
          <p className="text-sm font-medium text-text-primary mb-3">Hire share</p>
          <ApexPieChart data={pieData}/>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Average package by company (LPA)</p>
        <ApexBarChart data={topByPkg} dataKey="avg_package" xKey="company" horizontal color="#14b8a6"/>
      </Card>
    </div>
  );
}
