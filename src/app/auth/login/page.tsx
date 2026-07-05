"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginAction } from "@/app/actions/auth"

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  async function handleLogin() {
    setError("")
    setLoading(true)

    try {
      const result = await loginAction(email, password)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      await router.push("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
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
          {/* Logo */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
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
              Academic Operations,
              <br />
              Simplified.
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginTop: 12,
                lineHeight: 1.6,
              }}
            >
              Manage timetables, faculty workloads,
              <br />
              and student schedules — all in one place.
            </p>
          </div>

          {/* Mini timetable decoration */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { code: "DAA", bg: "#dbeafe", text: "#1d4ed8", width: "70%" },
              { code: "DCN", bg: "#ede9fe", text: "#6d28d9", width: "55%" },
              { code: "WT", bg: "#fef3c7", text: "#b45309", width: "80%" },
            ].map((s) => (
              <div
                key={s.code}
                style={{
                  backgroundColor: s.bg,
                  borderRadius: 8,
                  padding: "6px 10px",
                  width: s.width,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.text,
                  }}
                >
                  {s.code}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: "rgba(0,0,0,0.08)",
                  }}
                />
              </div>
            ))}
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                marginTop: 6,
              }}
            >
              Timetable Builder · Live Preview
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
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginBottom: 28,
            }}
          >
            Sign in to your SkillArc account
          </p>

          {/* Error */}
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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              color: "#111827",
              outline: "none",
              marginBottom: 8,
              boxSizing: "border-box",
            }}
          />

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <a
              href="/forgot-password"
              style={{
                fontSize: 11,
                color: "#1d4ed8",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
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
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "#f3f4f6",
              }}
            />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>or</span>
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "#f3f4f6",
              }}
            />
          </div>

          {/* Signup link */}
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{
                color: "#1d4ed8",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}