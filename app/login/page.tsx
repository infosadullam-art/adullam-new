"use client"

import { useState, useEffect, useRef, Suspense } from "react"
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
import { Loader2, ShoppingBag, Mail, Phone, Lock, Key, Shield, AlertCircle, CheckCircle, MailCheck, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/admin/auth-context"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

// ============================================================
// COMPOSANT INTERNE QUI UTILISE useSearchParams
// ============================================================
function UserLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'
  
  const { login, register, user, isLoading: authLoading } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // États du formulaire
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

  // Redirection si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirect)
    }
  }, [user, authLoading, router, redirect])

  // Vérification des tentatives
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

  // Validation du mot de passe
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) return { valid: false, message: "Minimum 8 caractères" }
    if (!/[A-Z]/.test(password)) return { valid: false, message: "Au moins une majuscule" }
    if (!/[0-9]/.test(password)) return { valid: false, message: "Au moins un chiffre" }
    if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: "Au moins un caractère spécial" }
    return { valid: true, message: "Mot de passe valide" }
  }

  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>]/g, '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: sanitizeInput(value) }))
    setError("")
  }

  // Envoi du code de vérification
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

  // Soumission du formulaire
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
          setTimeout(() => router.push(redirect), 2000)
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: isDark ? "#0A0A0A" : "#F4F4F4" }}>
      <Card className="w-full max-w-md" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#ECECEC" }}>
        <CardHeader className="text-center">
          <Link 
            href="/" 
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{ background: "#D4372B" }}
          >
            <ShoppingBag className="h-6 w-6 text-white" />
          </Link>
          <CardTitle className="text-2xl" style={{ color: isDark ? "#fff" : "#0A0A0A" }}>
            {step === "login" && "Connexion client"}
            {step === "register" && "Créer un compte"}
            {step === "verify" && "Vérification"}
          </CardTitle>
          <CardDescription style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
            {step === "login" && "Connectez-vous pour accéder à votre espace client"}
            {step === "register" && "Créez votre compte en quelques secondes"}
            {step === "verify" && "Entrez le code reçu"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step !== "login" && (
            <button
              onClick={() => {
                setStep("login")
                setError("")
                setSuccess("")
              }}
              className="flex items-center gap-2 text-sm mb-4 transition-colors"
              style={{ color: isDark ? "#AAAAAA" : "#666666" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </button>
          )}

          {error && (
            <div className="mb-4 rounded-md p-3 text-sm flex items-start gap-2" style={{ background: isDark ? "#3A0A0A" : "#FFF0F0", border: isDark ? "0.5px solid #5A1A1A" : "0.5px solid #FECACA", color: "#D4372B" }}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md p-3 text-sm flex items-start gap-2" style={{ background: isDark ? "#0A2A0A" : "#F0FFF0", border: isDark ? "0.5px solid #1A5A1A" : "0.5px solid #A0E0A0", color: isDark ? "#66CC66" : "#2D7D2D" }}>
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step !== "verify" && (
            <div className="flex gap-2 mb-6">
              {/* Bouton Email - Actif */}
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("email")
                  setError("")
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === "email"
                    ? "text-white shadow-sm"
                    : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-100"
                }`}
                style={loginMethod === "email" ? { background: "#D4372B" } : { background: isDark ? "#0A0A0A" : "#F4F4F4" }}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </button>

              {/* Bouton Téléphone - DÉSACTIVÉ */}
              <button
                type="button"
                onClick={() => {
                  setError("❌ La connexion par téléphone n'est pas disponible. Veuillez utiliser votre email.")
                  setTimeout(() => setError(""), 4000)
                }}
                disabled={true}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-not-allowed relative overflow-hidden ${
                  loginMethod === "phone"
                    ? "text-white"
                    : isDark ? "text-gray-500" : "text-gray-400"
                }`}
                style={{
                  background: isDark ? "#1A1A1A" : "#E8E8E8",
                  border: isDark ? "1px solid #2A2A2A" : "1px solid #D0D0D0",
                  opacity: 0.6,
                  transform: "scale(0.97)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
                title="La connexion par téléphone n'est pas disponible"
              >
                {/* Overlay de blocage */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: isDark ? "rgba(0,0,0,0.3)" : "rgba(200,200,200,0.2)",
                    backdropFilter: "blur(1px)"
                  }}
                >
                  <span className="text-[8px] uppercase font-bold tracking-wider" style={{ color: isDark ? "#666" : "#999" }}>
                    🔒 Bloqué
                  </span>
                </div>
                <Phone className="w-4 h-4 inline mr-2 opacity-50" />
                Téléphone
                <span className="ml-1 text-[8px] uppercase opacity-50">(indisponible)</span>
              </button>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="csrf" value={csrfToken.current} />

            {step !== "verify" && (
              <>
                {step === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>Nom complet</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required={step === "register"}
                      className={isDark ? "bg-[#0A0A0A] border-gray-700 text-white" : ""}
                    />
                  </div>
                )}

                {loginMethod === "email" ? (
                  <div className="space-y-2">
                    <Label htmlFor="email" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>Adresse email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                      className={isDark ? "bg-[#0A0A0A] border-gray-700 text-white" : ""}
                    />
                  </div>
                ) : (
                  <div className="space-y-2 opacity-50 pointer-events-none">
                    <Label htmlFor="phone" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>
                      Numéro de téléphone
                      <span className="ml-1 text-xs" style={{ color: isDark ? "#666" : "#999" }}>(indisponible)</span>
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 text-sm" style={{ background: isDark ? "#0A0A0A" : "#F4F4F4", color: isDark ? "#AAAAAA" : "#666666", borderColor: isDark ? "#2A2A2A" : "#ECECEC" }}>
                        +225
                      </span>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="01 23 45 67 89"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`rounded-l-none ${isDark ? "bg-[#0A0A0A] border-gray-700 text-gray-500" : "bg-gray-100 text-gray-400"}`}
                        disabled={true}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting || loginMethod === "phone"}
                      required
                      className={isDark ? "bg-[#0A0A0A] border-gray-700 text-white" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: isDark ? "#AAAAAA" : "#666666" }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {step === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isSubmitting || loginMethod === "phone"}
                        required
                        className={isDark ? "bg-[#0A0A0A] border-gray-700 text-white" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: isDark ? "#AAAAAA" : "#666666" }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full text-white"
                  style={{ background: loginMethod === "phone" ? "#888" : "#D4372B" }}
                  disabled={isSubmitting || loginMethod === "phone"}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    loginMethod === "phone" ? "⛔ Indisponible" : (step === "login" ? "Se connecter" : "Créer mon compte")
                  )}
                </Button>
              </>
            )}

            {step === "verify" && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: isDark ? "#0A2A0A" : "#F0FFF0" }}>
                    <MailCheck className="w-6 h-6" style={{ color: isDark ? "#66CC66" : "#2D7D2D" }} />
                  </div>
                  <p className="text-sm" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                    Nous avons envoyé un code à 6 chiffres à
                  </p>
                  <p className="text-sm font-medium mt-1" style={{ color: isDark ? "#fff" : "#0A0A0A" }}>
                    {loginMethod === "email" ? formData.email : formData.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>Code de vérification</Label>
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    placeholder="000000"
                    value={formData.verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      setFormData(prev => ({ ...prev, verificationCode: value }))
                    }}
                    className={`text-center text-2xl tracking-[0.5em] font-mono ${isDark ? "bg-[#0A0A0A] border-gray-700 text-white" : ""}`}
                    maxLength={6}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {countdown > 0 ? (
                  <p className="text-sm text-center" style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                    Renvoyer le code dans {countdown} secondes
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="w-full text-sm hover:underline"
                    style={{ color: "#D4372B" }}
                  >
                    Renvoyer le code
                  </button>
                )}

                <Button 
                  type="submit" 
                  className="w-full text-white"
                  style={{ background: "#D4372B" }}
                  disabled={isSubmitting || formData.verificationCode.length !== 6}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Vérifier et créer mon compte"
                  )}
                </Button>
              </>
            )}
          </form>

          {step !== "verify" && (
            <div className="mt-6 text-center text-sm">
              <span style={{ color: isDark ? "#AAAAAA" : "#666666" }}>
                {step === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setStep(step === "login" ? "register" : "login")
                  setError("")
                  setSuccess("")
                  // Si on était en mode téléphone, revenir à email
                  if (loginMethod === "phone") {
                    setLoginMethod("email")
                  }
                  setFormData(prev => ({ ...prev, verificationCode: "", password: "", confirmPassword: "" }))
                }}
                className="hover:underline"
                style={{ color: "#D4372B" }}
              >
                {step === "login" ? "Inscrivez-vous" : "Connectez-vous"}
              </button>
            </div>
          )}

          <div className="mt-4 text-center text-xs flex items-center justify-center gap-3" style={{ color: isDark ? "#666666" : "#999999" }}>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Chiffré 256-bit</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Protégé</span>
            </div>
            <div className="flex items-center gap-1">
              <Key className="w-3 h-3" />
              <span>2FA disponible</span>
            </div>
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
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: isDark ? "#0A0A0A" : "#F4F4F4" }}>
      <Card className="w-full max-w-md" style={{ background: isDark ? "#1A1A1A" : "#fff", borderColor: isDark ? "#2A2A2A" : "#ECECEC" }}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#D4372B" }}>
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl" style={{ color: isDark ? "#fff" : "#0A0A0A" }}>Adullam</CardTitle>
          <CardDescription style={{ color: isDark ? "#AAAAAA" : "#666666" }}>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#D4372B" }} />
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// PAGE PRINCIPALE AVEC SUSPENSE BOUNDARY
// ============================================================
export default function UserLoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <UserLoginContent />
    </Suspense>
  )
}

// ============================================================
// UTILS
// ============================================================
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}