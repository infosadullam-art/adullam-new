"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Factory, Wallet, ShieldCheck } from "lucide-react"
import { useLocale } from "@/context/LocaleProvider"
import { useState, useEffect } from "react"
import * as Flags from "country-flag-icons/react/3x2"

// NOTE DEV : npm install country-flag-icons
// (remplace les drapeaux emoji par du SVG plat, cohérent sur tous les devices)

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

// Fournisseurs alignés sur le positionnement validé (Chine/Turquie/Dubaï/USA)
const suppliers = [
  { code: "CN", label: "Chine" },
  { code: "AE", label: "Dubaï" },
  { code: "TR", label: "Turquie" },
  { code: "US", label: "USA" },
] as const

const trustItems = [
  { icon: Factory, label: "0 intermédiaire", sub: "Prix usine réel" },
  { icon: Wallet, label: "42 devises", sub: "Mobile Money natif" },
  { icon: ShieldCheck, label: "Garanti ou remboursé", sub: "Non livré = remboursé" },
]

function Flag({ code, className }: { code: string; className?: string }) {
  const Cmp = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code]
  if (!Cmp) return null
  return <Cmp className={className} title={code} />
}

// ────────────────────────────────────────────────────────────────
// Slider storytelling — MÊMES images que ta prod actuelle (à adapter
// plus tard), mais contenu recentré sur les 3 vrais arguments de vente
// au lieu de 3 catégories produit. Punch conservé : badge + gros chiffre.
// ────────────────────────────────────────────────────────────────
const heroSlides = [
  {
    id: 1,
    image: "/hero-fashion.jpg",
    badge: "Direct usine",
    title: "Commandez direct usine",
    subtitle: "Sans grossiste, sans intermédiaire",
    statValue: "0",
    statLabel: "intermédiaire",
    href: "/for-you",
  },
  {
    id: 2,
    image: "/hero-electronics.jpg",
    badge: "Sourcing B2B",
    title: "Sourcing sur mesure",
    subtitle: "Produit précis, grande quantité : on négocie pour vous",
    statValue: "B2B",
    statLabel: "sur devis",
    href: "/boutique-noel",
  },
  {
    id: 3,
    image: "/hero-home.jpg",
    badge: "0 risque",
    title: "Garanti ou remboursé",
    subtitle: "Commande non livrée : remboursement automatique",
    statValue: "100%",
    statLabel: "remboursé",
    href: "/for-you",
  },
]

export function HeroSection() {
  const { country } = useLocale()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [paysActuel, setPaysActuel] = useState(() => {
    if (typeof window === "undefined") return pays.CI
    return pays[country as keyof typeof pays] || pays.CI
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setPaysActuel(pays[country as keyof typeof pays] || pays.CI)
  }, [country])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const MobileHero = () => (
    <div
      className="lg:hidden relative overflow-hidden"
      style={{
        height: "150px",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 10 : 0 }}
        >
          <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 70%, transparent 100%)" }} />

          <div className="absolute inset-0 flex flex-col justify-center px-5 z-20">
            <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 mb-3 rounded-md" style={{ background: "rgba(0,0,0,0.5)" }}>
              <Flag code={paysActuel.code} className="w-3.5 h-3.5 rounded-[2px]" />
              <span className="text-[10px] font-medium text-white font-sans">{paysActuel.nom}</span>
            </div>

            <span
              className="w-fit px-2 py-0.5 mb-1.5 text-white text-[10px] font-bold font-sans rounded-[2px]"
              style={{ background: "var(--accent)" }}
            >
              {slide.badge}
            </span>

            <h1 className="font-sans text-white mb-1.5" style={{ fontSize: "24px", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.03em", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
              {slide.title}
            </h1>
            <p className="font-sans text-[13px] mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
              {slide.subtitle}
            </p>

            <Link
              href={slide.href}
              className="flex items-center gap-1.5 w-fit group transition-transform duration-200 hover:scale-105 font-sans font-bold text-[12px] rounded-md"
              style={{ background: "#fff", color: "var(--brand)", padding: "8px 16px" }}
            >
              Découvrir
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col items-center rounded-lg" style={{ background: "var(--accent)", padding: "6px 12px" }}>
            <span className="text-[16px] font-black text-white leading-none font-sans">{slide.statValue}</span>
            <span className="text-[8px] text-white/80 font-sans">{slide.statLabel}</span>
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 left-5 z-30 flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Voir le slide ${i + 1}`}
            style={{
              height: "2px",
              width: i === currentSlide ? "20px" : "6px",
              borderRadius: "1px",
              background: i === currentSlide ? "var(--accent-amber)" : "rgba(255,255,255,0.3)",
              transition: "all 0.3s ease",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )

  const DesktopHero = () => (
    <div
      className="hidden lg:block"
      style={{ background: "var(--brand)", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease-out, transform 0.5s ease-out" }}
    >
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-8 items-center">
          {/* Colonne texte */}
          <div>
            <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md mb-4" style={{ background: "color-mix(in oklab, white 10%, transparent)" }}>
              <Flag code={paysActuel.code} className="w-3.5 h-3.5 rounded-[2px]" />
              <span className="text-[11px] font-medium text-white/90 font-sans">{paysActuel.nom}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-5">
              <span className="text-xs text-white/50 font-sans">Direct depuis</span>
              {suppliers.map((s) => (
                <span
                  key={s.code}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white/85 font-sans transition-all duration-200 hover:scale-105"
                  style={{ background: "color-mix(in oklab, white 7%, transparent)", border: "0.5px solid color-mix(in oklab, white 12%, transparent)" }}
                >
                  <Flag code={s.code} className="w-3.5 h-2.5 rounded-[1px]" />
                  {s.label}
                </span>
              ))}
            </div>

            <h1 className="font-sans text-white mb-3" style={{ fontSize: "38px", fontWeight: 900, lineHeight: 1.12, letterSpacing: "-0.03em" }}>
              L'usine directement
              <br />
              <span style={{ color: "var(--accent)" }}>chez toi.</span>
            </h1>

            <p className="font-sans mb-5" style={{ fontSize: "16px", color: "var(--muted-foreground)", lineHeight: 1.6, maxWidth: "440px" }}>
              Sans intermédiaire. Payez en mobile money, 42 devises.
            </p>

            <div className="flex items-center gap-3 mb-5">
              <Link
                href="/for-you"
                className="group flex items-center gap-2 font-sans font-bold text-sm text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{ background: "var(--accent)", padding: "12px 28px" }}
              >
                Explorer la boutique
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/boutique-noel"
                className="font-sans font-semibold text-sm text-white rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                style={{ border: "1px solid rgba(255,255,255,0.25)", padding: "11px 24px" }}
              >
                Sourcing B2B
              </Link>
            </div>

            {/* Trust bar */}
            <div className="grid grid-cols-3 gap-0" style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
              {trustItems.map(({ icon: Icon, label, sub }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-3 group transition-all duration-200 hover:translate-x-0.5"
                  style={{ borderRight: i < 2 ? "0.5px solid rgba(255,255,255,0.08)" : "none", paddingRight: i < 2 ? "20px" : 0, paddingLeft: i > 0 ? "20px" : 0 }}
                >
                  <div className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110" style={{ background: "color-mix(in oklab, var(--accent) 15%, transparent)" }}>
                    <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white font-sans">{label}</p>
                    <p className="text-[11px] font-sans" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne visuel — slider photos, punch conservé */}
          <div className="relative" style={{ height: "190px" }}>
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-700 rounded-xl overflow-hidden"
                style={{ opacity: index === currentSlide ? 1 : 0 }}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />

                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-md text-[11px] font-bold text-white font-sans" style={{ background: "var(--accent)" }}>
                    {slide.badge}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10 flex flex-col items-center rounded-lg" style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)", padding: "6px 14px" }}>
                  <span className="text-[20px] font-black text-white leading-none font-sans">{slide.statValue}</span>
                  <span className="text-[9px] text-white/70 font-sans">{slide.statLabel}</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <p className="text-[18px] font-extrabold text-white tracking-tight font-sans mb-0.5">{slide.title}</p>
                  <p className="text-[12px] text-white/70 font-sans">{slide.subtitle}</p>
                </div>
              </div>
            ))}

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Voir le slide ${i + 1}`}
                  style={{
                    height: "2px",
                    width: i === currentSlide ? "20px" : "6px",
                    borderRadius: "1px",
                    background: i === currentSlide ? "var(--accent-amber)" : "rgba(255,255,255,0.3)",
                    transition: "all 0.3s ease",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  )
}