import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/lib/admin/auth-context"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Adullam Admin",
  description: "Admin dashboard for Adullam e-commerce platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  )
}
