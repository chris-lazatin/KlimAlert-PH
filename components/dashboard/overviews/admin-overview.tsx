"use client"

// System Administrator overview.
// Mirrors MVP §4 (Role-Based Access Control, Audit Trail Logging,
// System Configuration, Data Backup & Recovery).
//
// The "Pending approvals" queue is the only real-data section: it talks to
// /auth/pending.php and /auth/approve.php when NEXT_PUBLIC_API_BASE_URL is
// configured, otherwise it falls back to an in-memory demo queue so the v0
// preview keeps working without a backend.

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  ArrowUpRight,
  Bell,
  Check,
  ClipboardCheck,
  Clock,
  Database,
  FileClock,
  HardDriveDownload,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings2,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  apiPendingApprovals,
  apiResolveApproval,
  ApiError,
  HAS_API,
  type PendingApproval,
} from "@/lib/api"
import {
  PrimaryActionLink,
  SecondaryActionLink,
  StatGrid,
  WelcomeHeader,
  DemoDataNote,
  type Stat,
} from "./shared"
import { cn } from "@/lib/utils"

// ---------------- Demo queue -----------------------------------------------
// Fixture data used only when HAS_API is false (v0 preview / no backend).
// Shaped exactly like the real /auth/pending.php payload so the rendering
// code below doesn't need to branch.
const DEMO_PENDING: PendingApproval[] = [
  {
    id: 9001,
    name: "Maria Santos",
    email: "msantos@drrmo-olongapo.gov.ph",
    mobile: "+63 917 555 0142",
    role: "lgu",
    barangay: "Pag-asa",
    // ~2 hours ago — relative timestamps are computed at render time.
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9002,
    name: "Carlo Mendoza",
    email: "carlo.m@volunteers.ph",
    mobile: "+63 905 333 8821",
    role: "volunteer",
    barangay: "Gordon Heights",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9003,
    name: "Andrea Ramos",
    email: "andrea.r@redcross.org.ph",
    mobile: null,
    role: "volunteer",
    barangay: "Sta. Rita",
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
]

// ---------------- Other (still demo) sections ------------------------------
const ROLE_DISTRIBUTION = [
  { role: "Citizens", count: 7843, percent: 93, tone: "bg-emerald-400" },
  { role: "Volunteers", count: 482, percent: 6, tone: "bg-sky-400" },
  { role: "LGU officers", count: 94, percent: 1, tone: "bg-amber-400" },
  { role: "Administrators", count: 12, percent: 0.5, tone: "bg-rose-400" },
] as const

const AUDIT_LOG = [
  {
    id: "a-001",
    actor: "Officer R. Reyes",
    action: "Verified report",
    target: "r-001 · Flooding (Gordon Heights)",
    when: "3 min ago",
    tone: "emerald",
  },
  {
    id: "a-002",
    actor: "System",
    action: "Broadcast sent",
    target: "Flood watch · Mabayuan & Sta. Rita",
    when: "32 min ago",
    tone: "rose",
  },
  {
    id: "a-003",
    actor: "Mark D.",
    action: "Submitted report",
    target: "r-007 · Fallen tree (Barretto)",
    when: "1 hr ago",
    tone: "zinc",
  },
  {
    id: "a-004",
    actor: "Admin · IT Office",
    action: "Updated alert threshold",
    target: "Heavy rainfall · 24mm/hr → 20mm/hr",
    when: "3 hrs ago",
    tone: "amber",
  },
  {
    id: "a-005",
    actor: "System",
    action: "Backup completed",
    target: "klimalert_db · 142 MB",
    when: "today 02:00",
    tone: "sky",
  },
] as const

const TONE_DOT: Record<string, string> = {
  emerald: "bg-emerald-400",
  rose: "bg-rose-400",
  amber: "bg-amber-400",
  sky: "bg-sky-400",
  zinc: "bg-zinc-500",
}

const SYSTEM_HEALTH = [
  { label: "API uptime · 30d", value: "99.97%", status: "ok" },
  { label: "Database latency", value: "84 ms", status: "ok" },
  { label: "PAGASA feed", value: "Healthy", status: "ok" },
  { label: "SMS gateway", value: "Degraded", status: "warn" },
] as const

// ---------------- Component -------------------------------------------------

export function AdminOverview() {
  const { user } = useAuth()
  const adminName = user?.name ?? "Administrator"

  // Real queue (only fetched when an API base URL is configured).
  const {
    data: liveData,
    error: liveError,
    isLoading: liveLoading,
    mutate: mutateLive,
  } = useSWR(
    HAS_API ? "auth/pending" : null,
    () => apiPendingApprovals(),
    { revalidateOnFocus: true },
  )

  // Demo queue — local state, mutated synchronously on approve/reject so
  // reviewers can exercise the flow in the v0 preview.
  const [demoQueue, setDemoQueue] = useState<PendingApproval[]>(DEMO_PENDING)

  const pending: PendingApproval[] = HAS_API ? liveData?.pending ?? [] : demoQueue
  const counts = useMemo(() => {
    if (HAS_API && liveData?.counts) return liveData.counts
    return pending.reduce(
      (acc, p) => {
        acc[p.role] = (acc[p.role] ?? 0) + 1
        return acc
      },
      { volunteer: 0, lgu: 0 } as { volunteer: number; lgu: number },
    )
  }, [liveData, pending])

  const totalPending = pending.length

  // Per-row busy + per-row error so multiple actions can resolve in parallel
  // without stomping each other.
  const [busy, setBusy] = useState<Record<number, "approve" | "reject" | undefined>>({})
  const [rowError, setRowError] = useState<Record<number, string | undefined>>({})

  const resolve = useCallback(
    async (target: PendingApproval, action: "approve" | "reject") => {
      setBusy((prev) => ({ ...prev, [target.id]: action }))
      setRowError((prev) => ({ ...prev, [target.id]: undefined }))

      // Demo mode: drop locally after a tiny delay so the spinner is visible.
      if (!HAS_API) {
        await new Promise((r) => setTimeout(r, 350))
        setDemoQueue((q) => q.filter((p) => p.id !== target.id))
        setBusy((prev) => {
          const { [target.id]: _omit, ...rest } = prev
          return rest
        })
        return
      }

      // Live mode: optimistically remove the row, then revalidate so the
      // counts and total agree with what the server now says.
      try {
        await apiResolveApproval({ id: target.id, action })
        await mutateLive()
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : "Hindi maproseso ang request. Subukan ulit."
        setRowError((prev) => ({ ...prev, [target.id]: msg }))
      } finally {
        setBusy((prev) => {
          const { [target.id]: _omit, ...rest } = prev
          return rest
        })
      }
    },
    [mutateLive],
  )

  const stats: Stat[] = [
    { label: "Total users", value: "8,431", trend: "+126 / wk", icon: Users, tone: "emerald" },
    {
      label: "Pending approvals",
      value: liveLoading && !liveData ? "…" : String(totalPending),
      trend:
        totalPending > 0
          ? `${counts.volunteer} volunteer · ${counts.lgu} LGU`
          : "All caught up",
      icon: UserCheck,
      tone: totalPending > 0 ? "amber" : "zinc",
    },
    { label: "Audit events (24h)", value: "1,204", trend: "+12%", icon: FileClock, tone: "sky" },
    { label: "Last backup", value: "2h ago", trend: "Daily 02:00", icon: Database, tone: "zinc" },
  ]

  return (
    <div className="space-y-6">
      <WelcomeHeader
        kicker="System administration"
        title={`Welcome, ${adminName}.`}
        subtitle="Manage user roles, audit activity, configure alert thresholds, at i-monitor ang data integrity."
        actions={
          <>
            <SecondaryActionLink href="/dashboard/settings" icon={Sliders}>
              System settings
            </SecondaryActionLink>
            <PrimaryActionLink href="/dashboard/verify" icon={ShieldCheck}>
              Open verification queue
            </PrimaryActionLink>
          </>
        }
      />

      <StatGrid stats={stats} />

      {/* Real data: pending volunteer / LGU approvals */}
      <PendingApprovalsCard
        pending={pending}
        counts={counts}
        loading={liveLoading && !liveData}
        error={liveError}
        busy={busy}
        rowError={rowError}
        onResolve={resolve}
      />

      {/* Top row: role distribution + audit log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Role distribution */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base font-semibold text-zinc-100">
                Role distribution
              </h2>
              <DemoDataNote />
            </div>
          </header>
          <div className="px-5 py-4 space-y-4">
            {ROLE_DISTRIBUTION.map((row) => (
              <div key={row.role}>
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="font-medium">{row.role}</span>
                  <span className="text-zinc-500 tabular-nums">
                    {row.count.toLocaleString()} ({row.percent}%)
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", row.tone)}
                    style={{ width: `${Math.max(row.percent, 1.2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-zinc-900 flex items-center justify-between">
            <p className="text-[11px] text-zinc-500">Role-based access control · MVP §4.1</p>
            <a
              href="#pending-approvals"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              Review pending
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </section>

        {/* Audit log */}
        <section className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base font-semibold text-zinc-100">
                Audit trail · last 24 hours
              </h2>
              <DemoDataNote />
            </div>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 cursor-not-allowed"
            >
              Export CSV
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </header>
          <ul className="divide-y divide-zinc-900">
            {AUDIT_LOG.map((entry) => (
              <li key={entry.id} className="px-5 py-3.5 flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 rounded-full shrink-0",
                    TONE_DOT[entry.tone] ?? TONE_DOT.zinc,
                  )}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-100">
                    <span className="font-medium">{entry.actor}</span>{" "}
                    <span className="text-zinc-400">{entry.action.toLowerCase()}</span>{" "}
                    <span className="text-zinc-500">·</span>{" "}
                    <span className="text-zinc-300">{entry.target}</span>
                  </p>
                </div>
                <span className="text-[11px] text-zinc-500 tabular-nums shrink-0">{entry.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* System config + backup */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="px-5 py-4 border-b border-zinc-900">
            <h2 className="font-heading text-base font-semibold text-zinc-100">
              System configuration
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">MVP §4.3 · Alert thresholds, notification rules, geolocation.</p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-900">
            <ConfigTile
              icon={Sliders}
              title="Alert thresholds"
              hint="Heavy rainfall: 20 mm/hr · Wind: 60 kph · River: 2.5 m"
              tone="amber"
            />
            <ConfigTile
              icon={Bell}
              title="Notification rules"
              hint="Push enabled · SMS via Globe LGU gateway · Email digest 7AM"
              tone="emerald"
            />
            <ConfigTile
              icon={KeyRound}
              title="Geofence settings"
              hint="Olongapo City (17 barangays) · 500m alert radius"
              tone="sky"
            />
            <ConfigTile
              icon={Settings2}
              title="Integration keys"
              hint="PAGASA feed · NOAH-PH · LGU SMS gateway"
              tone="zinc"
            />
          </div>
          <div className="px-5 py-3 border-t border-zinc-900 flex items-center justify-between">
            <Link
              href="/dashboard/settings"
              className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              Open full settings
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <DemoDataNote>Backend pending</DemoDataNote>
          </div>
        </section>

        {/* Backup & system health */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
          <header className="px-5 py-4 border-b border-zinc-900 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300">
              <HardDriveDownload className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-heading text-base font-semibold text-zinc-100">
                Backup & health
              </h2>
              <p className="text-[11px] text-zinc-500">MVP §4.4 · Data backup & recovery</p>
            </div>
          </header>
          <ul className="divide-y divide-zinc-900 flex-1">
            {SYSTEM_HEALTH.map((row) => (
              <li
                key={row.label}
                className="px-5 py-3.5 flex items-center justify-between gap-3"
              >
                <span className="text-sm text-zinc-300">{row.label}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-medium rounded-md border px-2 py-0.5",
                    row.status === "ok"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-200",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      row.status === "ok" ? "bg-emerald-400" : "bg-amber-400",
                    )}
                  />
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
          <div className="px-5 py-3.5 border-t border-zinc-900 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-zinc-500" />
            <p className="text-[11px] text-zinc-500 leading-snug flex-1">
              Daily snapshot at 02:00 PHT · Retained 30 days · AES-256 at rest.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

// ---------------- Pending approvals card -----------------------------------

function PendingApprovalsCard({
  pending,
  counts,
  loading,
  error,
  busy,
  rowError,
  onResolve,
}: {
  pending: PendingApproval[]
  counts: { volunteer: number; lgu: number }
  loading: boolean
  error: unknown
  busy: Record<number, "approve" | "reject" | undefined>
  rowError: Record<number, string | undefined>
  onResolve: (p: PendingApproval, action: "approve" | "reject") => void
}) {
  const total = pending.length
  const isLiveError =
    HAS_API &&
    !!error &&
    !(error instanceof ApiError && error.status === 401)

  return (
    <section
      id="pending-approvals"
      className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden scroll-mt-20"
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-zinc-900">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 shrink-0">
            <ClipboardCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-base font-semibold text-zinc-100">
                Pending approvals
              </h2>
              {!HAS_API && <DemoDataNote>Demo queue</DemoDataNote>}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
              Volunteer at LGU registrations are held with{" "}
              <code className="text-zinc-400">is_active = 0</code> until you approve them. Citizens
              auto-activate.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CountPill label="Volunteer" value={counts.volunteer} tone="sky" />
          <CountPill label="LGU" value={counts.lgu} tone="amber" />
        </div>
      </header>

      {/* Body states: error → empty → loading → list */}
      {isLiveError ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-rose-300">
            Hindi ma-load ang queue ({(error as ApiError)?.message ?? "network error"}).
          </p>
        </div>
      ) : loading ? (
        <div className="px-5 py-10 text-center text-sm text-zinc-500 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading pending registrations…
        </div>
      ) : total === 0 ? (
        <div className="px-5 py-10 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-zinc-100">All caught up.</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Walang volunteer o LGU na naghihintay ng verification.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-900">
          {pending.map((p) => (
            <PendingRow
              key={p.id}
              applicant={p}
              busy={busy[p.id]}
              error={rowError[p.id]}
              onResolve={onResolve}
            />
          ))}
        </ul>
      )}

      <footer className="px-5 py-3 border-t border-zinc-900 flex items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-500 leading-snug">
          Approve flips <code className="text-zinc-400">is_active = 1</code> · Reject deletes the row
          and writes to <code className="text-zinc-400">audit_log</code>.
        </p>
        <Link
          href="/dashboard/verify"
          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 shrink-0"
        >
          Verification queue
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </footer>
    </section>
  )
}

function PendingRow({
  applicant,
  busy,
  error,
  onResolve,
}: {
  applicant: PendingApproval
  busy: "approve" | "reject" | undefined
  error: string | undefined
  onResolve: (p: PendingApproval, action: "approve" | "reject") => void
}) {
  const ROLE_BADGE: Record<PendingApproval["role"], string> = {
    volunteer: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    lgu: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  }
  const initials = applicant.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        {/* Avatar + identity */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300"
          >
            {initials || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-zinc-100 truncate">{applicant.name}</p>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5",
                  ROLE_BADGE[applicant.role],
                )}
              >
                {applicant.role === "lgu" ? "LGU Officer" : "Volunteer"}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1 truncate max-w-full">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{applicant.email}</span>
              </span>
              {applicant.mobile && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {applicant.mobile}
                </span>
              )}
              {applicant.barangay && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Brgy. {applicant.barangay}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(applicant.created_at)}
              </span>
            </div>
            {error && (
              <p className="mt-1.5 text-[11px] text-rose-300" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:shrink-0">
          <button
            type="button"
            onClick={() => onResolve(applicant, "reject")}
            disabled={!!busy}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy === "reject" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Reject
          </button>
          <button
            type="button"
            onClick={() => onResolve(applicant, "approve")}
            disabled={!!busy}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-xs font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-10px_rgba(16,185,129,0.6)]"
          >
            {busy === "approve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Approve
          </button>
        </div>
      </div>
    </li>
  )
}

function CountPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "amber" | "sky"
}) {
  const cls =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-sky-500/30 bg-sky-500/10 text-sky-200"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium",
        cls,
      )}
    >
      <span className="tabular-nums font-semibold">{value}</span>
      <span className="text-zinc-400 font-normal">{label}</span>
    </span>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function ConfigTile({
  icon: Icon,
  title,
  hint,
  tone,
}: {
  icon: typeof Sliders
  title: string
  hint: string
  tone: "amber" | "emerald" | "sky" | "zinc"
}) {
  const toneClass: Record<typeof tone, string> = {
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    sky: "bg-sky-500/10 border-sky-500/30 text-sky-300",
    zinc: "bg-zinc-900 border-zinc-800 text-zinc-400",
  }
  return (
    <div className="bg-zinc-950 px-5 py-4 hover:bg-zinc-900/40 transition-colors">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0",
            toneClass[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100">{title}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{hint}</p>
        </div>
      </div>
    </div>
  )
}

