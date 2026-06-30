// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Users, Building2, TrendingUp, DollarSign, Award } from "lucide-react";
import { StatCard, Card, Skeleton, SectionHeader } from "@/components/ui";
import { ApexAreaChart, ApexBarChart, ApexPieChart } from "@/components/charts";
import { fmt, pct } from "@/lib/utils";
import type { KPIData, YearlyTrend, BranchStat, CompanyStat } from "@/types";

interface AnalyticsData {
  kpi: KPIData;
  trend: YearlyTrend[];
  branches: BranchStat[];
  company_stats: CompanyStat[];
}

export default function DashboardPage() {
  const [data, setData]     = useState<AnalyticsData | null>(null);
  const [loading, setLoad]  = useState(true);
  const [aiQuery, setAiQ]   = useState("");
  const [aiAnswer, setAiA]  = useState("");
  const [aiLoading, setAiL] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((j) => { setData(j.data); setLoad(false); });
  }, []);

  async function askAI() {
    if (!aiQuery.trim()) return;
    setAiL(true);
    const r = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `You are a placement analyst. Answer briefly:\n${aiQuery}` }),
    });
    const j = await r.json();
    setAiA(j.text);
    setAiL(false);
  }

  if (loading) return <LoadingSkeleton/>;

  const { kpi, trend, branches, company_stats } = data!;

  const branchPieData = branches.map((b) => ({ name: b.branch, value: b.placements }));
  const topCompanies  = company_stats.slice(0, 8);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Placement Overview"
        subtitle="Real-time analytics across all students and companies"
      />

      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Students"
          value={kpi.total_students.toLocaleString()}
          delta="vs last year"
          deltaUp
          icon={<Users size={15}/>}
        />
        <StatCard
          label="Placed"
          value={kpi.placed_students.toLocaleString()}
          icon={<Award size={15}/>}
          accent="bg-success/10 text-success"
        />
        <StatCard
          label="Companies"
          value={kpi.companies}
          icon={<Building2 size={15}/>}
          accent="bg-accent-teal/10 text-accent-teal"
        />
        <StatCard
          label="Avg Package"
          value={`₹${fmt(kpi.avg_package)} L`}
          icon={<DollarSign size={15}/>}
          accent="bg-accent-amber/10 text-accent-amber"
        />
        <StatCard
          label="Placement Rate"
          value={pct(kpi.placement_rate)}
          delta="this cycle"
          deltaUp={kpi.placement_rate > 70}
          icon={<TrendingUp size={15}/>}
          accent="bg-primary/10 text-primary"
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <p className="text-sm font-medium text-text-primary mb-4">Placement trend</p>
          <ApexAreaChart data={trend} dataKey="placements" xKey="year"/>
        </Card>

        <Card>
          <p className="text-sm font-medium text-text-primary mb-4">Branch share</p>
          <ApexPieChart data={branchPieData}/>
        </Card>
      </div>

      {/* ── Second charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-medium text-text-primary mb-4">Top companies by hires</p>
          <ApexBarChart
            data={topCompanies}
            dataKey="selected"
            xKey="company"
            horizontal
            color="#6366f1"
          />
        </Card>

        <Card>
          <p className="text-sm font-medium text-text-primary mb-4">Average package by company</p>
          <ApexBarChart
            data={topCompanies}
            dataKey="avg_package"
            xKey="company"
            horizontal
            color="#14b8a6"
          />
        </Card>
      </div>

      {/* ── AI analyst ─────────────────────────────────────────────── */}
      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">AI Placement Analyst</p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ask anything — e.g. which branch has the best placement rate?"
            value={aiQuery}
            onChange={(e) => setAiQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askAI()}
          />
          <button className="btn-primary" onClick={askAI} disabled={aiLoading}>
            {aiLoading ? "…" : "Ask"}
          </button>
        </div>
        {aiAnswer && (
          <div className="mt-3 p-3 rounded-lg bg-background-muted border border-background-border text-sm text-text-secondary leading-relaxed">
            {aiAnswer}
          </div>
        )}
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64"/>
      <div className="grid grid-cols-5 gap-3">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24"/>)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="col-span-2 h-60"/>
        <Skeleton className="h-60"/>
      </div>
    </div>
  );
}
