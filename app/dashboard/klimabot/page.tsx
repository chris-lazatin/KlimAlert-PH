"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Sparkles,
  Send,
  Wind,
  Droplets,
  Mountain,
  MapPin,
  Phone,
  Megaphone,
  RotateCcw,
  Languages,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
} from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

type Locale = "en" | "fil"

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "klimabot-greeting",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Kumusta! Ako si KlimaBot — ang AI preparedness assistant ng KlimAlert PH. Magtanong ka about typhoons, floods, earthquakes, evacuation, o emergency contacts. You can write in Filipino, Taglish, or English.",
      },
    ],
  },
]

const CATEGORIES = [
  {
    id: "typhoon",
    icon: Wind,
    title: { en: "Typhoon prep", fil: "Paghahanda sa bagyo" },
    prompts: {
      en: [
        "What should I pack in my go-bag for a typhoon?",
        "How do I secure my house before a Signal #2 storm?",
        "Explain PAGASA wind signal levels in simple terms.",
      ],
      fil: [
        "Anong dapat ipack sa go-bag bago bumagyo?",
        "Paano i-secure ang bahay bago mag-Signal #2?",
        "Pakipaliwanag ang PAGASA wind signals sa simpleng salita.",
      ],
    },
  },
  {
    id: "flood",
    icon: Droplets,
    title: { en: "Flood safety", fil: "Kaligtasan sa baha" },
    prompts: {
      en: [
        "What should I do if floodwater enters our house?",
        "How can I protect documents and appliances from flooding?",
        "When is it unsafe to wade through floodwater?",
      ],
      fil: [
        "Ano ang gagawin kapag pumasok na ang baha sa bahay?",
        "Paano protektahan ang mga dokumento at appliance sa baha?",
        "Kailan delikado tumawid sa baha?",
      ],
    },
  },
  {
    id: "earthquake",
    icon: Mountain,
    title: { en: "Earthquake", fil: "Lindol" },
    prompts: {
      en: [
        "What is the Drop, Cover, Hold drill?",
        "What should I do right after a strong earthquake?",
        "How do I check if my home is earthquake-ready?",
      ],
      fil: [
        "Paano gawin ang Drop, Cover, Hold drill?",
        "Ano ang gagawin pagkatapos ng malakas na lindol?",
        "Paano malalaman kung handa sa lindol ang aming bahay?",
      ],
    },
  },
  {
    id: "evacuation",
    icon: MapPin,
    title: { en: "Evacuation", fil: "Paglikas" },
    prompts: {
      en: [
        "How do I find the nearest open evacuation center?",
        "What should I bring when evacuating with kids?",
        "When should we pre-emptively evacuate?",
      ],
      fil: [
        "Paano makita ang pinakamalapit na bukas na evac center?",
        "Anong dapat dalhin pag-evacuate kasama ang mga bata?",
        "Kailan dapat mag-pre-emptive evacuation?",
      ],
    },
  },
  {
    id: "contacts",
    icon: Phone,
    title: { en: "Emergency contacts", fil: "Emergency contacts" },
    prompts: {
      en: [
        "Which hotline should I call for a medical emergency?",
        "Who do I contact for a fire in our barangay?",
        "How do I reach Olongapo City DRRMO?",
      ],
      fil: [
        "Saang hotline tatawag pag may medical emergency?",
        "Sino ang tatawagan kapag may sunog sa barangay?",
        "Paano i-contact ang Olongapo City DRRMO?",
      ],
    },
  },
  {
    id: "report",
    icon: Megaphone,
    title: { en: "Hazard reporting", fil: "Pag-report ng hazard" },
    prompts: {
      en: [
        "How do I file a community hazard report in the app?",
        "What details should a flood report include?",
        "Will my report be verified by the LGU?",
      ],
      fil: [
        "Paano mag-report ng hazard sa app?",
        "Anong detalye dapat isama sa flood report?",
        "Veverify ba ng LGU ang aking report?",
      ],
    },
  },
] as const

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: { en: "PAGASA & NDRRMC aware", fil: "Alam ang PAGASA & NDRRMC" },
    desc: {
      en: "Trained on Philippine disaster context — typhoons, baha, lindol, landslides.",
      fil: "Sanay sa konteksto ng Pilipinas — bagyo, baha, lindol, landslide.",
    },
  },
  {
    icon: Languages,
    title: { en: "Bilingual", fil: "Bilingual" },
    desc: {
      en: "Reply in the language you use — Filipino, Taglish, or English.",
      fil: "Sumasagot sa wikang gamit mo — Filipino, Taglish, o English.",
    },
  },
  {
    icon: Zap,
    title: { en: "Fast guidance", fil: "Mabilis na gabay" },
    desc: {
      en: "Concise, actionable steps for the moments that matter most.",
      fil: "Maikli at malinaw na hakbang para sa mahalagang sandali.",
    },
  },
] as const

const COPY = {
  eyebrow: { en: "KlimaBot AI", fil: "KlimaBot AI" },
  heading: {
    en: "Your AI preparedness companion",
    fil: "AI companion para sa inyong paghahanda",
  },
  sub: {
    en: "Ask about typhoons, floods, earthquakes, evacuation, and emergency response — anytime, in your own language.",
    fil: "Magtanong tungkol sa bagyo, baha, lindol, paglikas, at emergency response — kahit kailan, sa sarili mong wika.",
  },
  ready: { en: "Online", fil: "Online" },
  newChat: { en: "New chat", fil: "Bagong chat" },
  inputPlaceholder: {
    en: "Ask anything about preparedness…",
    fil: "Magtanong tungkol sa paghahanda…",
  },
  suggestionsLabel: { en: "Try a question", fil: "Subukan ang tanong" },
  capabilitiesLabel: {
    en: "What KlimaBot can help with",
    fil: "Saan makakatulong ang KlimaBot",
  },
  hint: {
    en: "Press Enter to send · Shift+Enter for a new line",
    fil: "Pindutin ang Enter para ipadala · Shift+Enter para sa bagong linya",
  },
  disclaimer: {
    en: "KlimaBot provides general preparedness guidance and is not a substitute for emergency services. For life-threatening situations, dial 911 or 117 immediately.",
    fil: "Ang KlimaBot ay nagbibigay ng general na gabay sa paghahanda — hindi kapalit ng emergency services. Sa life-threatening situations, tumawag agad sa 911 o 117.",
  },
}

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export default function KlimaBotPage() {
  const { user } = useAuth()
  const [locale, setLocale] = useState<Locale>("en")
  const [input, setInput] = useState("")
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]["id"]>("typhoon")
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/klimabot" }),
    messages: INITIAL_MESSAGES,
  })

  const isBusy = status === "streaming" || status === "submitted"
  const hasConversation = messages.length > 1

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, status])

  // Auto-grow textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    sendMessage({ text: trimmed })
    setInput("")
  }

  const reset = () => {
    if (isBusy) return
    setMessages(INITIAL_MESSAGES)
    setInput("")
  }

  const activePrompts = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategory)?.prompts[locale] ?? [],
    [activeCategory, locale],
  )

  const firstName = user?.name?.split(" ")[0] ?? "kabayan"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">
            {COPY.eyebrow[locale]}
          </p>
          <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50 mt-1 text-balance">
            {COPY.heading[locale]}
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">{COPY.sub[locale]}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Locale toggle */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
            <Languages className="h-4 w-4 text-zinc-500 ml-1.5" />
            {(["en", "fil"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors",
                  locale === l ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-100",
                )}
              >
                {l === "en" ? "EN" : "FIL"}
              </button>
            ))}
          </div>

          {/* New chat */}
          <button
            type="button"
            onClick={reset}
            disabled={!hasConversation || isBusy}
            className="h-10 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {COPY.newChat[locale]}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Chat panel */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col min-h-[640px] xl:min-h-[720px]">
          {/* Chat header */}
          <header className="flex items-center gap-3 px-5 py-4 border-b border-zinc-900 bg-gradient-to-br from-emerald-500/[0.06] via-zinc-950 to-zinc-950">
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.4} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-semibold text-zinc-100 leading-tight">KlimaBot</p>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {COPY.ready[locale]} · AI preparedness · FIL & EN
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              <ShieldCheck className="h-3 w-3" />
              KlimAlert PH
            </span>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-hidden">
            {!hasConversation ? (
              <WelcomeState locale={locale} firstName={firstName} onPick={send} />
            ) : (
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((m) => (
                  <Message key={m.id} role={m.role} text={getMessageText(m)} />
                ))}
                {status === "submitted" && (
                  <div className="flex items-start gap-3">
                    <BotAvatar />
                    <div className="rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 px-4 py-3">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.3s]" />
                      </span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    KlimaBot encountered an issue. Pakisubukan ulit.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="border-t border-zinc-900 bg-zinc-950 px-4 sm:px-6 py-4"
          >
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send(input)
                    }
                  }}
                  placeholder={COPY.inputPlaceholder[locale]}
                  rows={1}
                  disabled={isBusy}
                  className="flex-1 resize-none bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 px-3 py-2.5 leading-relaxed focus:outline-none disabled:opacity-60 max-h-[160px]"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!input.trim() || isBusy}
                  className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 flex items-center justify-center hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_20px_-8px_rgba(16,185,129,0.6)]"
                >
                  <Send className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500 text-center">{COPY.hint[locale]}</p>
            </div>
          </form>
        </section>

        {/* Side panel */}
        <aside className="space-y-4">
          {/* Categories */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <header className="px-4 py-3.5 border-b border-zinc-900">
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">
                {COPY.suggestionsLabel[locale]}
              </p>
            </header>

            <div className="grid grid-cols-3 gap-1 p-2 border-b border-zinc-900">
              {CATEGORIES.map((c) => {
                const Icon = c.icon
                const active = c.id === activeCategory
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-[10px] font-medium transition-colors text-center",
                      active
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200"
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent",
                    )}
                    aria-pressed={active}
                  >
                    <Icon
                      className={cn("h-4 w-4", active ? "text-emerald-300" : "text-zinc-500")}
                    />
                    <span className="leading-tight">{c.title[locale]}</span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.ul
                key={`${activeCategory}-${locale}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="p-2"
              >
                {activePrompts.map((p) => (
                  <li key={p}>
                    <button
                      onClick={() => send(p)}
                      disabled={isBusy}
                      className="group w-full text-left flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400/60 shrink-0 group-hover:bg-emerald-400 transition-colors" />
                      <span className="flex-1 leading-snug">{p}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </button>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">
              {COPY.capabilitiesLabel[locale]}
            </p>
            <ul className="mt-3 space-y-3">
              {CAPABILITIES.map((c) => {
                const Icon = c.icon
                return (
                  <li key={c.title.en} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 shrink-0">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 leading-tight">{c.title[locale]}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{c.desc[locale]}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-semibold">
              {locale === "en" ? "Important" : "Mahalaga"}
            </p>
            <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed">{COPY.disclaimer[locale]}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function WelcomeState({
  locale,
  firstName,
  onPick,
}: {
  locale: Locale
  firstName: string
  onPick: (text: string) => void
}) {
  const greeting =
    locale === "en"
      ? `Kumusta, ${firstName}. How can I help you prepare today?`
      : `Kumusta, ${firstName}. Paano kita matutulungan ngayon?`

  const starters = CATEGORIES.slice(0, 4).map((c) => ({
    icon: c.icon,
    label: c.title[locale],
    prompt: c.prompts[locale][0],
  }))

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 shadow-[0_18px_40px_-12px_rgba(16,185,129,0.55)]">
        <Bot className="h-7 w-7" strokeWidth={2.2} />
      </div>
      <h2 className="font-heading text-xl sm:text-2xl font-semibold text-zinc-50 mt-5 text-balance">
        {greeting}
      </h2>
      <p className="text-sm text-zinc-400 mt-2 leading-relaxed text-pretty">
        {locale === "en"
          ? "I'm trained on Philippine disaster context — PAGASA, NDRRMC, City DRRMO Olongapo. Pick a starter below or just type your question."
          : "Sanay ako sa konteksto ng Pilipinas — PAGASA, NDRRMC, City DRRMO Olongapo. Pumili ng starter sa baba o magtanong lang."}
      </p>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {starters.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.label}
              onClick={() => onPick(s.prompt)}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-emerald-500/40 transition-all p-4 flex items-start gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">
                  {s.label}
                </span>
                <span className="mt-1 block text-sm text-zinc-200 leading-snug line-clamp-2">{s.prompt}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BotAvatar() {
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 shrink-0 shadow-[0_4px_14px_-4px_rgba(16,185,129,0.5)]">
      <Sparkles className="h-4 w-4" strokeWidth={2.5} />
    </div>
  )
}

function Message({ role, text }: { role: string; text: string }) {
  if (!text) return null
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-zinc-100 text-zinc-900 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
          {text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3">
      <BotAvatar />
      <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  )
}
