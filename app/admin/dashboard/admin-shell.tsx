"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AdminSidebar, AdminMobileNav } from "@/components/admin/sidebar"
import { useAuth } from "@/lib/admin/auth-context"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user === null) router.replace("/admin/login")
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--adm-gris)]" aria-label="Chargement" />
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="flex h-dvh">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      <AdminMobileNav />
    </div>
  )
}
