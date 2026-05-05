// Typed API client for the KlimAlert PH PHP/MySQL backend.
//
// Configure NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost/klimalert-api)
// to point the front end at your XAMPP backend. When the var is empty
// (e.g. inside the v0 preview) the app stays in DEMO mode and uses
// in-memory sample data instead of hitting the network.

import type { HazardReport, HazardType, ReportStatus, Severity } from "@/lib/hazard-reports"

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
export const API_BASE = RAW_BASE.replace(/\/$/, "")
export const HAS_API = API_BASE.length > 0

export type AuthRole = "citizen" | "volunteer" | "lgu" | "admin"

export type AuthUser = {
  id: number
  name: string
  email: string
  role: AuthRole
  barangay?: string | null
  mobile?: string | null
  verified?: boolean
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type Json = Record<string, unknown>

async function request<T = Json>(
  path: string,
  init: RequestInit & { body?: BodyInit | Json | null } = {},
): Promise<T> {
  if (!HAS_API) {
    throw new ApiError("API not configured (set NEXT_PUBLIC_API_BASE_URL).", 0)
  }

  const headers = new Headers(init.headers as HeadersInit | undefined)
  let body: BodyInit | null | undefined = init.body as BodyInit | null | undefined

  // JSON-encode plain objects (FormData/Blob/URLSearchParams pass through).
  if (
    body !== null &&
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams) &&
    typeof body !== "string"
  ) {
    headers.set("Content-Type", "application/json")
    body = JSON.stringify(body)
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json")

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    body,
    credentials: "include",
  })

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      // non-JSON response; leave data null
    }
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "error" in data && typeof (data as Json).error === "string"
        ? ((data as Json).error as string)
        : null) || `Request failed (${res.status})`
    throw new ApiError(msg, res.status)
  }
  return (data ?? {}) as T
}

// ---------------- Auth ----------------

export async function apiLogin(input: { email: string; password: string }) {
  return request<{ ok: true; user: AuthUser }>("/auth/login.php", {
    method: "POST",
    body: input,
  })
}

export type RegisterStatus = "active" | "pending"

export async function apiRegister(input: {
  full_name: string
  email: string
  mobile?: string
  password: string
  barangay: string
  role: "citizen" | "volunteer" | "lgu"
}) {
  // Citizens come back as 'active' (session cookie set, redirect to dashboard).
  // Volunteer / LGU come back as 'pending' (no session, redirect to /pending).
  return request<{ ok: true; status: RegisterStatus; user: AuthUser; message?: string }>(
    "/auth/register.php",
    {
      method: "POST",
      body: input,
    },
  )
}

// ---------------- Admin: pending approvals ----------------

export type PendingApproval = {
  id: number
  name: string
  email: string
  mobile: string | null
  role: "volunteer" | "lgu"
  barangay: string | null
  created_at: string
}

export async function apiPendingApprovals(params?: {
  role?: "volunteer" | "lgu"
  barangay?: string
}) {
  const q = new URLSearchParams()
  if (params?.role) q.set("role", params.role)
  if (params?.barangay) q.set("barangay", params.barangay)
  const qs = q.toString()
  return request<{
    ok: true
    pending: PendingApproval[]
    counts: { volunteer: number; lgu: number }
    total: number
  }>(`/auth/pending.php${qs ? `?${qs}` : ""}`)
}

export async function apiResolveApproval(input: {
  id: number
  action: "approve" | "reject"
  note?: string
}) {
  return request<{
    ok: true
    id: number
    status: "approved" | "rejected"
    user?: AuthUser
  }>("/auth/approve.php", {
    method: "POST",
    body: input,
  })
}

export async function apiLogout() {
  return request<{ ok: true }>("/auth/logout.php", { method: "POST" })
}

export async function apiMe() {
  return request<{ ok: true; user: AuthUser }>("/auth/me.php")
}

// ---------------- Reports ----------------

type ApiReport = {
  id: number | string
  hazard_type: HazardType
  severity: Severity
  barangay: string
  landmark: string | null
  description: string
  photo_path: string | null
  latitude: number | null
  longitude: number | null
  status: ReportStatus
  is_anonymous: 0 | 1 | boolean
  created_at: string
  reporter: string
  reporter_role: string
  verified_by: string | null
}

function normalizeRole(role: string): "Citizen" | "Volunteer" | "LGU" {
  const r = role.toLowerCase()
  if (r === "lgu" || r === "admin") return "LGU"
  if (r === "volunteer") return "Volunteer"
  return "Citizen"
}

export function mapReport(r: ApiReport): HazardReport {
  return {
    id: String(r.id),
    type: r.hazard_type,
    severity: r.severity,
    barangay: r.barangay,
    landmark: r.landmark ?? "",
    description: r.description,
    photoUrl: r.photo_path ? `${API_BASE}/${r.photo_path}` : undefined,
    reporter: r.is_anonymous ? "Anonymous" : r.reporter,
    reporterRole: normalizeRole(r.reporter_role),
    status: r.status,
    createdAt: r.created_at,
    verifiedBy: r.verified_by ?? undefined,
  }
}

export async function apiListReports(params?: { status?: ReportStatus; barangay?: string; limit?: number }) {
  const q = new URLSearchParams()
  if (params?.status) q.set("status", params.status)
  if (params?.barangay) q.set("barangay", params.barangay)
  if (params?.limit) q.set("limit", String(params.limit))
  const qs = q.toString()
  const res = await request<{ ok: true; reports: ApiReport[] }>(`/reports/list.php${qs ? `?${qs}` : ""}`)
  return res.reports.map(mapReport)
}

export async function apiCreateReport(form: FormData) {
  return request<{ ok: true; id: number }>("/reports/create.php", {
    method: "POST",
    body: form,
  })
}

export async function apiVerifyReport(input: {
  id: string
  action: "verify" | "resolve" | "dismiss"
  note?: string
}) {
  return request<{ ok: true; id: number; status: ReportStatus }>("/reports/verify.php", {
    method: "POST",
    body: input,
  })
}
