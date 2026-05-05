"use client"

import { motion } from "motion/react"
import {
  Bell,
  MapPin,
  AlertTriangle,
  PhoneCall,
  BookOpen,
  Sparkles,
  CheckCircle2,
  CircleDashed,
  XCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.18em] mb-4">Core features</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight text-balance">
            Everything a barangay needs, in one calm interface.
          </h2>
          <p className="text-zinc-500 text-base md:text-lg leading-relaxed text-pretty">
            Five core MVPs that cover the full disaster response loop — alert, navigate, report, contact, and prepare.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3.5">
          {/* 1 — Real-time Alerts (wide) */}
          <BentoCard delay={0.05} className="md:col-span-4">
            <CardHeader icon={<Bell className="h-5 w-5" />} title="Real-Time Disaster Alerts" />
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              Hyper-local alerts pulled from PAGASA — typhoons, floods, earthquakes — filtered to your exact barangay.
              No noise. Just what matters, the moment it matters.
            </p>
            <AlertsPreview />
          </BentoCard>

          {/* 2 — Evacuation Map (medium) */}
          <BentoCard delay={0.1} className="md:col-span-2">
            <CardHeader icon={<MapPin className="h-5 w-5" />} title="Evacuation Map" />
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              Only shows centers with capacity. No more arriving at a full shelter.
            </p>
            <MapPreview />
          </BentoCard>

          {/* 3 — Hazard Reporting (medium) */}
          <BentoCard delay={0.15} className="md:col-span-2">
            <CardHeader icon={<AlertTriangle className="h-5 w-5" />} title="Hazard Reporting" />
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              See a flood, fallen tree, or blocked road? Report it in two taps with photo &amp; location.
            </p>
            <ReportPreview />
          </BentoCard>

          {/* 4 — AI Preparedness (wide) */}
          <BentoCard delay={0.2} className="md:col-span-4">
            <CardHeader icon={<Sparkles className="h-5 w-5" />} title="KlimaBot — AI Preparedness Assistant" badge="New" />
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              An AI assistant that answers questions in Filipino or English — emergency kit checklists, evacuation
              procedures, and what to do during a typhoon. Always on. Always patient.
            </p>
            <ChatPreview />
          </BentoCard>

          {/* 5 — Emergency Contacts (medium) */}
          <BentoCard delay={0.25} className="md:col-span-3">
            <CardHeader icon={<PhoneCall className="h-5 w-5" />} title="Emergency Contacts" />
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              One-tap dialing to your local LGU, rescue, police, fire — sorted by your barangay automatically.
            </p>
            <ContactsPreview />
          </BentoCard>

          {/* 6 — Preparedness Guide (medium) */}
          <BentoCard delay={0.3} className="md:col-span-3">
            <CardHeader icon={<BookOpen className="h-5 w-5" />} title="Preparedness Guide" />
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              Bilingual safety guides — Filipino &amp; English — for typhoons, floods, and earthquakes. So your lola
              doesn&apos;t need Google Translate.
            </p>
            <GuidePreview />
          </BentoCard>
        </div>
      </div>
    </section>
  )
}

/* ---------- Building blocks ---------- */

function BentoCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <Card className="group h-full overflow-hidden border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/70 hover:bg-zinc-900/60 transition-all duration-300 rounded-2xl backdrop-blur-sm">
        <CardContent className="p-6 flex flex-col h-full">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

function CardHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/15 transition-colors">
        {icon}
      </div>
      <p className="font-heading font-semibold text-zinc-100 text-[15px]">{title}</p>
      {badge && (
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </div>
  )
}

/* ---------- Inline previews ---------- */

function AlertsPreview() {
  const items = [
    { tone: "amber", title: "Typhoon Crising · Signal #2", meta: "Brgy. East Tapinac · 2 min ago" },
    { tone: "rose", title: "Flash flood warning — next 6h", meta: "Olongapo · just now" },
    { tone: "emerald", title: "All clear · Magnitude 3.1 quake", meta: "Subic · 14 min ago" },
  ] as const
  const tones = {
    amber: "border-amber-500/30 bg-amber-500/[0.06] text-amber-300",
    rose: "border-rose-500/30 bg-rose-500/[0.06] text-rose-300",
    emerald: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300",
  }
  return (
    <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
      {items.map((it, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.08 }}
          className={`flex items-center gap-3 rounded-lg border ${tones[it.tone]} px-3 py-2`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-zinc-100 truncate font-medium">{it.title}</p>
            <p className="text-[10.5px] text-zinc-500">{it.meta}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function MapPreview() {
  return (
    <div className="mt-auto relative rounded-xl border border-zinc-800 bg-emerald-950/20 overflow-hidden h-44">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.08) 1px,transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Roads */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-zinc-700/60" />
      <div className="absolute top-2/3 left-0 right-0 h-px bg-zinc-700/60" />
      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-zinc-700/60" />
      <div className="absolute top-0 bottom-0 left-2/3 w-px bg-zinc-700/60" />

      {/* Available pins (green) */}
      <Pin x="22%" y="28%" tone="emerald" pulsing />
      <Pin x="68%" y="40%" tone="emerald" />
      <Pin x="48%" y="68%" tone="emerald" />
      {/* Full pin (greyed/disabled) */}
      <Pin x="80%" y="78%" tone="muted" />

      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-[10px] text-zinc-400 bg-zinc-950/70 backdrop-blur rounded-md px-2 py-1.5 border border-zinc-800">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-zinc-600" /> Full / hidden
        </span>
      </div>
    </div>
  )
}

function Pin({ x, y, tone, pulsing }: { x: string; y: string; tone: "emerald" | "muted"; pulsing?: boolean }) {
  const color = tone === "emerald" ? "bg-emerald-400" : "bg-zinc-600"
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      {pulsing && (
        <span className={`absolute inset-0 rounded-full ${color} opacity-40 animate-ping h-3 w-3 -m-0.5`} />
      )}
      <span
        className={`relative block h-3 w-3 rounded-full ${color} ring-2 ring-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
      />
    </div>
  )
}

function ReportPreview() {
  return (
    <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">New Report</p>
        <span className="text-[10px] text-emerald-300">2/2 taps</span>
      </div>
      <div className="space-y-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-[12.5px] text-zinc-300">
          Knee-deep flooding on Rizal Ave.
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["Flood", "Tree", "Road"].map((tag, i) => (
            <span
              key={tag}
              className={`text-[10.5px] text-center rounded-md py-1.5 border ${
                i === 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10.5px] text-zinc-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> auto-located
          </span>
          <span className="text-[10.5px] font-semibold text-emerald-300">Submit ›</span>
        </div>
      </div>
    </div>
  )
}

function ChatPreview() {
  return (
    <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2.5">
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-zinc-100 text-zinc-900 px-3.5 py-2 text-[12.5px]">
          Ano ang dapat kong i-pack sa go-bag para sa bagyo?
        </div>
      </div>
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px] font-semibold text-emerald-300 shrink-0">
          K
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 text-zinc-200 px-3.5 py-2 text-[12.5px] leading-relaxed">
          Mahalaga ang go-bag. I-pack: 3 araw na tubig, de-latang pagkain, flashlight, first-aid kit, IDs sa
          waterproof bag, at extra na damit.
        </div>
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.2s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.4s]" />
        <span className="text-[10.5px] text-zinc-500 ml-1">KlimaBot is typing…</span>
      </div>
    </div>
  )
}

function ContactsPreview() {
  const contacts = [
    { name: "LGU Olongapo", number: "(047) 222-2222" },
    { name: "BFP — Fire", number: "(047) 222-7777" },
    { name: "PNP — Police", number: "117" },
  ]
  return (
    <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-2 space-y-1.5">
      {contacts.map((c) => (
        <div
          key={c.name}
          className="flex items-center justify-between rounded-lg bg-zinc-900/60 border border-zinc-800/60 px-3 py-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
              <PhoneCall className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[12.5px] text-zinc-100 leading-tight">{c.name}</p>
              <p className="text-[10.5px] text-zinc-500 leading-tight">{c.number}</p>
            </div>
          </div>
          <span className="text-[10.5px] font-semibold text-emerald-300">Tap to call</span>
        </div>
      ))}
    </div>
  )
}

function GuidePreview() {
  const steps = [
    { state: "done", label: "Subaybayan ang balita" },
    { state: "done", label: "Ihanda ang go-bag" },
    { state: "current", label: "Alamin ang evac route" },
    { state: "todo", label: "I-secure ang bahay" },
  ] as const
  return (
    <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-2.5">
          {s.state === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {s.state === "current" && <CircleDashed className="h-4 w-4 text-amber-400 animate-spin-slow shrink-0" />}
          {s.state === "todo" && <XCircle className="h-4 w-4 text-zinc-700 shrink-0" />}
          <span
            className={`text-[12.5px] ${
              s.state === "done" ? "text-zinc-400 line-through" : s.state === "current" ? "text-zinc-100" : "text-zinc-500"
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}
