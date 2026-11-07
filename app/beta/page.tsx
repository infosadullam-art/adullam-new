"use client"

// Programme beta Adullam — inscription limitee (30 Android + 10 iPhone). Donnees : GET/POST https://api.adullamarket.com/api/beta
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/context/LocaleProvider"

const API = "https://api.adullamarket.com"

const FL: Record<string, Record<string, string>> = {
  badge: { fr: "Programme bêta · 21 jours · 40 testeurs", en: "Beta programme · 21 days · 40 testers", pt: "Programa beta · 21 dias · 40 testadores", ar: "برنامج تجريبي · 21 يومًا · 40 مختبرًا" },
  title: { fr: "Testez l'application Adullam en avant-première", en: "Try the Adullam app before everyone else", pt: "Teste a aplicação Adullam em primeira mão", ar: "جرّب تطبيق أدولام قبل الجميع" },
  subtitle: { fr: "Nous ouvrons un nombre limité de places pour tester l'application mobile avant sa publication sur Google Play et l'App Store. Votre avis nous aide à la rendre fiable pour tous.", en: "We are opening a limited number of places to test the mobile app before its release on Google Play and the App Store. Your feedback helps us make it reliable for everyone.", pt: "Abrimos um número limitado de vagas para testar a aplicação móvel antes da sua publicação no Google Play e na App Store. A sua opinião ajuda-nos a torná-la fiável para todos.", ar: "نفتح عددًا محدودًا من الأماكن لتجربة التطبيق قبل نشره على Google Play و App Store. رأيك يساعدنا على جعله موثوقًا للجميع." },
  placesTitle: { fr: "Places disponibles", en: "Available places", pt: "Vagas disponíveis", ar: "الأماكن المتاحة" },
  android: { fr: "Android", en: "Android", pt: "Android", ar: "أندرويد" },
  iphone: { fr: "iPhone", en: "iPhone", pt: "iPhone", ar: "آيفون" },
  left: { fr: "{n} places restantes", en: "{n} places left", pt: "{n} vagas restantes", ar: "{n} أماكن متبقية" },
  leftOne: { fr: "1 place restante", en: "1 place left", pt: "1 vaga restante", ar: "مكان واحد متبقٍ" },
  full: { fr: "Complet", en: "Full", pt: "Esgotado", ar: "مكتمل" },
  registered: { fr: "{t} / {l} inscrits", en: "{t} / {l} registered", pt: "{t} / {l} inscritos", ar: "{t} / {l} مسجلين" },
  placesError: { fr: "Impossible de charger les places pour le moment.", en: "Unable to load places right now.", pt: "Não foi possível carregar as vagas agora.", ar: "تعذر تحميل الأماكن حاليًا." },
  howTitle: { fr: "Comment ça marche", en: "How it works", pt: "Como funciona", ar: "كيف يعمل" },
  s1t: { fr: "Vous vous inscrivez", en: "You sign up", pt: "Inscreve-se", ar: "تسجّل" },
  s1d: { fr: "Remplissez le formulaire ci-dessous et choisissez votre téléphone.", en: "Fill in the form below and choose your phone.", pt: "Preencha o formulário abaixo e escolha o seu telemóvel.", ar: "املأ النموذج أدناه واختر هاتفك." },
  s2t: { fr: "Nous validons votre place", en: "We confirm your place", pt: "Confirmamos a sua vaga", ar: "نؤكد مكانك" },
  s2d: { fr: "Nous vous envoyons le lien d'installation par WhatsApp ou par e-mail.", en: "We send you the installation link by WhatsApp or email.", pt: "Enviamos-lhe o link de instalação por WhatsApp ou e-mail.", ar: "نرسل لك رابط التثبيت عبر واتساب أو البريد." },
  s3t: { fr: "Vous testez pendant 21 jours", en: "You test for 21 days", pt: "Testa durante 21 dias", ar: "تجرّب لمدة 21 يومًا" },
  s3d: { fr: "Utilisez l'application normalement et signalez ce qui ne va pas.", en: "Use the app normally and tell us what goes wrong.", pt: "Use a aplicação normalmente e diga-nos o que corre mal.", ar: "استخدم التطبيق بشكل عادي وأخبرنا بما لا يعمل." },
  testTitle: { fr: "Ce que vous testerez", en: "What you will test", pt: "O que vai testar", ar: "ما الذي ستختبره" },
  t1: { fr: "Inscription, connexion et mot de passe oublié", en: "Sign-up, login and forgotten password", pt: "Registo, início de sessão e senha esquecida", ar: "التسجيل وتسجيل الدخول ونسيان كلمة المرور" },
  t2: { fr: "Catalogue, recherche et filtres", en: "Catalogue, search and filters", pt: "Catálogo, pesquisa e filtros", ar: "الكتالوج والبحث والفلاتر" },
  t3: { fr: "Panier et commande", en: "Cart and orders", pt: "Carrinho e encomendas", ar: "السلة والطلبات" },
  t4: { fr: "Paiement en mode test (aucun vrai débit)", en: "Payment in test mode (no real charge)", pt: "Pagamento em modo de teste (sem cobrança real)", ar: "الدفع في وضع التجربة (بدون خصم فعلي)" },
  t5: { fr: "Suivi des commandes et notifications", en: "Order tracking and notifications", pt: "Acompanhamento de encomendas e notificações", ar: "تتبع الطلبات والإشعارات" },
  formTitle: { fr: "Réserver ma place", en: "Reserve my place", pt: "Reservar a minha vaga", ar: "احجز مكانك" },
  name: { fr: "Nom complet", en: "Full name", pt: "Nome completo", ar: "الاسم الكامل" },
  email: { fr: "Adresse e-mail", en: "Email address", pt: "Endereço de e-mail", ar: "البريد الإلكتروني" },
  phone: { fr: "WhatsApp (recommandé)", en: "WhatsApp (recommended)", pt: "WhatsApp (recomendado)", ar: "واتساب (موصى به)" },
  platform: { fr: "Mon téléphone", en: "My phone", pt: "O meu telemóvel", ar: "هاتفي" },
  device: { fr: "Modèle du téléphone (facultatif)", en: "Phone model (optional)", pt: "Modelo do telemóvel (opcional)", ar: "طراز الهاتف (اختياري)" },
  devicePh: { fr: "Ex. Samsung A14, iPhone 12", en: "e.g. Samsung A14, iPhone 12", pt: "Ex. Samsung A14, iPhone 12", ar: "مثال: Samsung A14 أو iPhone 12" },
  consent: { fr: "J'accepte d'être contacté(e) pour ce programme bêta. Mes informations servent uniquement à l'organiser.", en: "I agree to be contacted about this beta programme. My details are used only to run it.", pt: "Aceito ser contactado(a) para este programa beta. Os meus dados servem apenas para o organizar.", ar: "أوافق على التواصل معي بخصوص هذا البرنامج التجريبي. تُستخدم بياناتي فقط لتنظيمه." },
  submit: { fr: "Réserver ma place", en: "Reserve my place", pt: "Reservar a minha vaga", ar: "احجز مكانك" },
  sending: { fr: "Envoi…", en: "Sending…", pt: "A enviar…", ar: "جارٍ الإرسال…" },
  okTitle: { fr: "Votre place est réservée", en: "Your place is reserved", pt: "A sua vaga está reservada", ar: "تم حجز مكانك" },
  okText: { fr: "Merci ! Nous validons votre inscription puis nous vous envoyons le lien d'installation par WhatsApp ou par e-mail. Pensez à regarder vos courriers indésirables.", en: "Thank you! We will confirm your registration and then send you the installation link by WhatsApp or email. Please check your spam folder too.", pt: "Obrigado! Vamos confirmar a sua inscrição e enviar-lhe o link de instalação por WhatsApp ou e-mail. Veja também a pasta de spam.", ar: "شكرًا! سنؤكد تسجيلك ثم نرسل لك رابط التثبيت عبر واتساب أو البريد. تحقق أيضًا من البريد غير المرغوب." },
  closed: { fr: "Toutes les places sont prises pour le moment. Merci pour votre intérêt !", en: "All places are taken for now. Thank you for your interest!", pt: "Todas as vagas estão preenchidas por agora. Obrigado pelo interesse!", ar: "جميع الأماكن محجوزة حاليًا. شكرًا لاهتمامك!" },
  eInvalid: { fr: "Vérifiez les informations saisies.", en: "Please check the details you entered.", pt: "Verifique os dados introduzidos.", ar: "تحقق من البيانات المدخلة." },
  eName: { fr: "Entrez votre nom.", en: "Enter your name.", pt: "Introduza o seu nome.", ar: "أدخل اسمك." },
  eEmail: { fr: "Adresse e-mail invalide.", en: "Invalid email address.", pt: "E-mail inválido.", ar: "بريد إلكتروني غير صالح." },
  ePlatform: { fr: "Choisissez Android ou iPhone.", en: "Choose Android or iPhone.", pt: "Escolha Android ou iPhone.", ar: "اختر أندرويد أو آيفون." },
  eConsent: { fr: "Cochez la case d'accord pour continuer.", en: "Tick the agreement box to continue.", pt: "Marque a caixa de acordo para continuar.", ar: "فعّل خانة الموافقة للمتابعة." },
  eFull: { fr: "Les places pour ce téléphone viennent d'être prises.", en: "The places for this phone have just been taken.", pt: "As vagas para este telemóvel acabaram de esgotar.", ar: "نفدت الأماكن لهذا الهاتف للتو." },
  eDup: { fr: "Cette adresse e-mail est déjà inscrite.", en: "This email address is already registered.", pt: "Este e-mail já está inscrito.", ar: "هذا البريد مسجل بالفعل." },
  eRate: { fr: "Trop de tentatives. Réessayez plus tard.", en: "Too many attempts. Try again later.", pt: "Demasiadas tentativas. Tente mais tarde.", ar: "محاولات كثيرة. حاول لاحقًا." },
  eGeneric: { fr: "Une erreur est survenue. Vérifiez votre connexion et réessayez.", en: "Something went wrong. Check your connection and try again.", pt: "Ocorreu um erro. Verifique a ligação e tente novamente.", ar: "حدث خطأ. تحقق من اتصالك وحاول مجددًا." },
}

type Slot = { limit: number; taken: number; remaining: number }
type Places = { android: Slot; ios: Slot }
type Platform = "ANDROID" | "IOS"

export default function BetaPage() {
  const { language, country } = useLocale()
  const fx = (k: string) => FL[k]?.[language as string] ?? FL[k]?.fr ?? k

  const [places, setPlaces] = useState<Places | null>(null)
  const [placesError, setPlacesError] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", device: "", website: "" })
  const [platform, setPlatform] = useState<Platform | "">("")
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const loadPlaces = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/beta`, { cache: "no-store" })
      const data = await res.json()
      if (data?.success) { setPlaces({ android: data.android, ios: data.ios }); setPlacesError(false) }
      else setPlacesError(true)
    } catch { setPlacesError(true) }
  }, [])

  useEffect(() => {
    loadPlaces()
    const id = setInterval(loadPlaces, 30000)
    return () => clearInterval(id)
  }, [loadPlaces])

  const slotOf = (p: Platform): Slot | null => (places ? (p === "ANDROID" ? places.android : places.ios) : null)
  const isFull = (p: Platform) => { const s = slotOf(p); return !!s && s.remaining <= 0 }
  const allFull = !!places && places.android.remaining <= 0 && places.ios.remaining <= 0

  // Si une plateforme est complete, on ne laisse pas la selection dessus
  useEffect(() => { if (platform && isFull(platform)) setPlatform("") }, [places]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      if (sessionStorage.getItem("beta_visit_sent")) return
      sessionStorage.setItem("beta_visit_sent", "1")
    } catch {}
    fetch(`${API}/api/app/track`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: "web", events: ["beta_visit"] }), keepalive: true }).catch(() => {})
  }, [])

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value.replace(/[<>]/g, "") }))
    setError("")
  }

  const leftLabel = (s: Slot) => (s.remaining <= 0 ? fx("full") : s.remaining === 1 ? fx("leftOne") : fx("left").replace("{n}", String(s.remaining)))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (form.name.trim().length < 2) { setError(fx("eName")); return }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) { setError(fx("eEmail")); return }
    if (!platform) { setError(fx("ePlatform")); return }
    if (!consent) { setError(fx("eConsent")); return }
    setBusy(true); setError("")
    try {
      const res = await fetch(`${API}/api/beta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          device: form.device,
          platform,
          country: typeof country === "string" ? country.slice(0, 2) : "",
          consent: true,
          website: form.website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) { setDone(true); loadPlaces(); return }
      const code = data?.code
      setError(code === "FULL" ? fx("eFull") : code === "DUPLICATE" ? fx("eDup") : code === "RATE" || res.status === 429 ? fx("eRate") : code === "INVALID" ? fx("eInvalid") : fx("eGeneric"))
      if (code === "FULL") loadPlaces()
    } catch {
      setError(fx("eGeneric"))
    } finally { setBusy(false) }
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-4 border-s-4 border-accent ps-3 text-lg font-semibold text-foreground">{children}</h2>
  )

  const PlaceCard = ({ p, label }: { p: Platform; label: string }) => {
    const s = slotOf(p)
    const pct = s ? Math.min(100, Math.round((s.taken / s.limit) * 100)) : 0
    return (
      <div className="flex-1 rounded-lg border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-foreground">{label}</span>
          <span className={`text-sm font-medium ${s && s.remaining <= 0 ? "text-muted-foreground" : "text-accent"}`}>{s ? leftLabel(s) : "…"}</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{s ? fx("registered").replace("{t}", String(s.taken)).replace("{l}", String(s.limit)) : ""}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <header>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-accent">{fx("badge")}</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{fx("title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{fx("subtitle")}</p>
        </header>

        <section className="rounded-lg border border-border bg-card p-5">
          <SectionTitle>{fx("placesTitle")}</SectionTitle>
          {placesError && !places ? (
            <p className="text-sm text-muted-foreground">{fx("placesError")}</p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <PlaceCard p="ANDROID" label={fx("android")} />
              <PlaceCard p="IOS" label={fx("iphone")} />
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <SectionTitle>{fx("howTitle")}</SectionTitle>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[["s1t", "s1d"], ["s2t", "s2d"], ["s3t", "s3d"]].map(([t, d], i) => (
              <li key={t}>
                <p className="text-sm font-semibold text-foreground"><span className="text-accent">{i + 1}.</span> {fx(t)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{fx(d)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <SectionTitle>{fx("testTitle")}</SectionTitle>
          <ul className="space-y-2 text-sm text-foreground">
            {["t1", "t2", "t3", "t4", "t5"].map((k) => (
              <li key={k} className="flex gap-2"><span className="mt-2 h-1 w-3 flex-shrink-0 bg-accent" aria-hidden="true" /><span>{fx(k)}</span></li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <SectionTitle>{fx("formTitle")}</SectionTitle>

          {done ? (
            <div className="rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400">
              <p className="font-semibold">{fx("okTitle")}</p>
              <p className="mt-1 text-sm">{fx("okText")}</p>
            </div>
          ) : allFull ? (
            <p className="text-sm text-muted-foreground">{fx("closed")}</p>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              {/* Champ piege contre les robots : invisible pour les humains */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={setField("website")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">{fx("name")}</Label>
                <Input id="name" name="name" autoComplete="name" value={form.name} onChange={setField("name")} disabled={busy} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{fx("email")}</Label>
                <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={setField("email")} disabled={busy} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">{fx("phone")}</Label>
                <Input id="phone" name="phone" type="tel" dir="ltr" autoComplete="tel" placeholder="+225 01 23 45 67 89" value={form.phone} onChange={setField("phone")} disabled={busy} />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">{fx("platform")}</Label>
                <div className="flex gap-2">
                  {([["ANDROID", "android"], ["IOS", "iphone"]] as [Platform, string][]).map(([p, k]) => {
                    const full = isFull(p)
                    const active = platform === p
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={full || busy}
                        aria-pressed={active}
                        onClick={() => { setPlatform(p); setError("") }}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          active ? "border-accent bg-accent text-white" : "border-border bg-transparent text-foreground hover:bg-surface-sunken"
                        } ${full ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {fx(k)}{full ? ` · ${fx("full")}` : ""}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="device" className="text-foreground">{fx("device")}</Label>
                <Input id="device" name="device" placeholder={fx("devicePh")} value={form.device} onChange={setField("device")} disabled={busy} maxLength={80} />
              </div>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError("") }} disabled={busy} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                <span>{fx("consent")}</span>
              </label>

              {error && <div className="rounded-md bg-accent-light p-3 text-sm text-accent" role="alert">{error}</div>}

              <Button type="submit" className="w-full bg-accent text-white hover:bg-accent-hover" disabled={busy}>
                {busy ? fx("sending") : fx("submit")}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
