"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string // Optionnel: pour les routes admin
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Pas connecté → redirection vers /account
        router.push("/account")
      } else if (requiredRole && user.role !== requiredRole) {
        // Pas le bon rôle → redirection vers dashboard
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router, requiredRole])

  // Afficher rien pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C72C1C]"></div>
      </div>
    )
  }

  // Si pas connecté, on ne rend rien (la redirection va avoir lieu)
  if (!user) {
    return null
  }

  // Vérifier le rôle si nécessaire
  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  // Connecté et autorisé → afficher les enfants
  return <>{children}</>
}