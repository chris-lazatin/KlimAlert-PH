"use client"

// Local persistence for user-editable settings & profile fields.
//
// Today these are saved to localStorage so toggles survive a refresh in
// demo mode. Each save helper has a clear seam where /me/settings.php and
// /me/profile.php can be wired in once the PHP backend exposes them.

import { useCallback, useEffect, useState } from "react"

export type Severity = "all" | "advisory" | "warning" | "critical"
export type Locale = "en" | "fil"

export type SettingsState = {
  pushOn: boolean
  smsOn: boolean
  emailOn: boolean
  soundOn: boolean
  vibrateOn: boolean
  threshold: Severity
  locale: Locale
  barangay: string
  autoLocation: boolean
  anonReports: boolean
  showOnMap: boolean
  shareTelemetry: boolean
}

export type ProfileState = {
  name: string
  email: string
  mobile: string
  barangay: string
}

const SETTINGS_KEY = "klimalert.settings.v1"
const PROFILE_KEY = "klimalert.profile.v1"

export const DEFAULT_SETTINGS: SettingsState = {
  pushOn: true,
  smsOn: true,
  emailOn: false,
  soundOn: true,
  vibrateOn: true,
  threshold: "advisory",
  locale: "fil",
  barangay: "East Tapinac",
  autoLocation: true,
  anonReports: false,
  showOnMap: true,
  shareTelemetry: false,
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / private mode */
  }
}

/**
 * Hook that hydrates a localStorage-backed object on mount, returning a
 * typed dirty-aware editor. Pass an `initial` patch (e.g. from auth user)
 * for first-load defaults.
 */
function usePersistedRecord<T extends Record<string, unknown>>(
  key: string,
  defaults: T,
  initial?: Partial<T>,
) {
  const [hydrated, setHydrated] = useState(false)
  const [saved, setSaved] = useState<T>({ ...defaults, ...(initial ?? {}) } as T)
  const [draft, setDraft] = useState<T>({ ...defaults, ...(initial ?? {}) } as T)

  useEffect(() => {
    const stored = readJson<T>(key, { ...defaults, ...(initial ?? {}) } as T)
    setSaved(stored)
    setDraft(stored)
    setHydrated(true)
    // We intentionally only rehydrate on mount to avoid clobbering user edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft)

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  const commit = useCallback(() => {
    writeJson(key, draft)
    setSaved(draft)
    return draft
  }, [draft, key])

  const reset = useCallback(() => {
    setDraft(saved)
  }, [saved])

  const replace = useCallback((next: T) => {
    setDraft(next)
  }, [])

  return { hydrated, saved, draft, dirty, setField, commit, reset, replace }
}

export function useSettings(initial?: Partial<SettingsState>) {
  return usePersistedRecord<SettingsState>(SETTINGS_KEY, DEFAULT_SETTINGS, initial)
}

export function useProfile(initial: ProfileState) {
  return usePersistedRecord<ProfileState>(PROFILE_KEY, initial, initial)
}

export function clearStoredPreferences() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(SETTINGS_KEY)
    window.localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* ignore */
  }
}
