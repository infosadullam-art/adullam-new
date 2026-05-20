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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2, ShoppingBag, Mail, Phone, Lock, Key, Shield,
  AlertCircle, CheckCircle, MailCheck, Eye, EyeOff, ArrowLeft,
  Smartphone
} from "lucide-react"
import { useAuth } from "@/lib/admin/auth-context"

const poppins = { fontFamily: "'Poppins', sans-serif" }

// ── UTILS ──────────────────────────────────────────────────────
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// ── COMPOSANT PRINCIPAL ────────────────────────────────────────
function UserLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/account"

  const { login, register, user, isLoading: authLoading } = useAuth()

  const [step, setStep] = useState<"login" | "register" | "verify">("login")
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "",
    confirmPassword: "", verificationCode: ""
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
    if (!authLoading && user) router.replace(redirect)
  }, [user, authLoading, router, redirect])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(p => p - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) return { valid: false, message: "Mot de passe trop court (8 caractères min)" }
    if (!/[A-Z]/.test(password)) return { valid: false, message: "Au moins une majuscule requise" }
    if (!/[0-9]/.test(password)) return { valid: false, message: "Au moins un chiffre requis" }
    return { valid: true, message: "" }
  }

  const handleSendCode = async () => {
    const identifier = loginMethod === "email" ? formData.email.toLowerCase().trim() : formData.phone.replace(/\s/g, "")
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, type: loginMethod })
    })
    const data = await res.json()
    if (data.success) { setStep("verify"); setCountdown(60) }
    else setError(data.error || "Impossible d'envoyer le code")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (blockedUntil && new Date() < blockedUntil) {
      const remaining = Math.ceil((blockedUntil.getTime() - Date.now()) / 1000)
      setError(`Trop de tentatives. Réessayez dans ${remaining}s`)
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      if (step === "login") {
        const identifier = loginMethod === "email" ? formData.email.toLowerCase().trim() : formData.phone.replace(/\s/g, "")
        await login(identifier, formData.password)
        router.push(redirect)
      } else if (step === "register") {
        if (!formData.name.trim()) { setError("Nom requis"); return }
        if (formData.password !== formData.confirmPassword) { setError("Mots de passe différents"); return }
        const pwdCheck = validatePassword(formData.password)
        if (!pwdCheck.valid) { setError(pwdCheck.message); return }
        await handleSendCode()
      } else if (step === "verify") {
        if (!formData.verificationCode || formData.verificationCode.length !== 6) {
          setError("Code à 6 chiffres requis"); return
        }
        const identifier = loginMethod === "email" ? formData.email.toLowerCase().trim() : formData.phone.replace(/\s/g, "")
        const res = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, code: formData.verificationCode })
        })
        const data = await res.json()
        if (data.success) {
          await register(formData.name, identifier, formData.password)
          setSuccess("Compte créé avec succès !")
          setTimeout(() => router.push(redirect), 2000)
        } else {
          setError(data.error || "Code invalide")
          setAttempts(p => p + 1)
          if (attempts >= 4) setBlockedUntil(new Date(Date.now() + 5 * 60 * 1000))
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
      setAttempts(p => p + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepTitle = step === "login" ? "Connexion" : step === "register" ? "Créer un compte" : "Vérification"
  const stepSub = step === "login" ? "Accédez à votre espace client" : step === "register" ? "Créez votre compte en quelques secondes" : "Entrez le code reçu"

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D4372B]">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl" style={poppins}>
            Adullam
          </CardTitle>
          <CardDescription style={poppins}>
            {stepTitle} • {stepSub}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Retour */}
          {step !== "login" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setStep("login"); setError(""); setSuccess("") }}
              className="mb-4 -ml-2 text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour
            </Button>
          )}

          {/* Erreur */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 mb-4 flex items-start gap-2 border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="rounded-md bg-green-50 p-3 mb-4 flex items-start gap-2 border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          {/* Toggle email / téléphone */}
          {step !== "verify" && (
            <Tabs defaultValue="email" className="mb-5" onValueChange={(v) => setLoginMethod(v as "email" | "phone")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Formulaire */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="csrf" value={csrfToken.current} />

            {step !== "verify" && (
              <>
                {/* Nom */}
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
                      required
                    />
                  </div>
                )}

                {/* Email / téléphone */}
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
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                        +225
                      </span>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="01 23 45 67 89"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                )}

                {/* Mot de passe */}
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
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Confirmer MDP */}
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
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-[#D4372B] hover:bg-[#B92E23]"
                  disabled={isSubmitting}
                >
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

            {/* Step Verify */}
            {step === "verify" && (
              <>
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MailCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Code envoyé à
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
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                      setFormData(p => ({ ...p, verificationCode: val }))
                    }}
                    maxLength={6}
                    disabled={isSubmitting}
                    required
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>

                {countdown > 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Renvoyer dans {countdown}s
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleSendCode}
                    className="w-full"
                  >
                    Renvoyer le code
                  </Button>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#D4372B] hover:bg-[#B92E23]"
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

          {/* Toggle login / register */}
          {step !== "verify" && (
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {step === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}
              </span>{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-[#D4372B]"
                onClick={() => {
                  setStep(step === "login" ? "register" : "login")
                  setError("")
                  setSuccess("")
                  setFormData(p => ({ ...p, verificationCode: "", password: "", confirmPassword: "" }))
                }}
              >
                {step === "login" ? "Inscrivez-vous" : "Connectez-vous"}
              </Button>
            </div>
          )}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Chiffré 256-bit</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Protégé</span>
            </div>
            <div className="flex items-center gap-1">
              <Key className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">2FA</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── LOADING FALLBACK ───────────────────────────────────────────
function LoginLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D4372B]">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Adullam</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4372B]" />
        </CardContent>
      </Card>
    </div>
  )
}

// ── PAGE PRINCIPALE ────────────────────────────────────────────
export default function UserLoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <UserLoginContent />
    </Suspense>
  )
}