"use client"

import { useMemo, useState } from "react"
import {
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  Clock,
  MapPin,
  Filter,
  Megaphone,
  AlertTriangle,
  Users,
  Activity,
  Building2,
  Send,
} from "lucide-react"
import {
  SAMPLE_REPORTS,
  HAZARD_META,
  SEVERITY_META,
  STATUS_META,
  type HazardReport,
  type ReportStatus,
} from "@/lib/hazard-reports"
import { useAuth } from "@/lib/auth-context"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const FILTERS: { id: ReportStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
  { id: "all", label: "All" },
]

export default function VerifyPage() {
  const { user, isDemo } = useAuth()
  const [items, setItems] = useState<HazardReport[]>(SAMPLE_REPORTS)
  const [filter, setFilter] = useState<ReportStatus | "all">("pending")
  const [selectedId, setSelectedId] = useState<string | null>(SAMPLE_REPORTS[0]?.id ?? null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const canVerify = isDemo || user?.role === "lgu" || user?.role === "admin"

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((r) => r.status === filter)),
    [items, filter],
  )

  const selected = useMemo(() => items.find((r) => r.id === selectedId) ?? null, [items, selectedId])

  const counts = useMemo(
    () => ({
      pending: items.filter((r) => r.status === "pending").length,
      verified: items.filter((r) => r.status === "verified").length,
      resolved: items.filter((r) => r.status === "resolved").length,
      dismissed: items.filter((r) => r.status === "dismissed").length,
    }),
    [items],
  )

  function applyAction(id: string, action: "verify" | "resolve" | "dismiss") {
    setBusy(id + ":" + action)
    // Local mock — production would POST /reports/verify.php via apiVerifyReport
    setTimeout(() => {
      setItems((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status:
                  action === "verify" ? "verified" : action === "resolve" ? "resolved" : "dismissed",
                verifiedBy: user?.name ?? "LGU Officer",
              }
            : r,
        ),
      )
      setNote("")
      setBusy(null)
    }, 350)
  }

  if (!canVerify) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-12 text-center">
        <ShieldX className="h-10 w-10 mx-auto text-zinc-600" />
        <h1 className="font-heading text-xl font-semibold text-zinc-100 mt-4">
          LGU access required
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
          Ang verification queue ay para lamang sa LGU officers, DRRMO staff, at admin. Mag-sign in sa
          tamang account para ma-access ang tools na ito.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">LGU operations</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50">
              Verification & broadcast tools
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              I-review at i-verify ang mga community reports bago i-broadcast sa public feed. Ang verified
              reports ay agad na sinasama sa Live Alerts.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-2 text-xs text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Signed in as {user?.name ?? "LGU Officer"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Pending review"
          value={counts.pending}
          icon={Clock}
          tone="amber"
          hint="Needs attention"
        />
        <StatCard label="Verified today" value={counts.verified} icon={ShieldCheck} tone="emerald" hint="Live to public" />
        <StatCard label="Resolved" value={counts.resolved} icon={CheckCircle2} tone="zinc" hint="Closed cases" />
        <StatCard label="Dismissed" value={counts.dismissed} icon={ShieldX} tone="zinc" hint="False / duplicate" />
      </div>

      {/* Quick actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ActionCard
          icon={Megaphone}
          title="Broadcast public alert"
          desc="Manually issue a citywide notification (PAGASA-style)."
          tone="emerald"
        />
        <ActionCard
          icon={Building2}
          title="Manage evac centers"
          desc="Update capacity, status, at facilities."
          tone="zinc"
        />
        <ActionCard
          icon={Users}
          title="Volunteer roster"
          desc="Activate verified volunteers para sa response."
          tone="zinc"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
        {/* Queue */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-500" />
              <h2 className="font-heading text-base font-semibold text-zinc-100">Verification queue</h2>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                    filter === f.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </header>

          <ul className="divide-y divide-zinc-900 max-h-[640px] overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-5 py-12 text-center text-sm text-zinc-500">
                Walang reports sa queue na ito. Mahusay ang trabaho!
              </li>
            ) : (
              filtered.map((r) => {
                const hazard = HAZARD_META[r.type]
                const sev = SEVERITY_META[r.severity]
                const stat = STATUS_META[r.status]
                const Icon = hazard.icon
                const active = selectedId === r.id
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={`w-full text-left px-5 py-4 transition-colors ${
                        active ? "bg-emerald-500/[0.06]" : "hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                          <Icon className={`h-4 w-4 ${hazard.tone}`} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-sm text-zinc-100">{hazard.label}</p>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5 ${sev.ring}`}
                            >
                              <span className={`h-1 w-1 rounded-full ${sev.dot}`} />
                              {sev.label}
                            </span>
                            <span
                              className={`text-[10px] font-medium rounded-md border px-1.5 py-0.5 ${stat.ring}`}
                            >
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1 inline-flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            Brgy. {r.barangay}
                            {r.landmark && <span className="text-zinc-600">· {r.landmark}</span>}
                          </p>
                          <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed line-clamp-2">
                            {r.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
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
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </section>

        {/* Detail panel */}
        <aside className="lg:sticky lg:top-5 lg:self-start">
          {selected ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <header className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-zinc-100">Review report</h3>
                <span
                  className={`text-[10px] font-medium rounded-md border px-1.5 py-0.5 ${
                    STATUS_META[selected.status].ring
                  }`}
                >
                  {STATUS_META[selected.status].label}
                </span>
              </header>

              <div className="px-5 py-4 space-y-4">
                {/* Summary */}
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <AlertTriangle className={`h-4 w-4 ${HAZARD_META[selected.type].tone}`} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100">
                      {HAZARD_META[selected.type].label}
                    </p>
                    <p className="text-[11px] text-zinc-500 inline-flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      Brgy. {selected.barangay}
                      {selected.landmark && <span className="text-zinc-600">· {selected.landmark}</span>}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">{selected.description}</p>

                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <Field label="Reporter" value={`${selected.reporter} (${selected.reporterRole})`} />
                  <Field label="Severity" value={SEVERITY_META[selected.severity].label} />
                  <Field label="Submitted" value={timeAgo(selected.createdAt)} />
                  <Field label="Verified by" value={selected.verifiedBy ?? "—"} />
                </dl>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="note"
                    className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500"
                  >
                    Verifier note (optional)
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Idagdag ang context o source na nakumpirma…"
                    className="mt-1.5 w-full rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 px-3 py-2 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={busy?.startsWith(selected.id)}
                    onClick={() => applyAction(selected.id, "verify")}
                    className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-xs font-semibold hover:brightness-110 transition disabled:opacity-50"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verify
                  </button>
                  <button
                    type="button"
                    disabled={busy?.startsWith(selected.id)}
                    onClick={() => applyAction(selected.id, "resolve")}
                    className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-200 text-xs font-semibold hover:bg-sky-500/15 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolve
                  </button>
                  <button
                    type="button"
                    disabled={busy?.startsWith(selected.id)}
                    onClick={() => applyAction(selected.id, "dismiss")}
                    className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs font-medium hover:border-zinc-700 hover:text-zinc-100 transition disabled:opacity-50"
                  >
                    <ShieldX className="h-3.5 w-3.5" />
                    Dismiss
                  </button>
                </div>

                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200 text-xs font-medium hover:bg-emerald-500/[0.1] transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  Broadcast as Live Alert
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center">
              <Activity className="h-8 w-8 mx-auto text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-400">Pumili ng report mula sa queue.</p>
            </div>
          )}
        </aside>
      </div>
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
  value: number
  icon: typeof Clock
  tone: "amber" | "emerald" | "zinc"
  hint: string
}) {
  const toneCls =
    tone === "amber"
      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
      : tone === "emerald"
        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
        : "bg-zinc-900 text-zinc-400 border-zinc-800"
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${toneCls}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] text-zinc-500">{hint}</span>
      </div>
      <p className="font-heading text-2xl font-semibold text-zinc-50 mt-3 tracking-tight tabular-nums">
        {value}
      </p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: typeof Megaphone
  title: string
  desc: string
  tone: "emerald" | "zinc"
}) {
  return (
    <button
      type="button"
      className={`text-left rounded-2xl border p-4 transition-colors ${
        tone === "emerald"
          ? "border-emerald-500/30 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.1]"
          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          tone === "emerald"
            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
            : "bg-zinc-900 border border-zinc-800 text-zinc-400"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 font-heading text-sm font-semibold text-zinc-100">{title}</p>
      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{desc}</p>
    </button>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</dt>
      <dd className="text-zinc-200 mt-0.5 truncate">{value}</dd>
    </div>
  )
}
