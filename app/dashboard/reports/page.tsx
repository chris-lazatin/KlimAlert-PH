"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, Clock, ShieldCheck, CheckCircle, Filter } from "lucide-react"
import { HazardReportForm } from "@/components/dashboard/hazard-report-form"
import { createClient } from "@/lib/supabase/client"
import {
  HAZARD_META,
  SEVERITY_META,
  STATUS_META,
  type HazardReport,
  type ReportStatus,
} from "@/lib/hazard-reports"

const FILTERS: { id: ReportStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "resolved", label: "Resolved" },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any): HazardReport {
  return {
    id: String(r.id),
    type: r.hazard_type,
    severity: r.severity,
    barangay: r.barangays?.name ?? "",
    landmark: r.landmark ?? "",
    description: r.description,
    photoUrl: r.photo_url ?? undefined,
    reporter: r.is_anonymous ? "Anonymous" : (r.profiles?.full_name ?? "Unknown"),
    reporterRole:
      r.profiles?.role === "lgu" || r.profiles?.role === "admin"
        ? "LGU"
        : r.profiles?.role === "volunteer"
        ? "Volunteer"
        : "Citizen",
    status: r.status,
    createdAt: r.created_at,
    verifiedBy: undefined,
  }
}

export default function ReportsPage() {
  const [filter, setFilter] = useState<ReportStatus | "all">("all")
  const [items, setItems] = useState<HazardReport[]>([])

  async function fetchReports() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("reports")
      .select("*, barangays(name), profiles!reporter_id(full_name, role)")
      .order("created_at", { ascending: false })
    if (!error && data) setItems(data.map(mapRow))
  }

  useEffect(() => { fetchReports() }, [])

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((r) => r.status === filter)),
    [items, filter],
  )
  const pending = items.filter((r) => r.status === "pending").length
  const verified = items.filter((r) => r.status === "verified").length
  const resolved = items.filter((r) => r.status === "resolved").length

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">Community reporting</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50">
              Hazard reports
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Bawat residente ay isang sensor. Ang verified reports ay ipinapadala sa LGU at sa mga kalapit na
              barangay.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-1.5 text-xs text-amber-200">
              <Clock className="h-3.5 w-3.5" />
              {pending} pending review
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-1.5 text-xs text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              {verified} verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/[0.06] px-3 py-1.5 text-xs text-sky-200">
              <CheckCircle className="h-3.5 w-3.5" />
              {resolved} resolved
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-5">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-500" />
              <h2 className="font-heading text-base font-semibold text-zinc-100">Recent reports</h2>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filter === f.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </header>

          <ul className="divide-y divide-zinc-900">
            {filtered.length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-zinc-500">
                Walang reports sa filter na ito.
              </li>
            )}
            {filtered.map((r) => {
              const hazard = HAZARD_META[r.type]
              const sev = SEVERITY_META[r.severity]
              const stat = STATUS_META[r.status]
              const Icon = hazard.icon
              return (
                <li key={r.id} className="px-5 py-4 hover:bg-zinc-900/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                      <Icon className={`h-4 w-4 ${hazard.tone}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-sm text-zinc-100">{hazard.label}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5 ${sev.ring}`}>
                          <span className={`h-1 w-1 rounded-full ${sev.dot}`} />
                          {sev.label}
                        </span>
                        <span className={`text-[10px] font-medium rounded-md border px-1.5 py-0.5 ${stat.ring}`}>
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        Brgy. {r.barangay}
                        {r.landmark && <span className="text-zinc-600">· {r.landmark}</span>}
                      </p>
                      <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{r.description}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                        <span>by {r.reporter}</span>
                        <span className="rounded-md bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px]">
                          {r.reporterRole}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <aside id="report" className="scroll-mt-24 lg:sticky lg:top-5 lg:self-start">
          <HazardReportForm onSubmitted={fetchReports} />
        </aside>
      </div>
    </div>
  )
}