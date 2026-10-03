"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Truck, Wallet, ShieldCheck } from "lucide-react"
import { useLocale } from "@/context/LocaleProvider"
import { useTranslations } from "next-intl"
import { getCountryName } from "@/lib/country-config"
import { useState, useEffect } from "react"
import * as Flags from "country-flag-icons/react/3x2"

// NOTE DEV : npm install country-flag-icons
function Flag({ code, className }: { code: string; className?: string }) {
  const Cmp = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code]
  if (!Cmp) return null
  return <Cmp className={className} title={code} />
}

const heroSlides = [
  {
    id: 1,
    image: "/hero-1-direct-usine.webp",
    titleKey: "slide1Title",
    ctaKey: "slide1Cta",
    href: "/for-you",
  },
  {
    id: 2,
    image: "/hero-2-sourcing-sur-mesure.webp",
    titleKey: "slide2Title",
    ctaKey: "slide2Cta",
    href: "/boutique-noel",
  },
  {
    id: 3,
    image: "/hero-3-garantie-remboursement.webp",
    titleKey: "slide3Title",
    ctaKey: "slide3Cta",
    href: "/for-you",
  },
]

const trustItems = [
  { icon: Wallet, labelKey: "paymentLabel", subKey: "paymentSub" },
  { icon: Truck, labelKey: "deliveryLabel", subKey: "deliverySub" },
  { icon: ShieldCheck, labelKey: "guaranteeLabel", subKey: "guaranteeSub" },
]

const suppliers = [
  { code: "CN", labelKey: "supplierChina" },
  { code: "AE", labelKey: "supplierDubai" },
  { code: "TR", labelKey: "supplierTurkey" },
  { code: "US", labelKey: "supplierUsa" },
]

// Police via variable CSS : même pile qu'avant en LTR, Cairo en arabe (voir globals.css)
const amazonFont = "var(--font-amazon)"

export function HeroSection() {
  const { country, language } = useLocale()
  const t = useTranslations("hero")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  // Pays de livraison : nom traduit via Intl (plus de table de noms en dur)
  const paysActuel = { code: country, nom: getCountryName(country, language) }

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
          background: "#0A0A0A",
          color: "#fff",
          borderRadius: "8px",
          padding: "10px 18px",
          fontSize: "13px",
          fontWeight: 700,
          fontFamily: amazonFont,
        }}
      >
        {t(heroSlides[currentSlide].ctaKey)}
        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" />
      </Link>

      <div className="flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={t("slideAria", { n: i + 1 })}
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
      {/* Localisation — au-dessus de l'image, pas de texte sur la photo */}
      <div className="flex items-center gap-1.5 mb-2">
        <Flag code={paysActuel.code} className="w-4 h-3 rounded-[1px]" />
        <span style={{ fontSize: "11px", fontWeight: 500, color: "#555", fontFamily: amazonFont }}>
          {t("deliveryTo", { country: paysActuel.nom })}
        </span>
      </div>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2 / 1", borderRadius: "10px" }}>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 10 : 0 }}
          >
            <Image
              src={slide.image}
              alt={t(slide.titleKey)}
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
            {/* Localisation — au-dessus du bloc texte, pas sur l'image */}
            <div
              className="flex items-center gap-1.5 mb-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease-out 0ms, transform 0.5s ease-out 0ms",
              }}
            >
              <Flag code={paysActuel.code} className="w-4 h-3 rounded-[1px]" />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#AAAAAA", fontFamily: amazonFont }}>
                {t("deliveryTo", { country: paysActuel.nom })}
              </span>
            </div>

            <div
              className="flex items-center gap-2 flex-wrap mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease-out 40ms, transform 0.5s ease-out 40ms",
              }}
            >
              <span style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: amazonFont }}>{t("directFrom")}</span>
              {suppliers.map((s) => (
                <span
                  key={s.labelKey}
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
                  <Flag code={s.code} className="w-4 h-3 rounded-[1px]" />
                  {t(s.labelKey)}
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
              {t("headline")}
              <br />
              <span style={{ fontSize: "40px", fontWeight: 900, color: "#D4372B", fontFamily: amazonFont }}>
                {t("headlineAccent")}
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
              {t("subline")}
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
                {t("explore")}
                <ChevronRight className="w-4 h-4 transition-transform duration-200 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
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
                {t("sourcingB2B")}
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
                  <Image src={slide.image} alt={t(slide.titleKey)} fill className="object-cover" sizes="50vw" priority={index === 0} />
                </div>
              ))}
            </div>

            <SlideControls dark={true} />
          </div>
        </div>
      </div>

      {/* Trust bar — pleine largeur (edge-to-edge), contenu aligné sur le conteneur du hero */}
      <div className="w-full" style={{ background: "#FFFFFF", marginTop: "24px" }}>
        <div
          className="max-w-7xl mx-auto px-8 grid grid-cols-3 gap-0"
          style={{
            paddingTop: "16px",
            paddingBottom: "16px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 360ms, transform 0.5s ease-out 360ms",
          }}
        >
          {trustItems.map(({ icon: Icon, labelKey, subKey }, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-3 group transition-all duration-200 ltr:hover:translate-x-0.5 rtl:hover:-translate-x-0.5"
              style={{
                borderInlineEnd: i < 2 ? "0.5px solid rgba(0,0,0,0.1)" : "none",
                paddingInlineEnd: i < 2 ? "32px" : "0",
                paddingInlineStart: i > 0 ? "32px" : "0",
              }}
            >
              <div
                className="p-2 transition-all duration-300 group-hover:scale-110"
                style={{ background: "rgba(0,0,0,0.06)", borderRadius: "8px" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#0A0A0A" }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ fontFamily: amazonFont, color: "#0A0A0A" }}>{t(labelKey)}</p>
                <p className="text-[12px]" style={{ fontFamily: amazonFont, color: "#555555" }}>{t(subKey)}</p>
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