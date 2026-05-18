"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, ChevronRight, Truck, Shield, Clock } from "lucide-react"
import { useLocale } from "@/context/LocaleProvider"
import { useState, useEffect } from "react"

const pays = {
  CI: { nom: "Côte d'Ivoire", drapeau: "🇨🇮", code: "CI" },
  SN: { nom: "Sénégal", drapeau: "🇸🇳", code: "SN" },
  CM: { nom: "Cameroun", drapeau: "🇨🇲", code: "CM" },
  MA: { nom: "Maroc", drapeau: "🇲🇦", code: "MA" },
  TN: { nom: "Tunisie", drapeau: "🇹🇳", code: "TN" },
  DZ: { nom: "Algérie", drapeau: "🇩🇿", code: "DZ" },
}

const heroSlides = [
  {
    id: 1,
    image: "/hero-fashion.jpg",
    title: "Mode Africaine",
    subtitle: "Collections printemps-été",
    badge: "Nouvelle collection",
    offre: "-30%",
    href: "/categorie/mode",
  },
  {
    id: 2,
    image: "/hero-electronics.jpg",
    title: "Électronique",
    subtitle: "Smartphones, accessoires",
    badge: "Livraison 7j",
    offre: "-25%",
    href: "/categorie/electronique",
  },
  {
    id: 3,
    image: "/hero-home.jpg",
    title: "Maison & Cuisine",
    subtitle: "Équipez votre intérieur",
    badge: "Meilleures ventes",
    offre: "-40%",
    href: "/categorie/maison",
  },
]

const trustItems = [
  { icon: Truck, label: "Livraison porte-à-porte", sub: "50j · 15j · 7j" },
  { icon: Shield, label: "Paiement sécurisé", sub: "Mobile Money, Carte" },
  { icon: Clock, label: "Suivi en temps réel", sub: "De l'usine à votre porte" },
]

const suppliers = [
  { flag: "🇨🇳", label: "Chine" },
  { flag: "🇦🇪", label: "Dubaï" },
  { flag: "🇹🇷", label: "Turquie" },
  { flag: "🇺🇸", label: "USA" },
  { flag: "🇪🇺", label: "Europe" },
]

export function HeroSection() {
  const { country } = useLocale()
  const paysActuel = pays[country as keyof typeof pays] || pays.CI
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // ── MOBILE ─────────────────────────────────────────────────
  const MobileHero = () => (
    <div className="lg:hidden relative overflow-hidden" style={{ height: "220px" }}>
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 10 : 0 }}
        >
          <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)" }} />

          <div className="absolute inset-0 flex flex-col justify-center px-5 z-20">
            <div
              className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full mb-3"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "0.5px solid rgba(255,255,255,0.3)" }}
            >
              <MapPin className="w-3 h-3 text-white" />
              <span style={{ fontSize: "10px", fontWeight: 500, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
                {paysActuel.nom} {paysActuel.drapeau}
              </span>
            </div>

            <span
              className="w-fit px-2 py-0.5 rounded-md mb-1.5 text-white"
              style={{ background: "#D4372B", fontSize: "10px", fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}
            >
              {slide.badge}
            </span>

            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", fontFamily: "'Poppins', sans-serif", marginBottom: "4px" }}>
              {slide.title}
            </h1>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontFamily: "'Poppins', sans-serif", marginBottom: "14px" }}>
              {slide.subtitle}
            </p>

            <Link
              href={slide.href}
              className="flex items-center gap-1.5 w-fit"
              style={{
                background: "#fff",
                color: "#0A0A0A",
                borderRadius: "8px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Découvrir {slide.offre}
              <ChevronRight className="w-3.5 h-3.5" />
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
              height: "3px",
              width: i === currentSlide ? "24px" : "8px",
              borderRadius: "2px",
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
        style={{ background: "#D4372B", borderRadius: "10px", width: "52px", height: "52px" }}
      >
        <span style={{ fontSize: "15px", fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>
          {heroSlides[currentSlide].offre}
        </span>
        <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.8)", fontFamily: "'Poppins', sans-serif" }}>
          offre
        </span>
      </div>
    </div>
  )

  // ── DESKTOP ─────────────────────────────────────────────────
  const DesktopHero = () => (
    <div className="hidden lg:block" style={{ background: "#0A0A0A" }}>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-14 items-center">

          {/* Gauche — Texte */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>Direct depuis :</span>
              {suppliers.map((s) => (
                <span
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "100px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {s.flag} {s.label}
                </span>
              ))}
            </div>

            <h1
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                fontFamily: "'Poppins', sans-serif",
                marginBottom: "16px",
              }}
            >
              Achetez direct
              <br />
              <span style={{ color: "#D4372B" }}>des usines du monde</span>
            </h1>

            <p style={{ fontSize: "16px", color: "#AAAAAA", lineHeight: 1.6, fontFamily: "'Poppins', sans-serif", maxWidth: "420px", marginBottom: "32px" }}>
              Adullam connecte les acheteurs africains aux meilleurs fournisseurs de Chine, Dubaï, Turquie, USA et Europe.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/for-you"
                style={{
                  background: "#D4372B",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "13px 28px",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Explorer la boutique
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/boutique-noel"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Sourcing B2B
              </Link>
            </div>
          </div>

          {/* Droite — Image carrousel */}
          <div className="relative" style={{ height: "240px" }}>
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: index === currentSlide ? 1 : 0, borderRadius: "20px", overflow: "hidden" }}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />

                {/* AJOUT : CTA en haut à gauche */}
                <div className="absolute top-4 left-4 z-10">
                  <Link
                    href={slide.href}
                    className="flex items-center gap-1.5 w-fit"
                    style={{
                      background: "#fff",
                      color: "#0A0A0A",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Découvrir {slide.offre}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Info overlay bas (inchangé) */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: "'Poppins', sans-serif" }}>{slide.badge}</p>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "#fff", fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}>{slide.title}</p>
                  </div>
                  <div
                    style={{
                      background: "#D4372B",
                      borderRadius: "10px",
                      padding: "8px 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "20px", fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>{slide.offre}</span>
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", fontFamily: "'Poppins', sans-serif" }}>aujourd'hui</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Dots desktop */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    height: "3px",
                    width: i === currentSlide ? "20px" : "6px",
                    borderRadius: "2px",
                    background: i === currentSlide ? "#D4372B" : "rgba(255,255,255,0.25)",
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
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}
        >
          {trustItems.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className="flex items-center gap-3"
              style={{ borderRight: i < 2 ? "0.5px solid rgba(255,255,255,0.08)" : "none", paddingRight: i < 2 ? "32px" : "0", paddingLeft: i > 0 ? "32px" : "0" }}
            >
              <div style={{ background: "rgba(212,55,43,0.15)", borderRadius: "10px", padding: "10px" }}>
                <Icon className="w-5 h-5" style={{ color: "#D4372B" }} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{label}</p>
                <p style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>{sub}</p>
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