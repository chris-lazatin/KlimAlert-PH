"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Ano ang dapat ipack sa go-bag?",
  "Saang evac center ako pwedeng pumunta?",
  "What should I do during a typhoon?",
  "Magpa-prepare bago bumagyo",
]

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "klimabot-greeting",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Kumusta! Ako si KlimaBot — ang AI preparedness assistant ng KlimAlert PH. May tanong ka ba about typhoons, floods, earthquakes, evacuation, o emergency contacts? You can ask in Filipino or English.",
      },
    ],
  },
]

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function KlimaBot() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/klimabot" }),
    messages: INITIAL_MESSAGES,
  })

  useEffect(() => {
    if (open) setHasUnread(false)
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  // Hide the floating bot on the dedicated KlimaBot page to avoid two chat surfaces.
  if (pathname?.startsWith("/dashboard/klimabot")) return null

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || status === "streaming" || status === "submitted") return
    sendMessage({ text: trimmed })
    setInput("")
  }

  const isBusy = status === "streaming" || status === "submitted"

  return (
    <>
      {/* Toggle FAB */}
      <button
        aria-label={open ? "Close KlimaBot" : "Open KlimaBot"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-50 bottom-5 right-5 sm:bottom-7 sm:right-7 group",
          "h-14 w-14 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950",
          "shadow-[0_10px_40px_-10px_rgba(16,185,129,0.7)] hover:shadow-[0_10px_40px_-5px_rgba(16,185,129,0.9)]",
          "transition-all duration-300 hover:scale-105 active:scale-95",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
        {hasUnread && !open && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 bottom-24 right-3 sm:right-7 w-[calc(100vw-1.5rem)] sm:w-[400px] max-h-[calc(100vh-7rem)] sm:max-h-[600px] flex flex-col rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)]"
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 p-4 border-b border-zinc-800/80 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-900">
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950">
                <Sparkles className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-semibold text-zinc-100 leading-tight">KlimaBot</p>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI preparedness · FIL & EN
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hidden">
              {messages.map((m) => (
                <Message key={m.id} role={m.role} text={getMessageText(m)} />
              ))}
              {status === "submitted" && (
                <div className="flex items-start gap-2">
                  <BotAvatar />
                  <div className="rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 px-3.5 py-2.5">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.3s]" />
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/[0.07] px-3 py-2.5 text-xs text-red-300">
                  KlimaBot encountered an issue. Pakisubukan ulit.
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hidden">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={isBusy}
                    className="shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300 hover:bg-emerald-500/15 transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-end gap-2 p-3 border-t border-zinc-800/80 bg-zinc-950"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                placeholder="Magtanong sa Filipino o English…"
                rows={1}
                disabled={isBusy}
                className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-600 px-3 py-2.5 leading-snug focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 max-h-[100px] disabled:opacity-60"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!input.trim() || isBusy}
                className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 flex items-center justify-center hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function BotAvatar() {
  return (
    <div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px] font-semibold text-emerald-300 shrink-0">
      K
    </div>
  )
}

function Message({ role, text }: { role: string; text: string }) {
  if (!text) return null
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-zinc-100 text-zinc-900 px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2">
      <BotAvatar />
      <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 text-zinc-200 px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  )
}
