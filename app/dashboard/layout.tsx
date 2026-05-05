import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { AuthProvider } from "@/lib/auth-context"
import { FloatingChatbot } from "@/components/klimabot/floating-chatbot"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <DashboardTopbar />
          <main className="flex-1 px-5 lg:px-7 py-6 lg:py-8">{children}</main>
        </div>
      </div>

      {/* This renders the floating chatbot bubble inside the dashboard */}
      <FloatingChatbot />
      
    </AuthProvider>
  )
}
