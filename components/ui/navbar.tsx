"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#roles", label: "For who" },
  { href: "#testimonials", label: "Voices" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 pt-4">
      <nav
        className={cn(
          "max-w-6xl mx-auto flex items-center justify-between h-14 px-3 pr-3 md:pr-2 rounded-full border transition-all duration-300",
          scrolled
            ? "bg-zinc-950/80 border-zinc-800/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            : "bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md",
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 pl-3 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <ShieldAlert className="h-4 w-4 text-zinc-950" strokeWidth={2.5} />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
            </span>
          </span>
          <span className="font-display text-base font-semibold text-zinc-100 tracking-tight">
            KlimAlert<span className="text-emerald-400"> PH</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 text-sm rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm rounded-full text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="ml-1 px-4 py-2 text-sm rounded-full bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Get started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-full text-zinc-300 hover:bg-zinc-800/60 transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "md:hidden max-w-6xl mx-auto overflow-hidden transition-all duration-300",
          open ? "max-h-[400px] opacity-100 mt-2" : "max-h-0 opacity-0",
        )}
      >
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl p-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-zinc-800/80 my-1" />
          <Link
            href="/login"
            className="px-4 py-2.5 text-sm rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2.5 text-sm rounded-xl bg-zinc-100 text-zinc-900 font-medium text-center hover:bg-white transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
