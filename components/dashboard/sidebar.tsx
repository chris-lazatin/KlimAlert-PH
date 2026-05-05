"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, ShieldAlert, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { NAV_BY_ROLE, ROLE_LABEL } from "@/lib/roles"
import type { AuthRole } from "@/lib/api"

const BADGE_TONE: Record<NonNullable<ReturnType<() => "amber" | "emerald" | "zinc">>, string> = {
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Default to citizen view when there's no user yet (e.g. first paint).
  const role: AuthRole = user?.role ?? "citizen"
  const sections = NAV_BY_ROLE[role]

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-zinc-900 bg-zinc-950 sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-zinc-900">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
          <ShieldAlert className="h-4 w-4 text-zinc-950" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold tracking-tight text-zinc-100 leading-none">
            KlimAlert<span className="text-emerald-400"> PH</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500 font-medium truncate">
            {ROLE_LABEL[role]} workspace
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {sections.map((section) => (
          <div key={section.label} className="space-y-0.5">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-semibold">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-zinc-900 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60",
                  )}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-emerald-400"
                      aria-hidden
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-emerald-400" : "text-zinc-500",
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-md border",
                        BADGE_TONE[item.badgeTone ?? "zinc"],
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3 space-y-0.5 border-t border-zinc-900 pt-3">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname.startsWith("/dashboard/settings")
              ? "bg-zinc-900 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60",
          )}
        >
          <Settings
            className={cn(
              "h-4 w-4",
              pathname.startsWith("/dashboard/settings") ? "text-emerald-400" : "text-zinc-500",
            )}
          />
          Settings
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 transition-colors"
        >
          <LogOut className="h-4 w-4 text-zinc-500" />
          Sign out
        </button>
      </div>

      <div className="m-3 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-zinc-900 p-3">
        <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">PAGASA</p>
        <p className="mt-1 text-xs text-zinc-300 leading-snug">
          Public storm warning monitoring active for Luzon.
        </p>
        <p className="mt-1.5 text-[10px] text-zinc-500">Last sync · 2 min ago</p>
      </div>
    </aside>
  )
}
