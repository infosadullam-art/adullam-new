"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Truck, Shield, Clock, Star, TrendingUp } from "lucide-react"
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
  { id: 1, image: "/hero-fashion.jpg", title: "Mode", subtitle: "Collections tendances", badge: "-30%", bg: "from-pink-600/60" },
  { id: 2, image: "/hero-electronics.jpg", title: "Électronique", subtitle: "Smartphones & accessoires", badge: "-25%", bg: "from-blue-600/60" },
  { id: 3, image: "/hero-home.jpg", title: "Maison", subtitle: "Équipez votre intérieur", badge: "-40%", bg: "from-emerald-600/60" },
]

export function HeroSection() {
  const { country } = useLocale()
  const paysActuel = pays[country as keyof typeof pays] || pays.CI
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  // ========== MOBILE - STYLE JUMIA ==========
  const MobileHero = () => (
    <div className="lg:hidden bg-[#f5f5f5]">
      <div className="bg-[#ff6b00] text-white text-center py-1.5 text-[10px] font-medium">
        🔥 Livraison gratuite dès 50 000 FCFA • Paiement sécurisé
      </div>

      <div className="relative h-[160px] mx-2 mt-2 rounded-xl overflow-hidden shadow-md">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} to-black/40`} />
            
            <div className="relative z-20 h-full flex items-center px-4">
              <div>
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                  {slide.badge}
                </span>
                <h2 className="text-xl font-bold text-white">{slide.title}</h2>
                <p className="text-xs text-white/80">{slide.subtitle}</p>
                <Link href={`/categorie/${slide.id}`} className="inline-flex items-center gap-1 bg-white text-gray-800 text-[11px] font-medium px-3 py-1 rounded-full mt-2 shadow-sm">
                  J'en profite <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-2 py-3 bg-white border-b border-gray-100">
        <button className="flex flex-col items-center gap-1 py-1">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <span className="text-[10px] text-gray-700">Tendances</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-[10px] text-gray-700">Meilleures ventes</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-[10px] text-gray-700">Livraison rapide</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-[10px] text-gray-700">Paiement sécurisé</span>
        </button>
      </div>
    </div>
  )

  // ========== DESKTOP - STYLE JUMIA AVEC CARTE LATÉRALE FIXE ==========
  const DesktopHero = () => (
    <div className="hidden lg:block bg-[#f5f5f5]">
      <div className="bg-[#ff6b00] text-white text-center py-2 text-xs font-medium">
        🔥 LIVRAISON GRATUITE À PARTIR DE 50 000 FCFA • PAIEMENT À LA LIVRAISON • SATISFAIT OU REMBOURSÉ
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          {/* SLIDER - 2/3 */}
          <div className="col-span-2 relative h-[280px] rounded-xl overflow-hidden shadow-lg">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} to-black/30`} />
                
                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                    {slide.badge}
                  </span>
                  <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
                  <p className="text-sm text-white/80 mt-1">{slide.subtitle}</p>
                  <Link href={`/categorie/${slide.id}`} className="inline-flex items-center gap-1 bg-white text-gray-800 text-sm font-medium px-5 py-2 rounded-full mt-3 w-fit shadow-md hover:bg-gray-100 transition">
                    Découvrir <ChevronRight className="w-4 h-4" />
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

          {/* CARTE LATÉRALE - 1/3 (FIXE, PAS DE FONDU) */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3">
              <span className="text-sm font-bold">🇨🇮 {paysActuel.nom}</span>
              <p className="text-[10px] opacity-80">Livraison porte-à-porte</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Livraison express</p>
                  <p className="text-[10px] text-gray-500">7-50 jours selon mode</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Paiement sécurisé</p>
                  <p className="text-[10px] text-gray-500">Mobile Money, Carte</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Suivi en temps réel</p>
                  <p className="text-[10px] text-gray-500">De l'usine à votre porte</p>
                </div>
              </div>
              <button className="w-full mt-2 bg-[#ff6b00] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#e55a00] transition">
                Voir les offres
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3 mt-6">
          {["Mode", "Électronique", "Maison", "Beauté", "Sport", "Jouets"].map((cat) => (
            <button key={cat} className="bg-white rounded-lg py-2 text-center text-sm font-medium text-gray-700 hover:shadow-md transition shadow-sm border border-gray-100">
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