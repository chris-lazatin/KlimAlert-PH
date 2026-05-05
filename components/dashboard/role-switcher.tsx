"use client"

// Demo-only role switcher rendered in the topbar when no API is connected.
// Lets reviewers preview each MVP dashboard (Citizen / Volunteer / LGU / Admin)
// without needing real auth.

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ALL_ROLES, ROLE_LABEL, ROLE_LABEL_FIL } from "@/lib/roles"
import type { AuthRole } from "@/lib/api"
import { cn } from "@/lib/utils"

export function RoleSwitcher() {
  const { user, isDemo, setDemoRole } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Only render in demo mode — real users shouldn't see it.
  if (!isDemo) return null

  const current: AuthRole = user?.role ?? "citizen"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="hidden md:inline-flex items-center gap-2 h-9 pl-2.5 pr-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] text-xs font-medium text-amber-200 hover:bg-amber-500/[0.12] hover:border-amber-500/50 transition"
      >
        <Users className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-300/80">
          Preview as
        </span>
        <span className="text-zinc-100 font-semibold">{ROLE_LABEL[current]}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-amber-300/80 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 overflow-hidden z-40"
        >
          <div className="px-3 py-2.5 border-b border-zinc-900">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-300">
              Demo mode
            </p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
              Switch roles to preview each MVP dashboard. No backend required.
            </p>
          </div>
          <ul className="py-1">
            {ALL_ROLES.map((role) => {
              const active = role === current
              return (
                <li key={role}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDemoRole(role)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-zinc-900" : "hover:bg-zinc-900/60",
                    )}
                  >
                    <span
                      className={cn(
                        "h-7 w-7 shrink-0 rounded-md flex items-center justify-center text-[11px] font-bold border",
                        active
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800",
                      )}
                    >
                      {ROLE_LABEL[role].slice(0, 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium truncate",
                          active ? "text-zinc-100" : "text-zinc-200",
                        )}
                      >
                        {ROLE_LABEL[role]}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">{ROLE_LABEL_FIL[role]}</p>
                    </div>
                    {active && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
