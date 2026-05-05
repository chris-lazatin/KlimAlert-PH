"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError("Punan po lahat ng fields.")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/dashboard")
  }

  return (
    <AuthShell
      title="Welcome back, kababayan."
      subtitle="Mag-sign in para makita ang real-time alerts at evacuation status sa inyong barangay."
      footer={
        <>
          {"Wala pang account? "}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Mag-register
          </Link>
        </>
      }
    >
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Password
            </label>
            <Link href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
              Nakalimutan?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 pr-11 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
            <button
              type="button"
              aria-label={showPwd ? "Hide password" : "Show password"}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 select-none cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/40 focus:ring-offset-0"
          />
          <span className="text-sm text-zinc-400">Tandaan ako sa device na ito</span>
        </label>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.07] px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sini-sign in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
            </>
          )}
        </button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-zinc-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-600">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition flex items-center justify-center gap-2"
          >
            <FacebookIcon />
            Facebook
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.2-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 19.5-8 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5c-7.3 0-13.6 4.1-16.7 10.2z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-4.9c-1.9 1.4-4.3 2.4-6.9 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.4 39.3 16.1 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6 4.9c-.4.4 6.5-4.7 6.5-14.3 0-1.2-.1-2.3-.1-3.5z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 10-13.9 11.9V15.5H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2V8h-1.6c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.8v8.4A12 12 0 0024 12z"
      />
    </svg>
  )
}
