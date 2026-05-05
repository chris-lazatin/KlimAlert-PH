import { Navbar } from "@/components/ui/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { ImpactSection } from "@/components/sections/impact-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { RolesSection } from "@/components/sections/roles-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { CtaSection } from "@/components/sections/cta-section"
import { FooterSection } from "@/components/sections/footer-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 overflow-hidden">
      <Navbar />
      <HeroSection />
      <ImpactSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RolesSection />
      <TestimonialsSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
