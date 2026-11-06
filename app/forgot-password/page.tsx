"use client"

// Mot de passe oublie — e-mail, puis code recu + nouveau mot de passe (routes /api/auth/forgot-password et /api/auth/reset-password).
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/context/LocaleProvider"
import { useTranslations } from "next-intl"

const API = "https://api.adullamarket.com"

const FL: Record<string, Record<string, string>> = {
  title: { fr: "Mot de passe oublié", en: "Forgot password", pt: "Esqueceu a senha", ar: "نسيت كلمة المرور" },
  descEmail: { fr: "Entrez l'adresse e-mail de votre compte. Nous vous envoyons un code à 6 chiffres.", en: "Enter your account email. We will send you a 6-digit code.", pt: "Indique o e-mail da sua conta. Enviaremos um código de 6 dígitos.", ar: "أدخل بريدك الإلكتروني وسنرسل لك رمزًا من 6 أرقام." },
  descReset: { fr: "Saisissez le code reçu par e-mail et choisissez un nouveau mot de passe.", en: "Enter the code you received by email and choose a new password.", pt: "Introduza o código recebido por e-mail e escolha uma nova senha.", ar: "أدخل الرمز الذي وصلك بالبريد واختر كلمة مرور جديدة." },
  email: { fr: "Adresse e-mail", en: "Email address", pt: "Endereço de e-mail", ar: "البريد الإلكتروني" },
  send: { fr: "Envoyer le code", en: "Send code", pt: "Enviar código", ar: "إرسال الرمز" },
  sent: { fr: "Si un compte existe pour {email}, un code vient d'être envoyé.", en: "If an account exists for {email}, a code has just been sent.", pt: "Se existir uma conta para {email}, um código acabou de ser enviado.", ar: "إذا كان هناك حساب لـ {email} فقد تم إرسال رمز للتو." },
  code: { fr: "Code reçu", en: "Code received", pt: "Código recebido", ar: "الرمز المستلم" },
  newPw: { fr: "Nouveau mot de passe", en: "New password", pt: "Nova senha", ar: "كلمة المرور الجديدة" },
  confirm: { fr: "Confirmer le mot de passe", en: "Confirm password", pt: "Confirmar senha", ar: "تأكيد كلمة المرور" },
  submit: { fr: "Changer le mot de passe", en: "Change password", pt: "Alterar senha", ar: "تغيير كلمة المرور" },
  loading: { fr: "Veuillez patienter…", en: "Please wait…", pt: "Aguarde…", ar: "يرجى الانتظار…" },
  resend: { fr: "Renvoyer le code", en: "Resend code", pt: "Reenviar código", ar: "إعادة إرسال الرمز" },
  resendIn: { fr: "Renvoyer le code dans {s} s", en: "Resend code in {s} s", pt: "Reenviar código em {s} s", ar: "إعادة الإرسال بعد {s} ث" },
  mismatch: { fr: "Les mots de passe ne correspondent pas", en: "Passwords do not match", pt: "As senhas não coincidem", ar: "كلمتا المرور غير متطابقتين" },
  invalidEmail: { fr: "Adresse e-mail invalide", en: "Invalid email address", pt: "E-mail inválido", ar: "بريد إلكتروني غير صالح" },
  code6: { fr: "Le code contient 6 chiffres", en: "The code has 6 digits", pt: "O código tem 6 dígitos", ar: "الرمز مكون من 6 أرقام" },
  tooMany: { fr: "Trop de tentatives. Réessayez plus tard.", en: "Too many attempts. Try again later.", pt: "Demasiadas tentativas. Tente mais tarde.", ar: "محاولات كثيرة. حاول لاحقًا." },
  badCode: { fr: "Code incorrect ou expiré. Demandez un nouveau code.", en: "Wrong or expired code. Request a new one.", pt: "Código incorreto ou expirado. Peça um novo.", ar: "الرمز خاطئ أو منتهي. اطلب رمزًا جديدًا." },
  error: { fr: "Une erreur est survenue. Vérifiez votre connexion.", en: "Something went wrong. Check your connection.", pt: "Ocorreu um erro. Verifique a ligação.", ar: "حدث خطأ. تحقق من اتصالك." },
  doneTitle: { fr: "Mot de passe modifié", en: "Password changed", pt: "Senha alterada", ar: "تم تغيير كلمة المرور" },
  doneText: { fr: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.", en: "You can now log in with your new password.", pt: "Já pode iniciar sessão com a nova senha.", ar: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة." },
  goLogin: { fr: "Se connecter", en: "Log in", pt: "Entrar", ar: "تسجيل الدخول" },
  backLogin: { fr: "Retour à la connexion", en: "Back to login", pt: "Voltar ao início de sessão", ar: "العودة لتسجيل الدخول" },
  changeEmail: { fr: "Changer d'adresse e-mail", en: "Use another email", pt: "Usar outro e-mail", ar: "استخدام بريد آخر" },
}

type Step = "email" | "reset" | "done"

export default function ForgotPasswordPage() {
  const t = useTranslations("login")
  const router = useRouter()
  const { language } = useLocale()
  const fx = (k: string) => FL[k]?.[language as string] ?? FL[k]?.fr ?? k

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [pw, setPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [busy, setBusy] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("email")
    if (e) setEmail(e.replace(/[<>]/g, ""))
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  const cleanEmail = () => email.toLowerCase().trim()

  const validatePassword = (p: string): string | null => {
    if (p.length < 8) return t("pwMin8")
    if (!/[A-Z]/.test(p)) return t("pwUpper")
    if (!/[0-9]/.test(p)) return t("pwDigit")
    if (!/[^A-Za-z0-9]/.test(p)) return t("pwSpecial")
    return null
  }

  const requestCode = async (): Promise<boolean> => {
    const e = cleanEmail()
    if (!/^\S+@\S+\.\S+$/.test(e)) { setError(fx("invalidEmail")); return false }
    setBusy(true); setError("")
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      })
      if (res.ok) { setInfo(fx("sent").replace("{email}", e)); setCountdown(60); return true }
      setError(res.status === 429 ? fx("tooMany") : res.status === 400 ? fx("invalidEmail") : fx("error"))
      return false
    } catch {
      setError(fx("error")); return false
    } finally { setBusy(false) }
  }

  const submitReset = async () => {
    setError("")
    if (code.length !== 6) { setError(fx("code6")); return }
    if (pw !== confirm) { setError(fx("mismatch")); return }
    const bad = validatePassword(pw)
    if (bad) { setError(bad); return }
    setBusy(true)
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail(), code, password: pw }),
      })
      if (res.ok) { setInfo(""); setStep("done"); return }
      setError(res.status === 429 ? fx("tooMany") : res.status === 400 ? fx("badCode") : fx("error"))
    } catch {
      setError(fx("error"))
    } finally { setBusy(false) }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (step === "email") { if (await requestCode()) setStep("reset") }
    else if (step === "reset") await submitReset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card shadow-xs">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">{step === "done" ? fx("doneTitle") : fx("title")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === "email" ? fx("descEmail") : step === "reset" ? fx("descReset") : fx("doneText")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && <div className="mb-4 rounded-md p-3 text-sm bg-accent-light text-accent">{error}</div>}
          {info && !error && <div className="mb-4 rounded-md p-3 text-sm bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">{info}</div>}

          {step === "done" ? (
            <Button type="button" className="w-full text-white bg-accent hover:bg-accent-hover" onClick={() => router.push("/login")}>{fx("goLogin")}</Button>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {step === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">{fx("email")}</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value.replace(/[<>]/g, "")); setError("") }} disabled={busy} required />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-foreground">{fx("code")}</Label>
                    <Input id="code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" value={code} onChange={(e) => { setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6)); setError("") }} className="text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} disabled={busy} required />
                  </div>
                  {countdown > 0 ? (
                    <p className="text-sm text-center text-muted-foreground">{fx("resendIn").replace("{s}", String(countdown))}</p>
                  ) : (
                    <button type="button" onClick={requestCode} disabled={busy} className="w-full text-sm text-accent hover:underline">{fx("resend")}</button>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="newPw" className="text-foreground">{fx("newPw")}</Label>
                    <Input id="newPw" name="newPw" type="password" autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setError("") }} disabled={busy} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPw" className="text-foreground">{fx("confirm")}</Label>
                    <Input id="confirmPw" name="confirmPw" type="password" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError("") }} disabled={busy} required />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full text-white bg-accent hover:bg-accent-hover" disabled={busy || (step === "reset" && code.length !== 6)}>
                {busy ? fx("loading") : step === "email" ? fx("send") : fx("submit")}
              </Button>

              {step === "reset" && (
                <button type="button" onClick={() => { setStep("email"); setError(""); setInfo(""); setCode(""); setPw(""); setConfirm("") }} className="w-full text-sm text-muted-foreground hover:text-foreground">{fx("changeEmail")}</button>
              )}
            </form>
          )}

          {step !== "done" && (
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-accent hover:underline">{fx("backLogin")}</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
