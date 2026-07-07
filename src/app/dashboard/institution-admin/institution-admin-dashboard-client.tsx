"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Users, GraduationCap, BookOpen, Plus, Mail, Clock, ChevronRight } from "lucide-react"
import { ROLES } from "@/constants/roles"

type Status = "idle" | "loading" | "success" | "error"

interface Institution { id: string; name: string; domain: string | null }
interface Stats { faculty: number; students: number; courses: number }
interface RecentUser { id: string; email: string; role: string; created_at: string }

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB").format(new Date(date))
}

export default function InstitutionAdminDashboardClient({
  institution,
  stats,
  recentUsers,
}: {
  institution: Institution | null
  stats: Stats
  recentUsers: RecentUser[]
}) {
  const router = useRouter()
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>(ROLES.FACULTY)
  const [inviteStatus, setInviteStatus] = useState<Status>("idle")
  const [inviteError, setInviteError] = useState("")

  async function handleInvite() {
    if (!inviteEmail.trim() || !institution?.id) return
    setInviteStatus("loading")
    setInviteError("")

    try {
      const res = await fetch("/api/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          institutionId: institution.id,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to invite")
      }

      setInviteStatus("success")
      setInviteEmail("")
      setTimeout(() => {
        setInviteStatus("idle")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setInviteStatus("error")
      setInviteError(err.message)
    }
  }

  const statCards = [
    { label: "Faculty", value: stats.faculty, accent: "bg-emerald-100 text-emerald-700", icon: <Users size={18} color="#065f46" /> },
    { label: "Students", value: stats.students, accent: "bg-sky-100 text-sky-700", icon: <GraduationCap size={18} color="#1d4ed8" /> },
    { label: "Courses", value: stats.courses, accent: "bg-amber-100 text-amber-700", icon: <BookOpen size={18} color="#b45309" /> },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/30">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Institution dashboard</p>
                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{greeting}, admin</h1>
                <p className="mt-2 text-sm text-slate-500">{institution?.name ?? "Institution dashboard"}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/institution-admin")}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/30 transition hover:bg-indigo-700"
            >
              <Mail size={16} /> Invite member
            </button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${card.accent}`}>
                {card.icon}
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-950">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">Manage institutional operations</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Departments", href: "/dashboard/institution-admin/departments" },
                { label: "Programs", href: "/dashboard/institution-admin/programs" },
                { label: "Faculty", href: "/dashboard/institution-admin/faculty" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-4 pb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-700">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Parent engagement</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">Invite and connect</h2>
              </div>
            </div>
            <div className="space-y-4">
              {inviteStatus === "success" && (
                <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">Invite sent successfully.</div>
              )}
              {inviteStatus === "error" && (
                <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{inviteError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <input
                  value={inviteEmail}
                  type="email"
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="faculty@college.edu"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value={ROLES.FACULTY}>Faculty</option>
                  <option value={ROLES.STUDENT}>Student</option>
                  <option value={ROLES.HOD}>Head of Department</option>
                  <option value={ROLES.PROGRAM_HEAD}>Program Head</option>
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviteStatus === "loading"}
                className="mt-2 w-full rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {inviteStatus === "loading" ? "Sending invite..." : "Send invite"}
              </button>
            </div>
          </aside>

          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recent members</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">Latest invites</h2>
              </div>
              <button
                onClick={() => router.push("/dashboard/institution-admin/students")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-200"
              >
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No recent users to display.
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950 truncate">{user.email}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(user.created_at)}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
