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
  },
  {
    id: 2,
    image: "/hero-electronics.jpg",
    title: "Électronique",
    subtitle: "Smartphones, accessoires",
    badge: "Livraison 7j",
    offre: "-25%",
  },
  {
    id: 3,
    image: "/hero-home.jpg",
    title: "Maison & Cuisine",
    subtitle: "Équipez votre intérieur",
    badge: "Meilleures ventes",
    offre: "-40%",
  },
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

  // ========== VERSION MOBILE - NON MODIFIÉE ==========
  const MobileHero = () => (
    <div className="lg:hidden bg-white">
      <div className="relative h-[160px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            </div>

            <div className="relative z-20 h-full flex items-center px-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20 w-fit">
                  <MapPin className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-medium text-white">
                    {paysActuel.nom} {paysActuel.drapeau}
                  </span>
                </div>

                <h1 className="text-lg font-bold text-white">
                  {slide.title}
                </h1>
                
                <p className="text-xs text-white/80">
                  {slide.subtitle}
                </p>

                <Link
                  href={`/categorie/${slide.id}`}
                  className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30"
                >
                  <span>Découvrir</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentSlide
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  // ========== VERSION DESKTOP - STYLE ALIBABA (COMPACT) ==========
  const DesktopHero = () => (
    <div className="hidden lg:block bg-white">
      {/* Bandeau promo */}
      <div className="bg-[#ff6a00] text-white text-center py-1.5 text-xs font-medium">
        🔥 LIVRAISON MONDIALE • PAIEMENT SÉCURISÉ • SATISFAIT OU REMBOURSÉ
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 gap-5">
          {/* SLIDER - 2/3 */}
          <div className="col-span-2 relative h-[260px] rounded-xl overflow-hidden shadow-lg">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
                
                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">
                    {slide.badge}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
                  <p className="text-sm text-white/80 mt-1">{slide.subtitle}</p>
                  <Link href={`/categorie/${slide.id}`} className="inline-flex items-center gap-1 bg-white text-gray-800 text-sm font-medium px-5 py-2 rounded-full mt-3 w-fit shadow-md hover:bg-gray-50 transition">
                    Acheter maintenant <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all ${
                    index === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CARTE LATÉRALE - 1/3 */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#ff6a00]/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#ff6a00]" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Livraison vers {paysActuel.nom} {paysActuel.drapeau}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5 text-[#ff6a00]" />
                  </div>
                  <span>Livraison 7-50 jours</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span>Suivi en temps réel</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 bg-[#ff6a00] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#e55a00] transition">
              Voir les offres
            </button>
          </div>
        </div>

        {/* Catégories rapides */}
        <div className="flex gap-8 mt-5 pt-3 border-t border-gray-100">
          {["Mode", "Électronique", "Maison", "Beauté", "Sport", "Jouets"].map((cat) => (
            <button key={cat} className="text-sm text-gray-500 hover:text-[#ff6a00] transition font-medium">
              {cat}
            </button>
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