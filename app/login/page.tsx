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

// ============================================================
// COMPOSANT INTERNE QUI UTILISE useSearchParams
// ============================================================
function UserLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'
  
  const { login, register, user, isLoading: authLoading } = useAuth()

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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {step === "login" && "Connexion client"}
            {step === "register" && "Créer un compte"}
            {step === "verify" && "Vérification"}
          </CardTitle>
          <CardDescription>
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
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </button>
          )}

          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 flex items-start gap-2 border border-green-200">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step !== "verify" && (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === "email"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === "phone"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </button>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="csrf" value={csrfToken.current} />

            {step !== "verify" && (
              <>
                {step === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required={step === "register"}
                    />
                  </div>
                )}

                {loginMethod === "email" ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        +225
                      </span>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="01 23 45 67 89"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="rounded-l-none"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {step === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    step === "login" ? "Se connecter" : "Créer mon compte"
                  )}
                </Button>
              </>
            )}

            {step === "verify" && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MailCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nous avons envoyé un code à 6 chiffres à
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {loginMethod === "email" ? formData.email : formData.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Code de vérification</Label>
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
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Renvoyer le code dans {countdown} secondes
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    Renvoyer le code
                  </button>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting || formData.verificationCode.length !== 6}>
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
              <span className="text-muted-foreground">
                {step === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setStep(step === "login" ? "register" : "login")
                  setError("")
                  setSuccess("")
                  setFormData(prev => ({ ...prev, verificationCode: "", password: "", confirmPassword: "" }))
                }}
                className="text-primary hover:underline"
              >
                {step === "login" ? "Inscrivez-vous" : "Connectez-vous"}
              </button>
            </div>
          )}

          <div className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-3">
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Adullam</CardTitle>
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