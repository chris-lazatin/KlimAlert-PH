"use client"

import { motion } from "motion/react"
import { Users, Megaphone, Building2, Shield } from "lucide-react"

const roles = [
  {
    icon: Users,
    title: "Citizens & Families",
    tagline: "Stay one step ahead, in your language.",
    bullets: [
      "Real-time alerts for your exact barangay",
      "Bilingual preparedness guides (FIL / EN)",
      "Find evacuation centers with open capacity",
      "Quick-dial emergency hotlines",
    ],
  },
  {
    icon: Megaphone,
    title: "Volunteers & Reporters",
    tagline: "Turn what you see into action.",
    bullets: [
      "Submit hazard reports with photo & location",
      "Crowd-verify reports from your neighbors",
      "Share live updates on rising water, traffic, etc.",
      "Build a trusted reporting reputation",
    ],
  },
  {
    icon: Building2,
    title: "LGU & Response Officers",
    tagline: "Coordinate with eyes on every street.",
    bullets: [
      "Live monitoring dashboard for your area",
      "Broadcast targeted alerts to specific zones",
      "Verify or dismiss community reports",
      "Track evacuation centers & resources",
    ],
    highlighted: true,
  },
  {
    icon: Shield,
    title: "System Administrators",
    tagline: "Keep the network safe & accountable.",
    bullets: [
      "Role-based access control",
      "Full audit trail of alerts & reports",
      "Configure alert levels & geofencing",
      "Disaster-proof backup & recovery",
    ],
  },
]

export function RolesSection() {
  return (
    <section id="roles" className="relative px-6 py-28 border-y border-zinc-900/80">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.18em] mb-4">Built for everyone</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight text-balance">
            Four roles. One unified disaster response loop.
          </h2>
          <p className="text-zinc-500 text-base md:text-lg leading-relaxed text-pretty">
            Whether you&apos;re a resident, a volunteer, an LGU officer, or IT staff — KlimAlert PH adapts to your
            responsibilities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role, i) => {
            const isHero = role.highlighted
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group relative rounded-2xl border p-6 flex flex-col h-full overflow-hidden transition-all duration-300 ${
                  isHero
                    ? "bg-gradient-to-b from-emerald-500/[0.08] to-zinc-900/40 border-emerald-500/30 hover:border-emerald-400/50"
                    : "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-900/60"
                }`}
              >
                {isHero && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5">
                    Most active
                  </span>
                )}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                    isHero
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                      : "bg-zinc-800/80 border border-zinc-800 text-zinc-300"
                  }`}
                >
                  <role.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>

                <h3 className="font-heading text-lg font-semibold text-zinc-100 mb-1.5">{role.title}</h3>
                <p className={`text-sm mb-5 ${isHero ? "text-emerald-200/70" : "text-zinc-500"}`}>{role.tagline}</p>

                <ul className="space-y-2.5 mt-auto">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span
                        className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                          isHero ? "bg-emerald-400" : "bg-zinc-600"
                        }`}
                      />
                      <span className="text-[13px] text-zinc-400 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
