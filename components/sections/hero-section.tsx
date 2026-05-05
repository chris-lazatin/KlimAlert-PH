"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import { ArrowRight, Radio, MapPin, Waves, Wind, AlertTriangle, ShieldCheck, Activity } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Ambient grid + glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.04),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center,black 30%,transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center,black 30%,transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto w-full">
        {/* LEFT — copy */}
        <div className="lg:col-span-7 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 mb-7"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium text-zinc-300 tracking-wide">
              SDG 13 · Climate Action · Live PAGASA feed
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-balance"
          >
            <span className="text-zinc-100 block">Disaster ready.</span>
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Barangay smart.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed text-pretty"
          >
            Hyper-local typhoon and flood alerts, an evacuation map that only shows centers with capacity, and
            community-driven hazard reports — built for every Filipino, every barangay.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4"
          >
            <Link href="/register">
              <LiquidCtaButton>Get started — it&apos;s free</LiquidCtaButton>
            </Link>
            <Link
              href="#how-it-works"
              className="group flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              <span>See how it works</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center lg:justify-start justify-center gap-x-6 gap-y-3"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
              <span>PAGASA data feed</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <MapPin className="h-4 w-4 text-emerald-400/80" />
              <span>Google Maps evacuation map</span>
            </div>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Activity className="h-4 w-4 text-emerald-400/80" />
              <span>AI-assisted preparedness</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Live Alert Console */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <AlertConsole />
        </motion.div>
      </div>
    </section>
  )
}

function AlertConsole() {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/20 via-transparent to-amber-500/10 blur-3xl rounded-[3rem]" />
      <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-900/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Window bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/60">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="flex-1 mx-3 flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-900/80 border border-zinc-800 rounded-md px-2.5 py-1">
            <Radio className="h-3 w-3 text-emerald-400" />
            <span className="truncate">klimalert.ph / barangay-east-tapinac</span>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
            LIVE
          </span>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Top alert */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                  <AlertTriangle className="h-3 w-3" /> Signal #2 — Typhoon
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">2 min ago</span>
            </div>
            <p className="text-sm text-zinc-200 leading-snug">
              Tropical Storm <span className="font-semibold">&quot;Crising&quot;</span> approaching Zambales. Flood risk
              <span className="text-amber-300 font-semibold"> high</span> in the next 6 hours.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <ConsoleStat icon={<Waves className="h-4 w-4" />} label="Flood" value="HIGH" tone="amber" />
            <ConsoleStat icon={<Wind className="h-4 w-4" />} label="Wind" value="85kph" tone="zinc" />
            <ConsoleStat icon={<MapPin className="h-4 w-4" />} label="Centers" value="7 open" tone="emerald" />
          </div>

          {/* Live feed */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-semibold text-zinc-300 tracking-wide uppercase">Community feed</p>
              <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                3 new
              </span>
            </div>
            <ul className="space-y-2">
              <FeedItem
                tone="amber"
                title="Knee-deep flooding on Rizal Ave."
                meta="Brgy. Sta. Rita · 4 min ago · verified"
              />
              <FeedItem tone="emerald" title="Evac center: GC Gym now open" meta="Brgy. East Tapinac · 7 min ago" />
              <FeedItem tone="zinc" title="Fallen tree blocking narrow road" meta="Brgy. New Cabalan · 12 min ago" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConsoleStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: "amber" | "emerald" | "zinc"
}) {
  const tones = {
    amber: "border-amber-500/30 bg-amber-500/[0.06] text-amber-300",
    emerald: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300",
    zinc: "border-zinc-800 bg-zinc-900/60 text-zinc-300",
  } as const
  return (
    <div className={`rounded-xl border ${tones[tone]} px-3 py-2.5`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
        <span className="text-zinc-500">{icon}</span>
        {label}
      </div>
      <p className={`font-display text-base font-bold leading-none`}>{value}</p>
    </div>
  )
}

function FeedItem({ tone, title, meta }: { tone: "amber" | "emerald" | "zinc"; title: string; meta: string }) {
  const dot = {
    amber: "bg-amber-400",
    emerald: "bg-emerald-400",
    zinc: "bg-zinc-500",
  }[tone]
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dot} shrink-0`} />
      <div className="min-w-0">
        <p className="text-[12.5px] text-zinc-200 leading-snug truncate">{title}</p>
        <p className="text-[10.5px] text-zinc-500">{meta}</p>
      </div>
    </li>
  )
}
