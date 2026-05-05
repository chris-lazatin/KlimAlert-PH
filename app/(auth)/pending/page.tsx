"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Clock, MailCheck, ShieldCheck } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"

const ROLE_LABEL: Record<string, string> = {
  volunteer: "Volunteer / Reporter",
  lgu: "LGU Officer",
}

function PendingContent() {
  const params = useSearchParams()
  const rawRole = (params.get("role") ?? "volunteer").toLowerCase()
  const role = rawRole === "lgu" ? "lgu" : "volunteer"
  const email = params.get("email") ?? ""

  return (
    <AuthShell
      title="Account submitted."
      subtitle="Salamat sa pag-register. Ang inyong application ay nasa hands na ng City DRRMO admins para sa verification."
      footer={
        <>
          {"Mali ang nai-submit? "}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Register ulit
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] px-5 py-4 flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <MailCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-emerald-200">
              {ROLE_LABEL[role] ?? "Volunteer / Reporter"} application received.
            </p>
            {email && (
              <p className="text-xs text-emerald-300/80 mt-0.5 break-all">
                We&apos;ll notify <span className="font-medium">{email}</span> once an admin reviews it.
              </p>
            )}
          </div>
        </div>

        <ol className="space-y-3">
          <Step
            n={1}
            icon={MailCheck}
            title="Submitted"
            desc="Your account is saved and tied to your barangay."
            done
          />
          <Step
            n={2}
            icon={ShieldCheck}
            title="City DRRMO review"
            desc="An admin verifies the role you requested. Volunteer at LGU accounts ay i-vine-verify bago ma-activate."
            active
          />
          <Step
            n={3}
            icon={Clock}
            title="Sign-in unlocked"
            desc="Once approved, your existing email and password will work right away."
          />
        </ol>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-400 leading-relaxed">
          <p>
            <span className="font-medium text-zinc-200">Tip:</span> If you signed up as a Citizen, you can already
            sign in — only Volunteer and LGU accounts wait for verification.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/login"
            className="flex-1 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)]"
          >
            Try signing in
          </Link>
          <Link
            href="/"
            className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition flex items-center justify-center gap-2 px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}

function Step({
  n,
  icon: Icon,
  title,
  desc,
  active,
  done,
}: {
  n: number
  icon: typeof Clock
  title: string
  desc: string
  active?: boolean
  done?: boolean
}) {
  const tone = done
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
    : active
      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
      : "border-zinc-800 bg-zinc-900/40 text-zinc-500"

  return (
    <li className="flex items-start gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone}`}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-medium text-zinc-100 flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 tabular-nums">Step {n}</span>
          <span className="text-zinc-700">·</span>
          <span>{title}</span>
        </p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      {active && (
        <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider mt-1">
          In review
        </span>
      )}
      {done && (
        <span className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider mt-1">
          Done
        </span>
      )}
    </li>
  )
}

export default function PendingPage() {
  return (
    <Suspense fallback={null}>
      <PendingContent />
    </Suspense>
  )
}
