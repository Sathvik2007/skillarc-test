"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { ROLES } from "@/constants/roles"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle"
  )
  const [error, setError] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // reads #access_token from URL hash and creates session
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        console.log("✅ Session user email:", session.user.email)
        setUserEmail(session.user.email)
      } else {
        console.warn("⚠️ No session user found")
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
      console.log("🔄 Updating password for:", userEmail)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.error("❌ Password update error:", error.message)
        setError(error.message)
        setStatus("error")
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("👤 Current User:", user)

      let redirectPath = "/dashboard"

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        console.log("📋 Current Profile:", profile)
        console.log("❌ Profile Error:", profileError)

        if (profile?.role === ROLES.STUDENT) {
          redirectPath = "/dashboard/student"
        } else if (profile?.role === ROLES.FACULTY) {
          redirectPath = "/dashboard/faculty"
        } else if (profile?.role === ROLES.INSTITUTION_ADMIN) {
          redirectPath = "/dashboard/institution-admin"
        } else if (profile?.role === ROLES.ORG_ADMIN) {
          redirectPath = "/dashboard/org-admin"
        } else if (profile?.role === ROLES.HOD) {
          redirectPath = "/dashboard/hod"
        } else if (profile?.role === ROLES.PROGRAM_HEAD) {
          redirectPath = "/dashboard/program-head"
        } else if (profile?.role === ROLES.SUPER_ADMIN) {
          redirectPath = "/dashboard/super-admin"
        } else if (profile?.role === ROLES.PARENT) {
          redirectPath = "/dashboard/parent"
        }
      }

      console.log("✅ Password updated successfully")
      setStatus("success")

      setTimeout(() => {
        console.log("🚀 Redirecting to:", redirectPath)
        router.push(redirectPath)
      }, 1500)
    } catch (err) {
      console.error("❌ Unexpected error:", err)
      setError("An unexpected error occurred")
      setStatus("error")
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", backgroundColor: "#f9fafb", fontFamily: font,
    }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, padding: 32,
        boxShadow: "0 1px 8px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6",
        width: "100%", maxWidth: 400,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
          Set your password
        </h1>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 24 }}>
          Choose a password to activate your account
        </p>

        {userEmail && (
          <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 16, fontStyle: "italic" }}>
            Setting up: {userEmail}
          </p>
        )}

        {status === "success" && (
          <div style={{
            backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>🎉</span>
            <p style={{ fontSize: 12, color: "#166534", margin: 0, fontWeight: 500 }}>
              Password set! Redirecting…
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={{
            backgroundColor: "#fee2e2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, color: "#991b1b", margin: 0 }}>{error}</p>
          </div>
        )}

        <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, display: "block" }}>
          New Password
        </label>
        <input
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={status === "loading" || status === "success"}
          style={{
            width: "100%", padding: "9px 12px", fontSize: 13,
            border: "1px solid #e5e7eb", borderRadius: 10,
            backgroundColor: "#f9fafb", color: "#111827",
            outline: "none", marginBottom: 12, boxSizing: "border-box", fontFamily: font,
            cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
            opacity: status === "loading" || status === "success" ? 0.6 : 1,
          }}
        />

        <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, display: "block" }}>
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Repeat password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          disabled={status === "loading" || status === "success"}
          style={{
            width: "100%", padding: "9px 12px", fontSize: 13,
            border: "1px solid #e5e7eb", borderRadius: 10,
            backgroundColor: "#f9fafb", color: "#111827",
            outline: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: font,
            cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
            opacity: status === "loading" || status === "success" ? 0.6 : 1,
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={status === "loading" || status === "success"}
          style={{
            width: "100%", padding: "10px 0", fontSize: 13, fontWeight: 700,
            color: "#ffffff",
            backgroundColor: status === "loading" ? "#93c5fd" : status === "success" ? "#86efac" : "#1d4ed8",
            border: "none", borderRadius: 10,
            cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
            transition: "background 0.15s", fontFamily: font,
          }}
        >
          {status === "loading" ? "Saving…" : status === "success" ? "✓ Password Set" : "Set Password & Login"}
        </button>
      </div>
    </div>
  )
}