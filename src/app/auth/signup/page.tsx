"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signupAction } from "@/app/actions/auth"
import { ROLES } from "@/constants/roles"

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

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

      await router.push("/dashboard")
    } catch (err) {
      console.error("Signup error:", err)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f5f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 900,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Left — branding */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
            padding: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 18 }}>📅</span>
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                SkillArc
              </span>
            </div>

            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Join your institution
              <br />
              on SkillArc.
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginTop: 12,
                lineHeight: 1.6,
              }}
            >
              Create your account and get started
              <br />
              with smarter academic management.
            </p>
          </div>

          {/* Role cards decoration */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {[
              {
                label: "Student",
                emoji: "🎓",
                bg: "#d1fae5",
                text: "#065f46",
              },
              {
                label: "Faculty",
                emoji: "👨‍🏫",
                bg: "#ede9fe",
                text: "#6d28d9",
              },
              {
                label: "Timetable Manager",
                emoji: "📋",
                bg: "#dbeafe",
                text: "#1d4ed8",
              },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  backgroundColor: r.bg,
                  borderRadius: 8,
                  padding: "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 14 }}>{r.emoji}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: r.text,
                  }}
                >
                  {r.label}
                </span>
              </div>
            ))}
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                marginTop: 4,
              }}
            >
              Role-based access control
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div
          style={{
            width: 380,
            backgroundColor: "#ffffff",
            padding: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Create account
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginBottom: 28,
            }}
          >
            Fill in your details to get started
          </p>

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 12, color: "#991b1b" }}>{error}</p>
            </div>
          )}

          {/* Name */}
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
              display: "block",
            }}
          >
            Full name
          </label>
          <input
            type="text"
            placeholder="Dr. John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              color: "#111827",
              outline: "none",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          {/* Email */}
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
              display: "block",
            }}
          >
            Email address
          </label>
          <input
            type="email"
            placeholder="you@institution.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              color: "#111827",
              outline: "none",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          {/* Password */}
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
              display: "block",
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              color: "#111827",
              outline: "none",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          {/* Role */}
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
              display: "block",
            }}
          >
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              color: "#111827",
              outline: "none",
              marginBottom: 24,
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Submit */}
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 0",
              fontSize: 13,
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: loading ? "#93c5fd" : "#1d4ed8",
              border: "none",
              borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              marginBottom: 24,
              fontFamily: font,
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <a
              href="/auth/login"
              style={{
                color: "#1d4ed8",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}