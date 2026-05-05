import type React from "react"
import type { Metadata, Viewport } from "next"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/providers/lenis-provider"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "KlimAlert PH — Community-Based Disaster Preparedness & Alert System",
  description:
    "Hyper-local, real-time disaster alerts, evacuation routing, and community hazard reporting for Filipino barangays. Aligned with SDG 13: Climate Action.",
  generator: "v0.app",
  keywords: [
    "KlimAlert PH",
    "disaster preparedness",
    "Philippines",
    "PAGASA",
    "evacuation centers",
    "hazard reporting",
    "barangay",
    "SDG 13",
    "climate action",
  ],
  authors: [{ name: "Christopher V. Lazatin" }],
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-zinc-950">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}>
        <LenisProvider>
          {children}
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  )
}
