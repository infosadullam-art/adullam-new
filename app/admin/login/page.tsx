"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/admin/auth-context"

// 🔐 Variable mémoire pour accessToken
let inMemoryAccessToken: string | null = null

// ============================================================
// COMPOSANT INTERNE QUI UTILISE useSearchParams
// ============================================================
function AdminLoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin/dashboard'
  
  const { login, refreshUser, user, isLoading: authLoading } = useAuth()

  // 🔹 Redirection si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirect)
    }
  }, [user, authLoading, router, redirect])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      await refreshUser()
      router.replace(redirect)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err?.message || "Échec de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Adullam Admin</CardTitle>
          <CardDescription>Connectez-vous pour accéder au tableau de bord administrateur</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@adullam.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Lien vers la page de connexion utilisateur */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Vous êtes un client ? </span>
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href={`/account?mode=login${redirect !== '/admin/dashboard' ? `&redirect=${encodeURIComponent(redirect)}` : ''}`}>
                Connectez-vous ici
              </a>
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Identifiants par défaut :</p>
            <p className="font-mono text-xs">admin@adullam.com / Admin123!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// LOADING FALLBACK PENDANT LE SUSPENSE
// ============================================================
function LoginLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Adullam Admin</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// PAGE PRINCIPALE AVEC SUSPENSE BOUNDARY
// ============================================================
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <AdminLoginContent />
    </Suspense>
  )
}