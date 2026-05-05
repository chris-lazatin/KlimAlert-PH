"use client"

import { motion } from "motion/react"
import { UserPlus, Bell, Map, MessageSquare } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Sign up & locate",
    desc: "Create your account and pin your barangay. We use it to filter every alert and resource to your exact area.",
  },
  {
    icon: Bell,
    title: "Get alerts that matter",
    desc: "PAGASA-driven typhoon, flood, and quake warnings — delivered the moment your barangay is at risk, not after.",
  },
  {
    icon: Map,
    title: "Navigate to safety",
    desc: "Open the live evacuation map. We only show centers with available capacity, so you never arrive to a full shelter.",
  },
  {
    icon: MessageSquare,
    title: "Report & help neighbors",
    desc: "See a hazard? Tap to report. Ask KlimaBot anything in Filipino or English. Every resident becomes a sensor.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-6 py-28 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.18em] mb-4">How it works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight text-balance">
            Four steps from sign-up to safer streets.
          </h2>
          <p className="text-zinc-500 text-base md:text-lg leading-relaxed text-pretty">
            Designed so any Filipino — from BSIT student to your lola — can use it the first time, without a manual.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* connector line */}
          <div className="hidden md:block absolute top-[44px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                {/* Number badge */}
                <div className="relative z-10 flex items-center justify-center h-[88px]">
                  <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-[0_8px_30px_-10px_rgba(16,185,129,0.4)]">
                    <step.icon className="h-6 w-6 text-emerald-400" strokeWidth={1.75} />
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-500 text-zinc-950 text-[11px] font-bold flex items-center justify-center ring-4 ring-zinc-950">
                      {i + 1}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-lg font-semibold text-zinc-100 mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed text-pretty">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
