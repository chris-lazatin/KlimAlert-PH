import Link from "next/link"
import { Github, Facebook, Mail, ShieldAlert } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "For who", href: "#roles" },
    { label: "Voices", href: "#testimonials" },
  ],
  resources: [
    { label: "Preparedness Guide", href: "https://www.gfdrr.org/en/feature-story/protecting-lives-and-property-disaster-risk-philippines" },
    { label: "Emergency Hotlines", href: "https://olongapocity.gov.ph/emergency-hotlines/" },
    { label: "PAGASA Live", href: "https://www.pagasa.dost.gov.ph" },
    { label: "NDRRMC", href: "https://ndrrmc.gov.ph" },
  ],
  legal: [
    { label: "Privacy", href: "https://www.pdc.org/privacy-policy-disaster-alert/" },
    { label: "Terms", href: "https://lawphil.net/statutes/repacts/ra2010/ra_10121_2010.html" },
    { label: "Data ethics", href: "https://www.preventionweb.net/news/ethics-data-disaster-management-and-crisis-operations" },
  ],
}

export function FooterSection() {
  return (
    <footer className="relative px-6 pt-20 pb-10 border-t border-zinc-900 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <ShieldAlert className="h-4 w-4 text-zinc-950" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-semibold text-zinc-100 tracking-tight">
                KlimAlert<span className="text-emerald-400"> PH</span>
              </span>
            </Link>
            <p className="mt-5 text-sm text-zinc-500 max-w-sm leading-relaxed">
              A community-based disaster preparedness &amp; alert system for Filipino barangays. Built as a capstone
              project at Gordon College — Olongapo City.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-300 tracking-wide">
                Aligned with SDG 13 · Climate Action
              </span>
            </div>
          </div>

          <FooterColumn title="Product" links={footerLinks.product} />
          <FooterColumn title="Resources" links={footerLinks.resources} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} KlimAlert PH · Christopher V. Lazatin · BSIT 2A, Gordon College.
          </p>
          <div className="flex items-center gap-2">
            <SocialIcon href="https://share.google/PLonPjp37xSIZs2tO" label="Email">
              <Mail className="w-4 h-4" />
            </SocialIcon>
            <SocialIcon href="https://www.facebook.com/" label="Facebook">
              <Facebook className="w-4 h-4" />
            </SocialIcon>
            <SocialIcon href="https://github.com/" label="GitHub">
              <Github className="w-4 h-4" />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div>
      <h4 className="font-heading text-xs font-semibold text-zinc-300 uppercase tracking-[0.15em] mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex items-center justify-center h-9 w-9 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all"
    >
      {children}
    </Link>
  )
}
