"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Save,
  X,
  Megaphone,
  Award,
  Activity,
  Calendar,
  Sparkles,
  CheckCircle2,
  Heart,
  Users,
  AlertTriangle,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { useAuth, nameInitials } from "@/lib/auth-context"
import { OLONGAPO_BARANGAYS } from "@/lib/olongapo"
import { useProfile, type ProfileState } from "@/lib/preferences"

const ROLE_LABEL: Record<string, string> = {
  citizen: "Citizen Reporter",
  volunteer: "Verified Volunteer",
  lgu: "LGU Officer",
  admin: "Administrator",
}

type ActivityItem = {
  id: string
  type: "report" | "verify" | "evac" | "guide"
  title: string
  meta: string
  time: string
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "ac-1",
    type: "report",
    title: "Filed flood report sa Gordon Heights",
    meta: "Verified by DRRMO Olongapo",
    time: "2 hours ago",
  },
  {
    id: "ac-2",
    type: "guide",
    title: "Completed “Bago dumating ang bagyo” checklist",
    meta: "PAGASA · 8 steps",
    time: "Yesterday",
  },
  {
    id: "ac-3",
    type: "evac",
    title: "Marked as safe sa East Tapinac Covered Court",
    meta: "Tropical Storm Aghon",
    time: "3 days ago",
  },
  {
    id: "ac-4",
    type: "report",
    title: "Filed power outage report sa Mabayuan",
    meta: "Resolved by Olongapo Electric",
    time: "1 week ago",
  },
]

const ACTIVITY_META: Record<ActivityItem["type"], { icon: LucideIcon; tone: string; ring: string }> = {
  report: {
    icon: Megaphone,
    tone: "text-amber-300",
    ring: "border-amber-500/30 bg-amber-500/10",
  },
  verify: {
    icon: ShieldCheck,
    tone: "text-emerald-300",
    ring: "border-emerald-500/30 bg-emerald-500/10",
  },
  evac: {
    icon: MapPin,
    tone: "text-sky-300",
    ring: "border-sky-500/30 bg-sky-500/10",
  },
  guide: {
    icon: Sparkles,
    tone: "text-zinc-300",
    ring: "border-zinc-700 bg-zinc-900",
  },
}

const BADGES: { id: string; label: string; desc: string; icon: LucideIcon; earned: boolean }[] = [
  {
    id: "b-1",
    label: "First responder",
    desc: "Filed iyong unang verified hazard report.",
    icon: AlertTriangle,
    earned: true,
  },
  { id: "b-2", label: "Trusted source", desc: "5+ verified community reports.", icon: ShieldCheck, earned: true },
  { id: "b-3", label: "Bayanihan", desc: "Tumulong sa 3 evacuation drills.", icon: Heart, earned: true },
  {
    id: "b-4",
    label: "Storm chaser",
    desc: "Active during 5 typhoon events.",
    icon: Sparkles,
    earned: false,
  },
  { id: "b-5", label: "Barangay champion", desc: "Top reporter sa iyong brgy.", icon: Award, earned: false },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_RE = /^[+\d][\d\s\-()]{6,}$/

export default function ProfilePage() {
  const { user, isDemo } = useAuth()

  const initialProfile: ProfileState = useMemo(
    () => ({
      name: user?.name ?? "Christopher L.",
      email: user?.email ?? "demo@klimalert.ph",
      mobile: user?.mobile ?? "+63 917 555 0119",
      barangay: user?.barangay ?? "East Tapinac",
    }),
    [user?.name, user?.email, user?.mobile, user?.barangay],
  )

  const { hydrated, draft, saved, dirty, setField, commit, reset } = useProfile(initialProfile)

  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileState, string>>>({})
  const [saveBusy, setSaveBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  function validate(): boolean {
    const next: Partial<Record<keyof ProfileState, string>> = {}
    if (!draft.name.trim()) next.name = "Pakipuno ang iyong pangalan."
    if (!EMAIL_RE.test(draft.email.trim())) next.email = "Hindi valid ang email."
    if (!MOBILE_RE.test(draft.mobile.trim())) next.mobile = "Hindi valid ang mobile number."
    if (!draft.barangay) next.barangay = "Pumili ng barangay."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaveBusy(true)
    try {
      // Production: PUT /me/profile.php with the draft body.
      await new Promise((r) => setTimeout(r, 400))
      commit()
      setEditing(false)
      setToast("Profile updated")
    } finally {
      setSaveBusy(false)
    }
  }

  function handleCancel() {
    reset()
    setErrors({})
    setEditing(false)
  }

  // Display values come from saved (post-commit) when not editing,
  // and from draft (live) while editing.
  const view = editing ? draft : saved
  const role = user?.role ?? "citizen"
  const verified = user?.verified ?? true
  const initials = nameInitials(view.name)
  const memberSince = "March 2025"

  return (
    <div className="space-y-5">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-200"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
          {toast}
        </div>
      )}

      {/* Header banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-emerald-500/[0.08] via-zinc-950 to-zinc-950">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px circle at 80% -20%, rgba(16,185,129,0.15), transparent 50%)",
          }}
        />
        <div className="relative px-5 sm:px-7 py-6 flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
            <span className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-2xl sm:text-3xl font-bold shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]">
              {initials}
              {verified && (
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 ring-2 ring-emerald-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50 truncate">
                  {view.name}
                </h1>
                {isDemo && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                    Demo
                  </span>
                )}
                {dirty && editing && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    Unsaved
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  {ROLE_LABEL[role] ?? "Citizen"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  Brgy. {view.barangay} · Olongapo City
                </span>
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <Calendar className="h-3 w-3" />
                  Member since {memberSince}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-3 max-w-xl leading-relaxed">
                Active community reporter na nakatutok sa Olongapo City. Bawat verified report mo ay tumutulong
                sa LGU at sa kapwa residente.
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                disabled={!hydrated}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 hover:border-zinc-700 transition-colors disabled:opacity-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saveBusy || !dirty}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-sm font-semibold hover:brightness-110 transition disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                >
                  {saveBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saveBusy ? "Saving" : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300 hover:border-zinc-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </>
            )}
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Reports filed" value="14" icon={Megaphone} tone="emerald" />
        <StatCard label="Verified rate" value="92%" icon={ShieldCheck} tone="emerald" hint="High trust score" />
        <StatCard label="People helped" value="248" icon={Users} tone="zinc" />
        <StatCard label="Drills attended" value="3" icon={Heart} tone="zinc" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Contact info */}
        <section className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="px-5 py-4 border-b border-zinc-900">
            <h2 className="font-heading text-base font-semibold text-zinc-100">Contact information</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Ginagamit lamang para sa critical alerts at LGU coordination.
            </p>
          </header>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Full name"
              icon={Pencil}
              value={view.name}
              onChange={(v) => setField("name", v)}
              editing={editing}
              error={errors.name}
            />
            <FormField
              label="Email"
              icon={Mail}
              value={view.email}
              onChange={(v) => setField("email", v)}
              editing={editing}
              type="email"
              error={errors.email}
            />
            <FormField
              label="Mobile number"
              icon={Phone}
              value={view.mobile}
              onChange={(v) => setField("mobile", v)}
              editing={editing}
              type="tel"
              error={errors.mobile}
            />
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                <MapPin className="h-3 w-3" />
                Home barangay
              </label>
              {editing ? (
                <select
                  value={view.barangay}
                  onChange={(e) => setField("barangay", e.target.value)}
                  className="mt-1.5 w-full h-9 px-2 rounded-md bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {OLONGAPO_BARANGAYS.map((b) => (
                    <option key={b} value={b}>
                      Brgy. {b}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1.5 text-sm text-zinc-200">Brgy. {view.barangay}</p>
              )}
              {errors.barangay && (
                <p className="mt-1 text-[11px] text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.barangay}
                </p>
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-100">
                  {verified ? "Identity verified" : "Verification pending"}
                </p>
                <p className="text-xs text-emerald-200/70 mt-0.5 leading-relaxed">
                  {verified
                    ? "Verified ng LGU Olongapo. Ang iyong reports ay may higher priority sa queue."
                    : "I-submit ang iyong barangay ID para ma-verify ang account at mapabilis ang reports."}
                </p>
              </div>
              {!verified && (
                <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-semibold hover:brightness-110 transition">
                  Verify now
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-zinc-100">Achievements</h2>
            <span className="text-[11px] text-zinc-500">
              {BADGES.filter((b) => b.earned).length}/{BADGES.length}
            </span>
          </header>
          <ul className="divide-y divide-zinc-900">
            {BADGES.map((b) => {
              const Icon = b.icon
              return (
                <li
                  key={b.id}
                  className={`px-5 py-3.5 flex items-center gap-3 ${b.earned ? "" : "opacity-50"}`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 border ${
                      b.earned
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100">{b.label}</p>
                    <p className="text-[11px] text-zinc-500 leading-snug">{b.desc}</p>
                  </div>
                  {b.earned && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      {/* Activity */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <header className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="font-heading text-base font-semibold text-zinc-100">Recent activity</h2>
          </div>
          <Link
            href="/dashboard/reports"
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            See all reports
          </Link>
        </header>
        <ul className="divide-y divide-zinc-900">
          {ACTIVITY.map((a) => {
            const meta = ACTIVITY_META[a.type]
            const Icon = meta.icon
            return (
              <li key={a.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-zinc-900/40 transition-colors">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${meta.ring} shrink-0`}
                >
                  <Icon className={`h-4 w-4 ${meta.tone}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-100 font-medium">{a.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{a.meta}</p>
                </div>
                <span className="text-[11px] text-zinc-500 shrink-0 tabular-nums">{a.time}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone: "emerald" | "zinc"
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
            tone === "emerald"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : "bg-zinc-900 text-zinc-400 border-zinc-800"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        {hint && <span className="text-[11px] text-zinc-500">{hint}</span>}
      </div>
      <p className="font-heading text-2xl font-semibold text-zinc-50 mt-3 tracking-tight tabular-nums">
        {value}
      </p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  )
}

function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  editing,
  type = "text",
  error,
}: {
  label: string
  icon: LucideIcon
  value: string
  onChange: (v: string) => void
  editing: boolean
  type?: string
  error?: string
}) {
  return (
    <div
      className={`rounded-xl border bg-zinc-900/40 p-3 transition-colors ${
        error ? "border-rose-500/40" : "border-zinc-800"
      }`}
    >
      <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className="mt-1.5 w-full h-9 px-2 rounded-md bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      ) : (
        <p className="mt-1.5 text-sm text-zinc-200 truncate">{value}</p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-rose-300 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
