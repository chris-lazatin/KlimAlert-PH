// Bilingual disaster preparedness guides for KlimAlert PH
// Content based on PAGASA, NDRRMC, Philippine Red Cross & PHIVOLCS guidance.

import { Wind, Mountain, Waves, Flame, Anchor, CloudRain, type LucideIcon } from "lucide-react"

export type Locale = "en" | "fil"

export type GuidePhase = {
  before: string[]
  during: string[]
  after: string[]
}

export type Guide = {
  id: string
  icon: LucideIcon
  category: "Typhoon" | "Earthquake" | "Flood" | "Fire" | "Tsunami" | "Landslide"
  duration: string // e.g. "5 min read"
  title: { en: string; fil: string }
  shortDesc: { en: string; fil: string }
  emergencyTip: { en: string; fil: string }
  sections: { en: GuidePhase; fil: GuidePhase }
  authority: string // PAGASA, PHIVOLCS, BFP, etc.
}

export const GUIDES: Guide[] = [
  {
    id: "typhoon",
    icon: Wind,
    category: "Typhoon",
    duration: "5 min read",
    authority: "PAGASA · NDRRMC",
    title: { en: "Typhoon Preparedness", fil: "Paghahanda sa Bagyo" },
    shortDesc: {
      en: "What to do before, during, and after a typhoon hits your barangay.",
      fil: "Ano ang dapat gawin bago, habang, at pagkatapos ng bagyo sa inyong barangay.",
    },
    emergencyTip: {
      en: "If signal No. 4 or 5 is raised, evacuate to the nearest open evacuation center immediately.",
      fil: "Kung Signal No. 4 o 5, lumikas agad sa pinakamalapit na bukas na evacuation center.",
    },
    sections: {
      en: {
        before: [
          "Monitor PAGASA bulletins every 6 hours; note your area's storm signal.",
          "Prepare a Go Bag: 3-day food/water, medicine, flashlight, batteries, IDs, cash.",
          "Charge phones, power banks, and battery-powered radios.",
          "Trim tree branches near your roof; secure loose galvanized iron sheets.",
          "Move appliances and important documents to higher floors or shelves.",
          "Identify your nearest open evacuation center inside KlimAlert PH.",
        ],
        during: [
          "Stay indoors, away from windows and glass doors.",
          "Turn off main electricity if water starts entering your home.",
          "Do not cross flooded streets; even 6 inches can knock you down.",
          "Listen to PAGASA updates via radio — do not rely on rumors.",
          "If an evacuation order is issued, leave immediately. Do not wait.",
          "Keep your phone for emergencies only; conserve battery.",
        ],
        after: [
          "Wait for an official 'all clear' from your barangay before leaving shelter.",
          "Avoid downed power lines and floodwaters — they may be electrified or contaminated.",
          "Inspect your home for structural damage before re-entering.",
          "Boil drinking water for at least 3 minutes; flood water carries leptospirosis.",
          "Report damage and casualties to your barangay or via KlimAlert PH.",
          "Help neighbors, especially seniors and persons with disabilities.",
        ],
      },
      fil: {
        before: [
          "Sundan ang PAGASA bulletins kada 6 oras; tandaan ang storm signal ng inyong lugar.",
          "Maghanda ng Go Bag: 3-araw na pagkain/tubig, gamot, flashlight, baterya, IDs, pera.",
          "I-charge ang mga cellphone, power bank, at battery-powered na radyo.",
          "Putulin ang mga sanga ng puno na malapit sa bubong; ipakô ang yero.",
          "Ilipat sa mas mataas na lugar ang appliances at mahahalagang dokumento.",
          "Tingnan sa KlimAlert PH ang pinakamalapit na bukas na evacuation center.",
        ],
        during: [
          "Manatili sa loob ng bahay, malayo sa bintana at salamin.",
          "I-off ang main electrical switch kapag may pumapasok na tubig.",
          "Huwag tumawid sa baha; kayang tumumba ng 6 pulgada lang na tubig.",
          "Makinig sa PAGASA via radyo — huwag maniwala sa tsismis.",
          "Kapag inutusan na lumikas, lumikas agad. Huwag maghintay.",
          "Gamitin ang phone sa emergency lang; tipirin ang baterya.",
        ],
        after: [
          "Hintayin ang opisyal na 'all clear' mula sa barangay bago lumabas.",
          "Iwasan ang mga bumagsak na linya ng kuryente at baha — maaaring may kuryente o mikrobyo.",
          "Suriin ang bahay kung ligtas pa bago bumalik.",
          "Pakuluan ang inuming tubig ng 3 minuto; may leptospirosis sa baha.",
          "I-report ang sira at nasawi sa barangay o sa KlimAlert PH.",
          "Tulungan ang kapitbahay, lalo na ang matatanda at PWD.",
        ],
      },
    },
  },
  {
    id: "earthquake",
    icon: Mountain,
    category: "Earthquake",
    duration: "4 min read",
    authority: "PHIVOLCS",
    title: { en: "Earthquake Safety", fil: "Kaligtasan sa Lindol" },
    shortDesc: {
      en: "Drop, cover, and hold on. Learn the right response when the ground shakes.",
      fil: "Yumuko, magtago, kumapit. Alamin ang tamang gawin kapag yumayanig.",
    },
    emergencyTip: {
      en: "Drop. Cover. Hold on. Stay there until shaking stops — do not run outside.",
      fil: "Yumuko. Magtago. Kumapit. Manatili hanggang tumigil ang yanig — huwag tumakbo palabas.",
    },
    sections: {
      en: {
        before: [
          "Identify safe spots in each room: under sturdy tables, against interior walls.",
          "Anchor heavy furniture, mirrors, and water heaters to walls.",
          "Keep heavy items on lower shelves; never above beds.",
          "Practice 'Drop, Cover, Hold On' with your family every quarter.",
          "Prepare a 72-hour emergency kit with food, water, and a whistle.",
        ],
        during: [
          "Drop to your hands and knees. Cover your head and neck. Hold on to a sturdy shelter.",
          "If indoors, stay inside; do NOT run outside during shaking.",
          "If outside, move to an open area away from buildings, trees, and power lines.",
          "If driving, pull over away from overpasses; stay inside the vehicle.",
          "If trapped, tap on a pipe so rescuers can hear you. Conserve oxygen.",
        ],
        after: [
          "Expect aftershocks — they can be as strong as the main quake.",
          "Check for injuries; provide first aid before leaving the area.",
          "Inspect for gas leaks (smell test) and structural damage before re-entry.",
          "Do not use elevators. Use stairs and watch for cracks.",
          "Tune in to PHIVOLCS announcements; follow tsunami warnings if near coast.",
        ],
      },
      fil: {
        before: [
          "Alamin ang ligtas na lugar sa bawat kwarto: sa ilalim ng matibay na mesa o pader sa loob.",
          "Itali sa pader ang mabibigat na muwebles, salamin, at water heater.",
          "Ilagay sa baba ang mabibigat na bagay; huwag sa itaas ng kama.",
          "Magsanay ng 'Yuko, Tago, Kapit' kasama ang pamilya tuwing kuwarter.",
          "Maghanda ng 72-oras na emergency kit: pagkain, tubig, at pitong-pito (whistle).",
        ],
        during: [
          "Yumuko sa kamay at tuhod. Takpan ang ulo at leeg. Kumapit sa matibay na shelter.",
          "Kapag nasa loob, manatili sa loob; HUWAG tumakbo palabas habang yumayanig.",
          "Kapag nasa labas, lumipat sa bukas na lugar — malayo sa gusali, puno, kuryente.",
          "Kapag nagmamaneho, huminto malayo sa flyover; manatili sa loob ng sasakyan.",
          "Kapag naipit, kumatok sa tubo para marinig ka ng tagasagip. Tipirin ang oxygen.",
        ],
        after: [
          "Asahan ang aftershocks — kasing-lakas pa rin ng main quake.",
          "Suriin kung may sugatan; bigyan ng first aid bago umalis.",
          "Suriin kung may gas leak (amoy) at sira sa istruktura bago bumalik.",
          "Huwag gamitin ang elevator. Gamitin ang hagdan; mag-ingat sa bitak.",
          "Makinig sa PHIVOLCS; sundin ang tsunami warning kung malapit sa dagat.",
        ],
      },
    },
  },
  {
    id: "flood",
    icon: Waves,
    category: "Flood",
    duration: "4 min read",
    authority: "DOH · NDRRMC",
    title: { en: "Flood Safety", fil: "Kaligtasan sa Baha" },
    shortDesc: {
      en: "Never wade through flood water — it carries disease and hidden currents.",
      fil: "Huwag tatawid sa baha — may sakit at malalim na agos na hindi nakikita.",
    },
    emergencyTip: {
      en: "Turn around, don't drown. 6 inches of moving water can sweep an adult away.",
      fil: "Huwag pilitin. 6 pulgada ng umaagos na tubig ay kayang tangayin ang isang tao.",
    },
    sections: {
      en: {
        before: [
          "Know your evacuation route to high ground.",
          "Place electrical sockets and appliances above flood level.",
          "Store sandbags and waterproof bags for documents.",
          "Have leptospirosis-prevention boots ready if you must wade.",
        ],
        during: [
          "Move to the highest floor immediately if water enters your home.",
          "Avoid walking, swimming, or driving through flood water.",
          "Disconnect electricity at the main switch.",
          "Watch out for snakes and floating debris.",
        ],
        after: [
          "Boil drinking water for 3 minutes; flood water carries E. coli & leptospira.",
          "See a doctor if you waded — ask about doxycycline prophylaxis.",
          "Throw away food that touched flood water, including sealed cans.",
          "Disinfect floors and walls with bleach solution (1 cup per 5 gallons).",
        ],
      },
      fil: {
        before: [
          "Alamin ang evacuation route papunta sa mataas na lugar.",
          "Ilagay ang outlet at appliances sa mas mataas na bahagi.",
          "Maghanda ng sandbags at waterproof na lalagyan ng dokumento.",
          "Maghanda ng bota laban sa leptospirosis kung kailangan tumawid.",
        ],
        during: [
          "Pumunta agad sa pinakamataas na palapag kapag pumasok ang tubig.",
          "Huwag tumawid, lumangoy, o magmaneho sa baha.",
          "I-off ang main electrical switch.",
          "Mag-ingat sa ahas at lumulutang na basura.",
        ],
        after: [
          "Pakuluan ang inuming tubig ng 3 minuto; may E. coli at leptospira.",
          "Magpatingin sa doktor kung tumawid sa baha — itanong ang doxycycline.",
          "Itapon ang pagkaing nadikit sa baha, kahit nakaselyong lata.",
          "I-disinfect ang sahig at pader: 1 tasang bleach kada 5 galon ng tubig.",
        ],
      },
    },
  },
  {
    id: "fire",
    icon: Flame,
    category: "Fire",
    duration: "3 min read",
    authority: "BFP",
    title: { en: "Fire Response", fil: "Tugon sa Sunog" },
    shortDesc: {
      en: "Get out, stay out, and call BFP. Never go back inside for belongings.",
      fil: "Lumabas, manatili sa labas, at tumawag ng BFP. Huwag nang bumalik sa loob.",
    },
    emergencyTip: {
      en: "If clothes catch fire: STOP, DROP, and ROLL. Cover face with hands.",
      fil: "Kapag nasusunog ang damit: TIGIL, DAPA, at GULONG. Takpan ang mukha.",
    },
    sections: {
      en: {
        before: [
          "Install smoke alarms on every floor; test monthly.",
          "Keep a working fire extinguisher near the kitchen.",
          "Plan two ways out of every room and meet outside at one fixed point.",
          "Never overload electrical outlets with octopus connections.",
        ],
        during: [
          "Crawl low under smoke; the air is cleanest near the floor.",
          "Feel doors before opening — if hot, do not open.",
          "If trapped, seal door cracks with wet cloth and signal from a window.",
          "Call 911 or BFP Olongapo (047) 222-2222 once outside.",
        ],
        after: [
          "Do not re-enter the building until the BFP declares it safe.",
          "Replace smoke detector batteries even after a small fire.",
          "Document damage with photos for insurance and barangay records.",
          "Seek medical attention for smoke inhalation, even if mild.",
        ],
      },
      fil: {
        before: [
          "Mag-install ng smoke alarm sa bawat palapag; subukan buwan-buwan.",
          "Magkaroon ng fire extinguisher malapit sa kusina.",
          "Mag-plano ng dalawang labasan sa bawat kwarto at fixed meeting point sa labas.",
          "Huwag mag-octopus connection sa outlet.",
        ],
        during: [
          "Gumapang sa baba para makaiwas sa usok; malinis ang hangin sa sahig.",
          "Damhin muna ang pintuan; kung mainit, huwag buksan.",
          "Kapag naipit, takpan ang puwang ng pinto ng basang tela; sumenyas sa bintana.",
          "Tumawag sa 911 o BFP Olongapo (047) 222-2222 pagkalabas.",
        ],
        after: [
          "Huwag bumalik sa loob hangga't hindi sinasabi ng BFP na ligtas.",
          "Palitan ang baterya ng smoke detector kahit maliit lang ang sunog.",
          "I-dokumento ang sira gamit ang larawan para sa insurance at barangay.",
          "Magpatingin sa doktor kahit konting smoke inhalation lang.",
        ],
      },
    },
  },
  {
    id: "tsunami",
    icon: Anchor,
    category: "Tsunami",
    duration: "3 min read",
    authority: "PHIVOLCS",
    title: { en: "Tsunami Awareness", fil: "Kaalaman sa Tsunami" },
    shortDesc: {
      en: "If you feel a strong quake near the coast, run to high ground without waiting for an alert.",
      fil: "Kapag malakas ang lindol malapit sa dagat, takbo agad sa mataas — huwag maghintay ng alerto.",
    },
    emergencyTip: {
      en: "Natural warning: strong shaking, sudden sea retreat, or a roar from the ocean. Run uphill now.",
      fil: "Natural na babala: malakas na yanig, biglaang paghupa ng dagat, o ugong galing sa karagatan. Takbo sa mataas.",
    },
    sections: {
      en: {
        before: [
          "Know your local evacuation map and assembly point — at least 30m above sea level.",
          "If you live near the coast (Subic Bay), practice the route quarterly.",
          "Keep shoes and a Go Bag near your bed.",
        ],
        during: [
          "Drop, Cover, Hold On during shaking, then immediately move to high ground.",
          "Move on foot if possible — roads will be jammed with vehicles.",
          "A tsunami is a series of waves; the first is rarely the largest.",
        ],
        after: [
          "Stay on high ground for at least several hours; await PHIVOLCS clearance.",
          "Avoid damaged buildings, downed power lines, and debris.",
          "Help others; share verified updates only.",
        ],
      },
      fil: {
        before: [
          "Alamin ang evacuation map at assembly point — 30m taas mula sa dagat.",
          "Kung malapit sa baybayin (Subic Bay), magsanay ng ruta tuwing kuwarter.",
          "Maghanda ng sapatos at Go Bag sa tabi ng kama.",
        ],
        during: [
          "Yuko, Tago, Kapit habang yumayanig, tapos takbo agad sa mataas na lugar.",
          "Lakad kung kaya — mababarahan ang kalsada ng sasakyan.",
          "Sunud-sunod ang alon ng tsunami; hindi pinakamalaki ang una.",
        ],
        after: [
          "Manatili sa mataas na lugar ng ilang oras; hintayin ang PHIVOLCS clearance.",
          "Iwasan ang sirang gusali, bumagsak na linya, at basura.",
          "Tumulong sa iba; ibahagi lang ang verified na balita.",
        ],
      },
    },
  },
  {
    id: "landslide",
    icon: CloudRain,
    category: "Landslide",
    duration: "3 min read",
    authority: "MGB · NDRRMC",
    title: { en: "Landslide Awareness", fil: "Kaalaman sa Pagguho" },
    shortDesc: {
      en: "Watch for tilting trees, new cracks, and muddy water — these are landslide warnings.",
      fil: "Mag-ingat sa nakakiling na puno, bagong bitak, at maputik na tubig — palatandaan ng pagguho.",
    },
    emergencyTip: {
      en: "If you hear a roar of mud or rocks, run perpendicular to the slope, never down.",
      fil: "Kung may ugong ng putik o bato, tumakbo papasingit sa gilid — hindi pababa.",
    },
    sections: {
      en: {
        before: [
          "Check the MGB hazard map for your barangay's susceptibility.",
          "Avoid building near steep slopes, drainage paths, or near recent burn scars.",
          "Plant deep-rooted vegetation on slopes around your home.",
          "During heavy rain, listen for unusual sounds — cracking trees, boulders shifting.",
        ],
        during: [
          "Move away from the path of the landslide quickly.",
          "Curl into a tight ball and protect your head if escape is impossible.",
          "Stay alert for flooding which often follows landslides.",
        ],
        after: [
          "Stay away from the slide area; secondary slides may follow.",
          "Check for injured persons trapped near the slide; alert rescuers.",
          "Report broken utility lines to authorities.",
          "Replant damaged ground as soon as possible to prevent erosion.",
        ],
      },
      fil: {
        before: [
          "Tingnan sa MGB hazard map kung delikado ang inyong barangay.",
          "Iwasan ang pagtayo ng bahay sa matarik na lugar o daloy ng tubig.",
          "Magtanim ng malalim ang ugat na halaman sa paligid ng bahay.",
          "Sa malakas na ulan, makinig sa kakaibang ingay — bumibitak na puno, gumagalaw na bato.",
        ],
        during: [
          "Lumayo agad sa daanan ng pagguho.",
          "Kumulong na maliit at takpan ang ulo kung hindi makakatakas.",
          "Maging alerto sa baha na sumusunod sa pagguho.",
        ],
        after: [
          "Iwasan ang lugar ng pagguho; maaaring may sumunod pa.",
          "Tingnan kung may naipit; tawagin ang tagasagip.",
          "I-report ang sirang utility line sa awtoridad.",
          "Magtanim ulit sa nasirang lupa para maiwasan ang erosion.",
        ],
      },
    },
  },
]

export const PHASE_LABELS: Record<keyof GuidePhase, { en: string; fil: string }> = {
  before: { en: "Before", fil: "Bago" },
  during: { en: "During", fil: "Habang" },
  after: { en: "After", fil: "Pagkatapos" },
}
