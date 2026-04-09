"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Home, ShoppingCart, HelpCircle, User, LogOut, 
  Mail, Phone, MapPin, Package, Heart, ChevronRight, 
  AlertCircle, Eye, EyeOff, ArrowLeft, Shield, CheckCircle,
  Clock, Lock, Key, Smartphone, MailCheck, Plus
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/admin/auth-context"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook, FaApple } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { ordersApi, addressesApi, wishlistApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { Header } from "@/components/header"
import MobileNav from "@/components/mobile-nav"

export default function AccountPage() {
  const router = useRouter()
  const { user, login, register, logout, isLoading: authLoading } = useAuth()
  const { formatPrice } = useCurrencyFormatter()

  const [isLogged, setIsLogged] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState({ orders: false, wishlist: false, addresses: false })

  // Auth states
  const [step, setStep] = useState<"login" | "register" | "verify">("login")
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "", verificationCode: ""
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
      if (response.success) setOrders(response.data || [])
    } catch (error) { console.error(error) } 
    finally { setLoading(prev => ({ ...prev, orders: false })) }

    setLoading(prev => ({ ...prev, wishlist: true }))
    try {
      const response = await wishlistApi.list()
      if (response.success) setWishlist(response.data || [])
    } catch (error) { console.error(error) }
    finally { setLoading(prev => ({ ...prev, wishlist: false })) }

    setLoading(prev => ({ ...prev, addresses: true }))
    try {
      const response = await addressesApi.list()
      if (response.success) setAddresses(response.addresses || [])
    } catch (error) { console.error(error) }
    finally { setLoading(prev => ({ ...prev, addresses: false })) }
  }

  const checkRateLimit = (): boolean => {
    if (blockedUntil && new Date() < blockedUntil) {
      const minutes = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000)
      setError(`Trop de tentatives. Réessayez dans ${minutes} minute(s)`)
      return false
    }
    if (attempts >= 3) {
      setBlockedUntil(new Date(Date.now() + 15 * 60000))
      setError("Trop de tentatives. Compte bloqué 15 minutes.")
      return false
    }
    return true
  }

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) return { valid: false, message: "Minimum 8 caractères" }
    if (!/[A-Z]/.test(password)) return { valid: false, message: "Au moins une majuscule" }
    if (!/[0-9]/.test(password)) return { valid: false, message: "Au moins un chiffre" }
    if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: "Au moins un caractère spécial" }
    return { valid: true, message: "Mot de passe valide" }
  }

  const sanitizeInput = (input: string): string => input.replace(/[<>]/g, '')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: sanitizeInput(e.target.value) }))
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
      identifier = loginMethod === "email" ? identifier.toLowerCase().trim() : identifier.replace(/\s/g, '')

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
          setCountdown(prev => { if (prev <= 1) { clearInterval(timer); return 0 } return prev - 1 })
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
        identifier = loginMethod === "email" ? identifier.toLowerCase().trim() : identifier.replace(/\s/g, '')
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
        identifier = loginMethod === "email" ? identifier.toLowerCase().trim() : identifier.replace(/\s/g, '')
        
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

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return
    try {
      const response = await addressesApi.delete(id)
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse supprimée")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) { console.error(error) }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const response = await addressesApi.update(id, { isDefault: true })
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse par défaut mise à jour")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) { console.error(error) }
  }

  const handleRemoveFromWishlist = async (id: string) => {
    if (!confirm("Voulez-vous retirer ce produit ?")) return
    try {
      const response = await wishlistApi.remove(id)
      if (response.success) {
        await fetchUserData()
        setSuccess("Produit retiré")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) { console.error(error) }
  }

  const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      "PENDING": "En attente", "CONFIRMED": "Confirmée", "PROCESSING": "En cours",
      "SHIPPED": "Expédiée", "DELIVERED": "Livrée", "CANCELLED": "Annulée"
    }
    return map[status] || status
  }

  const getStatusColor = (status: string): string => {
    const map: Record<string, string> = {
      "PENDING": "bg-amber-100 text-amber-700",
      "CONFIRMED": "bg-blue-100 text-blue-700",
      "PROCESSING": "bg-purple-100 text-purple-700",
      "SHIPPED": "bg-indigo-100 text-indigo-700",
      "DELIVERED": "bg-emerald-100 text-emerald-700",
      "CANCELLED": "bg-red-100 text-red-700"
    }
    return map[status] || "bg-gray-100 text-gray-700"
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="max-w-md w-full">
            <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Retour</span>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Adullam</h1>
              <p className="text-sm text-gray-500 mt-1">Espace sécurisé</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {step === "login" && "Connexion"}
                    {step === "register" && "Inscription"}
                    {step === "verify" && "Vérification"}
                  </h2>
                  {step !== "login" && (
                    <button onClick={() => { setStep("login"); setError(""); setSuccess(""); }} className="text-sm text-gray-400 hover:text-gray-600">
                      Retour
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm text-emerald-600">{success}</p>
                  </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="csrf" value={csrfToken.current} />

                  {step !== "verify" && (
                    <>
                      {step === "register" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20" placeholder="Jean Dupont" required />
                        </div>
                      )}

                      {loginMethod === "email" ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20" placeholder="vous@exemple.com" required />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500">+225</span>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="flex-1 px-4 py-2.5 border rounded-r-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20" placeholder="01 23 45 67 89" required />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 pr-10" placeholder="••••••••" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {step === "register" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                          <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 pr-10" placeholder="••••••••" required />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {step !== "register" && loginMethod === "email" && (
                          <button type="button" className="text-sm text-gray-400 hover:text-gray-600">Mot de passe oublié ?</button>
                        )}
                        <div className="flex-1"></div>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                          {isSubmitting ? "Chargement..." : (step === "login" ? "Se connecter" : "Continuer")}
                        </button>
                      </div>
                    </>
                  )}

                  {step === "verify" && (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MailCheck className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Vérification</h3>
                        <p className="text-sm text-gray-500 mt-1">Code envoyé à {loginMethod === "email" ? formData.email : formData.phone}</p>
                      </div>

                      <div>
                        <input type="text" name="verificationCode" value={formData.verificationCode} onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))} className="w-full px-4 py-3 text-center text-2xl tracking-[0.3em] font-mono border border-gray-200 rounded-xl" placeholder="000000" maxLength={6} required />
                      </div>

                      {countdown > 0 ? (
                        <p className="text-sm text-gray-400 text-center">Renvoyer dans {countdown}s</p>
                      ) : (
                        <button type="button" onClick={handleSendCode} className="text-sm text-gray-500 hover:text-gray-700 text-center w-full">Renvoyer le code</button>
                      )}

                      <button type="submit" disabled={isSubmitting || formData.verificationCode.length !== 6} className="w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 mt-4">
                        {isSubmitting ? "Vérification..." : "Créer mon compte"}
                      </button>
                    </>
                  )}
                </form>

                {step !== "verify" && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                      <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-gray-400">Ou</span></div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 opacity-50 cursor-not-allowed" disabled>Google</button>
                      <button className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 opacity-50 cursor-not-allowed" disabled>Facebook</button>
                    </div>

                    <p className="text-sm text-center mt-6 text-gray-500">
                      {step === "login" ? "Pas de compte ?" : "Déjà inscrit ?"}{" "}
                      <button onClick={() => { setStep(step === "login" ? "register" : "login"); setError(""); setSuccess(""); }} className="text-gray-900 font-medium">
                        {step === "login" ? "Inscription" : "Connexion"}
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name || user?.email}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100">
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
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${activeTab === item.id ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">{item.count}</span>}
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
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.name?.split(' ')[0] || 'Cher client'}</h1>
              <p className="text-gray-400 mt-1">Bienvenue dans votre espace personnel</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Commandes", value: orders.length, icon: ShoppingCart },
                { label: "Favoris", value: wishlist.length, icon: Heart },
                { label: "Adresses", value: addresses.length, icon: MapPin },
                { label: "Livrées", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {orders.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-medium text-gray-900 mb-4">Dernières commandes</h2>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => router.push(`/account/orders/${order.id}`)}>
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes commandes</h2>
            {loading.orders ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/account/orders/${order.id}`)}>
                    <div className="flex justify-between items-start mb-4">
                      <div><p className="text-sm text-gray-400">Commande #{order.orderNumber}</p><p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Détails</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100"><Package className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400 mb-4">Aucune commande</p><button onClick={() => router.push("/products")} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Découvrir</button></div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes favoris</h2>
            {loading.wishlist ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map((item) => {
                  const productId = item.product?.id || item.productId
                  const productName = item.product?.name || item.productName || "Produit"
                  const productImage = item.product?.images?.[0]
                  const productPrice = item.product?.price || item.price || 0
                  return (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group relative">
                      <button onClick={() => handleRemoveFromWishlist(item.id)} className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"><Heart className="w-3.5 h-3.5 text-red-500" /></button>
                      <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => router.push(`/products/${productId}`)}>
                        {productImage ? <Image src={productImage} alt={productName} width={200} height={200} className="object-cover" /> : <Package className="w-10 h-10 text-gray-300" />}
                      </div>
                      <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 cursor-pointer" onClick={() => router.push(`/products/${productId}`)}>{productName}</h3>
                      <p className="text-base font-bold text-gray-900">{formatPrice(productPrice)}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100"><Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">Aucun favori</p></div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-gray-900">Mes adresses</h2><button onClick={() => router.push("/account/addresses")} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 flex items-center gap-2"><Plus className="w-4 h-4" />Ajouter</button></div>
            {loading.addresses ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
            ) : addresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
                    {address.isDefault && <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">Défaut</span>}
                    <div className="flex items-start gap-3 mb-4"><div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-gray-500" /></div><div><p className="font-medium text-gray-900">{address.firstName} {address.lastName}</p><p className="text-sm text-gray-500 mt-1">{address.address}</p><p className="text-sm text-gray-500">{address.city}, {address.country}</p><p className="text-sm text-gray-500">{address.phone}</p></div></div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100"><button onClick={() => router.push(`/account/addresses?edit=${address.id}`)} className="text-sm text-gray-500 hover:text-gray-700">Modifier</button>{!address.isDefault && <button onClick={() => handleSetDefaultAddress(address.id)} className="text-sm text-gray-500 hover:text-gray-700">Définir défaut</button>}<button onClick={() => handleDeleteAddress(address.id)} className="text-sm text-red-500 hover:text-red-600">Supprimer</button></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100"><MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400 mb-4">Aucune adresse</p><button onClick={() => router.push("/account/addresses")} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Ajouter</button></div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-100"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Lock className="w-5 h-5 text-gray-600" /></div><div><h3 className="font-medium text-gray-900">Mot de passe</h3><p className="text-sm text-gray-400">Dernière modification il y a 30j</p></div></div><button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Modifier</button></div></div>
              <div className="bg-white p-6 rounded-xl border border-gray-100"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Smartphone className="w-5 h-5 text-gray-600" /></div><div><h3 className="font-medium text-gray-900">2FA</h3><p className="text-sm text-gray-400">Protection supplémentaire</p></div></div><button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Activer</button></div></div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="max-w-2xl"><h2 className="text-lg font-semibold text-gray-900 mb-4">Aide</h2><div className="bg-white rounded-xl border border-gray-100 p-6"><form className="space-y-4"><div><select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"><option>Problème de commande</option><option>Problème de livraison</option><option>Question produit</option><option>Autre</option></select></div><div><textarea rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" placeholder="Décrivez votre problème..."></textarea></div><button type="submit" className="w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800">Envoyer</button></form></div></div>
        )}
      </main>

      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}

function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}