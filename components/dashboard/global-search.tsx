"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  LayoutDashboard,
  Radio,
  MapPin,
  Megaphone,
  Phone,
  BookOpen,
  Sparkles,
  Settings as SettingsIcon,
  ShieldCheck,
  User as UserIcon,
  Wind,
  Mountain,
  Waves,
  Flame,
  Anchor,
  CloudRain,
  Building2,
  type LucideIcon,
} from "lucide-react"
import { EVAC_CENTERS } from "@/lib/evacuation-centers"
import { GUIDES } from "@/lib/preparedness-guides"

type SearchItem = {
  id: string
  group: "Pages" | "Evacuation centers" | "Preparedness guides"
  title: string
  subtitle?: string
  href: string
  icon: LucideIcon
  keywords: string
}

const PAGE_ITEMS: SearchItem[] = [
  {
    id: "page-overview",
    group: "Pages",
    title: "Overview",
    subtitle: "Dashboard home",
    href: "/dashboard",
    icon: LayoutDashboard,
    keywords: "overview dashboard home summary",
  },
  {
    id: "page-alerts",
    group: "Pages",
    title: "Live alerts",
    subtitle: "PAGASA & LGU advisories",
    href: "/dashboard/alerts",
    icon: Radio,
    keywords: "alerts pagasa typhoon storm signal warning bulletin",
  },
  {
    id: "page-evacuation",
    group: "Pages",
    title: "Evacuation map",
    subtitle: "Open evacuation centers",
    href: "/dashboard/evacuation",
    icon: MapPin,
    keywords: "evacuation map shelter centers lumikas",
  },
  {
    id: "page-reports",
    group: "Pages",
    title: "Hazard reports",
    subtitle: "Submit and track reports",
    href: "/dashboard/reports",
    icon: Megaphone,
    keywords: "hazard reports flood landslide submit baha",
  },
  {
    id: "page-contacts",
    group: "Pages",
    title: "Emergency contacts",
    subtitle: "Hotlines and responders",
    href: "/dashboard/contacts",
    icon: Phone,
    keywords: "contacts hotline emergency rescue cdrrmo bfp pnp red cross",
  },
  {
    id: "page-guides",
    group: "Pages",
    title: "Preparedness guide",
    subtitle: "Bilingual safety playbooks",
    href: "/dashboard/guides",
    icon: BookOpen,
    keywords: "guides preparedness paghahanda safety",
  },
  {
    id: "page-klimabot",
    group: "Pages",
    title: "KlimaBot AI",
    subtitle: "Ask the climate assistant",
    href: "/dashboard/klimabot",
    icon: Sparkles,
    keywords: "klimabot ai chatbot assistant tanong",
  },
  {
    id: "page-verify",
    group: "Pages",
    title: "Verification queue",
    subtitle: "LGU report review",
    href: "/dashboard/verify",
    icon: ShieldCheck,
    keywords: "verify lgu queue moderation review",
  },
  {
    id: "page-profile",
    group: "Pages",
    title: "My profile",
    href: "/dashboard/profile",
    icon: UserIcon,
    keywords: "profile account user me",
  },
  {
    id: "page-settings",
    group: "Pages",
    title: "Settings",
    href: "/dashboard/settings",
    icon: SettingsIcon,
    keywords: "settings preferences notifications language",
  },
]

const GUIDE_ICONS: Record<string, LucideIcon> = {
  Typhoon: Wind,
  Earthquake: Mountain,
  Flood: Waves,
  Fire: Flame,
  Tsunami: Anchor,
  Landslide: CloudRain,
}

function buildIndex(): SearchItem[] {
  const evacItems: SearchItem[] = EVAC_CENTERS.map((c) => ({
    id: `evac-${c.id}`,
    group: "Evacuation centers",
    title: c.name,
    subtitle: `${c.address} · ${c.status.replace("_", " ")}`,
    href: `/dashboard/evacuation?center=${c.id}`,
    icon: Building2,
    keywords: `${c.name} ${c.barangay} ${c.address} ${c.facilities.join(" ")} evacuation shelter`.toLowerCase(),
  }))

  const guideItems: SearchItem[] = GUIDES.map((g) => ({
    id: `guide-${g.id}`,
    group: "Preparedness guides",
    title: g.title.en,
    subtitle: `${g.category} · ${g.title.fil}`,
    href: `/dashboard/guides?guide=${g.id}`,
    icon: GUIDE_ICONS[g.category] ?? BookOpen,
    keywords:
      `${g.title.en} ${g.title.fil} ${g.category} ${g.shortDesc.en} ${g.shortDesc.fil} ${g.authority}`.toLowerCase(),
  }))

  return [...PAGE_ITEMS, ...evacItems, ...guideItems]
}

const INDEX = buildIndex()
const GROUP_ORDER: SearchItem["group"][] = ["Pages", "Evacuation centers", "Preparedness guides"]

function score(item: SearchItem, q: string): number {
  if (!q) return 0
  const title = item.title.toLowerCase()
  const sub = (item.subtitle ?? "").toLowerCase()
  const kw = item.keywords
  if (title === q) return 100
  if (title.startsWith(q)) return 80
  if (title.includes(q)) return 60
  if (sub.includes(q)) return 40
  if (kw.includes(q)) return 25
  return 0
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [] as SearchItem[]
    const scored = INDEX.map((item) => ({ item, s: score(item, q) })).filter((r) => r.s > 0)
    scored.sort((a, b) => b.s - a.s || a.item.title.localeCompare(b.item.title))
    return scored.slice(0, 12).map((r) => r.item)
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<SearchItem["group"], SearchItem[]>()
    for (const r of results) {
      if (!map.has(r.group)) map.set(r.group, [])
      map.get(r.group)!.push(r)
    }
    // Stable order
    const ordered: { group: SearchItem["group"]; items: SearchItem[] }[] = []
    for (const g of GROUP_ORDER) {
      if (map.has(g)) ordered.push({ group: g, items: map.get(g)! })
    }
    return ordered
  }, [results])

  // Reset active index when results change
  useEffect(() => {
    setActive(0)
  }, [results])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  // Cmd/Ctrl+K to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  // Keep active item visible
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [active])

  function handleSelect(item: SearchItem) {
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    router.push(item.href)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (query) {
        setQuery("")
      } else {
        setOpen(false)
        inputRef.current?.blur()
      }
      return
    }
    if (!results.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => (a + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = results[active]
      if (item) handleSelect(item)
    }
  }

  const showPanel = open && (query.length > 0)
  // Build a flat indexed list to map grouped UI back to a single active index.
  const flatIndex = results

  return (
    <div ref={wrapperRef} className="flex-1 max-w-md ml-4 relative hidden md:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        placeholder="Search alerts, evac centers, contacts…"
        className="w-full h-9 pl-9 pr-12 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
      />
      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 h-5 text-[10px] font-mono text-zinc-500">
        <Command className="h-2.5 w-2.5" />K
      </kbd>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          ref={listRef}
          className="absolute left-0 right-0 mt-2 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 overflow-hidden z-40"
        >
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-zinc-300 font-medium">No results</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Try a barangay, evac center, or hazard type.
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-[24rem] overflow-y-auto py-1">
                {grouped.map((g) => (
                  <div key={g.group} className="py-1">
                    <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-semibold">
                      {g.group}
                    </p>
                    {g.items.map((item) => {
                      const idx = flatIndex.indexOf(item)
                      const isActive = idx === active
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          data-idx={idx}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActive(idx)}
                          onClick={(e) => {
                            e.preventDefault()
                            handleSelect(item)
                          }}
                          className={`flex items-center gap-3 px-3 py-2 mx-1 rounded-lg transition-colors ${
                            isActive ? "bg-zinc-900 text-zinc-100" : "text-zinc-300 hover:bg-zinc-900/60"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                              isActive
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-[11px] text-zinc-500 truncate mt-0.5">{item.subtitle}</p>
                            )}
                          </div>
                          {isActive && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-zinc-500 shrink-0" aria-hidden />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-900 px-3 py-2 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-zinc-800 bg-zinc-900">
                      <ArrowUp className="h-2.5 w-2.5" />
                    </kbd>
                    <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-zinc-800 bg-zinc-900">
                      <ArrowDown className="h-2.5 w-2.5" />
                    </kbd>
                    navigate
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="inline-flex h-4 items-center justify-center rounded border border-zinc-800 bg-zinc-900 px-1">
                      <CornerDownLeft className="h-2.5 w-2.5" />
                    </kbd>
                    select
                  </span>
                </span>
                <span>
                  {results.length} result{results.length === 1 ? "" : "s"}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
