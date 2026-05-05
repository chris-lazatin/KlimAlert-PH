"use client"

// Dashboard overview dispatcher.
// Picks the role-tailored overview based on the authenticated user's role.
// Demo mode lets the previewer flip between roles via the topbar role switcher.

import { useAuth } from "@/lib/auth-context"
import { CitizenOverview } from "@/components/dashboard/overviews/citizen-overview"
import { VolunteerOverview } from "@/components/dashboard/overviews/volunteer-overview"
import { LguOverview } from "@/components/dashboard/overviews/lgu-overview"
import { AdminOverview } from "@/components/dashboard/overviews/admin-overview"

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Loading workspace…
      </div>
    )
  }

  switch (user?.role) {
    case "volunteer":
      return <VolunteerOverview />
    case "lgu":
      return <LguOverview />
    case "admin":
      return <AdminOverview />
    case "citizen":
    default:
      return <CitizenOverview />
  }
}
