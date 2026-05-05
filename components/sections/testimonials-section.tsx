"use client"

import { motion } from "motion/react"
import { TestimonialsColumn } from "@/components/ui/testimonials-column"

const testimonials = [
  {
    text: "Noong Yolanda, walang nakapagsabi sa amin na lalakas. Sa KlimAlert, alam ko na 6 hours bago dumating ang flood. Iyon na ang pagkakaiba ng buhay at kamatayan.",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop&crop=face",
    name: "Aling Marites Dela Cruz",
    role: "Resident · Brgy. Sta. Rita",
  },
  {
    text: "Bilang barangay kagawad, dati naghahabol kami ng impormasyon. Ngayon, nakikita ko sa dashboard kung saan may baha, kung sino ang kailangan ng tulong, lahat real-time.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    name: "Kgd. Roberto Santiago",
    role: "Brgy. Kagawad · East Tapinac",
  },
  {
    text: "The evacuation map only showing centers with capacity is genius. We used to send families to full shelters during storms. That single feature is a game-changer.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face",
    name: "Engr. Cristina Ramos",
    role: "MDRRMO · Olongapo City",
  },
  {
    text: "Madali lang gamitin kahit ng nanay ko. Filipino ang sagot ng KlimaBot, kaya hindi siya natatakot magtanong. First app na hindi niya pinakiusap akong i-translate.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    name: "Janella Mendoza",
    role: "BSIT student · Gordon College",
  },
  {
    text: "I report a fallen tree, my neighbor verifies it, and 3 minutes later the LGU dispatched a team. The community-verification loop actually works.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    name: "Mark Aguilar",
    role: "Volunteer Reporter · Subic",
  },
  {
    text: "Hyper-local talaga. Sa app, lalabas lang ang alerto kung talagang aabot ang bagyo sa amin. Hindi na kami nasanay sa false alarms.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    name: "Aling Liza Garcia",
    role: "Resident · Brgy. New Cabalan",
  },
  {
    text: "As a senior citizen, the one-tap emergency hotline saved my husband during a heart attack last typhoon. No fumbling with numbers in a panic.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
    name: "Lola Cora Bautista",
    role: "Resident · Brgy. Banicain",
  },
  {
    text: "Bilang IT admin sa LGU, ang audit trail ay napaka-importante. Nakikita namin ang bawat alert at report — accountable lahat.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    name: "Jomar Villanueva",
    role: "IT Admin · LGU Olongapo",
  },
  {
    text: "Hindi pa kami swerte na masyadong gumamit. Pero alam naming nasa kamay namin kung sakaling kailangan. That peace of mind is everything.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    name: "Patricia Reyes",
    role: "Mother of three · Olongapo",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

const partners = ["PAGASA", "NDRRMC", "MDRRMO", "DICT", "DOST", "Gordon College"]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative px-6 py-28 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.18em] mb-4">Voices from the field</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-zinc-100 text-center tracking-tight text-balance">
            From Aling Marites to the MDRRMO.
          </h2>
          <p className="text-center mt-4 text-zinc-500 text-base md:text-lg leading-relaxed text-pretty">
            Real Filipinos. Real disasters. Real preparedness.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[700px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={20} />
        </div>

        <div className="mt-16 pt-12 border-t border-zinc-800/50">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-500 mb-8">
            Aligned with national agencies & local partners
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <motion.div
              className="flex gap-12 md:gap-20"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ x: { duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "linear" } }}
            >
              {[...partners, ...partners].map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="font-display text-xl md:text-2xl font-semibold text-zinc-700 whitespace-nowrap flex-shrink-0 tracking-tight"
                >
                  {p}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
