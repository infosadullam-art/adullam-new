"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, ChevronRight, Truck, Wallet, ShieldCheck } from "lucide-react"
import { useLocale } from "@/context/LocaleProvider"
import { useState, useEffect } from "react"
import * as Flags from "country-flag-icons/react/3x2"

// NOTE DEV : npm install country-flag-icons
function Flag({ code, className }: { code: string; className?: string }) {
  const Cmp = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code]
  if (!Cmp) return null
  return <Cmp className={className} title={code} />
}

const pays = {
  CI: { nom: "Côte d'Ivoire", drapeau: "🇨🇮", code: "CI" },
  SN: { nom: "Sénégal", drapeau: "🇸🇳", code: "SN" },
  CM: { nom: "Cameroun", drapeau: "🇨🇲", code: "CM" },
  MA: { nom: "Maroc", drapeau: "🇲🇦", code: "MA" },
  TN: { nom: "Tunisie", drapeau: "🇹🇳", code: "TN" },
  DZ: { nom: "Algérie", drapeau: "🇩🇿", code: "DZ" },
  BF: { nom: "Burkina Faso", drapeau: "🇧🇫", code: "BF" },
  ML: { nom: "Mali", drapeau: "🇲🇱", code: "ML" },
  NE: { nom: "Niger", drapeau: "🇳🇪", code: "NE" },
  TG: { nom: "Togo", drapeau: "🇹🇬", code: "TG" },
  BJ: { nom: "Bénin", drapeau: "🇧🇯", code: "BJ" },
  GN: { nom: "Guinée", drapeau: "🇬🇳", code: "GN" },
  GW: { nom: "Guinée-Bissau", drapeau: "🇬🇼", code: "GW" },
  LR: { nom: "Libéria", drapeau: "🇱🇷", code: "LR" },
  SL: { nom: "Sierra Leone", drapeau: "🇸🇱", code: "SL" },
  GM: { nom: "Gambie", drapeau: "🇬🇲", code: "GM" },
  GH: { nom: "Ghana", drapeau: "🇬🇭", code: "GH" },
  CG: { nom: "Congo", drapeau: "🇨🇬", code: "CG" },
  CD: { nom: "RDC", drapeau: "🇨🇩", code: "CD" },
  GA: { nom: "Gabon", drapeau: "🇬🇦", code: "GA" },
  GQ: { nom: "Guinée équatoriale", drapeau: "🇬🇶", code: "GQ" },
  CF: { nom: "République centrafricaine", drapeau: "🇨🇫", code: "CF" },
  TD: { nom: "Tchad", drapeau: "🇹🇩", code: "TD" },
  ST: { nom: "Sao Tomé", drapeau: "🇸🇹", code: "ST" },
  KE: { nom: "Kenya", drapeau: "🇰🇪", code: "KE" },
  TZ: { nom: "Tanzanie", drapeau: "🇹🇿", code: "TZ" },
  UG: { nom: "Ouganda", drapeau: "🇺🇬", code: "UG" },
  RW: { nom: "Rwanda", drapeau: "🇷🇼", code: "RW" },
  BI: { nom: "Burundi", drapeau: "🇧🇮", code: "BI" },
  ET: { nom: "Éthiopie", drapeau: "🇪🇹", code: "ET" },
  ER: { nom: "Érythrée", drapeau: "🇪🇷", code: "ER" },
  SO: { nom: "Somalie", drapeau: "🇸🇴", code: "SO" },
  DJ: { nom: "Djibouti", drapeau: "🇩🇯", code: "DJ" },
  SS: { nom: "Soudan du Sud", drapeau: "🇸🇸", code: "SS" },
  SD: { nom: "Soudan", drapeau: "🇸🇩", code: "SD" },
  ZA: { nom: "Afrique du Sud", drapeau: "🇿🇦", code: "ZA" },
  ZM: { nom: "Zambie", drapeau: "🇿🇲", code: "ZM" },
  ZW: { nom: "Zimbabwe", drapeau: "🇿🇼", code: "ZW" },
  MZ: { nom: "Mozambique", drapeau: "🇲🇿", code: "MZ" },
  AO: { nom: "Angola", drapeau: "🇦🇴", code: "AO" },
  NA: { nom: "Namibie", drapeau: "🇳🇦", code: "NA" },
  BW: { nom: "Botswana", drapeau: "🇧🇼", code: "BW" },
  MW: { nom: "Malawi", drapeau: "🇲🇼", code: "MW" },
  MG: { nom: "Madagascar", drapeau: "🇲🇬", code: "MG" },
  MU: { nom: "Maurice", drapeau: "🇲🇺", code: "MU" },
  KM: { nom: "Comores", drapeau: "🇰🇲", code: "KM" },
  SC: { nom: "Seychelles", drapeau: "🇸🇨", code: "SC" },
  EG: { nom: "Égypte", drapeau: "🇪🇬", code: "EG" },
  LY: { nom: "Libye", drapeau: "🇱🇾", code: "LY" },
  MR: { nom: "Mauritanie", drapeau: "🇲🇷", code: "MR" },
  EH: { nom: "Sahara occidental", drapeau: "🇪🇭", code: "EH" },
  US: { nom: "États-Unis", drapeau: "🇺🇸", code: "US" },
}

// Storytelling — même mécanique de slide, contenu recentré sur les 3
// vrais arguments de vente au lieu de 3 catégories produit interchangeables
const heroSlides = [
  {
    id: 1,
    image: "/hero-fashion.jpg",
    title: "Commandez direct usine",
    subtitle: "Sans grossiste, sans intermédiaire",
    badge: "Direct usine",
    offre: "0%",
    statLabel: "intermédiaire",
    cta: "Commander",
    href: "/for-you",
  },
  {
    id: 2,
    image: "/hero-electronics.jpg",
    title: "Sourcing sur mesure",
    subtitle: "Produit précis, grande quantité : on négocie pour vous",
    badge: "Sourcing B2B",
    offre: "B2B",
    statLabel: "sur devis",
    cta: "Demander un devis",
    href: "/boutique-noel",
  },
  {
    id: 3,
    image: "/hero-home.jpg",
    title: "Garanti ou remboursé",
    subtitle: "Commande non livrée : remboursement automatique",
    badge: "0 risque",
    offre: "100%",
    statLabel: "remboursé",
    cta: "En savoir plus",
    href: "/for-you",
  },
]

const trustItems = [
  { icon: Wallet, label: "Paiement sécurisé", sub: "Mobile Money, Carte" },
  { icon: Truck, label: "Livraison rapide", sub: "7 à 45 jours" },
  { icon: ShieldCheck, label: "Garanti ou remboursé", sub: "Si ça n'arrive pas" },
]

const suppliers = [
  { code: "CN", label: "Chine" },
  { code: "AE", label: "Dubaï" },
  { code: "TR", label: "Turquie" },
  { code: "US", label: "USA" },
]

const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export function HeroSection() {
  const { country } = useLocale()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [paysActuel, setPaysActuel] = useState(() => {
    if (typeof window === 'undefined') return pays.CI
    return pays[country as keyof typeof pays] || pays.CI
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
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
        height: "240px",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
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
            <div
              className="flex items-center gap-1.5 w-fit px-2.5 py-1 mb-3"
              style={{ background: "rgba(0,0,0,0.5)", borderRadius: "4px", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.45s ease-out 0ms, transform 0.45s ease-out 0ms" }}
            >
              <Flag code={paysActuel.code} className="w-3.5 h-2.5 rounded-[1px]" />
              <span style={{ fontSize: "10px", fontWeight: 500, color: "#fff", fontFamily: amazonFont }}>
                {paysActuel.nom}
              </span>
            </div>

            <span
              className="w-fit px-2 py-0.5 mb-1.5 text-white transition-transform duration-200 hover:scale-105"
              style={{ background: "#D4372B", borderRadius: "2px", fontSize: "10px", fontWeight: 700, fontFamily: amazonFont, opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.45s ease-out 60ms, transform 0.45s ease-out 60ms" }}
            >
              {slide.badge}
            </span>

            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.03em", fontFamily: amazonFont, marginBottom: "6px", textShadow: "0 1px 2px rgba(0,0,0,0.2)", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.45s ease-out 120ms, transform 0.45s ease-out 120ms" }}>
              {slide.title}
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontFamily: amazonFont, marginBottom: "16px", textShadow: "0 1px 1px rgba(0,0,0,0.1)", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.45s ease-out 180ms, transform 0.45s ease-out 180ms" }}>
              {slide.subtitle}
            </p>

            <Link
              href={slide.href}
              className="flex items-center gap-1.5 w-fit group transition-transform duration-200 hover:scale-105"
              style={{
                background: "#fff",
                color: "#0A0A0A",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: amazonFont,
                opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.45s ease-out 240ms, transform 0.45s ease-out 240ms",
              }}
            >
              {slide.cta}
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 left-5 z-30 flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            style={{
              height: "2px",
              width: i === currentSlide ? "20px" : "6px",
              borderRadius: "1px",
              background: i === currentSlide ? "#fff" : "rgba(255,255,255,0.4)",
              transition: "all 0.3s ease",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      <div
        className="absolute top-4 right-4 z-30 flex flex-col items-center justify-center"
        style={{ background: "#D4372B", borderRadius: "6px", width: "48px", height: "48px" }}
      >
        <span style={{ fontSize: "14px", fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: amazonFont }}>
          {heroSlides[currentSlide].offre}
        </span>
        <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.8)", fontFamily: amazonFont }}>
          {heroSlides[currentSlide].statLabel}
        </span>
      </div>
    </div>
  )

  const DesktopHero = () => (
    <div 
      className="hidden lg:block"
      style={{ 
        background: "#0A0A0A",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-2">
        <div className="grid grid-cols-2 gap-12 items-center">

          {/* Gauche — Texte */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-6" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease-out 0ms, transform 0.5s ease-out 0ms" }}>
              <span style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: amazonFont }}>Direct depuis :</span>
              {suppliers.map((s) => (
                <span
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "40px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    color: "#fff",
                    fontFamily: amazonFont,
                    transition: "all 0.2s ease",
                  }}
                  className="inline-flex items-center gap-1.5 hover:bg-white/15 hover:scale-105 transition-all duration-200"
                >
                  <Flag code={s.code} className="w-4 h-3 rounded-[1px]" />
                  {s.label}
                </span>
              ))}
            </div>

            {/* ✅ TITRE CORRIGÉ : même taille pour les deux lignes */}
            <h1
              style={{
                fontSize: "40px",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                fontFamily: amazonFont,
                marginBottom: "16px",
                opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease-out 90ms, transform 0.5s ease-out 90ms",
              }}
            >
              Tu veux commander direct usine ?
              <br />
              <span style={{ fontSize: "40px", fontWeight: 900, color: "#D4372B", fontFamily: amazonFont }}>
                On s'occupe de tout.
              </span>
            </h1>

            <p style={{ 
              fontSize: "16px", 
              color: "#D0D0D0", 
              lineHeight: 1.6, 
              fontFamily: amazonFont, 
              maxWidth: "460px", 
              marginBottom: "32px",
              fontWeight: 400,
              opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease-out 180ms, transform 0.5s ease-out 180ms",
            }}>
              Tu reçois chez toi. Si ça n'arrive pas — on te rembourse.
            </p>

            <div className="flex items-center gap-3" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease-out 270ms, transform 0.5s ease-out 270ms" }}>
              <Link
                href="/for-you"
                className="group transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                  background: "#D4372B",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "12px 28px",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: amazonFont,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Explorer la boutique
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/boutique-noel"
                className="transition-all duration-200 hover:border-[#D4372B] hover:-translate-y-0.5"
                style={{
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "11px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: amazonFont,
                }}
              >
                Sourcing B2B
              </Link>
            </div>
          </div>

          {/* Droite — Image carrousel */}
          <div className="relative" style={{ height: "280px" }}>
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-all duration-700"
                style={{ 
                  opacity: index === currentSlide ? 1 : 0, 
                  borderRadius: "12px", 
                  overflow: "hidden",
                }}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />

                <div className="absolute top-4 left-4 z-10">
                  <Link
                    href={slide.href}
                    className="flex items-center gap-1.5 w-fit group transition-transform duration-200 hover:scale-105"
                    style={{
                      background: "#fff",
                      color: "#0A0A0A",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      fontFamily: amazonFont,
                    }}
                  >
                    {slide.cta}
                    <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div>
                    <p className="text-[11px] text-white/60" style={{ fontFamily: amazonFont }}>{slide.badge}</p>
                    <p className="text-[18px] font-extrabold text-white tracking-tight" style={{ fontFamily: amazonFont }}>{slide.title}</p>
                  </div>
                  <div
                    className="flex flex-col items-center"
                    style={{
                      background: "#D4372B",
                      borderRadius: "8px",
                      padding: "8px 14px",
                    }}
                  >
                    <span className="text-[20px] font-black text-white leading-none" style={{ fontFamily: amazonFont }}>{slide.offre}</span>
                    <span className="text-[9px] text-white/70" style={{ fontFamily: amazonFont }}>{slide.statLabel}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    height: "2px",
                    width: i === currentSlide ? "20px" : "6px",
                    borderRadius: "1px",
                    background: i === currentSlide ? "#D4372B" : "rgba(255,255,255,0.3)",
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

        {/* Trust bar */}
        <div
          className="grid grid-cols-3 gap-0 mt-8"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "16px", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease-out 360ms, transform 0.5s ease-out 360ms" }}
        >
          {trustItems.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 group transition-all duration-200 hover:translate-x-0.5"
              style={{ 
                borderRight: i < 2 ? "0.5px solid rgba(255,255,255,0.08)" : "none", 
                paddingRight: i < 2 ? "32px" : "0", 
                paddingLeft: i > 0 ? "32px" : "0",
              }}
            >
              <div 
                className="p-2 transition-all duration-300 group-hover:scale-110"
                style={{ background: "rgba(212,55,43,0.15)", borderRadius: "8px" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#D4372B" }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white" style={{ fontFamily: amazonFont }}>{label}</p>
                <p className="text-[12px] text-[#AAAAAA]" style={{ fontFamily: amazonFont }}>{sub}</p>
              </div>
            </div>
          ))}
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