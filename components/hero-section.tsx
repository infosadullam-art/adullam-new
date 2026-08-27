"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Truck, Wallet, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"

const heroSlides = [
  {
    id: 1,
    image: "/hero-1-direct-usine.webp",
    title: "Commandez directement à l'usine",
    cta: "Commander maintenant",
    href: "/for-you",
  },
  {
    id: 2,
    image: "/hero-2-sourcing-sur-mesure.webp",
    title: "Sourcing sur mesure",
    cta: "Demander un devis",
    href: "/boutique-noel",
  },
  {
    id: 3,
    image: "/hero-3-garantie-remboursement.webp",
    title: "Livraison garantie ou remboursé",
    cta: "Commander en confiance",
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Barre de navigation (bouton + points), utilisée sous l'image en mobile et en desktop
  const SlideControls = ({ dark }: { dark: boolean }) => (
    <div className="flex items-center justify-between mt-3">
      <Link
        href={heroSlides[currentSlide].href}
        className="flex items-center gap-1.5 group transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        style={{
          background: dark ? "#0A0A0A" : "#0A0A0A",
          color: "#fff",
          borderRadius: "8px",
          padding: "10px 18px",
          fontSize: "13px",
          fontWeight: 700,
          fontFamily: amazonFont,
        }}
      >
        {heroSlides[currentSlide].cta}
        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>

      <div className="flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Voir le slide ${i + 1}`}
            style={{
              height: "6px",
              width: i === currentSlide ? "20px" : "6px",
              borderRadius: "3px",
              background: i === currentSlide ? "#D4372B" : dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
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

  const MobileHero = () => (
    <div
      className="lg:hidden px-4 pt-4"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2 / 1", borderRadius: "10px" }}>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 10 : 0 }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <SlideControls dark={false} />
    </div>
  )

  const DesktopHero = () => (
    <div
      className="hidden lg:block"
      style={{
        background: "#0A0A0A",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-2">
        <div className="grid grid-cols-2 gap-12 items-center">

          {/* Gauche — Texte */}
          <div>
            <div
              className="flex items-center gap-2 flex-wrap mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease-out 0ms, transform 0.5s ease-out 0ms",
              }}
            >
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
                  }}
                  className="inline-flex items-center gap-1.5 hover:bg-white/15 hover:scale-105 transition-all duration-200"
                >
                  {s.label}
                </span>
              ))}
            </div>

            <h1
              style={{
                fontSize: "40px",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                fontFamily: amazonFont,
                marginBottom: "16px",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease-out 90ms, transform 0.5s ease-out 90ms",
              }}
            >
              Tu veux commander direct usine ?
              <br />
              <span style={{ fontSize: "40px", fontWeight: 900, color: "#D4372B", fontFamily: amazonFont }}>
                On s'occupe de tout.
              </span>
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "#D0D0D0",
                lineHeight: 1.6,
                fontFamily: amazonFont,
                maxWidth: "460px",
                marginBottom: "32px",
                fontWeight: 400,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease-out 180ms, transform 0.5s ease-out 180ms",
              }}
            >
              Tu reçois chez toi. Si ça n'arrive pas — on te rembourse.
            </p>

            <div
              className="flex items-center gap-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease-out 270ms, transform 0.5s ease-out 270ms",
              }}
            >
              <Link
                href="/for-you"
                className="group transition-transform duration-200 hover:scale-105"
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

          {/* Droite — Image carrousel (aucun texte superposé, image entière visible) */}
          <div>
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2 / 1", borderRadius: "12px" }}>
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: index === currentSlide ? 1 : 0 }}
                >
                  <Image src={slide.image} alt={slide.title} fill className="object-cover" sizes="50vw" priority={index === 0} />
                </div>
              ))}
            </div>

            <SlideControls dark={true} />
          </div>
        </div>

        {/* Trust bar */}
        <div
          className="grid grid-cols-3 gap-0 mt-8"
          style={{
            background: "#FFFFFF",
            borderTop: "0.5px solid rgba(255,255,255,0.08)",
            paddingTop: "16px",
            paddingBottom: "16px",
            borderRadius: "8px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 360ms, transform 0.5s ease-out 360ms",
          }}
        >
          {trustItems.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-3 group transition-all duration-200 hover:translate-x-0.5"
              style={{
                borderRight: i < 2 ? "0.5px solid rgba(0,0,0,0.1)" : "none",
                paddingRight: i < 2 ? "32px" : "0",
                paddingLeft: i > 0 ? "32px" : "0",
              }}
            >
              <div
                className="p-2 transition-all duration-300 group-hover:scale-110"
                style={{ background: "rgba(0,0,0,0.06)", borderRadius: "8px" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#0A0A0A" }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ fontFamily: amazonFont, color: "#0A0A0A" }}>{label}</p>
                <p className="text-[12px]" style={{ fontFamily: amazonFont, color: "#555555" }}>{sub}</p>
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