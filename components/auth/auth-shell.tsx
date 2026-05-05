import type { ReactNode } from "react"
import Link from "next/link"
import { ShieldAlert, Radio, MapPin, Users } from "lucide-react"

type Highlight = {
  icon: typeof Radio
  title: string
  desc: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Radio,
    title: "Real-time alerts",
    desc: "PAGASA + LGU broadcasts straight to your barangay.",
  },
  {
    icon: MapPin,
    title: "Open evac centers only",
    desc: "Routes you only to centers with available capacity.",
  },
  {
    icon: Users,
    title: "Community-powered",
    desc: "Verified hazard reports from your neighbors.",
  },
]

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-zinc-900 bg-gradient-to-br from-zinc-950 via-emerald-950/10 to-zinc-950 p-10">
        {/* Decorative grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_24px_rgba(16,185,129,0.45)]">
              <ShieldAlert className="h-4 w-4 text-zinc-950" strokeWidth={2.6} />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
              </span>
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-zinc-100">
              KlimAlert<span className="text-emerald-400"> PH</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80 font-medium mb-4">
            Olongapo · Zambales
          </p>
          <h2 className="font-heading text-3xl xl:text-4xl font-semibold tracking-tight text-zinc-50 text-balance leading-[1.1]">
            Disaster ready.
            <br />
            <span className="text-emerald-400">Barangay smart.</span>
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed text-pretty">
            Join the community-powered preparedness network built for Filipino barangays. Your account stays tied to
            your location so alerts are always hyper-local.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon
              return (
                <li key={h.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-zinc-100 text-sm">{h.title}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">{h.desc}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <span>Aligned with NDRRMC · PAGASA · SDG 13</span>
          <span>v1.0 · Capstone</span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        {/* Mobile brand */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
              <ShieldAlert className="h-4 w-4 text-zinc-950" strokeWidth={2.6} />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight text-zinc-100">
              KlimAlert<span className="text-emerald-400"> PH</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-heading text-2xl sm:text-[28px] font-semibold tracking-tight text-zinc-50 text-balance">
              {title}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed text-pretty">{subtitle}</p>
          </div>

          {children}

          <div className="mt-8 text-center text-sm text-zinc-500">{footer}</div>
        </div>
      </main>
    </div>
  )
}
