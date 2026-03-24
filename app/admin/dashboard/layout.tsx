"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useAuth } from "@/lib/admin/auth-context"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirection vers login si on a fini de charger et pas d'utilisateur
    if (!isLoading && user === null) {
      router.replace("/admin/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    // Si pas d'utilisateur après chargement, ne rien afficher pour éviter le flash
    return null
  }

  // Layout principal pour utilisateur connecté
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
