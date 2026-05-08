"use client"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

type AuthRole = "citizen" | "volunteer" | "lgu" | "admin"

type AuthUser = {
  id: string
  name: string
  email: string
  role: AuthRole
  barangay?: string | null
}

type Ctx = {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setUser(null)
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, barangay_id, barangays(name)")
      .eq("id", supabaseUser.id)
      .single()

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: data?.full_name ?? "User",
      role: (data?.role ?? "citizen") as AuthRole,
      barangay: (data?.barangays as any)?.name ?? null,
    })
    setLoading(false)
  }, [supabase])

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await loadProfile(user)
  }, [supabase, loadProfile])

  useEffect(() => {
    refresh()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => loadProfile(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
  try {
    await supabase.auth.signOut()
  } catch {
    // session may already be gone — that's fine, still redirect
  } finally {
    router.push("/login")
    router.refresh() // clears Next.js router cache so protected pages re-check auth
  }
}, [supabase, router])

  const value = useMemo(
    () => ({ user, loading, refresh, signOut }),
    [user, loading, refresh, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

export function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}