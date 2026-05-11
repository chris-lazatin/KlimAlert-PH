// Mock evacuation center dataset for Olongapo City.
// In production, fed from MySQL via a PHP endpoint and refreshed by LGU officers.
export type EvacStatus = "OPEN" | "NEAR_FULL" | "FULL" | "CLOSED"

export interface EvacuationCenter {
  id: string
  name: string
  barangay: string
  address: string
  lat: number
  lng: number
  capacity: number
  occupancy: number
  status: EvacStatus
  facilities: string[]
  manager: string
  contact: string
}

export const EVAC_CENTERS: EvacuationCenter[] = [
  {
    id: "ec-001",
    name: "East Tapinac Covered Court",
    barangay: "East Tapinac",
    address: "Rizal Ave., Brgy. East Tapinac",
    lat: 14.8302,
    lng: 120.286,
    capacity: 250,
    occupancy: 142,
    status: "OPEN",
    facilities: ["Toilets", "Generator", "First-aid"],
    manager: "Brgy. East Tapinac DRRM",
    contact: "(047) 223-3444",
  },
  {
    id: "ec-002",
    name: "Olongapo City National High School Gym",
    barangay: "East Bajac-Bajac",
    address: "18th St., East Bajac-Bajac",
    lat: 14.8348,
    lng: 120.291,
    capacity: 600,
    occupancy: 380,
    status: "OPEN",
    facilities: ["Toilets", "Generator", "Kitchen", "Medical"],
    manager: "DepEd Olongapo",
    contact: "(047) 223-3744",
  },
  {
    id: "ec-003",
    name: "Sta. Rita Multi-Purpose Hall",
    barangay: "Santa Rita",
    address: "Magsaysay Drive, Sta. Rita",
    lat: 14.8421,
    lng: 120.2901,
    capacity: 180,
    occupancy: 175,
    status: "NEAR_FULL",
    facilities: ["Toilets", "First-aid"],
    manager: "Brgy. Santa Rita",
    contact: "(047) 222-5173",
  },
  {
    id: "ec-004",
    name: "Old Cabalan Elementary School",
    barangay: "Old Cabalan",
    address: "National Road, Old Cabalan",
    lat: 14.8558,
    lng: 120.296,
    capacity: 320,
    occupancy: 320,
    status: "FULL",
    facilities: ["Toilets", "Generator"],
    manager: "DepEd · Brgy. Old Cabalan",
    contact: "(047) 603-1700",
  },
  {
    id: "ec-005",
    name: "Gordon College Sports Complex",
    barangay: "East Tapinac",
    address: "Donor St., East Tapinac",
    lat: 14.8329,
    lng: 120.2839,
    capacity: 800,
    occupancy: 210,
    status: "OPEN",
    facilities: ["Toilets", "Generator", "Kitchen", "Medical", "Wi-Fi"],
    manager: "Gordon College DRRMO",
    contact: "(047) 222-4080",
  },
  {
    id: "ec-006",
    name: "Kalaklan Barangay Hall",
    barangay: "Kalaklan",
    address: "Kalaklan Bridge Rd.",
    lat: 14.8225,
    lng: 120.2865,
    capacity: 120,
    occupancy: 90,
    status: "OPEN",
    facilities: ["Toilets", "First-aid"],
    manager: "Brgy. Kalaklan",
    contact: "(047) 224-6983",
  },
  {
    id: "ec-007",
    name: "New Kalalake Covered Court",
    barangay: "New Kalalake",
    address: "Aguinaldo St., New Kalalake",
    lat: 14.8369,
    lng: 120.2795,
    capacity: 200,
    occupancy: 195,
    status: "NEAR_FULL",
    facilities: ["Toilets", "Generator"],
    manager: "Brgy. New Kalalake",
    contact: "(047) 224-8264",
  },
  {
    id: "ec-008",
    name: "Mabayuan Barangay Gymnasium",
    barangay: "Mabayuan",
    address: "Mabayuan Rd.",
    lat: 14.8478,
    lng: 120.281,
    capacity: 280,
    occupancy: 110,
    status: "OPEN",
    facilities: ["Toilets", "Generator", "Kitchen"],
    manager: "Brgy. Mabayuan",
    contact: "(047) 602-3900",
  },
  {
    id: "ec-009",
    name: "Barretto Public Plaza",
    barangay: "Barretto",
    address: "National Hwy., Barretto",
    lat: 14.8665,
    lng: 120.2742,
    capacity: 150,
    occupancy: 0,
    status: "CLOSED",
    facilities: ["Toilets"],
    manager: "Brgy. Barretto",
    contact: "(047) 222-4295",
  },
]

export function getAvailableCenters(): EvacuationCenter[] {
  // Per instructor's directive: only show evacuation centers that are AVAILABLE.
  // We exclude FULL and CLOSED.
  return EVAC_CENTERS.filter((c) => c.status === "OPEN" || c.status === "NEAR_FULL")
}

export const STATUS_META: Record<EvacStatus, { label: string; color: string; ring: string; dot: string }> = {
  OPEN: {
    label: "Open",
    color: "text-emerald-300",
    ring: "border-emerald-500/40 bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  NEAR_FULL: {
    label: "Near full",
    color: "text-amber-300",
    ring: "border-amber-500/40 bg-amber-500/10",
    dot: "bg-amber-400",
  },
  FULL: {
    label: "Full",
    color: "text-red-300",
    ring: "border-red-500/40 bg-red-500/10",
    dot: "bg-red-400",
  },
  CLOSED: {
    label: "Closed",
    color: "text-zinc-400",
    ring: "border-zinc-700 bg-zinc-800",
    dot: "bg-zinc-500",
  },
}