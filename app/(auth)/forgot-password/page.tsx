"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email) {
      setError("Pakiusap ilagay ang inyong email.")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <AuthShell
      title="Nakalimutan ang password?"
      subtitle="Ilagay ang inyong email at magpapadala kami ng link para i-reset ang inyong password."
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          Bumalik sa Sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-5 py-6 text-center space-y-2">
          <Mail className="h-8 w-8 text-emerald-400 mx-auto" />
          <p className="text-sm font-medium text-emerald-300">Reset link na-send!</p>
          <p className="text-sm text-zinc-400">
            Tingnan ang inyong email sa <span className="text-zinc-200 font-medium">{email}</span> at i-click ang link para i-reset ang password.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan.delacruz@email.com"
              className="w-full h-11 px-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/[0.07] px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Nagpapadala…
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Magpadala ng Reset Link
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}