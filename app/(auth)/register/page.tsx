"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, UserPlus, Check } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { OLONGAPO_BARANGAYS } from "@/lib/olongapo"
import { createClient } from "@/lib/supabase/client"

const ROLES = [
  { value: "citizen", label: "Citizen", desc: "Receive alerts, submit reports" },
  { value: "volunteer", label: "Volunteer / Reporter", desc: "Verified field reporter" },
  { value: "lgu", label: "LGU Officer", desc: "Broadcast & manage alerts" },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    barangay: "",
    role: "citizen" as (typeof ROLES)[number]["value"],
    password: "",
    agree: false,
  })

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))

  const passwordChecks = [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(form.password) },
    { label: "One number", ok: /\d/.test(form.password) },
  ]

const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.fullName || !form.email || !form.barangay || !form.password) {
      setError("Pakipuno ang lahat ng required fields.")
      return
    }
    if (!form.agree) {
      setError("Kailangan i-agree sa Terms at Privacy Policy.")
      return
    }
    if (!passwordChecks.every((c) => c.ok)) {
      setError("Mahina pa ang password — sundan ang 3 requirements.")
      return
    }
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error || !data.user) {
      setError(error?.message ?? "Hindi ma-create ang account. Subukan ulit.")
      setLoading(false)
      return
    }

    const { data: barangayData } = await supabase
  .from("barangays")
  .select("id")
  .eq("name", form.barangay)
  .single()

await supabase.from("profiles").insert({
  id: data.user.id,
  full_name: form.fullName,
  mobile: form.phone || null,
  role: form.role,
  barangay_id: barangayData?.id ?? null,
  status: form.role === "citizen" ? "active" : "pending",
})

    if (form.role === "volunteer" || form.role === "lgu") {
      const qs = new URLSearchParams({ role: form.role, email: form.email })
      router.push(`/pending?${qs.toString()}`)
      return
    }

    router.push("/dashboard")
  }

  return (
    <AuthShell
      title="Sumali sa community."
      subtitle="Mag-create ng account na nakatali sa inyong barangay para hyper-local ang alerts."
      footer={
        <>
          {"May account na? "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
            Full Name
          </label>
          <input
            id="fullName"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Juan Dela Cruz"
            className="w-full h-11 px-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="juan@email.com"
              className="w-full h-11 px-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Mobile
            </label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              className="w-full h-11 px-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="barangay" className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
            Barangay <span className="text-emerald-400 normal-case">(Olongapo City)</span>
          </label>
          <select
            id="barangay"
            value={form.barangay}
            onChange={(e) => update("barangay", e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
          >
            <option value="">Pumili ng barangay…</option>
            {OLONGAPO_BARANGAYS.map((b) => (
              <option key={b} value={b}>
                Brgy. {b}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Account type</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const active = form.role === r.value
              return (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => update("role", r.value)}
                  className={`relative text-left rounded-xl border px-3 py-2.5 transition ${
                    active
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${active ? "text-emerald-300" : "text-zinc-200"}`}>
                      {r.label}
                    </span>
                    {active && <Check className="h-3.5 w-3.5 text-emerald-300" />}
                  </div>
                  <span className="block text-[11px] text-zinc-500 mt-0.5">{r.desc}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Volunteer at LGU accounts ay i-vine-verify ng City DRRMO bago ma-activate.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
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
          <ul className="grid grid-cols-3 gap-1.5 pt-1">
            {passwordChecks.map((c) => (
              <li
                key={c.label}
                className={`flex items-center gap-1.5 text-[11px] ${c.ok ? "text-emerald-400" : "text-zinc-500"}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${c.ok ? "bg-emerald-400" : "bg-zinc-700"}`}
                  aria-hidden
                />
                {c.label}
              </li>
            ))}
          </ul>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => update("agree", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/40 focus:ring-offset-0"
          />
          <span className="text-sm text-zinc-400 leading-relaxed">
            {"Sumasang-ayon ako sa "}
            <Link href="#" className="text-emerald-400 hover:text-emerald-300">
              Terms of Service
            </Link>
            {" at "}
            <Link href="#" className="text-emerald-400 hover:text-emerald-300">
              Privacy Policy
            </Link>
            {" ng KlimAlert PH."}
          </span>
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
              Gumagawa ng account…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </button>
      </form>
    </AuthShell>
  )
}
