"use client"

// Volunteer overview: focused on incident reporting and crowd verification.
// Mirrors MVP §2 (Incident Reporting, Crowd Verification, Real-Time Updates).

import Link from "next/link"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Megaphone,
  ShieldCheck,
  ThumbsUp,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { SAMPLE_REPORTS, HAZARD_META, SEVERITY_META, STATUS_META } from "@/lib/hazard-reports"
import {
  EvacuationMapCard,
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
  { label: "Reports submitted", value: "12", trend: "this week", icon: Megaphone, tone: "emerald" },
  { label: "Verified by LGU", value: "9", trend: "75%", icon: CheckCircle2, tone: "emerald" },
  { label: "Pending validation", value: "3", trend: "needs votes", icon: Clock, tone: "amber" },
  { label: "Community trust", value: "Tier 2", trend: "+1 this mo.", icon: TrendingUp, tone: "sky" },
]

// Reports submitted by the current volunteer (mock view).
const MY_REPORTS = SAMPLE_REPORTS.slice(0, 3)
// Reports awaiting community validation.
const NEEDS_VALIDATION = SAMPLE_REPORTS.filter((r) => r.status === "pending")

export function VolunteerOverview() {
  const { user } = useAuth()
  const firstName = (user?.name ?? "Volunteer").split(" ")[0]

  return (
    <div className="space-y-6">
      <WelcomeHeader
        kicker="Volunteer reporter dashboard"
        title={`Salamat sa pag-volunteer, ${firstName}.`}
        subtitle="Ang mga ulat mo mula sa ground ay tumutulong sa LGU na makagawa ng mabilis na desisyon."
        actions={
          <>
            <SecondaryActionLink href="/dashboard/reports" icon={ShieldCheck}>
              Verify reports
            </SecondaryActionLink>
            <PrimaryActionLink href="/dashboard/reports#report" icon={Megaphone}>
              Submit hazard report
            </PrimaryActionLink>
          </>
        }
      />

      <StatGrid stats={STATS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <LiveAlertsCard />
        </div>

        {/* Quick report card */}
        <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-zinc-950 to-zinc-950 p-5 flex flex-col">
          <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">
            Quick action
          </p>
          <h2 className="font-heading text-lg font-semibold text-zinc-50 mt-1">
            Nakakita ka ba ng panganib?
          </h2>
          <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
            I-report agad para ma-verify ng LGU. Pwedeng may photo, location, at description.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-zinc-300">
            {[
              "Pagbaha o tumataas na tubig",
              "Bumagsak na puno o sarado na kalsada",
              "Nasunog o nasalanta na tahanan",
              "Pinsala sa kuryente o tubig",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="leading-snug">{tip}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/reports#report"
            className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Magsumite ng report
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      {/* My reports */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
          <div>
            <h2 className="font-heading text-base font-semibold text-zinc-100">My recent reports</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Sundan ang status ng iyong mga isinumiteng ulat.
            </p>
          </div>
          <Link
            href="/dashboard/reports"
            className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] text-zinc-500 uppercase tracking-wider">
              <tr className="border-b border-zinc-900">
                <th className="text-left font-medium px-5 py-3">Hazard</th>
                <th className="text-left font-medium px-5 py-3">Severity</th>
                <th className="text-left font-medium px-5 py-3">Location</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Verified by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {MY_REPORTS.map((r) => {
                const hazard = HAZARD_META[r.type]
                const severity = SEVERITY_META[r.severity]
                const status = STATUS_META[r.status]
                const Icon = hazard.icon
                return (
                  <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-2 text-zinc-100 font-medium">
                        <Icon className={cn("h-4 w-4", hazard.tone)} />
                        {hazard.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-medium rounded-md border px-2 py-0.5",
                          severity.ring,
                        )}
                      >
                        {severity.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">Brgy. {r.barangay}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-medium rounded-md border px-2 py-0.5",
                          status.ring,
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-zinc-500 text-xs">
                      {r.verifiedBy ?? "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Crowd verification queue */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base font-semibold text-zinc-100">
                Needs community verification
              </h2>
              <DemoDataNote />
            </div>
            <Link
              href="/dashboard/reports"
              className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              Open queue
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="divide-y divide-zinc-900">
            {NEEDS_VALIDATION.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-zinc-500">
                Walang report na hinihintay ng community validation. Mabuti ito.
              </li>
            ) : (
              NEEDS_VALIDATION.map((r) => {
                const hazard = HAZARD_META[r.type]
                const Icon = hazard.icon
                return (
                  <li
                    key={r.id}
                    className="px-5 py-4 flex items-start gap-4 hover:bg-zinc-900/40 transition-colors"
                  >
                    <span className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Icon className={cn("h-4 w-4", hazard.tone)} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-zinc-100">
                        {hazard.label} · Brgy. {r.barangay}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500">
                        <span>by {r.reporter}</span>
                        <span aria-hidden>·</span>
                        <span>{r.landmark}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs font-medium hover:bg-emerald-500/20 transition"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Confirm
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>

        <EvacuationMapCard />
      </section>
    </div>
  )
}
