"use client"

import { motion } from "motion/react"

const metrics = [
  { value: "20", suffix: "/yr", label: "Typhoons hit the PH", description: "Per PAGASA, year after year" },
  { value: "4th", suffix: "", label: "Most climate-affected", description: "Global Climate Risk Index" },
  { value: "16M", suffix: "+", label: "Lives affected by Yolanda", description: "NDRRMC, 2013" },
  { value: "100%", suffix: "", label: "Preventable with prep", description: "Why KlimAlert PH exists" },
]

export function ImpactSection() {
  return (
    <section className="relative px-6 py-28 border-y border-zinc-900/80 bg-zinc-950">
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.18em] mb-4">The reality</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight text-balance">
            We are fighting 21st-century typhoons with dial-up infrastructure.
          </h2>
          <p className="text-zinc-500 text-base md:text-lg leading-relaxed text-pretty">
            The Philippines is one of the world&apos;s most disaster-prone nations. Most casualties are not bad luck —
            they are bad information. KlimAlert PH closes that gap.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-800/60">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative bg-zinc-950 p-7 md:p-9 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/0 to-emerald-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <p className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mb-2 leading-none">
                  {metric.value}
                  <span className="text-emerald-400">{metric.suffix}</span>
                </p>
                <p className="text-sm font-medium text-zinc-300 mb-1.5">{metric.label}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
