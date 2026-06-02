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

// Police Amazon Ember
const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Logo
const Logo = () => (
  <div className="flex items-center">
    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", letterSpacing: "-0.04em", color: "#0A0A0A" }}>
      adul<span style={{ color: "#D4372B" }}>.</span>lam
    </span>
  </div>
)

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function AccountPage() {
  const router = useRouter()
  const { user, login, register, logout, isLoading: authLoading } = useAuth()
  const { formatPrice } = useCurrencyFormatter()

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FAFAFA" }}>
        <div className="max-w-md w-full">
          
          <div className="text-center mb-6">
            <Logo />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: amazonFont }}>
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
                    className="text-xs text-gray-500 hover:text-gray-700"
                    style={{ fontFamily: amazonFont }}
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
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={{ fontFamily: amazonFont }}
                  >
                    <Mail className="w-3 h-3 inline mr-1.5" />
                    Email
                  </button>
                  <button
                    onClick={() => setLoginMethod("phone")}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                      loginMethod === "phone"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={{ fontFamily: amazonFont }}
                  >
                    <Phone className="w-3 h-3 inline mr-1.5" />
                    Téléphone
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600" style={{ fontFamily: amazonFont }}>{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-600" style={{ fontFamily: amazonFont }}>{success}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                
                <input type="hidden" name="csrf" value={csrfToken.current} />

                {step !== "verify" && (
                  <>
                    {step === "register" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
                          Nom complet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                          placeholder="Jean Dupont"
                          style={{ fontFamily: amazonFont }}
                          required
                        />
                      </div>
                    )}

                    {loginMethod === "email" ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
                          Adresse email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                          placeholder="vous@exemple.com"
                          style={{ fontFamily: amazonFont }}
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
                          Numéro de téléphone
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                            +225
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 text-sm border rounded-r-md border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                            placeholder="01 23 45 67 89"
                            style={{ fontFamily: amazonFont }}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900/20 pr-9"
                          placeholder="••••••••"
                          style={{ fontFamily: amazonFont }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {step === "register" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900/20 pr-9"
                            placeholder="••••••••"
                            style={{ fontFamily: amazonFont }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md text-sm transition-all hover:bg-gray-800 disabled:opacity-50"
                      style={{ fontFamily: amazonFont }}
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
                        step === "login" ? "Se connecter" : "Créer mon compte"
                      )}
                    </button>
                  </>
                )}

                {step === "verify" && (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <MailCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5" style={{ fontFamily: amazonFont }}>
                        Vérification
                      </h3>
                      <p className="text-[11px] text-gray-500" style={{ fontFamily: amazonFont }}>
                        Code envoyé à {loginMethod === "email" ? formData.email : formData.phone}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
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
                        className="w-full px-3 py-2 text-center text-base tracking-[0.3em] font-mono border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>

                    {countdown > 0 ? (
                      <p className="text-xs text-gray-500 text-center" style={{ fontFamily: amazonFont }}>
                        Renvoyer dans {countdown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        className="w-full text-xs text-gray-600 hover:text-gray-900 hover:underline"
                        style={{ fontFamily: amazonFont }}
                      >
                        Renvoyer le code
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || formData.verificationCode.length !== 6}
                      className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md text-sm transition-all hover:bg-gray-800 disabled:opacity-50 mt-2"
                      style={{ fontFamily: amazonFont }}
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
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-gray-400" style={{ fontFamily: amazonFont }}>Ou</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: FcGoogle, label: "Google", color: "" },
                      { icon: FaFacebook, label: "Facebook", color: "text-blue-600" },
                      { icon: FaApple, label: "Apple", color: "" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => alert("Connexion bientôt disponible")}
                        className="flex items-center justify-center py-2 px-3 border border-gray-200 rounded-md opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step !== "verify" && (
                <p className="text-xs text-center mt-4 text-gray-500" style={{ fontFamily: amazonFont }}>
                  {step === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
                  <button
                    onClick={() => {
                      setStep(step === "login" ? "register" : "login")
                      setError("")
                      setSuccess("")
                    }}
                    className="text-gray-900 font-medium hover:underline"
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
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              <div className="h-5 w-px bg-gray-200"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: amazonFont }}>{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>{user?.email}</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600" style={{ fontFamily: amazonFont }}>Vérifié</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200">
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
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                      activeTab === item.id
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={{ fontFamily: amazonFont }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-0.5 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
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
                <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: amazonFont }}>
                  Bonjour, {user?.name?.split(' ')[0] || user?.email} !
                </h1>
                <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: amazonFont }}>Bienvenue dans votre espace personnel</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Commandes", value: orders.length, icon: ShoppingCart, color: "blue" },
                { label: "Favoris", value: wishlist.length, icon: Heart, color: "red" },
                { label: "Adresses", value: addresses.length, icon: MapPin, color: "green" },
                { label: "Livrées", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package, color: "purple" }
              ].map((stat, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 bg-${stat.color}-50 rounded-md flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                    </div>
                    <span className="text-xl font-bold text-gray-900" style={{ fontFamily: amazonFont }}>{stat.value}</span>
                  </div>
                  <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {orders.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: amazonFont }}>Dernières commandes</h2>
                <div className="space-y-2">
                  {orders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900" style={{ fontFamily: amazonFont }}>Commande #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`} style={{ fontFamily: amazonFont }}>
                          {getStatusLabel(order.status)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
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
            <h2 className="text-base font-semibold text-gray-900 mb-3" style={{ fontFamily: amazonFont }}>Mes commandes</h2>
            {loading.orders ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>Commande #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`} style={{ fontFamily: amazonFont }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: amazonFont }}>{formatPrice(order.total)}</span>
                      <button className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors">
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: amazonFont }}>Aucune commande pour le moment</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors mt-2"
                >
                  Découvrir nos produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3" style={{ fontFamily: amazonFont }}>Ma liste de souhaits</h2>
            {loading.wishlist ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wishlist.map((item) => {
                  const productId = item.product?.id || item.productId
                  const productName = item.product?.name || item.productName || "Produit"
                  const productImage = item.product?.images?.[0]
                  const productPrice = item.product?.price || item.price || 0
                  
                  return (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 group relative">
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      </button>
                      <div 
                        className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden cursor-pointer"
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
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <h3 
                        className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-gray-700"
                        onClick={() => router.push(`/products/${productId}`)}
                        style={{ fontFamily: amazonFont }}
                      >
                        {productName}
                      </h3>
                      <p className="text-sm font-bold text-gray-900" style={{ fontFamily: amazonFont }}>
                        {formatPrice(productPrice)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: amazonFont }}>Votre wishlist est vide</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors mt-2"
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
              <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: amazonFont }}>Mes adresses</h2>
              <button 
                onClick={() => router.push("/account/addresses")}
                className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
            </div>
            {loading.addresses ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white p-4 rounded-lg border border-gray-200 relative">
                    {address.isDefault && (
                      <span className="absolute top-3 right-3 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">
                        Par défaut
                      </span>
                    )}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900" style={{ fontFamily: amazonFont }}>{address.firstName} {address.lastName}</p>
                        <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: amazonFont }}>{address.address}</p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>{address.city}, {address.country}</p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                      <button onClick={() => router.push(`/account/addresses?edit=${address.id}`)} className="text-xs text-gray-600 hover:text-gray-900 hover:underline">
                        Modifier
                      </button>
                      {!address.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(address.id)} className="text-xs text-gray-600 hover:text-gray-900 hover:underline">
                          Définir par défaut
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(address.id)} className="text-xs text-red-500 hover:text-red-600 hover:underline">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: amazonFont }}>Aucune adresse enregistrée</p>
                <button 
                  onClick={() => router.push("/account/addresses")}
                  className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors mt-2"
                >
                  Ajouter une adresse
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-3" style={{ fontFamily: amazonFont }}>Paramètres de sécurité</h2>
            
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                      <Lock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900" style={{ fontFamily: amazonFont }}>Mot de passe</h3>
                      <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>Dernière modification il y a 30 jours</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 border border-gray-200 rounded-md text-xs hover:bg-gray-50 transition-colors">
                    Modifier
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mot de passe fort</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900" style={{ fontFamily: amazonFont }}>Authentification à 2 facteurs</h3>
                      <p className="text-xs text-gray-500" style={{ fontFamily: amazonFont }}>Protection supplémentaire</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors">
                    Activer
                  </button>
                </div>
                <p className="text-xs text-gray-600" style={{ fontFamily: amazonFont }}>Protégez votre compte avec une vérification en deux étapes</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3" style={{ fontFamily: amazonFont }}>Sessions actives</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                        <Smartphone className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900" style={{ fontFamily: amazonFont }}>Appareil actuel</p>
                        <p className="text-[10px] text-gray-500">Dernière activité: il y a quelques minutes</p>
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
            <h2 className="text-base font-semibold text-gray-900 mb-3" style={{ fontFamily: amazonFont }}>Centre d'aide</h2>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <form className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
                    Sujet
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900/20" style={{ fontFamily: amazonFont }}>
                    <option>Problème de commande</option>
                    <option>Problème de livraison</option>
                    <option>Question sur un produit</option>
                    <option>Problème de compte</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: amazonFont }}>
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                    placeholder="Décrivez votre problème..."
                    style={{ fontFamily: amazonFont }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors font-medium"
                  style={{ fontFamily: amazonFont }}
                >
                  Envoyer
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2" style={{ fontFamily: amazonFont }}>Questions fréquentes</h3>
                <div className="space-y-1.5">
                  <button className="text-xs text-gray-600 hover:text-gray-900 hover:underline block">
                    • Comment suivre ma commande ?
                  </button>
                  <button className="text-xs text-gray-600 hover:text-gray-900 hover:underline block">
                    • Délais de livraison moyens
                  </button>
                  <button className="text-xs text-gray-600 hover:text-gray-900 hover:underline block">
                    • Politique de retour
                  </button>
                  <button className="text-xs text-gray-600 hover:text-gray-900 hover:underline block">
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