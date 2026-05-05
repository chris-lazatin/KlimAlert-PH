"use client"

import { useRef, useState } from "react"
import { Upload, MapPin, Loader2, CheckCircle2, X, Camera, AlertCircle } from "lucide-react"
import { OLONGAPO_BARANGAYS } from "@/lib/olongapo"
import { HAZARD_META, SEVERITY_META, type HazardType, type Severity } from "@/lib/hazard-reports"
import { apiCreateReport, ApiError, HAS_API } from "@/lib/api"

const HAZARD_TYPES: HazardType[] = [
  "flood",
  "fire",
  "landslide",
  "fallen_tree",
  "road_blocked",
  "power_outage",
  "other",
]
const SEVERITY_LEVELS: Severity[] = ["low", "moderate", "high", "critical"]

export function HazardReportForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [type, setType] = useState<HazardType | "">("")
  const [severity, setSeverity] = useState<Severity>("moderate")
  const [barangay, setBarangay] = useState("")
  const [landmark, setLandmark] = useState("")
  const [description, setDescription] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [coordStatus, setCoordStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPhoto({ file, preview })
  }

  function clearPhoto() {
    if (photo) URL.revokeObjectURL(photo.preview)
    setPhoto(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setCoordStatus("error")
      return
    }
    setCoordStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setCoordStatus("ok")
      },
      () => setCoordStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !barangay || !description) return
    setSubmitError(null)
    setLoading(true)
    try {
      if (HAS_API) {
        const fd = new FormData()
        fd.set("hazard_type", type)
        fd.set("severity", severity)
        fd.set("barangay", barangay)
        if (landmark) fd.set("landmark", landmark)
        fd.set("description", description)
        fd.set("anonymous", anonymous ? "1" : "0")
        if (coords) {
          fd.set("latitude", String(coords.lat))
          fd.set("longitude", String(coords.lng))
        }
        if (photo) fd.set("photo", photo.file)
        await apiCreateReport(fd)
      } else {
        // Demo mode: pretend we POSTed to the PHP backend.
        await new Promise((r) => setTimeout(r, 900))
      }
      setSuccess(true)
      onSubmitted?.()
      setTimeout(() => {
        setSuccess(false)
        setType("")
        setSeverity("moderate")
        setBarangay("")
        setLandmark("")
        setDescription("")
        clearPhoto()
        setCoords(null)
        setCoordStatus("idle")
      }, 2200)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "May problema sa pag-submit. Subukan ulit."
      setSubmitError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 lg:p-6 space-y-5"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 font-medium">Report a hazard</p>
        <h2 className="font-heading text-xl font-semibold text-zinc-50 mt-1">I-report ang panganib sa inyong lugar</h2>
        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
          Kapag may nakitang banta sa kaligtasan, mag-submit ng report. Ipapadala ito sa LGU at sa mga kalapit na
          residente para sa mabilisang aksyon.
        </p>
      </div>

      {/* Hazard type */}
      <div>
        <label className="text-xs font-medium text-zinc-300 mb-2 block">
          Hazard type <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HAZARD_TYPES.map((t) => {
            const meta = HAZARD_META[t]
            const Icon = meta.icon
            const active = type === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`group flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors ${
                  active
                    ? "border-emerald-500/40 bg-emerald-500/[0.08] text-zinc-100"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-emerald-300" : meta.tone}`} />
                <span className="text-[11px] font-medium leading-tight">{meta.label}</span>
                <span className="text-[10px] text-zinc-500 leading-tight">{meta.labelFil}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="text-xs font-medium text-zinc-300 mb-2 block">Severity</label>
        <div className="flex flex-wrap gap-2">
          {SEVERITY_LEVELS.map((s) => {
            const meta = SEVERITY_META[s]
            const active = severity === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? meta.ring : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
            Barangay <span className="text-rose-400">*</span>
          </label>
          <select
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Piliin ang barangay…</option>
            {OLONGAPO_BARANGAYS.map((b) => (
              <option key={b} value={b}>
                Brgy. {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-300 mb-1.5 block">Landmark / Sitio</label>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. malapit sa covered court"
            className="w-full h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* GPS detect */}
      <button
        type="button"
        onClick={detectLocation}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5" />
        {coordStatus === "loading"
          ? "Detecting…"
          : coordStatus === "ok" && coords
          ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
          : coordStatus === "error"
          ? "Pindutin para subukan ulit ang GPS"
          : "I-detect ang GPS location"}
      </button>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
          Description <span className="text-rose-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          maxLength={500}
          placeholder="Ano ang nangyari? Gaano kalala? May tao bang naipit o nasaktan?"
          className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
        />
        <p className="mt-1 text-[10px] text-zinc-600 tabular-nums">{description.length}/500</p>
      </div>

      {/* Photo */}
      <div>
        <label className="text-xs font-medium text-zinc-300 mb-1.5 block">Photo (optional)</label>
        {photo ? (
          <div className="relative rounded-lg overflow-hidden border border-zinc-800">
            <img src={photo.preview} alt="Preview" className="w-full h-44 object-cover" />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-300 hover:text-zinc-100"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-6 cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition-colors">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
              <Camera className="h-4 w-4 text-zinc-400" />
            </span>
            <span className="text-xs text-zinc-300 font-medium">I-attach ang larawan</span>
            <span className="text-[10px] text-zinc-500">JPG or PNG · max 5 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Anonymous */}
      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0"
        />
        <span className="text-xs text-zinc-400 leading-relaxed">
          I-submit ng anonymous. <span className="text-zinc-600">(Hindi ipapakita ang pangalan ko sa public feed.)</span>
        </span>
      </label>

      {submitError && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.07] px-3 py-2.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-900">
        <p className="text-[11px] text-zinc-500">
          Sa pag-submit, sumasang-ayon kang ipasa sa LGU ang report na ito.
        </p>
        <button
          type="submit"
          disabled={loading || success || !type || !barangay || !description}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Submitted
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Submit report
            </>
          )}
        </button>
      </div>
    </form>
  )
}
