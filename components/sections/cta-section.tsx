"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Check } from "lucide-react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"

const points = ["Free for residents, forever", "Filipino & English support", "Works on any device"]

export function CtaSection() {
  return (
    <section className="relative px-6 py-32">
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[110%] h-[120%] bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_55%)] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse at center,black 30%,transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center,black 30%,transparent 75%)",
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-300 tracking-wide">Now in beta · Olongapo pilot</span>
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold text-zinc-100 mb-5 tracking-tight text-balance leading-[1.05]">
              The next typhoon is coming.
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Will your barangay be ready?
              </span>
            </h2>

            <p className="text-base md:text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
              Join the Filipinos turning disaster preparedness into a daily habit. Sign up today — it&apos;s built for
              you, by one of you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/register">
                <LiquidCtaButton>Get started — it&apos;s free</LiquidCtaButton>
              </Link>
              <Link
                href="#features"
                className="group flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                <span>Explore features</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {points.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  {p}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
