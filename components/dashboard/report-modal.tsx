"use client"

import { useEffect, useState } from "react"
import { X, MapPin, Clock, ShieldCheck, User, CheckCircle2, Send, ChevronDown, ChevronUp } from "lucide-react"
import {
  HAZARD_META,
  SEVERITY_META,
  STATUS_META,
  type HazardReport,
} from "@/lib/hazard-reports"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

type SituationalUpdate = {
  text: string
  by: string
  at: string
}

export function ReportModal({
  report,
  onClose,
  onStatusChange,
}: {
  report: HazardReport | null
  onClose: () => void
  onStatusChange?: () => void
}) {
  const { user } = useAuth()
  const isVolunteer = user?.role === "volunteer"

  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateText, setUpdateText] = useState("")
  const [updates, setUpdates] = useState<SituationalUpdate[]>([])
  const [loading, setLoading] = useState(false)

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (report) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [report])

  // Reset state when report changes
  useEffect(() => {
    setShowUpdateForm(false)
    setUpdateText("")
    setUpdates([])
  }, [report?.id])

  if (!report) return null

  const hazard = HAZARD_META[report.type]
  const sev = SEVERITY_META[report.severity]
  const stat = STATUS_META[report.status]
  const Icon = hazard.icon

  const handleVerify = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("reports")
      .update({ status: "verified" })
      .eq("id", report.id)
    setLoading(false)
    onStatusChange?.()
    onClose()
  }

  const handleResolve = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("reports")
      .update({ status: "resolved" })
      .eq("id", report.id)
    setLoading(false)
    onStatusChange?.()
    onClose()
  }

  const handleUpdate = () => {
    const text = updateText.trim()
    if (!text) return
    setUpdates((prev) => [
      ...prev,
      { text, by: user?.name ?? "Volunteer", at: new Date().toISOString() },
    ])
    setUpdateText("")
    setShowUpdateForm(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">

          {/* Photo */}
          {report.photoUrl && (
            <div className="relative w-full h-56 bg-zinc-900">
              <img
                src={report.photoUrl}
                alt="Report photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                <Icon className={`h-5 w-5 ${hazard.tone}`} />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold text-zinc-50">{hazard.label}</h2>
                <p className="text-xs text-zinc-500">{hazard.labelFil}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 px-5 pt-3">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border px-2 py-1 ${sev.ring}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
              {sev.label}
            </span>
            <span className={`text-[10px] font-medium rounded-md border px-2 py-1 ${stat.ring}`}>
              {stat.label}
            </span>
          </div>

          {/* Details */}
          <div className="px-5 pt-4 pb-5 space-y-4">

            {/* Location */}
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-zinc-100 font-medium">Brgy. {report.barangay}</p>
                {report.landmark && (
                  <p className="text-xs text-zinc-500 mt-0.5">{report.landmark}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 leading-relaxed">{report.description}</p>

            {/* Situational updates */}
            {updates.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Situational updates</p>
                {updates.map((u, i) => (
                  <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-[11px]">
                    <p className="text-zinc-300">{u.text}</p>
                    <p className="text-zinc-500 mt-1">By {u.by} · {timeAgo(u.at)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Situational update form */}
            {isVolunteer && showUpdateForm && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="e.g. Rising water levels, road now passable..."
                  className="flex-1 h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition"
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                />
                <button
                  onClick={handleUpdate}
                  className="h-9 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Reporter & time */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                </span>
                <div>
                  <p className="text-xs text-zinc-200 font-medium">{report.reporter}</p>
                  <span className="text-[10px] text-zinc-500">{report.reporterRole}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-zinc-500 flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" />
                  {timeAgo(report.createdAt)}
                </p>
                {report.verifiedBy && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    {report.verifiedBy}
                  </p>
                )}
              </div>
            </div>

            {/* Volunteer actions */}
            {isVolunteer && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-800">
                {report.status === "pending" && (
                  <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 transition"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verify report
                  </button>
                )}
                {report.status === "verified" && (
                  <button
                    onClick={handleResolve}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20 disabled:opacity-50 transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark resolved
                  </button>
                )}
                <button
                  onClick={() => setShowUpdateForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  {showUpdateForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  Situational update
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}