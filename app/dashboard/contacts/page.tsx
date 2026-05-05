"use client"

import { useMemo, useState } from "react"
import {
  Phone,
  Search,
  Copy,
  Check,
  ShieldAlert,
  Stethoscope,
  Flame,
  Building2,
  Zap,
  Anchor,
  Star,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"

type ContactCategory =
  | "drrmo"
  | "police"
  | "fire"
  | "medical"
  | "barangay"
  | "utilities"
  | "coastguard"

type Contact = {
  id: string
  name: string
  number: string
  hint: string
  category: ContactCategory
  available: "24/7" | "office hours"
  pinned?: boolean
}

const CATEGORY_META: Record<
  ContactCategory,
  { label: string; icon: LucideIcon; tone: string; ring: string }
> = {
  drrmo: {
    label: "DRRMO & rescue",
    icon: ShieldAlert,
    tone: "text-emerald-300",
    ring: "border-emerald-500/30 bg-emerald-500/10",
  },
  police: {
    label: "Police",
    icon: ShieldAlert,
    tone: "text-sky-300",
    ring: "border-sky-500/30 bg-sky-500/10",
  },
  fire: {
    label: "Fire & rescue",
    icon: Flame,
    tone: "text-rose-300",
    ring: "border-rose-500/30 bg-rose-500/10",
  },
  medical: {
    label: "Medical & hospitals",
    icon: Stethoscope,
    tone: "text-amber-300",
    ring: "border-amber-500/30 bg-amber-500/10",
  },
  barangay: {
    label: "Barangay desks",
    icon: Building2,
    tone: "text-zinc-300",
    ring: "border-zinc-700 bg-zinc-900",
  },
  utilities: {
    label: "Utilities",
    icon: Zap,
    tone: "text-yellow-300",
    ring: "border-yellow-500/30 bg-yellow-500/10",
  },
  coastguard: {
    label: "Coast guard",
    icon: Anchor,
    tone: "text-blue-300",
    ring: "border-blue-500/30 bg-blue-500/10",
  },
}

const CONTACTS: Contact[] = [
  // DRRMO
  {
    id: "c-001",
    name: "Olongapo City DRRMO",
    number: "(047) 222-2222",
    hint: "24/7 emergency desk",
    category: "drrmo",
    available: "24/7",
    pinned: true,
  },
  {
    id: "c-002",
    name: "Zambales PDRRMO",
    number: "(047) 602-1234",
    hint: "Provincial coordination",
    category: "drrmo",
    available: "24/7",
  },
  {
    id: "c-003",
    name: "Red Cross Olongapo",
    number: "(047) 222-2575",
    hint: "Rescue & ambulance",
    category: "drrmo",
    available: "24/7",
    pinned: true,
  },

  // Police
  {
    id: "c-010",
    name: "PNP Emergency Hotline",
    number: "117",
    hint: "National emergency",
    category: "police",
    available: "24/7",
    pinned: true,
  },
  {
    id: "c-011",
    name: "PNP Olongapo City",
    number: "(047) 222-3131",
    hint: "Police hotline",
    category: "police",
    available: "24/7",
  },
  {
    id: "c-012",
    name: "PNP Highway Patrol",
    number: "(047) 222-4577",
    hint: "Road safety & accidents",
    category: "police",
    available: "24/7",
  },

  // Fire
  {
    id: "c-020",
    name: "BFP Olongapo",
    number: "(047) 224-2533",
    hint: "Fire response & rescue",
    category: "fire",
    available: "24/7",
    pinned: true,
  },
  {
    id: "c-021",
    name: "BFP Subic",
    number: "(047) 232-4533",
    hint: "Subic district",
    category: "fire",
    available: "24/7",
  },

  // Medical
  {
    id: "c-030",
    name: "James L. Gordon Memorial Hospital",
    number: "(047) 224-2331",
    hint: "Trauma & ER · Hall St.",
    category: "medical",
    available: "24/7",
    pinned: true,
  },
  {
    id: "c-031",
    name: "Olongapo City Public Hospital",
    number: "(047) 222-3361",
    hint: "Public ER",
    category: "medical",
    available: "24/7",
  },
  {
    id: "c-032",
    name: "Subic Bay Medical Center",
    number: "(047) 252-5252",
    hint: "Subic Freeport",
    category: "medical",
    available: "24/7",
  },

  // Barangay
  {
    id: "c-040",
    name: "Brgy. East Tapinac DRRM",
    number: "+63 947 555 0112",
    hint: "Brgy. emergency desk",
    category: "barangay",
    available: "24/7",
  },
  {
    id: "c-041",
    name: "Brgy. Mabayuan",
    number: "+63 936 220 7711",
    hint: "Barangay hall",
    category: "barangay",
    available: "office hours",
  },
  {
    id: "c-042",
    name: "Brgy. Santa Rita",
    number: "+63 928 411 5512",
    hint: "Barangay hall",
    category: "barangay",
    available: "office hours",
  },
  {
    id: "c-043",
    name: "Brgy. Barretto",
    number: "+63 921 553 1290",
    hint: "Barangay hall",
    category: "barangay",
    available: "office hours",
  },

  // Utilities
  {
    id: "c-050",
    name: "Olongapo Electric (OEDC)",
    number: "(047) 222-2588",
    hint: "Power outage report",
    category: "utilities",
    available: "24/7",
  },
  {
    id: "c-051",
    name: "Subic Water",
    number: "(047) 252-4222",
    hint: "Water service",
    category: "utilities",
    available: "office hours",
  },

  // Coast guard
  {
    id: "c-060",
    name: "PCG Subic Bay",
    number: "(047) 252-7676",
    hint: "Maritime emergencies",
    category: "coastguard",
    available: "24/7",
  },
]

const FILTERS: { id: ContactCategory | "all" | "pinned"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned" },
  { id: "drrmo", label: "DRRMO" },
  { id: "police", label: "Police" },
  { id: "fire", label: "Fire" },
  { id: "medical", label: "Medical" },
  { id: "barangay", label: "Barangay" },
  { id: "utilities", label: "Utilities" },
  { id: "coastguard", label: "Coast guard" },
]

function tel(n: string) {
  return n.replace(/\D/g, "")
}

export default function ContactsPage() {
  const [filter, setFilter] = useState<ContactCategory | "all" | "pinned">("all")
  const [query, setQuery] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return CONTACTS.filter((c) => {
      const matchFilter =
        filter === "all" ? true : filter === "pinned" ? !!c.pinned : c.category === filter
      const q = query.trim().toLowerCase()
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q)
      return matchFilter && matchQ
    })
  }, [filter, query])

  // Group by category for the all view
  const grouped = useMemo(() => {
    const map = new Map<ContactCategory, Contact[]>()
    filtered.forEach((c) => {
      const arr = map.get(c.category) ?? []
      arr.push(c)
      map.set(c.category, arr)
    })
    return Array.from(map.entries())
  }, [filtered])

  const pinned = CONTACTS.filter((c) => c.pinned)

  async function handleCopy(id: string, number: string) {
    try {
      await navigator.clipboard.writeText(number)
      setCopied(id)
      setTimeout(() => setCopied((curr) => (curr === id ? null : curr)), 1500)
    } catch (err) {
      console.warn("[v0] copy failed", err)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">Emergency contacts</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50">
              One-tap call directory
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Lahat ng kailangang hotline para sa Olongapo City — police, fire, medical, barangay, at utilities.
              I-tap ang numero para tumawag agad sa mobile.
            </p>
          </div>
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white text-sm font-semibold hover:brightness-110 transition shadow-[0_8px_24px_-8px_rgba(244,63,94,0.6)]"
          >
            <Phone className="h-4 w-4" />
            Call 911
          </a>
        </div>
      </div>

      {/* Pinned hotlines */}
      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-emerald-500/[0.04] via-zinc-950 to-zinc-950 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-emerald-400" />
          <h2 className="font-heading text-sm font-semibold text-zinc-100">Pinned hotlines</h2>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium ml-1">
            Most called sa Olongapo
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pinned.map((c) => {
            const meta = CATEGORY_META[c.category]
            const Icon = meta.icon
            return (
              <a
                key={c.id}
                href={`tel:${tel(c.number)}`}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border ${meta.ring} shrink-0`}
                  >
                    <Icon className={`h-4 w-4 ${meta.tone}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500 font-semibold">
                      {meta.label}
                    </p>
                    <p className="font-medium text-sm text-zinc-100 mt-0.5 truncate">{c.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{c.hint}</p>
                    <p className="font-heading text-base text-emerald-300 mt-2 tabular-nums">{c.number}</p>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* Search + filter */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hanapin ang ahensya, brgy., o numero…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                filter === f.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <Phone className="h-8 w-8 mx-auto text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">Walang nahanap na contact.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([cat, items]) => {
            const meta = CATEGORY_META[cat]
            const Icon = meta.icon
            return (
              <section key={cat} className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-900">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${meta.ring}`}
                    >
                      <Icon className={`h-4 w-4 ${meta.tone}`} />
                    </span>
                    <h2 className="font-heading text-base font-semibold text-zinc-100">{meta.label}</h2>
                    <span className="text-[11px] text-zinc-500">{items.length} contacts</span>
                  </div>
                </header>
                <ul className="divide-y divide-zinc-900">
                  {items.map((c) => (
                    <li
                      key={c.id}
                      className="px-5 py-3.5 flex items-center gap-3 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-zinc-100 truncate">{c.name}</p>
                          {c.pinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5">
                              <Star className="h-2.5 w-2.5" />
                              Pinned
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-medium rounded-md border px-1.5 py-0.5 ${
                              c.available === "24/7"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : "border-zinc-700 bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            {c.available}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{c.hint}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopy(c.id, c.number)}
                          aria-label={`Copy ${c.name} number`}
                          className="h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:text-zinc-100 text-zinc-400 transition-colors flex items-center justify-center"
                        >
                          {copied === c.id ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={`tel:${tel(c.number)}`}
                          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-xs font-semibold hover:brightness-110 transition tabular-nums"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {c.number}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col sm:flex-row items-start gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-heading text-sm font-semibold text-zinc-100">Tamang paggamit ng hotlines</h3>
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
            Tumawag lamang sa mga emergency hotline para sa tunay na emergency. Para sa non-urgent na concerns,
            gamitin ang barangay desk o ang DRRMO information line.
          </p>
        </div>
        <a
          href="https://www.olongapocity.gov.ph/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          LGU website
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
