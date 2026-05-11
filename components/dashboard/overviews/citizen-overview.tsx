"use client"

// Citizen overview: read-first dashboard focused on staying informed and safe.
// Mirrors MVP §1 (Disaster Alerts, Preparedness Guide, Safe Zone & Evacuation
// Map, Emergency Contact Access).

import { Activity, Megaphone, ShieldAlert, Users } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  EmergencyContactsCard,
  EvacuationMapCard,
  LiveAlertsCard,
  OpenCentersCard,
  PrimaryActionLink,
  SecondaryActionLink,
  StatGrid,
  WeatherCard,
  WelcomeHeader,
  type Stat,
} from "./shared"

const STATS: Stat[] = [
  { label: "Active alerts", value: "2", trend: "+1", icon: Activity, tone: "amber" },
  { label: "Open evac centers", value: "6", trend: "of 9", icon: ShieldAlert, tone: "emerald" },
  { label: "Reports today", value: "14", trend: "+4", icon: Megaphone, tone: "zinc" },
  { label: "Verified residents", value: "8.2k", trend: "Olongapo", icon: Users, tone: "zinc" },
]

export function CitizenOverview() {
  const { user } = useAuth()
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null)
  const firstName = (user?.name ?? "Resident").split(" ")[0]
  const barangay = user?.barangay ?? "East Tapinac"

  return (
    <div className="space-y-6">
      <WelcomeHeader
        kicker="Mainit ang panahon ngayon"
        title={`Kumusta, ${firstName}.`}
        subtitle={
          <>
            Heto ang kasalukuyang preparedness status para sa{" "}
            <span className="text-zinc-200 font-medium">Brgy. {barangay}</span>.
          </>
        }
        actions={
          <>
            <SecondaryActionLink href="https://www.pagasa.dost.gov.ph/weather" external>
              View weather
            </SecondaryActionLink>
            <PrimaryActionLink href="/dashboard/reports#report" icon={Megaphone}>
              Report hazard
            </PrimaryActionLink>
          </>
        }
      />

      <StatGrid stats={STATS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <LiveAlertsCard />
        </div>
        <WeatherCard />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <EvacuationMapCard selectedId={selectedCenter} onSelect={setSelectedCenter} />
        </div>
        <OpenCentersCard limit={10} selectedId={selectedCenter} onSelect={setSelectedCenter} />
      </section>

      <EmergencyContactsCard />
    </div>
  )
}
