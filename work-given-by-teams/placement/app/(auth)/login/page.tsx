// app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

type LoginType = "Official (Placement Cell)" | "Student" | "Company Admin";

// Demo credentials that match MOCK_USERS in lib/mock-data.ts
const DEMO_CREDS: Record<LoginType, { user: string; pass: string }> = {
  "Official (Placement Cell)": { user: "admin",      pass: "admin123" },
  "Student":                    { user: "student1",   pass: "pass123"  },
  "Company Admin":              { user: "tcs_admin",  pass: "tcs123"   },
};

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setType]  = useState<LoginType>("Official (Placement Cell)");
  const [username,  setUser]  = useState("");
  const [password,  setPass]  = useState("");
  const [showPass,  setShow]  = useState(false);
  const [loading,   setLoad]  = useState(false);
  const [error,     setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoad(true);

    try {
      const res = await fetch("/api/auth", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password, login_type: loginType }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON from /api/auth:", text.slice(0, 300));
        setError(`Server error (${res.status}). Check server logs.`);
        setLoad(false);
        return;
      }

      const json = await res.json();
      setLoad(false);

      if (!res.ok) {
        setError(json.error ?? "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error — is the dev server running?");
      setLoad(false);
    }
  }

  function fillDemo() {
    const { user, pass } = DEMO_CREDS[loginType];
    setUser(user);
    setPass(pass);
    setError("");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary shadow-glow mb-4">
            <GraduationCap size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Placement Intelligence</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-4">
          {/* Login type toggle */}
          <div className="flex gap-1 p-1 bg-background-muted rounded-lg">
            {(["Official (Placement Cell)", "Student", "Company Admin"] as LoginType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setError(""); setUser(""); setPass(""); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  loginType === t
                    ? "bg-primary text-white shadow-glow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t === "Official (Placement Cell)" ? "Official" : t === "Company Admin" ? "Company" : t}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                placeholder={loginType === "Student" ? "e.g. student1" : "username"}
                value={username}
                onChange={(e) => setUser(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  &nbsp;Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="pt-2 border-t border-background-border space-y-2">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-xs text-text-muted hover:text-text-secondary py-1 transition-colors"
            >
              Fill demo credentials for{" "}
              <span className="text-primary">
                {loginType === "Official (Placement Cell)" ? "Official" : loginType}
              </span>
            </button>
            <div className="text-center text-xs text-text-muted space-y-0.5">
              <p className="font-medium text-text-secondary">Demo accounts:</p>
              <p>Official: <code className="text-primary">admin</code> / <code className="text-primary">admin123</code></p>
              <p>Student: <code className="text-primary">student1</code> / <code className="text-primary">pass123</code></p>
              <p>Company: <code className="text-primary">tcs_admin</code> / <code className="text-primary">tcs123</code></p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Placement Intelligence Apex · v2.0 · Mock Mode
        </p>
      </div>
    </div>
  );
}
