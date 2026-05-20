"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Loader2, ShoppingBag, Mail, Phone, Lock, Key, Shield,
  AlertCircle, CheckCircle, MailCheck, Eye, EyeOff, ArrowLeft
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
  const stepSub   = step === "login" ? "Accédez à votre espace client" : step === "register" ? "Créez votre compte en quelques secondes" : "Entrez le code reçu"

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#FAFAFA" }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "20px",
          border: "0.5px solid #ECECEC",
          boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────── */}
        <div style={{ background: "#0A0A0A", padding: "28px 24px 24px", textAlign: "center" }}>
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto mb-4"
            style={{ background: "#D4372B" }}
          >
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", ...poppins }}>
            adul<span style={{ color: "#D4372B" }}>.</span>lam
          </h1>
          <p style={{ fontSize: "13px", color: "#AAAAAA", marginTop: "4px", ...poppins }}>{stepTitle}</p>
          <p style={{ fontSize: "11px", color: "#555", marginTop: "2px", ...poppins }}>{stepSub}</p>
        </div>

        {/* ── BODY ────────────────────────────────────────────── */}
        <div style={{ padding: "24px" }}>

          {/* Retour */}
          {step !== "login" && (
            <button
              onClick={() => { setStep("login"); setError(""); setSuccess("") }}
              className="flex items-center gap-1.5 mb-5 transition-opacity hover:opacity-70 focus:outline-none"
              style={{ fontSize: "13px", color: "#AAAAAA", ...poppins }}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </button>
          )}

          {/* Erreur */}
          {error && (
            <div
              className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl"
              style={{ background: "#FFF0F0", border: "0.5px solid #FECACA" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4372B" }} />
              <span style={{ fontSize: "12px", color: "#D4372B", ...poppins }}>{error}</span>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div
              className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl"
              style={{ background: "#EBFBEE", border: "0.5px solid #B2F2BB" }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2F9E44" }} />
              <span style={{ fontSize: "12px", color: "#2F9E44", ...poppins }}>{success}</span>
            </div>
          )}

          {/* Toggle email / téléphone */}
          {step !== "verify" && (
            <div
              className="flex gap-1.5 mb-5 p-1 rounded-xl"
              style={{ background: "#F4F4F4" }}
            >
              {([
                { id: "email", icon: Mail,  label: "Email" },
                { id: "phone", icon: Phone, label: "Téléphone" },
              ] as const).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLoginMethod(id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none"
                  style={{
                    background: loginMethod === id ? "#fff" : "transparent",
                    color: loginMethod === id ? "#0A0A0A" : "#AAAAAA",
                    boxShadow: loginMethod === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    ...poppins,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── FORMULAIRE ──────────────────────────────────── */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <input type="hidden" name="csrf" value={csrfToken.current} />

            {step !== "verify" && (
              <>
                {/* Nom */}
                {step === "register" && (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", ...poppins }}>Nom complet</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                      className="w-full mt-1 px-3 py-2.5 text-sm focus:outline-none transition-all"
                      style={{ background: "#F4F4F4", borderRadius: "10px", border: "1.5px solid transparent", ...poppins }}
                      onFocus={e => (e.currentTarget.style.border = "1.5px solid #D4372B")}
                      onBlur={e  => (e.currentTarget.style.border = "1.5px solid transparent")}
                    />
                  </div>
                )}

                {/* Email / téléphone */}
                {loginMethod === "email" ? (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", ...poppins }}>Adresse email</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                      className="w-full mt-1 px-3 py-2.5 text-sm focus:outline-none transition-all"
                      style={{ background: "#F4F4F4", borderRadius: "10px", border: "1.5px solid transparent", ...poppins }}
                      onFocus={e => (e.currentTarget.style.border = "1.5px solid #D4372B")}
                      onBlur={e  => (e.currentTarget.style.border = "1.5px solid transparent")}
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", ...poppins }}>Numéro de téléphone</label>
                    <div className="flex mt-1 overflow-hidden" style={{ borderRadius: "10px", border: "1.5px solid transparent", background: "#F4F4F4" }}>
                      <span
                        className="flex items-center px-3 flex-shrink-0"
                        style={{ fontSize: "13px", color: "#555", borderRight: "0.5px solid #ECECEC", ...poppins }}
                      >
                        +225
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="01 23 45 67 89"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                        className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                        style={{ background: "transparent", ...poppins }}
                      />
                    </div>
                  </div>
                )}

                {/* Mot de passe */}
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", ...poppins }}>Mot de passe</label>
                  <div className="relative mt-1">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                      className="w-full px-3 py-2.5 pr-10 text-sm focus:outline-none transition-all"
                      style={{ background: "#F4F4F4", borderRadius: "10px", border: "1.5px solid transparent", ...poppins }}
                      onFocus={e => (e.currentTarget.style.border = "1.5px solid #D4372B")}
                      onBlur={e  => (e.currentTarget.style.border = "1.5px solid transparent")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                      style={{ color: "#AAAAAA" }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmer MDP */}
                {step === "register" && (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", ...poppins }}>Confirmer le mot de passe</label>
                    <div className="relative mt-1">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                        className="w-full px-3 py-2.5 pr-10 text-sm focus:outline-none transition-all"
                        style={{ background: "#F4F4F4", borderRadius: "10px", border: "1.5px solid transparent", ...poppins }}
                        onFocus={e => (e.currentTarget.style.border = "1.5px solid #D4372B")}
                        onBlur={e  => (e.currentTarget.style.border = "1.5px solid transparent")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                        style={{ color: "#AAAAAA" }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60 focus:outline-none mt-2"
                  style={{ background: "#D4372B", ...poppins }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</>
                  ) : (
                    step === "login" ? "Se connecter" : "Créer mon compte"
                  )}
                </button>
              </>
            )}

            {/* ── STEP VERIFY ───────────────────────────────── */}
            {step === "verify" && (
              <>
                <div className="text-center mb-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto mb-3"
                    style={{ background: "#EBFBEE" }}
                  >
                    <MailCheck className="w-6 h-6" style={{ color: "#2F9E44" }} />
                  </div>
                  <p style={{ fontSize: "12px", color: "#AAAAAA", ...poppins }}>
                    Code envoyé à
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#0A0A0A", marginTop: "2px", ...poppins }}>
                    {loginMethod === "email" ? formData.email : formData.phone}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", ...poppins }}>
                    Code de vérification
                  </label>
                  <input
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
                    className="w-full mt-1 px-3 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none transition-all"
                    style={{ background: "#F4F4F4", borderRadius: "10px", border: "1.5px solid transparent", color: "#0A0A0A" }}
                    onFocus={e => (e.currentTarget.style.border = "1.5px solid #D4372B")}
                    onBlur={e  => (e.currentTarget.style.border = "1.5px solid transparent")}
                  />
                </div>

                {countdown > 0 ? (
                  <p className="text-center" style={{ fontSize: "12px", color: "#AAAAAA", ...poppins }}>
                    Renvoyer dans {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="w-full text-sm font-semibold transition-opacity hover:opacity-70 focus:outline-none"
                    style={{ color: "#D4372B", ...poppins }}
                  >
                    Renvoyer le code
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || formData.verificationCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60 focus:outline-none mt-1"
                  style={{ background: "#D4372B", ...poppins }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
                  ) : (
                    "Vérifier et créer mon compte"
                  )}
                </button>
              </>
            )}
          </form>

          {/* Toggle login / register */}
          {step !== "verify" && (
            <p className="text-center mt-5" style={{ fontSize: "13px", color: "#AAAAAA", ...poppins }}>
              {step === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setStep(step === "login" ? "register" : "login")
                  setError(""); setSuccess("")
                  setFormData(p => ({ ...p, verificationCode: "", password: "", confirmPassword: "" }))
                }}
                className="font-semibold transition-opacity hover:opacity-70 focus:outline-none"
                style={{ color: "#D4372B" }}
              >
                {step === "login" ? "Inscrivez-vous" : "Connectez-vous"}
              </button>
            </p>
          )}

          {/* Trust badges */}
          <div
            className="flex items-center justify-center gap-4 mt-5 pt-4"
            style={{ borderTop: "0.5px solid #F0F0F0" }}
          >
            {[
              { icon: Lock,   label: "Chiffré 256-bit" },
              { icon: Shield, label: "Protégé" },
              { icon: Key,    label: "2FA disponible" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1">
                <Icon className="w-3 h-3" style={{ color: "#AAAAAA" }} />
                <span style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── LOADING FALLBACK ───────────────────────────────────────────
function LoginLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FAFAFA" }}>
      <div
        className="w-full flex flex-col items-center justify-center py-16"
        style={{ maxWidth: "420px", background: "#fff", borderRadius: "20px", border: "0.5px solid #ECECEC" }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
          style={{ background: "#D4372B" }}
        >
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <span style={{ fontSize: "20px", fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", fontFamily: "'Poppins', sans-serif" }}>
          adul<span style={{ color: "#D4372B" }}>.</span>lam
        </span>
        <Loader2 className="w-6 h-6 animate-spin mt-6" style={{ color: "#D4372B" }} />
      </div>
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