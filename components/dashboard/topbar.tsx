"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Bell,
  MapPin,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  ShieldCheck,
  CheckCheck,
  X,
  BellOff,
} from "lucide-react"
import { useAuth, nameInitials } from "@/lib/auth-context"
import { useNotifications, NOTIFICATION_TONE, formatRelative } from "@/lib/notifications"
import { GlobalSearch } from "@/components/dashboard/global-search"
import { RoleSwitcher } from "@/components/dashboard/role-switcher"
import { ROLE_LABEL } from "@/lib/roles"

export function DashboardTopbar() {
  const { user, isDemo, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const bellRef = useRef<HTMLDivElement | null>(null)

  const { items, unreadCount, markRead, markAllRead, dismiss, clearAll, hydrated } = useNotifications()

  useEffect(() => {
    if (!profileOpen && !bellOpen) return
    function onClick(e: MouseEvent) {
      if (profileOpen && !profileRef.current?.contains(e.target as Node)) setProfileOpen(false)
      if (bellOpen && !bellRef.current?.contains(e.target as Node)) setBellOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileOpen(false)
        setBellOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [profileOpen, bellOpen])

  const initials = user ? nameInitials(user.name) : "?"
  const displayName = user?.name ?? "Sign in"
  const barangay = user?.barangay ?? "Olongapo City"

  return (
    <header className="sticky top-0 z-30 h-16 px-5 lg:px-7 flex items-center gap-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
        <span>
          Olongapo City <span className="text-zinc-600">·</span>{" "}
          <span className="text-zinc-200 font-medium">Brgy. {barangay}</span>
        </span>
        {isDemo && (
          <span className="ml-2 hidden sm:inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Demo
          </span>
        )}
      </div>

      <GlobalSearch />

      <div className="flex items-center gap-2 ml-auto">
        <RoleSwitcher />

        {/* Notifications */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={bellOpen}
            onClick={() => {
              setBellOpen((v) => !v)
              setProfileOpen(false)
            }}
            className="relative h-9 w-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition"
          >
            <Bell className="h-4 w-4" />
            {hydrated && unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                <span className="sr-only">{unreadCount} unread notifications</span>
              </>
            )}
          </button>

          {bellOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-[22rem] sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Notifications</p>
                  <p className="text-[11px] text-zinc-500">
                    {hydrated && unreadCount > 0
                      ? `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}`
                      : "All caught up"}
                  </p>
                </div>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors disabled:text-zinc-600 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <ul className="max-h-[26rem] overflow-y-auto divide-y divide-zinc-900">
                {items.length === 0 ? (
                  <li className="px-4 py-10 flex flex-col items-center text-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500">
                      <BellOff className="h-4 w-4" />
                    </span>
                    <p className="text-sm text-zinc-300 font-medium">Walang notification</p>
                    <p className="text-[11px] text-zinc-500 max-w-[16rem]">
                      Lahat ng bagong alerts mula sa PAGASA at LGU ay lalabas dito.
                    </p>
                  </li>
                ) : (
                  items.map((n) => {
                    const tone = NOTIFICATION_TONE[n.severity]
                    const Icon = n.icon
                    const Wrapper: React.ElementType = n.href ? Link : "div"
                    const wrapperProps = n.href ? { href: n.href } : {}
                    return (
                      <li
                        key={n.id}
                        className={`group relative px-4 py-3 hover:bg-zinc-900/60 transition-colors ${
                          !n.read ? "bg-zinc-900/30" : ""
                        }`}
                      >
                        <Wrapper
                          {...wrapperProps}
                          onClick={() => {
                            markRead(n.id)
                            if (n.href) setBellOpen(false)
                          }}
                          className="flex items-start gap-3 pr-6"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone.ring}`}
                          >
                            <Icon className={`h-4 w-4 ${tone.iconColor}`} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-zinc-100 leading-snug">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span
                                  aria-label="Unread"
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                                />
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                              {n.body}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                                {n.source}
                              </span>
                              <span className="text-zinc-700">·</span>
                              <span className="text-[10px] text-zinc-500 tabular-nums">
                                {formatRelative(n.createdAt)}
                              </span>
                            </div>
                          </div>
                        </Wrapper>
                        <button
                          type="button"
                          aria-label="Dismiss notification"
                          onClick={(e) => {
                            e.stopPropagation()
                            dismiss(n.id)
                          }}
                          className="absolute top-2.5 right-2.5 h-6 w-6 rounded-md text-zinc-600 hover:bg-zinc-900 hover:text-zinc-200 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5 mx-auto" />
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>

              <div className="border-t border-zinc-900 px-3 py-2 flex items-center justify-between">
                <Link
                  href="/dashboard/alerts"
                  onClick={() => setBellOpen(false)}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-2"
                >
                  View all alerts
                </Link>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors px-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v)
              setBellOpen(false)
            }}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-lg hover:bg-zinc-900 transition"
          >
            <span className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 text-xs font-bold">
              {initials}
            </span>
            <span className="text-sm text-zinc-200 hidden sm:block">{displayName}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 overflow-hidden"
            >
              <div className="px-3 py-3 border-b border-zinc-900">
                <p className="text-sm font-semibold text-zinc-100">{displayName}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email ?? "guest@klimalert.ph"}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  {ROLE_LABEL[user?.role ?? "citizen"] ?? "Citizen"}
                </span>
              </div>
              <div className="py-1.5">
                <MenuItem
                  icon={UserIcon}
                  label="My profile"
                  href="/dashboard/profile"
                  onSelect={() => setProfileOpen(false)}
                />
                <MenuItem
                  icon={Settings}
                  label="Settings"
                  href="/dashboard/settings"
                  onSelect={() => setProfileOpen(false)}
                />
              </div>
              <div className="border-t border-zinc-900 py-1.5">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onSelect,
}: {
  icon: typeof Bell
  label: string
  href: string
  onSelect?: () => void
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 transition-colors"
    >
      <Icon className="h-4 w-4 text-zinc-500" />
      {label}
    </Link>
  )
}
