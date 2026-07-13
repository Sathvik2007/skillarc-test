"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Loading...")

  useEffect(() => {
    async function handleAuth() {
      try {
        setStatus("Verifying invite link...")

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.warn("⚠️ Callback session error:", error)
        }

        const inviteEmail = searchParams.get("inviteEmail")
        const retry = searchParams.get("retry")
        const callbackQuery = inviteEmail ? `?inviteEmail=${encodeURIComponent(inviteEmail)}` : ""
        const sessionEmail = session?.user?.email

        if (inviteEmail && sessionEmail && sessionEmail.toLowerCase() !== inviteEmail.toLowerCase()) {
          if (retry !== "1") {
            console.warn(
              "⚠️ Invite email mismatch detected, clearing the current session and retrying",
              { inviteEmail, sessionEmail }
            )
            setStatus("Clearing previous session...")
            await supabase.auth.signOut()
            const currentUrl = window.location.href
            const retryUrl = new URL(currentUrl)
            retryUrl.searchParams.set("retry", "1")
            window.location.replace(retryUrl.toString())
            return
          }

          console.error(
            "❌ Invite link came through with a mismatched session after retry.",
            { inviteEmail, sessionEmail }
          )
          setStatus("Invite session mismatch. Please log in with the invited email.")
          return
        }

        if (!session) {
          console.warn("⚠️ No active session after invite callback")
          setStatus("Setting up your account...")
          router.replace(`/auth/set-password${callbackQuery}`)
          return
        }

        setStatus("Redirecting...")
        router.replace(`/auth/set-password${callbackQuery}`)
      } catch (err) {
        console.error("❌ Auth callback error:", err)
        setStatus("An error occurred")
        setTimeout(() => router.replace("/auth/login"), 2000)
      }
    }

    handleAuth()
  }, [router, searchParams])

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
