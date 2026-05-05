// Hazard report types & sample data for KlimAlert PH
// Mirrors the columns in scripts/002_create_reports.sql

import { Waves, Flame, Mountain, TreePine, Construction, Zap, AlertTriangle, type LucideIcon } from "lucide-react"

export type HazardType =
  | "flood"
  | "fire"
  | "landslide"
  | "fallen_tree"
  | "road_blocked"
  | "power_outage"
  | "other"

export type Severity = "low" | "moderate" | "high" | "critical"
export type ReportStatus = "pending" | "verified" | "resolved" | "dismissed"

export type HazardReport = {
  id: string
  type: HazardType
  severity: Severity
  barangay: string
  landmark: string
  description: string
  photoUrl?: string
  reporter: string
  reporterRole: "Citizen" | "Volunteer" | "LGU"
  status: ReportStatus
  createdAt: string // ISO
  verifiedBy?: string
}

export const HAZARD_META: Record<
  HazardType,
  { label: string; labelFil: string; icon: LucideIcon; tone: string }
> = {
  flood: { label: "Flooding", labelFil: "Pagbaha", icon: Waves, tone: "text-sky-300" },
  fire: { label: "Fire", labelFil: "Sunog", icon: Flame, tone: "text-rose-300" },
  landslide: { label: "Landslide", labelFil: "Pagguho", icon: Mountain, tone: "text-amber-300" },
  fallen_tree: { label: "Fallen tree", labelFil: "Bumagsak na puno", icon: TreePine, tone: "text-lime-300" },
  road_blocked: { label: "Road blocked", labelFil: "Sarado ang kalsada", icon: Construction, tone: "text-orange-300" },
  power_outage: { label: "Power outage", labelFil: "Brownout", icon: Zap, tone: "text-yellow-300" },
  other: { label: "Other hazard", labelFil: "Iba pang panganib", icon: AlertTriangle, tone: "text-zinc-300" },
}

export const SEVERITY_META: Record<Severity, { label: string; ring: string; dot: string; bar: string }> = {
  low: {
    label: "Low",
    ring: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    bar: "bg-emerald-400",
  },
  moderate: {
    label: "Moderate",
    ring: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  high: {
    label: "High",
    ring: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-400",
    bar: "bg-orange-400",
  },
  critical: {
    label: "Critical",
    ring: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
    bar: "bg-rose-400",
  },
}

export const STATUS_META: Record<ReportStatus, { label: string; ring: string }> = {
  pending: { label: "Pending review", ring: "border-zinc-700 bg-zinc-900 text-zinc-300" },
  verified: { label: "Verified", ring: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  resolved: { label: "Resolved", ring: "border-sky-500/30 bg-sky-500/10 text-sky-300" },
  dismissed: { label: "Dismissed", ring: "border-zinc-700 bg-zinc-900 text-zinc-500" },
}

// Realistic sample reports. Replace with PHP API GET /reports/list.php
export const SAMPLE_REPORTS: HazardReport[] = [
  {
    id: "r-001",
    type: "flood",
    severity: "high",
    barangay: "Gordon Heights",
    landmark: "Rizal Ave., near Gordon College",
    description: "Tubig na hanggang baywang. Hindi madaanan ng tricycle papuntang highway.",
    reporter: "Rosario M.",
    reporterRole: "Citizen",
    status: "verified",
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    verifiedBy: "DRRMO Olongapo",
  },
  {
    id: "r-002",
    type: "fallen_tree",
    severity: "moderate",
    barangay: "Barretto",
    landmark: "National Highway, fronting Subic Bay Travelers",
    description: "Malaking puno bumagsak sa kalsada. Isang lane lang ang dumadaan.",
    reporter: "Mark D.",
    reporterRole: "Volunteer",
    status: "verified",
    createdAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    verifiedBy: "Brgy. Barretto",
  },
  {
    id: "r-003",
    type: "power_outage",
    severity: "low",
    barangay: "Mabayuan",
    landmark: "Sitio Maligaya area",
    description: "Walang kuryente simula 9PM. Naka-affect ang halos buong sitio.",
    reporter: "Anonymous",
    reporterRole: "Citizen",
    status: "pending",
    createdAt: new Date(Date.now() - 55 * 60_000).toISOString(),
  },
  {
    id: "r-004",
    type: "landslide",
    severity: "critical",
    barangay: "New Cabalan",
    landmark: "Upland road, KM 4 marker",
    description: "Gumuho ang gilid ng bundok. Walang nasaktan pero sarado ang daan.",
    reporter: "Brgy. Tanod J. Cruz",
    reporterRole: "Volunteer",
    status: "verified",
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
    verifiedBy: "Olongapo PNP",
  },
  {
    id: "r-005",
    type: "road_blocked",
    severity: "moderate",
    barangay: "Asinan",
    landmark: "Asinan St. corner Magsaysay Dr.",
    description: "Naka-park na truck na sira. Hindi makadaan ang ambulansya.",
    reporter: "Lyn S.",
    reporterRole: "Citizen",
    status: "resolved",
    createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
    verifiedBy: "Traffic Mgmt",
  },
  {
    id: "r-006",
    type: "fire",
    severity: "low",
    barangay: "Pag-asa",
    landmark: "Sitio Aeta, near covered court",
    description: "Maliit na bukal ng apoy sa basurahan. Naapula na ng residente.",
    reporter: "Brgy. Pag-asa BFP",
    reporterRole: "LGU",
    status: "resolved",
    createdAt: new Date(Date.now() - 7 * 60 * 60_000).toISOString(),
    verifiedBy: "BFP Olongapo",
  },
]
