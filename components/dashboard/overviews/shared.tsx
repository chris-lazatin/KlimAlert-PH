"use client"

// Shared widgets used by the role overview compositions. Each widget is
// purposely small + self-contained so each role overview can pick & choose
// what to render.

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Cloud,
  Droplets,
  Megaphone,
  Phone,
  ShieldAlert,
  Wind,
  type LucideIcon,
} from "lucide-react"
import { getAvailableCenters, STATUS_META } from "@/lib/evacuation-centers"
import { cn } from "@/lib/utils"

export const EvacuationMap = dynamic(
  () => import("@/components/dashboard/evacuation-map").then((m) => m.EvacuationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-sm text-zinc-500">
        Loading map…
      </div>
    ),
  },
)

// ---------------- Welcome header ----------------

export type WelcomeHeaderProps = {
  kicker: string
  title: string
  subtitle: React.ReactNode
  actions?: React.ReactNode
}

export function WelcomeHeader({ kicker, title, subtitle, actions }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">{kicker}</p>
        <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50 mt-1 text-balance">
          {title}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 text-pretty">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

// ---------------- Stat grid ----------------

export type StatTone = "amber" | "emerald" | "rose" | "sky" | "zinc"

export type Stat = {
  label: string
  value: string
  trend?: string
  icon: LucideIcon
  tone: StatTone
}

const STAT_TONE: Record<StatTone, string> = {
  amber: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
  emerald: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  rose: "bg-rose-500/10 text-rose-300 border border-rose-500/30",
  sky: "bg-sky-500/10 text-sky-300 border border-sky-500/30",
  zinc: "bg-zinc-900 text-zinc-400 border border-zinc-800",
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  STAT_TONE[s.tone],
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {s.trend && <span className="text-[11px] text-zinc-500">{s.trend}</span>}
            </div>
            <p className="font-heading text-2xl font-semibold text-zinc-50 mt-3 tracking-tight">
              {s.value}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        )
      })}
    </div>
  )
}

// ---------------- Live alerts list ----------------

export const SAMPLE_ALERTS = [
  {
    id: 1,
    alertPageId: "a-001",
    severity: "WARNING",
    title: "Tropical Storm Karding · Signal #2",
    desc: "Public storm warning sa Zambales. Inaasahang lakas ng hangin: 90-120 kph in 24 hrs.",
    time: "8 min ago",
    source: "PAGASA",
    severityClass: "border-amber-500/40 bg-amber-500/[0.06] text-amber-200",
    dotClass: "bg-amber-400",
  },
  {
    id: 2,
    alertPageId: "a-002",
    severity: "ADVISORY",
    title: "Flood watch · Mabayuan & Sta. Rita",
    desc: "Expected heavy rainfall sa loob ng 6 hrs. I-monitor ang creek levels.",
    time: "32 min ago",
    source: "City DRRMO",
    severityClass: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200",
    dotClass: "bg-emerald-400",
  },
  {
    id: 3,
    alertPageId: "a-005",
    severity: "INFO",
    title: "Pre-emptive evacuation prep",
    desc: "LGU coordinating sa barangays para sa pre-emptive evacuation ng coastal areas.",
    time: "1 hr ago",
    source: "LGU Olongapo",
    severityClass: "border-zinc-700 bg-zinc-900 text-zinc-300",
    dotClass: "bg-zinc-500",
  },
] as const

export function LiveAlertsCard() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <h2 className="font-heading text-base font-semibold text-zinc-100">Live alerts</h2>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            PAGASA · LGU Olongapo · Verified community
          </span>
        </div>
        <Link
          href="/dashboard/alerts"
          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
        >
          See all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </header>
      <ul className="divide-y divide-zinc-900">
        {SAMPLE_ALERTS.map((a) => (
  <li
    key={a.id}
    onClick={() => window.location.href = `/dashboard/alerts#${a.alertPageId}`}
    className="px-5 py-4 flex gap-4 hover:bg-zinc-900/40 transition-colors cursor-pointer"
  >
    <span className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", a.dotClass)} aria-hidden />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("text-[10px] font-semibold tracking-wider uppercase rounded-md border px-2 py-0.5", a.severityClass)}>
          {a.severity}
        </span>
        <p className="font-medium text-zinc-100 text-sm">{a.title}</p>
      </div>
      <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{a.desc}</p>
      <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500">
        <span>{a.source}</span>
        <span aria-hidden>·</span>
        <span>{a.time}</span>
      </div>
    </div>
  </li>
))}
      </ul>
    </section>
  )
}

// ---------------- Weather card ----------------

export function WeatherCard() {
  const [weather, setWeather] = useState<{
    temp: number
    humidity: number
    wind: number
    description: string
    risk: string
    icon: "sun" | "cloud" | "rain" | "storm"
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=14.83&longitude=120.28&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=Asia%2FManila"
        )
        const data = await res.json()
        const c = data.current
        const code: number = c.weather_code

        let description = "Clear skies"
        let icon: "sun" | "cloud" | "rain" | "storm" = "sun"
        if (code === 0) { description = "Clear skies"; icon = "sun" }
        else if (code <= 3) { description = "Partly cloudy"; icon = "cloud" }
        else if (code <= 48) { description = "Foggy conditions"; icon = "cloud" }
        else if (code <= 67) { description = "Rainy conditions"; icon = "rain" }
        else if (code <= 82) { description = "Rain showers"; icon = "rain" }
        else if (code >= 95) { description = "Thunderstorm"; icon = "storm" }

        const wind = Math.round(c.wind_speed_10m)
        let risk = "Low"
        if (wind > 60 || code >= 95) risk = "High"
        else if (wind > 30 || code >= 61) risk = "Moderate"

        setWeather({
          temp: Math.round(c.temperature_2m),
          humidity: c.relative_humidity_2m,
          wind,
          description,
          risk,
          icon,
        })
      } catch {
        // fallback to static values if fetch fails
        setWeather({ temp: 28, humidity: 88, wind: 62, description: "Partly cloudy", risk: "High", icon: "cloud" })
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const riskColor = weather?.risk === "High"
    ? { label: "text-amber-200", bg: "border-amber-500/20 bg-amber-500/[0.05]", icon: "text-amber-400", heading: "text-amber-300" }
    : weather?.risk === "Moderate"
    ? { label: "text-yellow-200", bg: "border-yellow-500/20 bg-yellow-500/[0.05]", icon: "text-yellow-400", heading: "text-yellow-300" }
    : { label: "text-emerald-200", bg: "border-emerald-500/20 bg-emerald-500/[0.05]", icon: "text-emerald-400", heading: "text-emerald-300" }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-linear-to-br from-emerald-500/10 via-zinc-950 to-zinc-950 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">
            Now · Olongapo
          </p>
          {loading ? (
            <div className="h-9 w-24 bg-zinc-800 animate-pulse rounded-lg mt-1" />
          ) : (
            <p className="font-heading text-3xl font-semibold text-zinc-50 mt-1">{weather?.temp}°C</p>
          )}
          {loading ? (
            <div className="h-4 w-40 bg-zinc-800 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-sm text-zinc-400">{weather?.description}</p>
          )}
        </div>
        <Cloud className="h-12 w-12 text-emerald-400/60" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <Wind className="h-4 w-4 text-zinc-400" />
          <p className="text-xs text-zinc-500 mt-2">Wind</p>
          {loading ? <div className="h-4 w-12 bg-zinc-800 animate-pulse rounded mt-1" /> : (
            <p className="text-sm font-semibold text-zinc-100">{weather?.wind} kph</p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <Droplets className="h-4 w-4 text-zinc-400" />
          <p className="text-xs text-zinc-500 mt-2">Humidity</p>
          {loading ? <div className="h-4 w-12 bg-zinc-800 animate-pulse rounded mt-1" /> : (
            <p className="text-sm font-semibold text-zinc-100">{weather?.humidity}%</p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <AlertTriangle className={`h-4 w-4 ${riskColor.icon}`} />
          <p className="text-xs text-zinc-500 mt-2">Risk</p>
          {loading ? <div className="h-4 w-12 bg-zinc-800 animate-pulse rounded mt-1" /> : (
            <p className={`text-sm font-semibold ${riskColor.label}`}>{weather?.risk}</p>
          )}
        </div>
      </div>
      <div className={`mt-5 rounded-xl border p-3 ${riskColor.bg}`}>
        <p className={`text-[11px] uppercase tracking-wider font-semibold ${riskColor.heading}`}>
          Action recommended
        </p>
        <p className="text-sm text-zinc-200 mt-1 leading-snug">
          {weather?.risk === "High"
            ? "Ihanda na ang go-bag at i-charge ang phones. I-monitor ang mga creek sa Sta. Rita & Mabayuan."
            : weather?.risk === "Moderate"
            ? "Mag-ingat sa pagbiyahe. Bantayan ang mga weather updates mula sa PAGASA."
            : "Ligtas ang panahon ngayon. Patuloy na i-monitor ang mga weather updates."}
        </p>
      </div>
    </section>
  )
}

// ---------------- Evacuation map card ----------------

export function EvacuationMapCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
        <div>
          <h2 className="font-heading text-base font-semibold text-zinc-100">Evacuation map</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Showing only available centers · FULL & CLOSED facilities are hidden by default.
          </p>
        </div>
        <Link
          href="/dashboard/evacuation"
          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
        >
          Full view
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </header>
      <div className="h-110 p-3">
        <EvacuationMap height="100%" />
      </div>
    </div>
  )
}

// ---------------- Open evac centers list ----------------

export function OpenCentersCard({ limit = 4 }: { limit?: number }) {
  const available = getAvailableCenters().slice(0, limit)
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
      <header className="px-5 py-4 border-b border-zinc-900">
        <h2 className="font-heading text-base font-semibold text-zinc-100">Nearest open centers</h2>
        <p className="text-[11px] text-zinc-500 mt-0.5">{available.length} available right now</p>
      </header>
      <ul className="flex-1 divide-y divide-zinc-900">
        {available.map((c) => {
          const meta = STATUS_META[c.status]
          const pct = Math.round((c.occupancy / c.capacity) * 100)
          return (
            <li key={c.id} className="px-5 py-3.5 hover:bg-zinc-900/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm text-zinc-100 truncate">{c.name}</p>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5",
                    meta.ring,
                    meta.color,
                  )}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Brgy. {c.barangay}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 90 ? "bg-amber-400" : "bg-emerald-400",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-zinc-500 tabular-nums">{pct}%</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------- Emergency contacts card ----------------

const CONTACTS = [
  { name: "Olongapo City DRRMO", number: "(047) 222-2222", hint: "24/7 emergency desk", icon: ShieldAlert },
  { name: "PNP Olongapo", number: "117 / (047) 222-3131", hint: "Police hotline", icon: Phone },
  { name: "BFP Olongapo", number: "(047) 224-2533", hint: "Fire & rescue", icon: Phone },
  { name: "James Gordon Hospital", number: "(047) 224-2331", hint: "Trauma & ER", icon: Phone },
] as const

export function EmergencyContactsCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <header className="px-5 py-4 border-b border-zinc-900">
        <h2 className="font-heading text-base font-semibold text-zinc-100">Emergency contacts</h2>
        <p className="text-[11px] text-zinc-500 mt-0.5">One-tap call sa mobile</p>
      </header>
      <ul className="divide-y divide-zinc-900">
        {CONTACTS.map((c) => {
          const Icon = c.icon
          return (
            <li
              key={c.name}
              className="px-5 py-3.5 flex items-center gap-3 hover:bg-zinc-900/40 transition-colors"
            >
              <span className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-100 font-medium truncate">{c.name}</p>
                <p className="text-[11px] text-zinc-500">{c.hint}</p>
              </div>
              <a
                href={`tel:${c.number.replace(/\D/g, "")}`}
                className="text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-colors tabular-nums"
              >
                {c.number}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------- Action buttons ----------------

export function PrimaryActionLink({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="h-10 px-4 rounded-lg bg-linear-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-sm font-semibold flex items-center gap-1.5 hover:brightness-110 transition shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

export function SecondaryActionLink({
  href,
  external,
  icon: Icon,
  children,
}: {
  href: string
  external?: boolean
  icon?: LucideIcon
  children: React.ReactNode
}) {
  const className =
    "h-10 px-4 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition inline-flex items-center gap-1.5"
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  )
}

// ---------------- Mock-data note ----------------

/** Small inline indicator for sections backed by mock data in demo mode. */
export function DemoDataNote({ children }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
      <Activity className="h-3 w-3" />
      {children ?? "Demo data"}
    </span>
  )
}

// Re-export an icon used by overviews to avoid repeat imports.
export const AlertActivityIcon = Megaphone
