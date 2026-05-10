"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Radio,
  AlertTriangle,
  CloudRain,
  Waves,
  Wind,
  Mountain,
  Flame,
  Megaphone,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
  Filter,
  Bell,
  BellRing,
  Share2,
} from "lucide-react"

type Severity = "critical" | "warning" | "advisory" | "info"
type AlertSource = "PAGASA" | "PHIVOLCS" | "DRRMO" | "BFP" | "LGU"
type AlertCategory = "typhoon" | "flood" | "earthquake" | "landslide" | "fire" | "general"

type LiveAlert = {
  id: string
  severity: Severity
  category: AlertCategory
  title: string
  description: string
  area: string
  source: AlertSource
  issuedAt: string // ISO
  validUntil?: string
  actions?: string[]
}

const SEV_META: Record<
  Severity,
  { label: string; chip: string; dot: string; ring: string; bg: string }
> = {
  critical: {
    label: "Critical",
    chip: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    dot: "bg-rose-400",
    ring: "ring-rose-500/30",
    bg: "from-rose-500/[0.08] to-transparent",
  },
  warning: {
    label: "Warning",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
    ring: "ring-amber-500/30",
    bg: "from-amber-500/[0.08] to-transparent",
  },
  advisory: {
    label: "Advisory",
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
    ring: "ring-emerald-500/30",
    bg: "from-emerald-500/[0.06] to-transparent",
  },
  info: {
    label: "Info",
    chip: "border-zinc-700 bg-zinc-900 text-zinc-300",
    dot: "bg-zinc-500",
    ring: "ring-zinc-700",
    bg: "from-zinc-900 to-transparent",
  },
}

const CATEGORY_META: Record<AlertCategory, { label: string; icon: typeof CloudRain; tone: string }> = {
  typhoon: { label: "Typhoon", icon: Wind, tone: "text-sky-300" },
  flood: { label: "Flood", icon: Waves, tone: "text-blue-300" },
  earthquake: { label: "Earthquake", icon: Mountain, tone: "text-amber-300" },
  landslide: { label: "Landslide", icon: Mountain, tone: "text-orange-300" },
  fire: { label: "Fire", icon: Flame, tone: "text-rose-300" },
  general: { label: "General", icon: Megaphone, tone: "text-zinc-300" },
}

const ALERTS: LiveAlert[] = [
  {
    id: "a-001",
    severity: "warning",
    category: "typhoon",
    title: "Tropical Storm Karding · Public Storm Warning Signal #2",
    description:
      "Inaasahang lakas ng hangin: 90–120 kph sa loob ng 24 oras. Posibleng storm surge sa coastal areas ng Zambales. Suspendido ang klase sa lahat ng level.",
    area: "Olongapo City · Whole Zambales",
    source: "PAGASA",
    issuedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    validUntil: new Date(Date.now() + 18 * 60 * 60_000).toISOString(),
    actions: [
      "Ihanda ang go-bag at importanteng dokumento",
      "I-charge ang phones at power banks",
      "I-secure ang mga gamit sa labas ng bahay",
    ],
  },
  {
    id: "a-002",
    severity: "advisory",
    category: "flood",
    title: "Flood watch · Mabayuan & Sta. Rita creek systems",
    description:
      "Inaasahang malakas na pag-ulan sa loob ng 6 oras. I-monitor ang creek levels at iwasan ang pagtawid sa bumabahang lugar.",
    area: "Brgy. Mabayuan · Brgy. Santa Rita",
    source: "DRRMO",
    issuedAt: new Date(Date.now() - 32 * 60_000).toISOString(),
    validUntil: new Date(Date.now() + 6 * 60 * 60_000).toISOString(),
    actions: ["Iwasan ang creek crossings", "Lumipat sa mas mataas na lugar kung kinakailangan"],
  },
  {
    id: "a-003",
    severity: "info",
    category: "general",
    title: "Pre-emptive evacuation prep · Coastal barangays",
    description:
      "Ang LGU ay nakikipag-coordinate sa mga barangay para sa pre-emptive evacuation ng mga coastal area. Asahan ang anunsyo mula sa barangay officials.",
    area: "Brgy. Barretto · Brgy. Kalaklan",
    source: "LGU",
    issuedAt: new Date(Date.now() - 60 * 60_000).toISOString(),
  },
  {
    id: "a-004",
    severity: "critical",
    category: "earthquake",
    title: "Magnitude 5.4 earthquake · Castillejos, Zambales",
    description:
      "Naitalang pagyanig ng intensity IV sa Olongapo. Walang tsunami warning. I-check ang mga gusali para sa pinsala at lumayo sa mga nababasag na bagay.",
    area: "Castillejos, Zambales · 42 km NNW",
    source: "PHIVOLCS",
    issuedAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    actions: ["Drop, cover, hold during aftershocks", "Iwasan ang mga sirang gusali"],
  },
  {
    id: "a-005",
    severity: "advisory",
    category: "fire",
    title: "Heightened fire watch · Dry weather window",
    description:
      "Mainit at tuyong panahon. I-monitor ang mga grasslands at huwag mag-ihaw sa labas. Tumawag agad sa BFP kung may makitang usok.",
    area: "Olongapo City · Citywide",
    source: "BFP",
    issuedAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
  },
  {
    id: "a-006",
    severity: "info",
    category: "general",
    title: "Power interruption notice · Sta. Rita feeder",
    description:
      "Scheduled maintenance mula 1:00 PM hanggang 4:00 PM bukas. Apektado ang Sta. Rita at bahagi ng Mabayuan.",
    area: "Brgy. Santa Rita",
    source: "LGU",
    issuedAt: new Date(Date.now() - 9 * 60 * 60_000).toISOString(),
  },
]

const SOURCE_FILTERS: { id: AlertSource | "all"; label: string }[] = [
  { id: "all", label: "All sources" },
  { id: "PAGASA", label: "PAGASA" },
  { id: "PHIVOLCS", label: "PHIVOLCS" },
  { id: "DRRMO", label: "DRRMO" },
  { id: "BFP", label: "BFP" },
  { id: "LGU", label: "LGU" },
]

const SEV_FILTERS: { id: Severity | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warning" },
  { id: "advisory", label: "Advisory" },
  { id: "info", label: "Info" },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return "expired"
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m left`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h left`
  return `${Math.floor(h / 24)}d left`
}

export default function AlertsPage() {
  const [sevFilter, setSevFilter] = useState<Severity | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<AlertSource | "all">("all")
  const [pushOn, setPushOn] = useState(true)

  const filtered = useMemo(() => {
    return ALERTS.filter((a) => {
      const matchSev = sevFilter === "all" || a.severity === sevFilter
      const matchSrc = sourceFilter === "all" || a.source === sourceFilter
      return matchSev && matchSrc
    })
  }, [sevFilter, sourceFilter])

  useEffect(() => {
  const hash = window.location.hash.replace("#", "")
  if (hash) {
    setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 300)
  }
}, [])

  const counts = useMemo(
    () => ({
      critical: ALERTS.filter((a) => a.severity === "critical").length,
      warning: ALERTS.filter((a) => a.severity === "warning").length,
      advisory: ALERTS.filter((a) => a.severity === "advisory").length,
      total: ALERTS.length,
    }),
    [],
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">Live alerts</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50">
              Real-time public safety alerts
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Direkta mula sa PAGASA, PHIVOLCS, BFP, at LGU Olongapo DRRMO. May verified community input para sa
              ground truth.
            </p>
          </div>
          <button
            onClick={() => setPushOn((v) => !v)}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border text-xs font-medium transition-colors ${
              pushOn
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            {pushOn ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            Push notifications {pushOn ? "on" : "off"}
          </button>
        </div>
      </div>

      {/* Live ticker */}
      <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-emerald-500/4 via-zinc-950 to-zinc-950 px-5 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            LIVE FEED
          </span>
          <span className="text-xs text-zinc-500">Last sync · 38 seconds ago</span>
          <div className="ml-auto flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-300">
              <span className="h-1 w-1 rounded-full bg-rose-400" />
              {counts.critical} critical
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              {counts.warning} warning
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              {counts.advisory} advisory
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
          <Filter className="h-4 w-4 text-zinc-500 ml-2" />
          {SEV_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSevFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                sevFilter === f.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1 overflow-x-auto">
          <Radio className="h-4 w-4 text-zinc-500 ml-2 shrink-0" />
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSourceFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                sourceFilter === f.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-12 text-center">
            <ShieldCheck className="h-8 w-8 mx-auto text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">Walang alerts sa filter na ito ngayon.</p>
          </div>
        ) : (
          filtered.map((a) => {
            const sev = SEV_META[a.severity]
            const cat = CATEGORY_META[a.category]
            const Icon = cat.icon
            return (
              <article
                key={a.id}
                id={a.id}
                className={`relative rounded-2xl border border-zinc-800 bg-linear-to-br ${sev.bg} bg-zinc-950 overflow-hidden hover:border-zinc-700 transition-colors`}
              >
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 ring-1 ${sev.ring}`}
                    >
                      <Icon className={`h-5 w-5 ${cat.tone}`} />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase rounded-md border px-2 py-0.5 ${sev.chip}`}
                        >
                          <span className={`h-1 w-1 rounded-full ${sev.dot}`} />
                          {sev.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                          {cat.label}
                        </span>
                        <span className="text-[10px] rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-zinc-400 font-medium">
                          {a.source}
                        </span>
                      </div>
                      <h2 className="font-heading text-base font-semibold text-zinc-100 mt-2 text-balance">
                        {a.title}
                      </h2>
                      <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed">{a.description}</p>

                      {a.actions && a.actions.length > 0 && (
                        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                          {a.actions.map((act) => (
                            <li
                              key={act}
                              className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-2.5 py-1.5 text-[12px] text-zinc-300"
                            >
                              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" />
                              <span className="leading-snug">{act}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {a.area}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Issued {timeAgo(a.issuedAt)}
                        </span>
                        {a.validUntil && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            Valid · {timeUntil(a.validUntil)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
                      >
                        <Share2 className="h-3 w-3" />
                        Share
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
