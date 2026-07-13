"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ROLES } from "@/constants/roles"

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [error, setError] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    }
    getSession()
  }, [])

  async function handleSubmit() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setStatus("error")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match")
      setStatus("error")
      return
    }

    setStatus("loading")
    setError("")

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
        setStatus("error")
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      let redirectPath = "/dashboard"

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role === ROLES.STUDENT) redirectPath = "/dashboard/student"
        else if (profile?.role === ROLES.FACULTY) redirectPath = "/dashboard/faculty"
        else if (profile?.role === ROLES.INSTITUTION_ADMIN) redirectPath = "/dashboard/institution-admin"
        else if (profile?.role === ROLES.ORG_ADMIN) redirectPath = "/dashboard/org-admin"
        else if (profile?.role === ROLES.HOD) redirectPath = "/dashboard/hod"
        else if (profile?.role === ROLES.PROGRAM_HEAD) redirectPath = "/dashboard/program-head"
        else if (profile?.role === ROLES.SUPER_ADMIN) redirectPath = "/dashboard/super-admin"
        else if (profile?.role === ROLES.PARENT) redirectPath = "/dashboard/parent"
      }

      setStatus("success")
      setTimeout(() => router.push(redirectPath), 1200)
    } catch (err) {
      setError("An unexpected error occurred")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.09),_transparent_18%),linear-gradient(180deg,#f8fbff,#eff6ff)] px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white/95 p-10 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Account setup</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Set your password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Create a secure password to activate your account and continue into SkillArc.</p>
        </div>

        {userEmail && (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Setting up: <span className="font-semibold text-slate-900">{userEmail}</span>
          </div>
        )}

        {status === "success" && (
          <div className="mb-6 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Password set! Redirecting…
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              disabled={status === "loading" || status === "success"}
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Repeat password"
              disabled={status === "loading" || status === "success"}
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === "loading" || status === "success"}
          className={
            `mt-8 w-full rounded-3xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 ${
              status === "success"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }
            `
          }
        >
          {status === "loading" ? "Saving…" : status === "success" ? "✓ Password Set" : "Set Password & Login"}
        </button>
      </div>
    </div>
  )
}
