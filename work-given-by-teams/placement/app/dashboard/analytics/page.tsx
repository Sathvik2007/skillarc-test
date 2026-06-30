// app/dashboard/analytics/page.tsx
"use client";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Award, Building2 } from "lucide-react";
import { Card, StatCard, SectionHeader, Skeleton } from "@/components/ui";
import { ApexAreaChart, ApexBarChart, ApexLineChart, ApexPieChart } from "@/components/charts";
import { fmt, pct } from "@/lib/utils";
import type { KPIData, YearlyTrend, BranchStat, CompanyStat } from "@/types";

interface AnalyticsData {
  kpi: KPIData;
  trend: YearlyTrend[];
  branches: BranchStat[];
  company_stats: CompanyStat[];
}

export default function AnalyticsPage() {
  const [data,  setData] = useState<AnalyticsData | null>(null);
  const [loading, setL]  = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(j => { setData(j.data); setL(false); });
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64"/>
      <div className="grid grid-cols-5 gap-3">{Array(5).fill(0).map((_,i)=><Skeleton key={i} className="h-24"/>)}</div>
      {Array(6).fill(0).map((_,i)=><Skeleton key={i} className="h-64"/>)}
    </div>
  );

  const { kpi, trend, branches, company_stats } = data!;

  // derived series
  const rateData    = trend.map(t => ({ year: t.year, rate: t.placement_rate }));
  const pkgData     = trend.map(t => ({ year: t.year, pkg:  t.avg_package    }));
  const branchPie   = branches.map(b => ({ name: b.branch, value: b.placements }));
  const branchRate  = branches.map(b => ({ branch: b.branch, rate: b.rate }));
  const top10       = [...company_stats].sort((a,b)=>b.selected-a.selected).slice(0,10);
  const topPkg      = [...company_stats].sort((a,b)=>b.avg_package-a.avg_package).slice(0,10);
  const difficulty  = company_stats.map(c => ({
    company:    c.company,
    difficulty: c.applicants / Math.max(c.selected, 1),
  })).sort((a,b)=>b.difficulty-a.difficulty).slice(0,10);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="University Analytics"
        subtitle="10-year placement intelligence report"
      />

      {/* ── KPIs ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Students"  value={kpi.total_students.toLocaleString()}  icon={<Users       size={15}/>}/>
        <StatCard label="Placed"          value={kpi.placed_students.toLocaleString()} icon={<Award       size={15}/>} accent="bg-success/10 text-success"/>
        <StatCard label="Companies"       value={kpi.companies}                        icon={<Building2   size={15}/>} accent="bg-accent-teal/10 text-accent-teal"/>
        <StatCard label="Avg Package"     value={`₹${fmt(kpi.avg_package)} L`}         icon={<TrendingUp  size={15}/>} accent="bg-accent-amber/10 text-accent-amber"/>
        <StatCard label="Placement Rate"  value={pct(kpi.placement_rate)}              icon={<BarChart3   size={15}/>} accent="bg-primary/10 text-primary"/>
      </div>

      {/* ── Trend charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-medium text-text-primary mb-3">Year-wise placements</p>
          <ApexAreaChart data={trend} dataKey="placements" xKey="year" color="#6366f1"/>
        </Card>
        <Card>
          <p className="text-sm font-medium text-text-primary mb-3">Placement rate % year-wise</p>
          <ApexAreaChart data={rateData} dataKey="rate" xKey="year" color="#14b8a6"/>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Average package trend (LPA)</p>
        <ApexAreaChart data={pkgData} dataKey="pkg" xKey="year" color="#f59e0b"/>
      </Card>

      {/* ── Branch analysis ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <p className="text-sm font-medium text-text-primary mb-3">Branch-wise placement count</p>
          <ApexBarChart data={branches} dataKey="placements" xKey="branch" color="#6366f1"/>
        </Card>
        <Card>
          <p className="text-sm font-medium text-text-primary mb-3">Branch share</p>
          <ApexPieChart data={branchPie}/>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Branch placement rate %</p>
        <ApexBarChart data={branchRate} dataKey="rate" xKey="branch" color="#14b8a6"/>
      </Card>

      {/* ── Company analysis ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-medium text-text-primary mb-3">Top 10 companies by hires</p>
          <ApexBarChart data={top10} dataKey="selected" xKey="company" horizontal color="#6366f1"/>
        </Card>
        <Card>
          <p className="text-sm font-medium text-text-primary mb-3">Top companies by avg package (LPA)</p>
          <ApexBarChart data={topPkg} dataKey="avg_package" xKey="company" horizontal color="#f59e0b"/>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Company difficulty index (applicants per hire)</p>
        <ApexBarChart data={difficulty} dataKey="difficulty" xKey="company" horizontal color="#f43f5e"/>
      </Card>

      {/* ── Multi-line trend ─────────────────────────────────────── */}
      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Placement rate vs avg package over years</p>
        <ApexLineChart
          data={trend}
          xKey="year"
          lines={[
            { key: "placement_rate", label: "Placement rate %", color: "#6366f1" },
            { key: "avg_package",    label: "Avg package LPA",  color: "#f59e0b" },
          ]}
        />
      </Card>

      {/* ── Company stats table ───────────────────────────────────── */}
      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Full company stats</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Applicants</th>
                <th>Selected</th>
                <th>Selection rate</th>
                <th>Avg package (L)</th>
              </tr>
            </thead>
            <tbody>
              {company_stats.map(c => (
                <tr key={c.company}>
                  <td className="font-medium text-text-primary">{c.company}</td>
                  <td>{c.applicants}</td>
                  <td className="text-success font-medium">{c.selected}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-background-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${c.selection_rate}%` }}/>
                      </div>
                      <span>{c.selection_rate}%</span>
                    </div>
                  </td>
                  <td>₹{fmt(c.avg_package)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
