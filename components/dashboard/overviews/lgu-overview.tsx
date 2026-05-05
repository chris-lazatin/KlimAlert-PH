"use client"

// LGU overview: operational dashboard for DRRMO officers.
// Mirrors MVP §3 (Disaster Monitoring, Alert Broadcasting, Incident Verification,
// Resource & Evacuation Management).

import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Megaphone,
  Radio,
  ShieldCheck,
  Siren,
  XCircle,
  Activity,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { SAMPLE_REPORTS, HAZARD_META, SEVERITY_META } from "@/lib/hazard-reports"
import { EVAC_CENTERS, STATUS_META as EVAC_STATUS_META } from "@/lib/evacuation-centers"
import {
  LiveAlertsCard,
  PrimaryActionLink,
  SecondaryActionLink,
  StatGrid,
  WelcomeHeader,
  DemoDataNote,
  type Stat,
} from "./shared"
import { cn } from "@/lib/utils"

const STATS: Stat[] = [
  { label: "Pending verification", value: "5", trend: "needs review", icon: Activity, tone: "amber" },
  { label: "Verified today", value: "23", trend: "+8", icon: CheckCircle2, tone: "emerald" },
  { label: "Active broadcasts", value: "2", trend: "PAGASA + LGU", icon: Radio, tone: "rose" },
  { label: "Evac occupancy", value: "62%", trend: "city-wide", icon: Building2, tone: "sky" },
]

const PENDING = SAMPLE_REPORTS.filter((r) => r.status === "pending")
const RECENT_VERIFIED = SAMPLE_REPORTS.filter((r) => r.status === "verified").slice(0, 3)

// Aggregate occupancy across all centers (city-wide capacity view).
const totalCapacity = EVAC_CENTERS.reduce((sum, c) => sum + c.capacity, 0)
const totalOccupancy = EVAC_CENTERS.reduce((sum, c) => sum + c.occupancy, 0)
const cityPct = Math.round((totalOccupancy / totalCapacity) * 100)

export function LguOverview() {
  const { user } = useAuth()
  const officer = user?.name ?? "DRRMO Officer"

  return (
    <div className="space-y-6">
      <WelcomeHeader
        kicker="Disaster monitoring console"
        title={`Good day, ${officer}.`}
        subtitle={
          <>
            Real-time situational awareness para sa{" "}
            <span className="text-zinc-200 font-medium">Olongapo City</span>. Verify reports, manage
            broadcasts, at i-coordinate ang evacuation response.
          </>
        }
        actions={
          <>
            <SecondaryActionLink href="/dashboard/evacuation" icon={Building2}>
              Manage evac centers
            </SecondaryActionLink>
            <PrimaryActionLink href="/dashboard/verify" icon={ShieldCheck}>
              Open verification queue
            </PrimaryActionLink>
          </>
        }
      />

      <StatGrid stats={STATS} />

      {/* Top row: verification queue snapshot + broadcast composer */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
            <div>
              <h2 className="font-heading text-base font-semibold text-zinc-100">
                Awaiting verification
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Citizen at volunteer reports na hinihintay ang LGU validation.
              </p>
            </div>
            <Link
              href="/dashboard/verify"
              className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              Full queue
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="divide-y divide-zinc-900">
            {PENDING.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-zinc-500">
                Walang nakabinbing verification. All clear.
              </li>
            ) : (
              PENDING.map((r) => {
                const hazard = HAZARD_META[r.type]
                const severity = SEVERITY_META[r.severity]
                const Icon = hazard.icon
                return (
                  <li
                    key={r.id}
                    className="px-5 py-4 flex items-start gap-4 hover:bg-zinc-900/40 transition-colors"
                  >
                    <span className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Icon className={cn("h-4 w-4", hazard.tone)} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-zinc-100">{hazard.label}</p>
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5",
                            severity.ring,
                          )}
                        >
                          {severity.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
                        <span>Brgy. {r.barangay}</span>
                        <span aria-hidden>·</span>
                        <span>by {r.reporter}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs font-medium hover:bg-emerald-500/20 transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verify
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Dismiss
                      </button>
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </section>

        {/* Broadcast composer (stub) */}
        <section className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.08] via-zinc-950 to-zinc-950 p-5 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
              <Siren className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold">
                Alert broadcast
              </p>
              <p className="text-sm font-semibold text-zinc-100">Compose new advisory</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Severity
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["INFO", "ADVISORY", "WARNING"] as const).map((level, i) => (
                  <button
                    key={level}
                    type="button"
                    className={cn(
                      "h-8 rounded-md text-[11px] font-semibold uppercase tracking-wider border transition",
                      i === 1
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Target
              </label>
              <select
                disabled
                className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-sm text-zinc-300"
              >
                <option>All Olongapo barangays</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Message
              </label>
              <textarea
                disabled
                rows={3}
                placeholder="Halimbawa: Pre-emptive evacuation pinapatupad sa coastal areas mula 6PM."
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 resize-none"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <DemoDataNote>Backend pending</DemoDataNote>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-semibold border border-rose-500/40 cursor-not-allowed"
            >
              <Megaphone className="h-3.5 w-3.5" />
              Send broadcast
            </button>
          </div>
        </section>
      </div>

      {/* Evac center capacity table */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
          <div>
            <h2 className="font-heading text-base font-semibold text-zinc-100">
              Evacuation center capacity
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              City-wide occupancy: {totalOccupancy.toLocaleString()} of {totalCapacity.toLocaleString()} ({cityPct}%)
            </p>
          </div>
          <Link
            href="/dashboard/evacuation"
            className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
          >
            Manage centers
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] text-zinc-500 uppercase tracking-wider">
              <tr className="border-b border-zinc-900">
                <th className="text-left font-medium px-5 py-3">Center</th>
                <th className="text-left font-medium px-5 py-3">Barangay</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3 w-[40%]">Occupancy</th>
                <th className="text-right font-medium px-5 py-3">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {EVAC_CENTERS.map((c) => {
                const meta = EVAC_STATUS_META[c.status]
                const pct = Math.round((c.occupancy / c.capacity) * 100)
                return (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-zinc-100">{c.name}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{c.barangay}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5",
                          meta.ring,
                          meta.color,
                        )}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              pct >= 95
                                ? "bg-rose-400"
                                : pct >= 80
                                  ? "bg-amber-400"
                                  : "bg-emerald-400",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-zinc-400 tabular-nums w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-zinc-300 tabular-nums">
                      {c.occupancy} / {c.capacity}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Live alerts + recently verified */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <LiveAlertsCard />
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="px-5 py-4 border-b border-zinc-900">
            <h2 className="font-heading text-base font-semibold text-zinc-100">
              Recently verified
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">By LGU & Brgy. units</p>
          </header>
          <ul className="divide-y divide-zinc-900">
            {RECENT_VERIFIED.map((r) => {
              const hazard = HAZARD_META[r.type]
              const Icon = hazard.icon
              return (
                <li key={r.id} className="px-5 py-3.5 flex items-start gap-3">
                  <span className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Icon className={cn("h-4 w-4", hazard.tone)} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {hazard.label} · Brgy. {r.barangay}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                      {r.verifiedBy ?? "—"}
                    </p>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-1" />
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
