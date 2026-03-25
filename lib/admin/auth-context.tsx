// lib/admin/auth-context.tsx
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "./api-client"

interface User {
  id: string
  email: string
  role: string
  name?: string
  phone?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

// 🔹 Clé unique pour le token
const TOKEN_KEY = "adullam_token"

// 🔹 Fonction pour nettoyer le token (enlever guillemets et espaces)
const cleanToken = (token: string | null): string | null => {
  if (!token) return null
  return token.replace(/["']/g, '').trim()
}

// 🔹 Stockage global du token en mémoire + localStorage pour persistance
let inMemoryAccessToken: string | null = null

// Charger le token du localStorage au démarrage
if (typeof window !== "undefined") {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  if (storedToken) {
    inMemoryAccessToken = cleanToken(storedToken)
    // Si le token a été nettoyé, on le sauvegarde propre
    if (inMemoryAccessToken !== storedToken) {
      localStorage.setItem(TOKEN_KEY, inMemoryAccessToken)
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  console.log("🔵 [AuthProvider] Initialisation")

  // 🔹 Rafraîchir l'utilisateur côté front
  const refreshUser = async () => {
    console.log("🟡 [AuthProvider] refreshUser appelé")
    setIsLoading(true)
    try {
      const res = await authApi.me()
      
      if (res.success && res.user) {
        console.log("🟢 [AuthProvider] Utilisateur trouvé:", res.user.email)
        setUser(res.user)
      } else {
        console.log("🟡 [AuthProvider] Aucun utilisateur connecté")
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        inMemoryAccessToken = null
      }
    } catch (error) {
      console.log("🔴 [AuthProvider] Erreur refreshUser:", error)
      setUser(null)
      localStorage.removeItem(TOKEN_KEY)
      inMemoryAccessToken = null
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Connexion sécurisée
  const login = async (email: string, password: string) => {
    console.log("🟡 [AuthProvider] login appelé")
    setIsLoading(true)
    try {
      const res = await authApi.login(email, password)
      
      if (!res.success) {
        throw new Error(res.message || "Login failed")
      }

      // 🔹 Stocker token en mémoire et localStorage (nettoyé)
      if (res.accessToken) {
        const cleanAccessToken = cleanToken(res.accessToken)
        console.log("🟢 [AuthProvider] Token stocké (nettoyé)")
        inMemoryAccessToken = cleanAccessToken
        localStorage.setItem(TOKEN_KEY, cleanAccessToken!)
      }

      // 🔹 Mettre à jour user
      if (res.user) {
        console.log("🟢 [AuthProvider] Utilisateur connecté:", res.user.email)
        setUser(res.user)
      } else {
        await refreshUser()
      }
    } catch (error) {
      console.log("🔴 [AuthProvider] Erreur login:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Inscription avec connexion automatique
  const register = async (name: string, email: string, password: string, phone?: string) => {
    console.log("🟡 [AuthProvider] register appelé avec:", { name, email, phone })
    setIsLoading(true)
    
    try {
      console.log("📤 [AuthProvider] Envoi de la requête register à /auth/register")
      
      const res = await authApi.register(name, email, password, phone)
      
      console.log("📦 [AuthProvider] Réponse register COMPLÈTE:", JSON.stringify(res, null, 2))

      if (!res || Object.keys(res).length === 0) {
        console.error("🔴 [AuthProvider] Réponse vide ou invalide")
        throw new Error("Le serveur a renvoyé une réponse vide")
      }

      if (res.success === false) {
        const errorMessage = res.message || res.error || res.errorMessage || "Registration failed"
        console.error("🔴 [AuthProvider] Échec register - message:", errorMessage)
        throw new Error(errorMessage)
      }

      if (res.user || res.id) {
        console.log("🟢 [AuthProvider] Inscription réussie avec réponse:", res)
        
        if (res.accessToken) {
          const cleanAccessToken = cleanToken(res.accessToken)
          inMemoryAccessToken = cleanAccessToken
          localStorage.setItem(TOKEN_KEY, cleanAccessToken!)
        }
        
        if (res.user) {
          setUser(res.user)
        }
        
        await login(email, password)
        return
      }

      console.error("🔴 [AuthProvider] Format de réponse non reconnu:", res)
      throw new Error("Format de réponse invalide")
      
    } catch (error) {
      console.error("🔴 [AuthProvider] Erreur register détaillée:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Déconnexion
  const logout = async () => {
    console.log("🟡 [AuthProvider] logout appelé")
    try {
      await authApi.logout()
    } catch (error) {
      console.log("🔴 [AuthProvider] Erreur logout:", error)
    }

    setUser(null)
    inMemoryAccessToken = null
    localStorage.removeItem(TOKEN_KEY)
    router.push("/account?mode=login")
  }

  // 🔹 Au chargement, vérifier si un token existe
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      const cleanTokenValue = cleanToken(token)
      if (cleanTokenValue !== token) {
        localStorage.setItem(TOKEN_KEY, cleanTokenValue!)
      }
      console.log("🟡 [AuthProvider] Token trouvé, récupération de l'utilisateur")
      refreshUser()
    } else {
      console.log("🟡 [AuthProvider] Aucun token, chargement terminé")
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  return context
}

export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY)
    return token ? cleanToken(token) : null
  }
  return null
}