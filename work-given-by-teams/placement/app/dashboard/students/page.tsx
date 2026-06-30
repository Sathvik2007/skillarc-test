// app/dashboard/students/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { Card, Badge, SectionHeader, Skeleton, EmptyState } from "@/components/ui";
import type { Student } from "@/types";

const STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  Placed:      "success",
  Rejected:    "danger",
  "Not Placed": "neutral",
};

const BRANCHES = ["CSE","IT","ECE","EEE","Mechanical","Civil","AI & DS"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading,  setLoad]     = useState(true);
  const [search,   setSearch]   = useState("");
  const [branch,   setBranch]   = useState("");
  const [status,   setStatus]   = useState("");

  const load = useCallback(() => {
    setLoad(true);
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (branch) p.set("branch", branch);
    if (status) p.set("status", status);

    fetch(`/api/students?${p}`)
      .then((r) => r.json())
      .then((j) => { setStudents(j.data ?? []); setLoad(false); });
  }, [search, branch, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Students" subtitle={`${students.length} records`}/>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
          <input
            className="input pl-8"
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="input w-36" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">All branches</option>
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>

        <select className="input w-36" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="Placed">Placed</option>
          <option value="Not Placed">Not Placed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="table-wrap">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-10"/>)}
          </div>
        ) : students.length === 0 ? (
          <EmptyState message="No students match your filters" icon={<Search size={32}/>}/>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Status</th>
                <th>Company</th>
                <th>Package (L)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id}>
                  <td className="font-mono text-xs text-text-muted">{s.student_id}</td>
                  <td className="font-medium text-text-primary">{s.name}</td>
                  <td>{s.branch}</td>
                  <td>{s.year}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[s.status] ?? "neutral"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="text-text-secondary">{s.company ?? "—"}</td>
                  <td className="text-text-secondary">
                    {s.package ? `₹${s.package}` : "—"}
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/students/${s.student_id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
