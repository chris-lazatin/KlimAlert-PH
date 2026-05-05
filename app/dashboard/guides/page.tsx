"use client"

import { useState } from "react"
import { Search, ArrowRight, Clock, ShieldCheck, BookOpen, Languages } from "lucide-react"
import { GUIDES, type Guide, type Locale } from "@/lib/preparedness-guides"
import { GuideReader } from "@/components/dashboard/guide-reader"

export default function GuidesPage() {
  const [locale, setLocale] = useState<Locale>("en")
  const [active, setActive] = useState<Guide | null>(null)
  const [query, setQuery] = useState("")

  const filtered = GUIDES.filter((g) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      g.title[locale].toLowerCase().includes(q) ||
      g.shortDesc[locale].toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    )
  })

  if (active) {
    return <GuideReader guide={active} locale={locale} onLocaleChange={setLocale} onBack={() => setActive(null)} />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">Preparedness guides</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50">
              {locale === "en" ? "Disaster preparedness library" : "Aklatan ng paghahanda sa sakuna"}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              {locale === "en"
                ? "Bilingual, step-by-step guides verified by PAGASA, PHIVOLCS, BFP, and NDRRMC."
                : "Bilingüe at step-by-step na gabay, verified ng PAGASA, PHIVOLCS, BFP, at NDRRMC."}
            </p>
          </div>

          {/* Locale toggle */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
            <Languages className="h-4 w-4 text-zinc-500 ml-2" />
            {(["en", "fil"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  locale === l ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {l === "en" ? "English" : "Filipino"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === "en" ? "Search guides…" : "Hanapin ang gabay…"}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <BookOpen className="h-8 w-8 mx-auto text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">
            {locale === "en" ? "No guides found." : "Walang nahanap na gabay."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((g) => {
            const Icon = g.icon
            return (
              <button
                key={g.id}
                onClick={() => setActive(g)}
                className="group relative text-left rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-emerald-500/40 hover:bg-zinc-900/40 transition-all"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(420px circle at var(--x,50%) var(--y,50%), rgba(16,185,129,0.06), transparent 40%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-zinc-500">
                      {g.category}
                    </span>
                  </div>

                  <h2 className="font-heading text-lg font-semibold text-zinc-100 mt-4 text-balance">
                    {g.title[locale]}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed line-clamp-2 text-pretty">
                    {g.shortDesc[locale]}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {g.authority}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {g.duration}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-emerald-400 group-hover:gap-2 transition-all">
                      {locale === "en" ? "Read" : "Basahin"}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
