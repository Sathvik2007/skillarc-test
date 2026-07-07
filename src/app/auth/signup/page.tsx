"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signupAction } from "@/app/actions/auth"
import { ROLES } from "@/constants/roles"

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: "Student" },
  { value: ROLES.FACULTY, label: "Faculty" },
  { value: ROLES.ORG_ADMIN, label: "Organization Admin" },
  { value: ROLES.INSTITUTION_ADMIN, label: "Institution Admin" },
  { value: ROLES.HOD, label: "HOD" },
  { value: ROLES.PROGRAM_HEAD, label: "Program Head" },
]

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<string>(ROLES.STUDENT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  async function handleSignup() {
    setError("")
    if (!name || !email || !password) {
      setError("Please fill in all fields.")
      return
    }

    setLoading(true)

    try {
      const result = await signupAction(name, email, password, role)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Signup error:", err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.09),_transparent_18%),linear-gradient(180deg,#f8fbff,#eff6ff)] flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-600 p-10 text-white">
          <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_55%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-xl">📅</div>
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">SkillArc</span>
              </div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-white">Join your institution on SkillArc.</h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-100/80">Create your account and get started with smarter academic management for schedules, users, and classes.</p>
            </div>
            <div className="space-y-3 rounded-[26px] bg-white/10 p-6 backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">Your role</div>
              <div className="space-y-2">
                {[
                  { label: "Student", emoji: "🎓" },
                  { label: "Faculty", emoji: "👨‍🏫" },
                  { label: "Timetable Manager", emoji: "📋" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-3xl bg-white/10 p-3">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm font-semibold text-slate-100">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-10">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Create your account</p>
            <h1 className="text-3xl font-black text-slate-950">Get started with SkillArc</h1>
            <p className="text-sm text-slate-500">Fill in your details to join your institution and start managing academic operations.</p>
          </div>
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Email address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.com"
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSignup}
            disabled={loading}
            className="mt-10 inline-flex w-full items-center justify-center rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>
      </div>
    </div>
  )
}
