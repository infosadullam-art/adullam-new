"use client"

import Link from "next/link"
import { ChevronRight, Factory, Wallet, ShieldCheck } from "lucide-react"
import { useLocale } from "@/context/LocaleProvider"
import { useState, useEffect } from "react"
import * as Flags from "country-flag-icons/react/3x2"

// ────────────────────────────────────────────────────────────────
// NOTE DEV : nouvelle dépendance à installer
//   npm install country-flag-icons
// Remplace les drapeaux emoji (rendu inconsistant selon OS/navigateur)
// par de vrais SVG plats, cohérents partout.
//
// Aucune image externe requise pour ce Hero : les 4 illustrations du
// slider sont du SVG inline (composants en bas de fichier), pas des
// photos à fournir — elles héritent des couleurs du thème (currentColor)
// donc elles suivent automatiquement le mode clair/sombre.
// ────────────────────────────────────────────────────────────────

const pays = {
  CI: { nom: "Côte d'Ivoire", code: "CI" }, SN: { nom: "Sénégal", code: "SN" },
  CM: { nom: "Cameroun", code: "CM" }, MA: { nom: "Maroc", code: "MA" },
  TN: { nom: "Tunisie", code: "TN" }, DZ: { nom: "Algérie", code: "DZ" },
  BF: { nom: "Burkina Faso", code: "BF" }, ML: { nom: "Mali", code: "ML" },
  NE: { nom: "Niger", code: "NE" }, TG: { nom: "Togo", code: "TG" },
  BJ: { nom: "Bénin", code: "BJ" }, GN: { nom: "Guinée", code: "GN" },
  GH: { nom: "Ghana", code: "GH" }, CD: { nom: "RDC", code: "CD" },
  GA: { nom: "Gabon", code: "GA" }, KE: { nom: "Kenya", code: "KE" },
  TZ: { nom: "Tanzanie", code: "TZ" }, RW: { nom: "Rwanda", code: "RW" },
  ET: { nom: "Éthiopie", code: "ET" }, ZA: { nom: "Afrique du Sud", code: "ZA" },
  EG: { nom: "Égypte", code: "EG" }, US: { nom: "États-Unis", code: "US" },
} as const

// Fournisseurs alignés strictement sur le positionnement validé :
// "Chine, Turquie, Dubaï et USA"
const suppliers = [
  { code: "CN", label: "Chine" },
  { code: "AE", label: "Dubaï" },
  { code: "TR", label: "Turquie" },
  { code: "US", label: "USA" },
] as const

// Faits bruts, sans adjectif
const trustItems = [
  { icon: Factory, label: "0 intermédiaire" },
  { icon: Wallet, label: "42 devises · Mobile Money" },
  { icon: ShieldCheck, label: "Non livré = remboursé" },
]

function Flag({ code, className }: { code: string; className?: string }) {
  const Cmp = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code]
  if (!Cmp) return null
  return <Cmp className={className} title={code} />
}

// ────────────────────────────────────────────────────────────────
// Illustrations du slider — line-art custom, stroke="currentColor",
// pas des lucide icons génériques. Chacune raconte un pilier du
// positionnement (storytelling), pas une catégorie produit.
// ────────────────────────────────────────────────────────────────

function IllustrationCommande({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      {/* usine */}
      <path d="M18 78V52l14-9 14 9v26" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M18 78h28" stroke="currentColor" strokeWidth="1.5" />
      <rect x="24" y="60" width="6" height="8" stroke="currentColor" strokeWidth="1.3" />
      <rect x="34" y="60" width="6" height="8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M46 50v-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* trajectoire pointillée */}
      <path d="M50 66 C 68 66, 76 66, 92 66" stroke="var(--accent-amber)" strokeWidth="1.6" strokeDasharray="1 6" strokeLinecap="round" />
      <path d="M86 61 L 93 66 L 86 71" stroke="var(--accent-amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* boîte destination */}
      <rect x="88" y="58" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M88 63h16M96 58v16" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function IllustrationSourcing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      {/* plan / blueprint */}
      <rect x="24" y="34" width="52" height="40" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 44h20M32 52h30M32 60h16M32 66h24" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      {/* loupe */}
      <circle cx="80" cy="72" r="14" stroke="var(--accent-amber)" strokeWidth="1.8" />
      <path d="M90 82l10 10" stroke="var(--accent-amber)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M74 72a6 6 0 0 1 6-6" stroke="var(--accent-amber)" strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

function IllustrationGarantie({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <path d="M60 20 L88 30 V56 C88 78 76 92 60 100 C44 92 32 78 32 56 V30 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M47 58 L56 68 L75 46" stroke="var(--accent-amber)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M96 40a26 26 0 1 1 -8-19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <path d="M84 15l4 8 8-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  )
}

function IllustrationIA({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <rect x="22" y="34" width="60" height="40" rx="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M40 74l-6 12 16-8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="40" cy="54" r="2.2" fill="currentColor" />
      <circle cx="52" cy="54" r="2.2" fill="currentColor" />
      <circle cx="64" cy="54" r="2.2" fill="currentColor" />
      {/* étincelle IA */}
      <path d="M92 26 L95 34 L103 37 L95 40 L92 48 L89 40 L81 37 L89 34 Z" stroke="var(--accent-amber)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

const storySlides = [
  {
    Illustration: IllustrationCommande,
    title: "Commandez direct usine",
    caption: "Sans passer par un grossiste ni un intermédiaire",
  },
  {
    Illustration: IllustrationSourcing,
    title: "Sourcing sur mesure",
    caption: "Un produit précis, une grande quantité : notre équipe négocie pour vous",
  },
  {
    Illustration: IllustrationGarantie,
    title: "Garanti ou remboursé",
    caption: "Commande non livrée : remboursement automatique",
  },
  {
    Illustration: IllustrationIA,
    title: "Assistant IA 24/7",
    caption: "3 systèmes intelligents vous accompagnent du choix à la livraison",
  },
] as const

export function HeroSection() {
  const { country } = useLocale()
  const [paysActuel, setPaysActuel] = useState(() => {
    if (typeof window === "undefined") return pays.CI
    return pays[country as keyof typeof pays] || pays.CI
  })
  const [mounted, setMounted] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    setPaysActuel(pays[country as keyof typeof pays] || pays.CI)
  }, [country])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % storySlides.length), 4500)
    return () => clearInterval(t)
  }, [])

  // ── Bloc texte partagé mobile/desktop ──
  const HeroCopy = ({ compact = false }: { compact?: boolean }) => (
    <div className={mounted ? "stagger" : ""}>
      <div
        className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md mb-4"
        style={{ background: "color-mix(in oklab, white 10%, transparent)" }}
      >
        <Flag code={paysActuel.code} className="w-3.5 h-3.5 rounded-[2px]" />
        <span className="text-[11px] font-medium text-white/90 font-sans">{paysActuel.nom}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-5">
        <span className="text-xs text-white/50 font-sans">Direct depuis</span>
        {suppliers.map((s) => (
          <span
            key={s.code}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white/85 font-sans elevate-hover"
            style={{ background: "color-mix(in oklab, white 7%, transparent)", border: "0.5px solid color-mix(in oklab, white 12%, transparent)" }}
          >
            <Flag code={s.code} className="w-3.5 h-2.5 rounded-[1px]" />
            {s.label}
          </span>
        ))}
      </div>

      <h1
        className={`font-heading font-normal text-white leading-[1.08] tracking-tight mb-4 ${
          compact ? "text-[28px]" : "text-[48px]"
        }`}
      >
        <span className="reveal-line block">
          <span style={{ animationDelay: "0.05s" }}>L'usine directement chez toi.</span>
        </span>
        <span className="reveal-line block" style={{ color: "var(--accent)" }}>
          <span style={{ animationDelay: "0.15s" }}>Sans intermédiaire.</span>
        </span>
      </h1>

      <p className={`text-white/70 font-sans mb-7 ${compact ? "text-sm max-w-[320px]" : "text-base max-w-[440px]"}`}>
        Achetez directement à la source. Payez en mobile money, 42 devises.
      </p>

      <div className="flex items-center gap-3 mb-7">
        <Link
          href="/for-you"
          className="group flex items-center gap-2 rounded-lg font-sans font-semibold text-sm text-white elevate-hover px-6 py-3"
          style={{ background: "var(--accent)" }}
        >
          Explorer la boutique
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <Link
          href="/boutique-noel"
          className="link-underline rounded-lg font-sans font-medium text-sm text-white px-6 py-3"
          style={{ border: "1px solid color-mix(in oklab, white 22%, transparent)" }}
        >
          Sourcing B2B
        </Link>
      </div>

      <div
        className="grid grid-cols-3 gap-0 pt-4"
        style={{ borderTop: "0.5px solid color-mix(in oklab, white 10%, transparent)" }}
      >
        {trustItems.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className="flex items-center gap-2"
            style={{
              borderRight: i < 2 ? "0.5px solid color-mix(in oklab, white 10%, transparent)" : "none",
              paddingRight: i < 2 ? "16px" : 0,
              paddingLeft: i > 0 ? "16px" : 0,
            }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent-amber)" }} strokeWidth={1.5} />
            <p className="text-[12px] leading-tight font-sans font-medium text-white/90">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Slider storytelling — même récit, 4 piliers du positionnement ──
  // hauteur réduite (desktop 420 → 260, mobile 200 → 150) comme demandé
  const HeroVisual = ({ heightClass }: { heightClass: string }) => {
    const slide = storySlides[slideIndex]
    const Illu = slide.Illustration
    return (
      <div
        className={`relative ${heightClass} rounded-xl overflow-hidden flex flex-col items-center justify-center text-center px-6`}
        style={{ background: "color-mix(in oklab, var(--accent) 8%, var(--brand))", border: "0.5px solid color-mix(in oklab, white 10%, transparent)" }}
      >
        {storySlides.map((s, i) => {
          const SlideIllu = s.Illustration
          return (
            <div
              key={s.title}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-opacity duration-700 ease-out"
              style={{ opacity: i === slideIndex ? 1 : 0, pointerEvents: i === slideIndex ? "auto" : "none" }}
            >
              <SlideIllu className="w-16 h-16 md:w-20 md:h-20 text-white/80 mb-3" />
              <p className="font-heading text-[19px] md:text-[22px] text-white mb-1">{s.title}</p>
              <p className="text-[12px] md:text-[13px] text-white/60 font-sans max-w-[300px]">{s.caption}</p>
            </div>
          )
        })}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {storySlides.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setSlideIndex(i)}
              aria-label={`Voir : ${s.title}`}
              className="h-[2px] rounded-full transition-all duration-300"
              style={{
                width: i === slideIndex ? "20px" : "10px",
                background: i === slideIndex ? "var(--accent-amber)" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "var(--brand)" }}>
      {/* MOBILE — hauteur réduite */}
      <div className="lg:hidden px-5 py-6">
        <HeroVisual heightClass="h-[150px] mb-5" />
        <HeroCopy compact />
      </div>

      {/* DESKTOP — hauteur réduite */}
      <div className="hidden lg:block max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 gap-14 items-center">
          <HeroCopy />
          <HeroVisual heightClass="h-[260px]" />
        </div>
      </div>
    </div>
  )
}