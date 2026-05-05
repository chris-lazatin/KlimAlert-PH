// Role configuration for KlimAlert PH.
//
// Maps each AuthRole to:
//   - a human label (English + Filipino),
//   - a sidebar navigation list (sections + items),
//   - a default demo display name so the role switcher feels distinct.
//
// All routes referenced here MUST exist under /app/dashboard/* — we never link
// to pages that aren't built yet.

import {
  LayoutDashboard,
  Radio,
  MapPin,
  Megaphone,
  Phone,
  BookOpen,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import type { AuthRole } from "@/lib/api"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Small badge shown at the right of the nav item (e.g. live count). */
  badge?: string
  /** Tone for the badge. */
  badgeTone?: "amber" | "emerald" | "zinc"
}

export type NavSection = {
  label: string
  items: NavItem[]
}

const overview: NavItem = { href: "/dashboard", label: "Overview", icon: LayoutDashboard }
const alerts: NavItem = { href: "/dashboard/alerts", label: "Live alerts", icon: Radio, badge: "2", badgeTone: "amber" }
const evacuation: NavItem = { href: "/dashboard/evacuation", label: "Evacuation map", icon: MapPin }
const reports: NavItem = { href: "/dashboard/reports", label: "Hazard reports", icon: Megaphone }
const contacts: NavItem = { href: "/dashboard/contacts", label: "Emergency contacts", icon: Phone }
const guides: NavItem = { href: "/dashboard/guides", label: "Preparedness guide", icon: BookOpen }
const klimabot: NavItem = { href: "/dashboard/klimabot", label: "KlimaBot AI", icon: Sparkles }
const verify: NavItem = {
  href: "/dashboard/verify",
  label: "Verification queue",
  icon: ShieldCheck,
  badge: "LGU",
  badgeTone: "emerald",
}

export const NAV_BY_ROLE: Record<AuthRole, NavSection[]> = {
  citizen: [
    {
      label: "My safety",
      items: [overview, alerts, evacuation, reports, contacts, guides, klimabot],
    },
  ],
  volunteer: [
    {
      label: "My safety",
      items: [overview, alerts, evacuation, contacts, guides],
    },
    {
      label: "Reporting",
      items: [reports, klimabot],
    },
  ],
  lgu: [
    {
      label: "Operations",
      items: [overview, alerts, evacuation, reports, contacts],
    },
    {
      label: "LGU tools",
      items: [verify, guides, klimabot],
    },
  ],
  admin: [
    {
      label: "Monitoring",
      items: [overview, alerts, reports, evacuation],
    },
    {
      label: "Administration",
      items: [verify, contacts],
    },
  ],
}

export const ROLE_LABEL: Record<AuthRole, string> = {
  citizen: "Citizen",
  volunteer: "Volunteer",
  lgu: "LGU Officer",
  admin: "Administrator",
}

export const ROLE_LABEL_FIL: Record<AuthRole, string> = {
  citizen: "Residente",
  volunteer: "Volunteer Reporter",
  lgu: "DRRMO Officer",
  admin: "IT Personnel",
}

export const ROLE_TAGLINE: Record<AuthRole, string> = {
  citizen: "Stay informed and prepared for hazards in your barangay.",
  volunteer: "Submit and verify hazard reports from the ground.",
  lgu: "Monitor reports, broadcast alerts, and coordinate response.",
  admin: "Manage users, audit activity, and configure the system.",
}

/** Demo personas used when NEXT_PUBLIC_API_BASE_URL is unset. */
export const DEMO_PERSONA: Record<
  AuthRole,
  { name: string; email: string; barangay: string }
> = {
  citizen: {
    name: "Christopher L.",
    email: "demo.citizen@klimalert.ph",
    barangay: "East Tapinac",
  },
  volunteer: {
    name: "Mark D.",
    email: "demo.volunteer@klimalert.ph",
    barangay: "Barretto",
  },
  lgu: {
    name: "Officer R. Reyes",
    email: "demo.lgu@klimalert.ph",
    barangay: "City DRRMO",
  },
  admin: {
    name: "IT Personnel",
    email: "demo.admin@klimalert.ph",
    barangay: "City IT Office",
  },
}

export const ALL_ROLES: AuthRole[] = ["citizen", "volunteer", "lgu", "admin"]
