"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Globe,
  MapPin,
  Lock,
  ShieldCheck,
  Eye,
  Trash2,
  Download,
  Languages,
  Volume2,
  Vibrate,
  AlertTriangle,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { OLONGAPO_BARANGAYS } from "@/lib/olongapo"
import { useSettings, type Severity } from "@/lib/preferences"

type SaveState = "idle" | "saving" | "saved"

export default function SettingsPage() {
  const { user, isDemo, signOut } = useAuth()

  // Hydrate preferences from localStorage; seed barangay from auth user.
  const { hydrated, draft, dirty, setField, commit, reset } = useSettings({
    barangay: user?.barangay ?? "East Tapinac",
  })

  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [toast, setToast] = useState<string | null>(null)

  // Auto-clear toasts.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  async function handleSave() {
    setSaveState("saving")
    try {
      // Production: PUT /me/settings.php with the draft body.
      await new Promise((r) => setTimeout(r, 350))
      commit()
      setSaveState("saved")
      setToast("Preferences saved")
      setTimeout(() => setSaveState("idle"), 1600)
    } catch {
      setSaveState("idle")
      setToast("Save failed — try again")
    }
  }

  function handleReset() {
    reset()
    setToast("Reverted to last saved")
  }

  // Password form (handled separately from preferences).
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwBusy, setPwBusy] = useState(false)

  function validatePassword(): string | null {
    if (!pw.current) return "Ilagay ang current password."
    if (pw.next.length < 8) return "Bagong password ay 8+ characters."
    if (pw.next !== pw.confirm) return "Hindi tugma ang bagong password."
    return null
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    const err = validatePassword()
    if (err) {
      setPwError(err)
      return
    }
    setPwError(null)
    setPwBusy(true)
    try {
      // Production: POST /auth/change-password.php
      await new Promise((r) => setTimeout(r, 500))
      setPw({ current: "", next: "", confirm: "" })
      setToast("Password updated")
    } finally {
      setPwBusy(false)
    }
  }

  // Export data
  function handleExport() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            user: user ?? null,
            preferences: draft,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `klimalert-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setToast("Data export downloaded")
  }

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState("")
  const canDelete = deleteText.trim().toUpperCase() === "DELETE"
  async function handleDelete() {
    if (!canDelete) return
    // Production: DELETE /me/account.php — for demo we just clear storage.
    try {
      window.localStorage.clear()
    } catch {
      /* noop */
    }
    await signOut()
  }

  // 2FA toggle (separate from preferences)
  const [twoFa, setTwoFa] = useState(false)
  function handleToggle2fa() {
    setTwoFa((v) => !v)
    setToast(twoFa ? "Two-factor disabled" : "Two-factor enabled")
  }

  const saveLabel = useMemo(() => {
    if (saveState === "saving") return "Saving…"
    if (saveState === "saved") return "Saved"
    return dirty ? "Save changes" : "All saved"
  }, [saveState, dirty])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">Account settings</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-50">
              Preferences & privacy
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              I-customize ang notifications, lokasyon, at kung paano ginagamit ang iyong data sa KlimAlert PH.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {dirty && saveState === "idle" && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 hover:border-zinc-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Revert
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!dirty || saveState !== "idle"}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 text-sm font-semibold hover:brightness-110 transition shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)] disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {saveState === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveState === "saved" ? (
                <Check className="h-4 w-4" />
              ) : null}
              {saveLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Status strip */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-200"
        >
          <Check className="h-3.5 w-3.5 text-emerald-300" />
          {toast}
        </div>
      )}

      {isDemo && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200 leading-relaxed">
            Nasa demo mode ka — ang mga preferences ay sine-save nang lokal sa browser. Mag-set ng
            <span className="font-semibold"> NEXT_PUBLIC_API_BASE_URL</span> para isabay ang server-side persistence.
          </p>
        </div>
      )}

      {/* Notifications */}
      <Section
        icon={Bell}
        title="Notifications"
        desc="Paano gusto mong tumanggap ng alerts mula sa PAGASA, DRRMO, at LGU."
      >
        <ToggleRow
          icon={Smartphone}
          title="Push notifications"
          desc="Real-time push sa device — best for critical alerts."
          checked={draft.pushOn}
          onChange={(v) => setField("pushOn", v)}
          disabled={!hydrated}
        />
        <ToggleRow
          icon={MessageSquare}
          title="SMS alerts"
          desc={`Padalhin sa ${user?.mobile ?? "registered mobile number"}.`}
          checked={draft.smsOn}
          onChange={(v) => setField("smsOn", v)}
          disabled={!hydrated}
        />
        <ToggleRow
          icon={Mail}
          title="Email digest"
          desc={`Daily summary sa ${user?.email ?? "—"}.`}
          checked={draft.emailOn}
          onChange={(v) => setField("emailOn", v)}
          disabled={!hydrated}
        />
        <ToggleRow
          icon={Volume2}
          title="Sound"
          desc="Mag-play ng tunog kapag may bagong alert."
          checked={draft.soundOn}
          onChange={(v) => setField("soundOn", v)}
          disabled={!hydrated}
        />
        <ToggleRow
          icon={Vibrate}
          title="Vibration"
          desc="Vibrate sa critical at warning alerts."
          checked={draft.vibrateOn}
          onChange={(v) => setField("vibrateOn", v)}
          disabled={!hydrated}
        />

        {/* Severity threshold */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">Minimum severity</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tatanggap ka lamang ng alerts mula sa antas na ito pataas.
              </p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(["all", "advisory", "warning", "critical"] as Severity[]).map((s) => {
                  const active = draft.threshold === s
                  const label =
                    s === "all" ? "All" : s === "advisory" ? "Advisory" : s === "warning" ? "Warning" : "Critical only"
                  return (
                    <button
                      key={s}
                      onClick={() => setField("threshold", s)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Localization */}
      <Section icon={Globe} title="Location & language" desc="Para tumama ang alerts sa iyong barangay.">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
              <Languages className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">Language</p>
              <p className="text-xs text-zinc-500 mt-0.5">Para sa app at preparedness guides.</p>
              <div className="mt-3 inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
                {(["en", "fil"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setField("locale", l)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      draft.locale === l ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {l === "en" ? "English" : "Filipino"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
              <MapPin className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">Home barangay</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ginagamit para i-prioritize ang mga alerts at evacuation centers na malapit sa iyo.
              </p>
              <select
                value={draft.barangay}
                onChange={(e) => setField("barangay", e.target.value)}
                className="mt-3 w-full sm:w-72 h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {OLONGAPO_BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    Brgy. {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <ToggleRow
          icon={MapPin}
          title="Auto-detect location"
          desc="Gamitin ang GPS para sa mas accurate na hazard zones."
          checked={draft.autoLocation}
          onChange={(v) => setField("autoLocation", v)}
          disabled={!hydrated}
        />
      </Section>

      {/* Privacy */}
      <Section icon={ShieldCheck} title="Privacy & data" desc="Kontrolin kung paano ginagamit ang iyong data.">
        <ToggleRow
          icon={Eye}
          title="Anonymous reports by default"
          desc="Itago ang iyong pangalan sa lahat ng community reports."
          checked={draft.anonReports}
          onChange={(v) => setField("anonReports", v)}
          disabled={!hydrated}
        />
        <ToggleRow
          icon={MapPin}
          title="Show on community map"
          desc="Pakita ang iyong general area (hindi exact address) sa LGU."
          checked={draft.showOnMap}
          onChange={(v) => setField("showOnMap", v)}
          disabled={!hydrated}
        />
        <ToggleRow
          icon={ShieldCheck}
          title="Share anonymous telemetry"
          desc="Tumulong na pagandahin ang KlimAlert PH gamit ang anonymized usage data."
          checked={draft.shareTelemetry}
          onChange={(v) => setField("shareTelemetry", v)}
          disabled={!hydrated}
        />

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">Data export & deletion</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                I-download ang iyong reports, profile, at activity history bago mag-delete.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/15 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete account
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Security" desc="I-secure ang iyong KlimAlert PH account.">
        <form onSubmit={handleChangePassword} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-sm font-medium text-zinc-100">Change password</p>
          <p className="text-xs text-zinc-500 mt-0.5">Minimum 8 characters. Iwasan ang madaling hulaan.</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="password"
              autoComplete="current-password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              placeholder="Current password"
              className="h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              type="password"
              autoComplete="new-password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              placeholder="New password"
              className="h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              type="password"
              autoComplete="new-password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Confirm new password"
              className="h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          {pwError && (
            <p className="mt-2 text-xs text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              {pwError}
            </p>
          )}
          <button
            type="submit"
            disabled={pwBusy}
            className="mt-3 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-200 hover:border-zinc-700 transition-colors disabled:opacity-50"
          >
            {pwBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Update password
          </button>
        </form>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-start gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
              twoFa
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-100">Two-factor authentication</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {twoFa
                ? "OTP layer is active. Gagamitin sa bawat login mula sa bagong device."
                : "Magdagdag ng OTP layer sa pag-login. Recommended para sa LGU accounts."}
            </p>
          </div>
          <button
            onClick={handleToggle2fa}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
              twoFa
                ? "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
            }`}
          >
            {twoFa ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </Section>

      {/* Delete account modal */}
      {deleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-950 p-5 shadow-2xl shadow-black/60">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 shrink-0">
                <Trash2 className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <h3 id="delete-title" className="font-heading text-lg font-semibold text-zinc-50">
                  Delete account permanently
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Mawawala ang iyong reports, achievements, at preferences. Hindi ito mababawi.
                </p>
                <label className="mt-4 block text-xs text-zinc-400">
                  I-type ang <span className="font-mono font-semibold text-rose-300">DELETE</span> para kumpirmahin.
                </label>
                <input
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="mt-1.5 w-full h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteOpen(false)
                  setDeleteText("")
                }}
                className="h-9 px-4 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 hover:border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete}
                className="h-9 px-4 rounded-lg border border-rose-500/40 bg-rose-500/15 text-xs font-semibold text-rose-200 hover:bg-rose-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Bell
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <header className="px-5 py-4 border-b border-zinc-900 flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shrink-0">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-zinc-100">{title}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
        </div>
      </header>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  )
}

function ToggleRow({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  icon: typeof Bell
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked
            ? "bg-emerald-500 hover:bg-emerald-400"
            : "bg-zinc-800 ring-1 ring-inset ring-zinc-700 hover:bg-zinc-700"
        }`}
      >
        <span className="sr-only">{title}</span>
        <span
          aria-hidden
          className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-zinc-50 shadow-md transition-transform duration-200 ease-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}
