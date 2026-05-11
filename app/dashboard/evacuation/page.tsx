"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { MapPin, Phone, Users, ShieldCheck, Search } from "lucide-react"
import { getAvailableCenters, STATUS_META, type EvacuationCenter } from "@/lib/evacuation-centers"
import { OLONGAPO_BARANGAYS } from "@/lib/olongapo"

const EvacuationMap = dynamic(
  () => import("@/components/dashboard/evacuation-map").then((m) => m.EvacuationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-sm text-zinc-500">
        Loading map…
      </div>
    ),
  },
)

export default function EvacuationPage() {
  const all = useMemo(() => getAvailableCenters(), [])
  const [query, setQuery] = useState("")
  const [barangay, setBarangay] = useState<string>("")
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => setSelected((prev) => (prev === id ? null : id))

  const filtered = useMemo<EvacuationCenter[]>(() => {
    return all.filter((c) => {
      const matchQ =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.barangay.toLowerCase().includes(query.toLowerCase())
      const matchB = !barangay || c.barangay === barangay
      return matchQ && matchB
    })
  }, [all, query, barangay])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">Evacuation locator</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50">
              Available evacuation centers
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Hindi ipinapakita ang mga FULL o CLOSED na centers. Ang capacity data ay live mula sa LGU Olongapo
              DRRMO.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-2 text-xs text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            {filtered.length} centers · {filtered.reduce((sum, c) => sum + (c.capacity - c.occupancy), 0)} slots open
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hanapin ang center o barangay…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <select
          value={barangay}
          onChange={(e) => setBarangay(e.target.value)}
          className="h-11 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All barangays</option>
          {OLONGAPO_BARANGAYS.map((b) => (
            <option key={b} value={b}>
              Brgy. {b}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        {/* Map */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="h-[640px] p-3">
            <EvacuationMap selectedId={selected} onSelect={handleSelect} height="100%" />
          </div>
        </div>

        {/* List */}
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col max-h-[640px]">
          <header className="px-5 py-4 border-b border-zinc-900">
            <h2 className="font-heading text-base font-semibold text-zinc-100">Centers nearby</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Tap to navigate · tap again to dismiss</p>
          </header>
          <ul className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {filtered.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-zinc-500">
                Walang nakitang center sa filter na ito.
              </li>
            )}
            {filtered.map((c) => {
              const meta = STATUS_META[c.status]
              const pct = Math.round((c.occupancy / c.capacity) * 100)
              const active = c.id === selected
              return (
                <li key={c.id}>
                  <button
                    onClick={() => handleSelect(c.id)}
                    className={`w-full text-left px-5 py-4 transition-colors ${
                      active ? "bg-emerald-500/[0.06]" : "hover:bg-zinc-900/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-zinc-100">{c.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5 inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Brgy. {c.barangay}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5 ${meta.ring} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="text-[11px] text-zinc-400 tabular-nums">
                        {c.occupancy}/{c.capacity}
                      </span>
                      <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 90 ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500 tabular-nums">{pct}%</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.facilities.map((f) => (
                        <span
                          key={f}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <a
                      href={`tel:${c.contact.replace(/\D/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 tabular-nums"
                    >
                      <Phone className="h-3 w-3" />
                      {c.contact}
                    </a>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </div>
  )
}