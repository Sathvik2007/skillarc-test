"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Loading...")

  useEffect(() => {
    async function handleAuth() {
      try {
        setStatus("Processing invite callback...")

        const { error: initializeError } = await supabase.auth.initialize()
        if (initializeError) {
          console.warn("⚠️ Auth initialize returned an error:", initializeError)
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setStatus("Setting up your account...")
          router.replace("/auth/set-password")
          return
        }

        setStatus("Redirecting...")
        router.replace("/auth/set-password")
      } catch (err) {
        console.error("❌ Auth callback error:", err)
        setStatus("An error occurred")
        setTimeout(() => router.replace("/auth/login"), 2000)
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.08),_transparent_20%),linear-gradient(180deg,#f8fbff,#eff6ff)] px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white/90 p-10 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl">⏳</div>
        <h1 className="text-xl font-semibold text-slate-900">Processing your invite</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">{status}</p>
      </div>
    </div>
  )
}
