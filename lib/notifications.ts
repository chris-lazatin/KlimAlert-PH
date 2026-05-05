"use client"

// Notifications store for the topbar bell dropdown.
//
// Persists "read" IDs and any user-dismissed IDs to localStorage so the
// unread count stays consistent across navigations and refreshes. The base
// notification list is sample data today; once the PHP backend exposes
// /notifications/list.php we can swap `BASE_NOTIFICATIONS` for a fetch.

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  Megaphone,
  Waves,
  Mountain,
  Flame,
  type LucideIcon,
} from "lucide-react"

export type NotificationKind = "alert" | "report" | "system" | "info"
export type NotificationSeverity = "advisory" | "warning" | "critical" | "info"

export type AppNotification = {
  id: string
  kind: NotificationKind
  severity: NotificationSeverity
  title: string
  body: string
  source: string
  createdAt: string // ISO
  href?: string
  icon: LucideIcon
}

const STORAGE_READ = "klimalert.notifications.read"
const STORAGE_DISMISSED = "klimalert.notifications.dismissed"

const BASE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    kind: "alert",
    severity: "critical",
    title: "Signal No. 2 — Tropical Storm Aghon",
    body: "Sustained winds 95 km/h. Iwasan ang paglabas mula 6PM hanggang madaling araw.",
    source: "PAGASA",
    createdAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    href: "/dashboard/alerts",
    icon: CloudRain,
  },
  {
    id: "n-2",
    kind: "alert",
    severity: "warning",
    title: "Flash flood watch — Gordon Heights",
    body: "Tubig na hanggang baywang sa Rizal Ave. Iwasan muna ang area.",
    source: "DRRMO Olongapo",
    createdAt: new Date(Date.now() - 22 * 60_000).toISOString(),
    href: "/dashboard/alerts",
    icon: Waves,
  },
  {
    id: "n-3",
    kind: "report",
    severity: "info",
    title: "Iyong report ay verified",
    body: "Ang flood report mo sa Gordon Heights ay na-verify ng DRRMO.",
    source: "KlimAlert PH",
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
    href: "/dashboard/reports",
    icon: ShieldCheck,
  },
  {
    id: "n-4",
    kind: "alert",
    severity: "advisory",
    title: "Landslide advisory — New Cabalan",
    body: "Ingat sa mga upland barangay. Maglakad lamang sa main roads.",
    source: "PHIVOLCS",
    createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
    href: "/dashboard/alerts",
    icon: Mountain,
  },
  {
    id: "n-5",
    kind: "alert",
    severity: "warning",
    title: "Fire incident report — Pag-asa",
    body: "Sunog malapit sa covered court. BFP Olongapo on scene.",
    source: "BFP Olongapo",
    createdAt: new Date(Date.now() - 9 * 60 * 60_000).toISOString(),
    href: "/dashboard/alerts",
    icon: Flame,
  },
  {
    id: "n-6",
    kind: "system",
    severity: "info",
    title: "Maligayang pagdating sa KlimAlert PH",
    body: "Kompletuhin ang iyong profile para sa mas accurate na alerts.",
    source: "KlimAlert PH",
    createdAt: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    href: "/dashboard/profile",
    icon: Megaphone,
  },
]

export const NOTIFICATION_TONE: Record<
  NotificationSeverity,
  { ring: string; iconColor: string; label: string }
> = {
  critical: {
    ring: "border-rose-500/30 bg-rose-500/10",
    iconColor: "text-rose-300",
    label: "Critical",
  },
  warning: {
    ring: "border-amber-500/30 bg-amber-500/10",
    iconColor: "text-amber-300",
    label: "Warning",
  },
  advisory: {
    ring: "border-sky-500/30 bg-sky-500/10",
    iconColor: "text-sky-300",
    label: "Advisory",
  },
  info: {
    ring: "border-emerald-500/30 bg-emerald-500/10",
    iconColor: "text-emerald-300",
    label: "Info",
  },
}

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr) : new Set()
  } catch {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)))
  } catch {
    /* quota / private mode */
  }
}

export type DecoratedNotification = AppNotification & { read: boolean }

export function useNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setReadIds(readSet(STORAGE_READ))
    setDismissedIds(readSet(STORAGE_DISMISSED))
    setHydrated(true)
  }, [])

  const items = useMemo<DecoratedNotification[]>(() => {
    return BASE_NOTIFICATIONS.filter((n) => !dismissedIds.has(n.id)).map((n) => ({
      ...n,
      read: readIds.has(n.id),
    }))
  }, [readIds, dismissedIds])

  const unreadCount = useMemo(
    () => (hydrated ? items.filter((n) => !n.read).length : 0),
    [items, hydrated],
  )

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      writeSet(STORAGE_READ, next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds(() => {
      const next = new Set(BASE_NOTIFICATIONS.map((n) => n.id))
      writeSet(STORAGE_READ, next)
      return next
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      writeSet(STORAGE_DISMISSED, next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setDismissedIds(() => {
      const next = new Set(BASE_NOTIFICATIONS.map((n) => n.id))
      writeSet(STORAGE_DISMISSED, next)
      return next
    })
  }, [])

  return { items, unreadCount, markRead, markAllRead, dismiss, clearAll, hydrated }
}

export function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.round(diffMs / 60_000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.round(hr / 24)
  return `${d}d ago`
}
