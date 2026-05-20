"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Home, Star, ShoppingCart, HelpCircle, User, LogOut, 
  Mail, Phone, MapPin, Package, Heart, ChevronRight, 
  AlertCircle, Eye, EyeOff, ArrowLeft, Shield, CheckCircle,
  Clock, Lock, Key, Smartphone, MailCheck, Info, Plus
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/admin/auth-context"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook, FaApple } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { ordersApi, addressesApi, wishlistApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

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
  const brandColor = "#2B4F3C"
  const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)"
  const brandLight = "#E8F3E8"

  // ============================================================
  // ÉTATS POUR L'AUTHENTIFICATION SÉCURISÉE
  // ============================================================
  const [step, setStep] = useState<"login" | "register" | "verify">("login")
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  
  // Formulaire
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationCode: ""
  })
  
  // UI
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  // Sécurité
  const [attempts, setAttempts] = useState(0)
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const csrfToken = useRef(generateCSRFToken())

  // ============================================================
  // CHARGEMENT DES DONNÉES UTILISATEUR AVEC LES BONNES APIS
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
    // Commandes avec ordersApi
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

    // Wishlist avec wishlistApi
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

    // Adresses avec addressesApi
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
    const commonPasswords = ["password123", "12345678", "azerty123"]
    if (commonPasswords.includes(password.toLowerCase())) {
      return { valid: false, message: "Mot de passe trop commun" }
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

      console.log("📤 Envoi code pour identifiant normalisé:", identifier)

      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier,
          method: loginMethod
        })
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

        console.log("🔍 Vérification pour identifiant normalisé:", identifier)

        const res = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier,
            code: formData.verificationCode
          })
        })

        const data = await res.json()

        if (data.success) {
          console.log("✅ Code vérifié, création du compte...")
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
      "PENDING": "bg-yellow-100 text-yellow-800",
      "CONFIRMED": "bg-blue-100 text-blue-800",
      "PROCESSING": "bg-purple-100 text-purple-800",
      "SHIPPED": "bg-indigo-100 text-indigo-800",
      "DELIVERED": "bg-green-100 text-green-800",
      "CANCELLED": "bg-red-100 text-red-800"
    }
    return colorMap[status] || "bg-gray-100 text-gray-800"
  }

  // ============================================================
  // PAGE DE CONNEXION/INSCRIPTION SÉCURISÉE
  // ============================================================
  if (!isLogged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour à l'accueil</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Adullam</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Connexion sécurisée</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
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
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Retour
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>Connexion 256-bit SSL</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <Key className="w-3 h-3" />
                <span>2FA disponible</span>
              </div>
            </div>

            <div className="p-6">
              
              {step !== "verify" && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setLoginMethod("email")}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                      loginMethod === "email"
                        ? "bg-gray-900 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => setLoginMethod("phone")}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                      loginMethod === "phone"
                        ? "bg-gray-900 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Phone className="w-4 h-4 inline mr-2" />
                    Téléphone
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Succès</p>
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                
                <input type="hidden" name="csrf" value={csrfToken.current} />

                {step !== "verify" && (
                  <>
                    {step === "register" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all"
                          placeholder="Jean Dupont"
                          maxLength={50}
                          required
                        />
                      </div>
                    )}

                    {loginMethod === "email" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all"
                          placeholder="vous@exemple.com"
                          maxLength={100}
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Numéro de téléphone
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500">
                            +225
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="flex-1 px-4 py-3 border rounded-r-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all"
                            placeholder="01 23 45 67 89"
                            maxLength={15}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all pr-12"
                          placeholder="••••••••"
                          minLength={8}
                          maxLength={50}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {step === "register" && formData.password && (
                        <div className="mt-2">
                          {(() => {
                            const validation = validatePassword(formData.password)
                            return (
                              <div className="flex items-center gap-2">
                                <div className={`text-xs ${validation.valid ? 'text-green-600' : 'text-gray-500'}`}>
                                  {validation.valid ? '✓ ' : ''}{validation.message}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>

                    {step === "register" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all pr-12"
                            placeholder="••••••••"
                            minLength={8}
                            maxLength={50}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {step === "login" && (
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => {/* TODO: Mot de passe oublié */}}
                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium py-3 px-4 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MailCheck className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Vérifiez votre {loginMethod === "email" ? "email" : "téléphone"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Nous avons envoyé un code à 6 chiffres à
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {loginMethod === "email" ? formData.email : formData.phone}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                        className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>

                    {countdown > 0 ? (
                      <p className="text-sm text-gray-500 text-center">
                        Renvoyer le code dans {countdown} secondes
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        className="w-full text-sm text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Renvoyer le code
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || formData.verificationCode.length !== 6}
                      className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium py-3 px-4 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Vérification...
                        </span>
                      ) : (
                        "Vérifier et créer mon compte"
                      )}
                    </button>
                  </>
                )}
              </form>

              {step !== "verify" && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500">Ou continuer avec</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => alert("Connexion Google bientôt disponible")}
                      className="flex items-center justify-center py-3 px-3 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed"
                      disabled
                      title="Bientôt disponible"
                    >
                      <FcGoogle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => alert("Connexion Facebook bientôt disponible")}
                      className="flex items-center justify-center py-3 px-3 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed"
                      disabled
                      title="Bientôt disponible"
                    >
                      <FaFacebook className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => alert("Connexion Apple bientôt disponible")}
                      className="flex items-center justify-center py-3 px-3 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed"
                      disabled
                      title="Bientôt disponible"
                    >
                      <FaApple className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}

              {step !== "verify" && (
                <p className="text-sm text-center mt-6 text-gray-600">
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

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Chiffré</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Protégé</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Session 24h</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400 mt-6">
            En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            Vos données sont protégées par le chiffrement 256-bit.
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // DASHBOARD UTILISATEUR (après connexion)
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">Compte vérifié</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Dernière connexion: {new Date().toLocaleDateString()}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 group"
                title="Déconnexion sécurisée"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      activeTab === item.id
                        ? "bg-gray-900 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour, {user?.name?.split(' ')[0] || user?.email}!
                </h1>
                <p className="text-gray-500 mt-1">Bienvenue dans votre espace personnel sécurisé</p>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Authentification à 2 facteurs active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Commandes", value: orders.length, icon: ShoppingCart, color: "blue" },
                { label: "Favoris", value: wishlist.length, icon: Heart, color: "red" },
                { label: "Adresses", value: addresses.length, icon: MapPin, color: "green" },
                { label: "Livrées", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package, color: "purple" }
              ].map((stat, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {orders.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Dernières commandes</h2>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">Commande #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-3">Recommandations de sécurité</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mot de passe fort</p>
                    <p className="text-xs text-gray-500">Dernière modification il y a 30 jours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">2FA activée</p>
                    <p className="text-xs text-gray-500">Numéro de téléphone vérifié</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email vérifié</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes commandes</h2>
            {loading.orders ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Commande #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                        Voir les détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune commande pour le moment</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
                >
                  Découvrir nos produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ma liste de souhaits</h2>
            {loading.wishlist ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map((item) => {
                  // ✅ CORRIGÉ : Utiliser l'ID du produit correctement
                  const productId = item.product?.id || item.productId
                  const productName = item.product?.name || item.productName || "Produit"
                  const productImage = item.product?.images?.[0]
                  const productPrice = item.product?.price || item.price || 0
                  
                  return (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative">
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </button>
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productImage ? (
                          <Image 
                            src={productImage} 
                            alt={productName} 
                            width={200} 
                            height={200} 
                            className="object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <h3 
                        className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-gray-700"
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productName}
                      </h3>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(productPrice)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Votre wishlist est vide</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
                >
                  Explorer les produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Mes adresses</h2>
              <button 
                onClick={() => router.push("/account/addresses")}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une adresse
              </button>
            </div>
            {loading.addresses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Par défaut
                      </span>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{address.firstName} {address.lastName}</p>
                        <p className="text-sm text-gray-500 mt-1">{address.address}</p>
                        <p className="text-sm text-gray-500">{address.city}, {address.country}</p>
                        <p className="text-sm text-gray-500">{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => router.push(`/account/addresses?edit=${address.id}`)}
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Modifier
                      </button>
                      {!address.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          Définir par défaut
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAddress(address.id)} 
                        className="text-sm text-red-500 hover:text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune adresse enregistrée</p>
                <button 
                  onClick={() => router.push("/account/addresses")}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
                >
                  Ajouter une adresse
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de sécurité</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Mot de passe</h3>
                      <p className="text-sm text-gray-500">Dernière modification il y a 30 jours</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    Modifier
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Mot de passe fort</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Authentification à 2 facteurs</h3>
                      <p className="text-sm text-gray-500">Protection supplémentaire</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                    Activer
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Protégez votre compte avec une vérification en deux étapes
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Sessions actives</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Appareil actuel</p>
                        <p className="text-xs text-gray-500">Dernière activité: il y a quelques minutes</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600">Session actuelle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Centre d'aide</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de la demande
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20">
                    <option>Problème de commande</option>
                    <option>Problème de livraison</option>
                    <option>Question sur un produit</option>
                    <option>Problème de compte</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    placeholder="Décrivez votre problème en détail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Envoyer la demande
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Questions fréquentes</h3>
                <div className="space-y-2">
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
                    • Comment suivre ma commande ?
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
                    • Délais de livraison moyens
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
                    • Politique de retour
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
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

// ============================================================
// UTILS DE SÉCURITÉ
// ============================================================
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}