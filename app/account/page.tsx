"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Home, Star, ShoppingCart, HelpCircle, User, LogOut, 
  Mail, Phone, MapPin, Package, Heart, ChevronRight, 
  AlertCircle, Eye, EyeOff, ArrowLeft, Shield, CheckCircle,
  Clock, Lock, Key, Smartphone, MailCheck, Info, Plus, ShoppingBag
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/admin/auth-context"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook, FaApple } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { ordersApi, addressesApi, wishlistApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

// Police Amazon Ember
const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Logo
const Logo = () => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  return (
    <div className="flex items-center">
      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", letterSpacing: "-0.04em", color: isDark ? "#fff" : "#0A0A0A" }}>
        adul<span style={{ color: "#D4372B" }}>.</span>lam
      </span>
    </div>
  )
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function AccountPage() {
  const router = useRouter()
  const { user, login, register, logout, isLoading: authLoading } = useAuth()
  const { formatPrice } = useCurrencyFormatter()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // États principaux
  const [isLogged, setIsLogged] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // États pour les données utilisateur
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState({
    orders: false,
    wishlist: false,
    addresses: false
  })

  // Couleurs de la marque
  const brandColor = "#D4372B"
  const brandLight = "#FFF0F0"

  // ============================================================
  // ÉTATS POUR L'AUTHENTIFICATION
  // ============================================================
  const [step, setStep] = useState<"login" | "register" | "verify">("login")
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationCode: ""
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const [attempts, setAttempts] = useState(0)
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const csrfToken = useRef(generateCSRFToken())

  // ============================================================
  // CHARGEMENT DES DONNÉES UTILISATEUR
  // ============================================================
  useEffect(() => {
    if (user) {
      setIsLogged(true)
      fetchUserData()
    } else {
      setIsLogged(false)
    }
  }, [user])

  const fetchUserData = async () => {
    setLoading(prev => ({ ...prev, orders: true }))
    try {
      const response = await ordersApi.list()
      if (response.success) {
        setOrders(response.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement commandes:", error)
    } finally {
      setLoading(prev => ({ ...prev, orders: false }))
    }

    setLoading(prev => ({ ...prev, wishlist: true }))
    try {
      const response = await wishlistApi.list()
      if (response.success) {
        setWishlist(response.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement wishlist:", error)
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }))
    }

    setLoading(prev => ({ ...prev, addresses: true }))
    try {
      const response = await addressesApi.list()
      if (response.success) {
        setAddresses(response.addresses || [])
      }
    } catch (error) {
      console.error("Erreur chargement adresses:", error)
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }))
    }
  }

  // ============================================================
  // FONCTIONS DE SÉCURITÉ
  // ============================================================
  const checkRateLimit = (): boolean => {
    if (blockedUntil && new Date() < blockedUntil) {
      const minutes = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000)
      setError(`Trop de tentatives. Réessayez dans ${minutes} minute(s)`)
      return false
    }
    
    if (attempts >= 3) {
      const blockTime = new Date(Date.now() + 15 * 60000)
      setBlockedUntil(blockTime)
      setError("Trop de tentatives. Compte bloqué 15 minutes.")
      return false
    }
    
    return true
  }

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: "Minimum 8 caractères" }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: "Au moins une majuscule" }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: "Au moins un chiffre" }
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { valid: false, message: "Au moins un caractère spécial" }
    }
    return { valid: true, message: "Mot de passe valide" }
  }

  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>]/g, '')
  }

  // ============================================================
  // GESTION DU FORMULAIRE
  // ============================================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: sanitizeInput(value) }))
    setError("")
  }

  const handleSendCode = async () => {
    if (!checkRateLimit()) return

    setIsSubmitting(true)
    setError("")
    
    try {
      let identifier = loginMethod === "email" ? formData.email : formData.phone
      
      if (!identifier) {
        setError(`${loginMethod === "email" ? "Email" : "Téléphone"} requis`)
        setIsSubmitting(false)
        return
      }

      if (loginMethod === "email") {
        identifier = identifier.toLowerCase().trim()
      } else {
        identifier = identifier.replace(/\s/g, '')
      }

      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method: loginMethod })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(`Code envoyé à ${identifier}`)
        setStep("verify")
        setAttempts(0)
        
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || "Erreur lors de l'envoi")
        setAttempts(prev => prev + 1)
      }
    } catch (err) {
      setError("Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkRateLimit()) return
    
    const formCsrf = (e.target as any).csrf?.value
    if (formCsrf !== csrfToken.current) {
      setError("Erreur de sécurité. Rafraîchissez la page.")
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (step === "login") {
        let identifier = loginMethod === "email" ? formData.email : formData.phone
        
        if (!identifier || !formData.password) {
          setError("Tous les champs sont requis")
          setIsSubmitting(false)
          return
        }

        if (loginMethod === "email") {
          identifier = identifier.toLowerCase().trim()
        } else {
          identifier = identifier.replace(/\s/g, '')
        }

        await login(identifier, formData.password)
        setAttempts(0)
        
      } else if (step === "register") {
        if (!formData.name || !formData.password || !formData.confirmPassword) {
          setError("Tous les champs sont requis")
          setIsSubmitting(false)
          return
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Les mots de passe ne correspondent pas")
          setIsSubmitting(false)
          return
        }

        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.valid) {
          setError(passwordValidation.message)
          setIsSubmitting(false)
          return
        }

        await handleSendCode()
        
      } else if (step === "verify") {
        if (!formData.verificationCode || formData.verificationCode.length !== 6) {
          setError("Code à 6 chiffres requis")
          setIsSubmitting(false)
          return
        }

        let identifier = loginMethod === "email" ? formData.email : formData.phone
        
        if (loginMethod === "email") {
          identifier = identifier.toLowerCase().trim()
        } else {
          identifier = identifier.replace(/\s/g, '')
        }

        const res = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, code: formData.verificationCode })
        })

        const data = await res.json()

        if (data.success) {
          await register(formData.name, identifier, formData.password)
          setSuccess("Compte créé avec succès !")
          setTimeout(() => router.push("/account"), 2000)
        } else {
          setError(data.error || "Code invalide")
          setAttempts(prev => prev + 1)
        }
      }
    } catch (error: any) {
      console.error("❌ Erreur:", error)
      setError(error.message || "Une erreur est survenue")
      setAttempts(prev => prev + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsLogged(false)
    router.push("/")
  }

  // ============================================================
  // GESTION DES ADRESSES
  // ============================================================
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return
    
    try {
      const response = await addressesApi.delete(id)
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse supprimée avec succès")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur suppression adresse:", error)
      setError("Erreur lors de la suppression")
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const response = await addressesApi.update(id, { isDefault: true })
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse par défaut mise à jour")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error("Erreur mise à jour adresse:", error)
    }
  }

  // ============================================================
  // GESTION DE LA WISHLIST
  // ============================================================
  const handleRemoveFromWishlist = async (id: string) => {
    if (!confirm("Voulez-vous retirer ce produit de votre liste de souhaits ?")) return
    
    try {
      const response = await wishlistApi.remove(id)
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Produit retiré de la wishlist")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error("Erreur suppression wishlist:", error)
      setError("Erreur lors de la suppression")
    }
  }

  // ============================================================
  // UTILS
  // ============================================================
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      "PENDING": "En attente",
      "CONFIRMED": "Confirmée",
      "PROCESSING": "En cours",
      "SHIPPED": "Expédiée",
      "DELIVERED": "Livrée",
      "CANCELLED": "Annulée"
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      "PENDING": "bg-yellow-50 text-yellow-700",
      "CONFIRMED": "bg-blue-50 text-blue-700",
      "PROCESSING": "bg-purple-50 text-purple-700",
      "SHIPPED": "bg-indigo-50 text-indigo-700",
      "DELIVERED": "bg-green-50 text-green-700",
      "CANCELLED": "bg-red-50 text-red-700"
    }
    return colorMap[status] || "bg-gray-50 text-gray-700"
  }

  // ============================================================
  // PAGE DE CONNEXION/INSCRIPTION
  // ============================================================
  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: isDark ? "#0A0A0A" : "#FAFAFA" }}>
        <div className="max-w-md w-full">
          
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          <div className="rounded-lg border overflow-hidden" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
            
            <div className="p-5 border-b" style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>
                  {step === "login" && "Connexion"}
                  {step === "register" && "Inscription"}
                  {step === "verify" && "Vérification"}
                </h2>
                {step !== "login" && (
                  <button
                    onClick={() => {
                      setStep("login")
                      setError("")
                      setSuccess("")
                    }}
                    className="text-xs hover:text-gray-700"
                    style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}
                  >
                    Retour
                  </button>
                )}
              </div>
            </div>

            <div className="p-5">
              
              {step !== "verify" && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setLoginMethod("email")}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                      loginMethod === "email"
                        ? "text-white"
                        : isDark ? "text-gray-400 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={loginMethod === "email" ? { background: "#D4372B", fontFamily: amazonFont } : { background: isDark ? "#0A0A0A" : "#F4F4F4", fontFamily: amazonFont }}
                  >
                    <Mail className="w-3 h-3 inline mr-1.5" />
                    Email
                  </button>
                  <button
                    onClick={() => {
                      // Bloquer la sélection du téléphone
                      setError("La connexion par téléphone n'est pas disponible pour le moment. Veuillez utiliser votre email.")
                      // Réinitialiser l'erreur après 3 secondes
                      setTimeout(() => setError(""), 3000)
                    }}
                    disabled={true}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all cursor-not-allowed opacity-50 ${
                      loginMethod === "phone"
                        ? "text-white"
                        : isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                    style={loginMethod === "phone" ? { background: "#D4372B", fontFamily: amazonFont } : { background: isDark ? "#0A0A0A" : "#F4F4F4", fontFamily: amazonFont }}
                    title="La connexion par téléphone n'est pas disponible"
                  >
                    <Phone className="w-3 h-3 inline mr-1.5" />
                    Téléphone
                    <span className="ml-1 text-[8px] uppercase" style={{ color: isDark ? "#666" : "#999" }}>(indisponible)</span>
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-md flex items-start gap-2" style={{ background: isDark ? "#3A0A0A" : "#FFF0F0", border: isDark ? "0.5px solid #5A1A1A" : "0.5px solid #FECACA" }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#D4372B" }} />
                  <p className="text-xs" style={{ color: isDark ? "#D4372B" : "#D4372B", fontFamily: amazonFont }}>{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-md flex items-start gap-2" style={{ background: isDark ? "#0A2A0A" : "#F0FFF0", border: isDark ? "0.5px solid #1A5A1A" : "0.5px solid #A0E0A0" }}>
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: isDark ? "#66CC66" : "#2D7D2D" }} />
                  <p className="text-xs" style={{ color: isDark ? "#66CC66" : "#2D7D2D", fontFamily: amazonFont }}>{success}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                
                <input type="hidden" name="csrf" value={csrfToken.current} />

                {step !== "verify" && (
                  <>
                    {step === "register" && (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                          Nom complet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20"
                          style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>
                    )}

                    {loginMethod === "email" ? (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                          Adresse email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20"
                          style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}
                          placeholder="vous@exemple.com"
                          required
                        />
                      </div>
                    ) : (
                      <div className="opacity-50 pointer-events-none">
                        <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                          Numéro de téléphone
                          <span className="ml-1 text-[10px]" style={{ color: isDark ? "#666" : "#999" }}>(indisponible)</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 text-sm" style={{ background: isDark ? "#0A0A0A" : "#F4F4F4", borderColor: isDark ? "#2A2A2A" : "#E5E5E5", color: isDark ? "#AAAAAA" : "#666666" }}>
                            +225
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 text-sm rounded-r-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20"
                            style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", borderLeft: "none", color: isDark ? "#444" : "#999", fontFamily: amazonFont }}
                            placeholder="01 23 45 67 89"
                            disabled
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20 pr-9"
                          style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: isDark ? "#AAAAAA" : "#999999" }}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {step === "register" && (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20 pr-9"
                            style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: isDark ? "#AAAAAA" : "#999999" }}
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || loginMethod === "phone"}
                      className="w-full text-white font-medium py-2 px-4 rounded-md text-sm transition-all disabled:opacity-50"
                      style={{ background: loginMethod === "phone" ? "#888" : "#D4372B", fontFamily: amazonFont }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Chargement...
                        </span>
                      ) : (
                        loginMethod === "phone" ? "Indisponible" : (step === "login" ? "Se connecter" : "Créer mon compte")
                      )}
                    </button>
                  </>
                )}

                {step === "verify" && (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: isDark ? "#0A2A0A" : "#F0FFF0" }}>
                        <MailCheck className="w-4 h-4" style={{ color: isDark ? "#66CC66" : "#2D7D2D" }} />
                      </div>
                      <h3 className="text-sm font-semibold mb-0.5" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>
                        Vérification
                      </h3>
                      <p className="text-[11px]" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>
                        Code envoyé à {loginMethod === "email" ? formData.email : formData.phone}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                        Code de vérification
                      </label>
                      <input
                        type="text"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                          setFormData(prev => ({ ...prev, verificationCode: value }))
                        }}
                        className="w-full px-3 py-2 text-center text-base tracking-[0.3em] font-mono rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20"
                        style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", color: isDark ? "#fff" : "#0A0A0A" }}
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>

                    {countdown > 0 ? (
                      <p className="text-xs text-center" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>
                        Renvoyer dans {countdown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        className="w-full text-xs hover:underline"
                        style={{ color: "#D4372B", fontFamily: amazonFont }}
                      >
                        Renvoyer le code
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || formData.verificationCode.length !== 6}
                      className="w-full text-white font-medium py-2 px-4 rounded-md text-sm transition-all disabled:opacity-50 mt-2"
                      style={{ background: "#D4372B", fontFamily: amazonFont }}
                    >
                      {isSubmitting ? "Vérification..." : "Vérifier et créer mon compte"}
                    </button>
                  </>
                )}
              </form>

              {step !== "verify" && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3" style={{ background: isDark ? "#1A1A1A" : "#fff", color: isDark ? "#666666" : "#999999", fontFamily: amazonFont }}>Ou</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: FcGoogle, label: "Google", color: "" },
                      { icon: FaFacebook, label: "Facebook", color: isDark ? "#8BB3F0" : "text-blue-600" },
                      { icon: FaApple, label: "Apple", color: "" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => alert("Connexion bientôt disponible")}
                        className="flex items-center justify-center py-2 px-3 border rounded-md opacity-50 cursor-not-allowed"
                        style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}
                        disabled
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step !== "verify" && (
                <p className="text-xs text-center mt-4" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>
                  {step === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
                  <button
                    onClick={() => {
                      setStep(step === "login" ? "register" : "login")
                      setError("")
                      setSuccess("")
                      // Si on était en mode téléphone, revenir à email
                      if (loginMethod === "phone") {
                        setLoginMethod("email")
                      }
                    }}
                    className="font-medium hover:underline"
                    style={{ color: "#D4372B" }}
                  >
                    {step === "login" ? "Inscrivez-vous" : "Connectez-vous"}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // DASHBOARD UTILISATEUR (après connexion)
  // ============================================================
  return (
    <div className="min-h-screen" style={{ background: isDark ? "#0A0A0A" : "#FAFAFA" }}>
      <header className="sticky top-0 z-10 border-b" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block">
                <Logo />
              </Link>
              <div className="h-5 w-px" style={{ background: isDark ? "#2A2A2A" : "#E5E5E5" }}></div>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>{user?.email}</p>
                  <span className="w-1 h-1 rounded-full" style={{ background: isDark ? "#2A2A2A" : "#D0D0D0" }}></span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600" style={{ fontFamily: amazonFont }}>Vérifié</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-md transition-colors"
              style={{ color: isDark ? "#AAAAAA" : "#666666", hover: isDark ? { color: "#fff" } : { color: "#0A0A0A" } }}
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: Home },
                { id: "orders", label: "Commandes", icon: ShoppingCart, count: orders.length },
                { id: "wishlist", label: "Favoris", icon: Heart, count: wishlist.length },
                { id: "addresses", label: "Adresses", icon: MapPin, count: addresses.length },
                { id: "security", label: "Sécurité", icon: Shield },
                { id: "help", label: "Aide", icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                      isActive
                        ? "text-white"
                        : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                    }`}
                    style={isActive ? { background: "#D4372B", fontFamily: amazonFont } : { fontFamily: amazonFont }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: isActive ? "rgba(255,255,255,0.2)" : isDark ? "#2A2A2A" : "#E5E5E5", color: isActive ? "#fff" : isDark ? "#AAAAAA" : "#666666" }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>
                  Bonjour, {user?.name?.split(' ')[0] || user?.email} !
                </h1>
                <p className="text-sm mt-0.5" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Bienvenue dans votre espace personnel</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Commandes", value: orders.length, icon: ShoppingCart, color: "blue" },
                { label: "Favoris", value: wishlist.length, icon: Heart, color: "red" },
                { label: "Adresses", value: addresses.length, icon: MapPin, color: "green" },
                { label: "Livrées", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package, color: "purple" }
              ].map((stat, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 bg-${stat.color}-50 rounded-md flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                    </div>
                    <span className="text-xl font-bold" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>{stat.value}</span>
                  </div>
                  <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {orders.length > 0 && (
              <div className="rounded-lg border p-4" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Dernières commandes</h2>
                <div className="space-y-2">
                  {orders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors"
                      style={{ background: isDark ? "#0A0A0A" : "#F9F9F9" }}
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Commande #{order.orderNumber}</p>
                        <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`} style={{ fontFamily: amazonFont }}>
                          {getStatusLabel(order.status)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: isDark ? "#666666" : "#CCCCCC" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-base font-semibold mb-3" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Mes commandes</h2>
            {loading.orders ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "#D4372B" }}></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 rounded-lg border cursor-pointer transition-shadow hover:shadow-sm"
                    style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Commande #{order.orderNumber}</p>
                        <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`} style={{ fontFamily: amazonFont }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                      <span className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>{formatPrice(order.total)}</span>
                      <button className="px-3 py-1.5 text-white text-xs rounded-md transition-colors" style={{ background: "#D4372B" }}>
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <Package className="w-12 h-12 mx-auto mb-3" style={{ color: isDark ? "#444" : "#D0D0D0" }} />
                <p className="text-sm mb-2" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Aucune commande pour le moment</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-4 py-1.5 text-white text-sm rounded-md transition-colors mt-2"
                  style={{ background: "#D4372B" }}
                >
                  Découvrir nos produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-base font-semibold mb-3" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Ma liste de souhaits</h2>
            {loading.wishlist ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "#D4372B" }}></div>
              </div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wishlist.map((item) => {
                  const productId = item.product?.id || item.productId
                  const productName = item.product?.name || item.productName || "Produit"
                  const productImage = item.product?.images?.[0]
                  const productPrice = item.product?.price || item.price || 0
                  
                  return (
                    <div key={item.id} className="p-3 rounded-lg border group relative" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        style={{ background: isDark ? "#1A1A1A" : "#fff" }}
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      </button>
                      <div 
                        className="aspect-square rounded-md mb-2 flex items-center justify-center overflow-hidden cursor-pointer"
                        style={{ background: isDark ? "#0A0A0A" : "#F4F4F4" }}
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productImage ? (
                          <Image 
                            src={productImage} 
                            alt={productName} 
                            width={120} 
                            height={120} 
                            className="object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <Package className="w-8 h-8" style={{ color: isDark ? "#444" : "#D0D0D0" }} />
                        )}
                      </div>
                      <h3 
                        className="text-xs font-medium mb-1 line-clamp-2 cursor-pointer"
                        style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productName}
                      </h3>
                      <p className="text-sm font-bold" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>
                        {formatPrice(productPrice)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: isDark ? "#444" : "#D0D0D0" }} />
                <p className="text-sm mb-2" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Votre wishlist est vide</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-4 py-1.5 text-white text-sm rounded-md transition-colors mt-2"
                  style={{ background: "#D4372B" }}
                >
                  Explorer les produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Mes adresses</h2>
              <button 
                onClick={() => router.push("/account/addresses")}
                className="px-3 py-1.5 text-white text-xs rounded-md transition-colors flex items-center gap-1"
                style={{ background: "#D4372B" }}
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
            </div>
            {loading.addresses ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "#D4372B" }}></div>
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {addresses.map((address) => (
                  <div key={address.id} className="p-4 rounded-lg border relative" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                    {address.isDefault && (
                      <span className="absolute top-3 right-3 px-1.5 py-0.5 text-[10px] rounded" style={{ background: isDark ? "#2A2A2A" : "#F4F4F4", color: isDark ? "#AAAAAA" : "#666666" }}>
                        Par défaut
                      </span>
                    )}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: isDark ? "#0A0A0A" : "#F4F4F4" }}>
                        <MapPin className="w-4 h-4" style={{ color: isDark ? "#AAAAAA" : "#666666" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>{address.firstName} {address.lastName}</p>
                        <p className="text-xs mt-0.5" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>{address.address}</p>
                        <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>{address.city}, {address.country}</p>
                        <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-3 border-t" style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                      <button onClick={() => router.push(`/account/addresses?edit=${address.id}`)} className="text-xs hover:underline" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                        Modifier
                      </button>
                      {!address.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(address.id)} className="text-xs hover:underline" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                          Définir par défaut
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(address.id)} className="text-xs hover:underline" style={{ color: "#D4372B" }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: isDark ? "#444" : "#D0D0D0" }} />
                <p className="text-sm mb-2" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Aucune adresse enregistrée</p>
                <button 
                  onClick={() => router.push("/account/addresses")}
                  className="px-4 py-1.5 text-white text-sm rounded-md transition-colors mt-2"
                  style={{ background: "#D4372B" }}
                >
                  Ajouter une adresse
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold mb-3" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Paramètres de sécurité</h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg border" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: isDark ? "#0A2A4A" : "#EFF6FF" }}>
                      <Lock className="w-4 h-4" style={{ color: isDark ? "#60A5FA" : "#2563EB" }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Mot de passe</h3>
                      <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Dernière modification il y a 30 jours</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 border rounded-md text-xs transition-colors" style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5", color: isDark ? "#AAAAAA" : "#666666" }}>
                    Modifier
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mot de passe fort</span>
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: isDark ? "#0A2A0A" : "#ECFDF5" }}>
                      <Smartphone className="w-4 h-4" style={{ color: isDark ? "#34D399" : "#059669" }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Authentification à 2 facteurs</h3>
                      <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Protection supplémentaire</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-white text-xs rounded-md transition-colors" style={{ background: "#D4372B" }}>
                    Activer
                  </button>
                </div>
                <p className="text-xs" style={{ color: isDark ? "#AAAAAA" : "#666666", fontFamily: amazonFont }}>Protégez votre compte avec une vérification en deux étapes</p>
              </div>

              <div className="p-4 rounded-lg border" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Sessions actives</h3>
                <div className="p-3 rounded-md" style={{ background: isDark ? "#0A0A0A" : "#F9F9F9" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                        <Smartphone className="w-3.5 h-3.5" style={{ color: isDark ? "#AAAAAA" : "#666666" }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Appareil actuel</p>
                        <p className="text-[10px]" style={{ color: isDark ? "#666666" : "#999999" }}>Dernière activité: il y a quelques minutes</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-600">Session actuelle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold mb-3" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Centre d'aide</h2>
            
            <div className="rounded-lg border p-4" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
              <form className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                    Sujet
                  </label>
                  <select className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20" style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>
                    <option>Problème de commande</option>
                    <option>Problème de livraison</option>
                    <option>Question sur un produit</option>
                    <option>Problème de compte</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: isDark ? "#DDDDDD" : "#555555", fontFamily: amazonFont }}>
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4372B]/20"
                    style={{ background: isDark ? "#0A0A0A" : "#fff", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E5E5", color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}
                    placeholder="Décrivez votre problème..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white text-sm rounded-md transition-colors font-medium"
                  style={{ background: "#D4372B" }}
                >
                  Envoyer
                </button>
              </form>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? "#2A2A2A" : "#E5E5E5" }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? "#fff" : "#0A0A0A", fontFamily: amazonFont }}>Questions fréquentes</h3>
                <div className="space-y-1.5">
                  <button className="text-xs hover:underline block" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                    • Comment suivre ma commande ?
                  </button>
                  <button className="text-xs hover:underline block" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                    • Délais de livraison moyens
                  </button>
                  <button className="text-xs hover:underline block" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                    • Politique de retour
                  </button>
                  <button className="text-xs hover:underline block" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                    • Comment modifier mon adresse ?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}