"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import * as Flags from "country-flag-icons/react/3x2"
import { Truck, Wallet, ShieldCheck, ChevronRight } from "lucide-react"

// NOTE DEV : npm install country-flag-icons (déjà en place)
function Flag({ code, className }: { code: string; className?: string }) {
  const Cmp = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code]
  if (!Cmp) return null
  return <Cmp className={className} title={code} />
}

// ── Les 3 visuels fournis contiennent déjà tout le texte (titre, icônes, bouton dessiné).
// On ne remet donc RIEN par-dessus l'image : pas de titre, pas de sous-titre, pas de badge.
// Chaque slide garde juste une destination (href) et le libellé du VRAI bouton cliquable
// affiché sous le visuel (celui dessiné dans le PNG n'est qu'une image, pas un lien).
const heroSlides = [
  {
    id: 1,
    image: "/images/hero/hero-1-direct-usine.webp",
    alt: "Commandez directement à l'usine, sans intermédiaire",
    cta: "Accédez aux usines, commandez en direct",
    href: "/for-you",
  },
  {
    id: 2,
    image: "/images/hero/hero-2-sourcing-sur-mesure.webp",
    alt: "Sourcing sur mesure : recherche, vérification, négociation, livraison",
    cta: "Votre solution sourcing, clé en main",
    href: "/boutique-noel",
  },
  {
    id: 3,
    image: "/images/hero/hero-3-garantie-remboursement.webp",
    alt: "Livraison garantie ou remboursé",
    cta: "Commandez en toute confiance",
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
const SLIDE_DURATION = 5000

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [isPaused])

  const active = heroSlides[currentSlide]

  return (
    <div
      style={{
        background: "#0A0A0A",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 lg:pt-8 lg:pb-8">

        {/* Bandeau fournisseurs — la seule info que les visuels ne portent pas */}
        <div className="flex items-center gap-2 flex-wrap mb-4 lg:mb-6">
          <span style={{ fontSize: "11px", color: "#AAAAAA", fontFamily: amazonFont }} className="shrink-0">
            Direct depuis :
          </span>
          {suppliers.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 hover:bg-white/15 hover:scale-105 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: "40px",
                padding: "4px 12px",
                fontSize: "11px",
                color: "#fff",
                fontFamily: amazonFont,
              }}
            >
              <Flag code={s.code} className="w-3.5 h-2.5 rounded-[1px]" />
              {s.label}
            </span>
          ))}
        </div>

        {/* Carrousel — ratio 2:1 fixe = identique à celui des 3 visuels fournis.
            On voit TOUJOURS l'image entière, jamais coupée, jamais démesurée en hauteur,
            que ce soit sur mobile ou desktop : c'est le ratio qui fixe la hauteur, pas un px codé en dur. */}
        <div className="relative w-full aspect-[2/1] max-h-[70vh] lg:max-h-[480px] rounded-xl overflow-hidden">
          {heroSlides.map((slide, index) => {
            const isActive = index === currentSlide
            return (
              <Link
                key={slide.id}
                href={slide.href}
                aria-label={slide.alt}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                className="absolute inset-0 block"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 900ms cubic-bezier(0.22,1,0.36,1)",
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex: isActive ? 10 : 0,
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  quality={85}
                  priority={index === 0}
                  className="object-cover"
                  style={{
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: `transform ${SLIDE_DURATION + 900}ms linear`,
                  }}
                />
              </Link>
            )
          })}

          {/* Indicateurs — barres de progression (pas de simples points statiques) :
              elles se remplissent pendant les 5s, on voit visuellement le rythme du carrousel. */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Voir la diapositive ${i + 1}`}
                className="relative h-[3px] w-8 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", padding: 0 }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "left",
                    background: "#F5A623",
                    transform: `scaleX(${i === currentSlide ? 1 : 0})`,
                    transition:
                      i === currentSlide && !isPaused
                        ? `transform ${SLIDE_DURATION}ms linear`
                        : "transform 200ms ease",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Bouton réel sous le visuel — un seul, celui de la slide active.
            Pas de texte dupliqué : juste l'action, cliquable, qui change avec le carrousel. */}
        <div className="mt-4 lg:mt-5">
          <Link
            key={active.id}
            href={active.href}
            className="animate-fade-in flex w-full sm:w-fit items-center justify-center gap-1.5 transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              background: "#D4372B",
              color: "#fff",
              borderRadius: "8px",
              padding: "13px 28px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: amazonFont,
            }}
          >
            {active.cta}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Trust bar */}
        <div
          className="grid grid-cols-3 gap-0 mt-6 lg:mt-8"
          style={{
            background: "#FFFFFF",
            paddingTop: "12px",
            paddingBottom: "12px",
            borderRadius: "8px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 200ms, transform 0.5s ease-out 200ms",
          }}
        >
          {trustItems.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-2 group transition-transform duration-200 hover:translate-x-0.5"
              style={{
                borderRight: i < 2 ? "0.5px solid rgba(0,0,0,0.1)" : "none",
                paddingRight: i < 2 ? "16px" : "0",
                paddingLeft: i > 0 ? "16px" : "0",
              }}
            >
              <div
                className="p-1.5 transition-transform duration-300 group-hover:scale-110 shrink-0"
                style={{ background: "rgba(0,0,0,0.06)", borderRadius: "7px" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#0A0A0A" }} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] leading-tight font-semibold truncate" style={{ fontFamily: amazonFont, color: "#0A0A0A" }}>
                  {label}
                </p>
                <p className="text-[11px] leading-tight truncate" style={{ fontFamily: amazonFont, color: "#555555" }}>
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}