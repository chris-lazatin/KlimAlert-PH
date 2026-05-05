"use client"

import { useState } from "react"
import { ArrowLeft, AlertTriangle, ShieldCheck, Clock, Printer } from "lucide-react"
import { PHASE_LABELS, type Guide, type Locale } from "@/lib/preparedness-guides"

const PHASE_TONES = {
  before: { ring: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300", num: "bg-emerald-500/20 text-emerald-300" },
  during: { ring: "border-amber-500/30 bg-amber-500/[0.06] text-amber-300", num: "bg-amber-500/20 text-amber-300" },
  after: { ring: "border-sky-500/30 bg-sky-500/[0.06] text-sky-300", num: "bg-sky-500/20 text-sky-300" },
} as const

export function GuideReader({
  guide,
  locale,
  onLocaleChange,
  onBack,
}: {
  guide: Guide
  locale: Locale
  onLocaleChange: (l: Locale) => void
  onBack: () => void
}) {
  const Icon = guide.icon
  const phases: Array<keyof typeof PHASE_TONES> = ["before", "during", "after"]
  const [activePhase, setActivePhase] = useState<keyof typeof PHASE_TONES>("before")
  const content = guide.sections[locale]

  return (
    <article className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "en" ? "All guides" : "Lahat ng gabay"}
        </button>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5">
            {(["en", "fil"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => onLocaleChange(l)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  locale === l ? "bg-zinc-800 text-emerald-300" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {l === "en" ? "EN" : "FIL"}
              </button>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            {locale === "en" ? "Print" : "I-print"}
          </button>
        </div>
      </div>

      {/* Hero */}
      <header className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/20 p-6 lg:p-8 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-semibold">
                {guide.category}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5 inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {guide.authority}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {guide.duration}
                </span>
              </p>
            </div>
          </div>
          <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50 text-balance">
            {guide.title[locale]}
          </h1>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed text-pretty max-w-2xl">
            {guide.shortDesc[locale]}
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-rose-300">
                {locale === "en" ? "Critical reminder" : "Mahalagang paalala"}
              </p>
              <p className="text-sm text-zinc-100 leading-relaxed mt-1">{guide.emergencyTip[locale]}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Phase tabs */}
      <nav className="grid grid-cols-3 gap-2">
        {phases.map((p) => {
          const tone = PHASE_TONES[p]
          const active = activePhase === p
          return (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                active ? tone.ring : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                {locale === "en" ? "Phase" : "Yugto"}
              </p>
              <p className={`font-heading text-base font-semibold mt-0.5 ${active ? "" : "text-zinc-200"}`}>
                {PHASE_LABELS[p][locale]}
              </p>
            </button>
          )
        })}
      </nav>

      {/* Phase content */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:p-7">
        <ol className="space-y-3.5">
          {content[activePhase].map((step, i) => {
            const tone = PHASE_TONES[activePhase]
            return (
              <li key={i} className="flex items-start gap-3.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold tabular-nums ${tone.num}`}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed pt-0.5 text-pretty">{step}</p>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Footer note */}
      <p className="text-[11px] text-zinc-600 text-center">
        {locale === "en"
          ? `Source: ${guide.authority}. Always follow your barangay's official advisories.`
          : `Pinagmulan: ${guide.authority}. Sundin pa rin ang opisyal na payo ng inyong barangay.`}
      </p>
    </article>
  )
}
