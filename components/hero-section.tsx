"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, ChevronRight, Truck, Shield, Clock, TrendingUp, Star, Zap } from "lucide-react"
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
  { id: 1, image: "/hero-fashion.jpg", title: "Mode", subtitle: "Collections tendances", badge: "-30%", color: "from-pink-500" },
  { id: 2, image: "/hero-electronics.jpg", title: "Électronique", subtitle: "Smartphones & accessoires", badge: "-25%", color: "from-blue-500" },
  { id: 3, image: "/hero-home.jpg", title: "Maison", subtitle: "Équipez votre intérieur", badge: "-40%", color: "from-emerald-500" },
]

export function HeroSection() {
  const { country } = useLocale()
  const paysActuel = pays[country as keyof typeof pays] || pays.CI
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  // ========== MOBILE - NON MODIFIÉ ==========
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
              <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            </div>
            <div className="relative z-20 h-full flex items-center px-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20 w-fit">
                  <MapPin className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-medium text-white">{paysActuel.nom} {paysActuel.drapeau}</span>
                </div>
                <h1 className="text-lg font-bold text-white">{slide.title}</h1>
                <p className="text-xs text-white/80">{slide.subtitle}</p>
                <Link href={`/categorie/${slide.id}`} className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30">
                  <span>Découvrir</span> <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`h-1 rounded-full transition-all ${index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
          ))}
        </div>
      </div>
    </div>
  )

  // ========== DESKTOP - NOUVEAU DESIGN COMPACT ==========
  const DesktopHero = () => (
    <div className="hidden lg:block bg-white">
      {/* Bandeau promo */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 text-xs font-bold tracking-wide">
        🔥 LIVRAISON GRATUITE DÈS 50 000 FCFA • PAIEMENT SÉCURISÉ • SATISFAIT OU REMBOURSÉ
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex gap-6">
          {/* SLIDER - GAUCHE */}
          <div className="flex-1 relative h-[280px] rounded-xl overflow-hidden shadow-lg">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-black/50`} />
                
                <div className="relative z-20 h-full flex flex-col justify-center px-10">
                  <span className="inline-block bg-white text-gray-900 text-sm font-extrabold px-3 py-1 rounded-full w-fit mb-3 shadow-lg">
                    {slide.badge}
                  </span>
                  <h2 className="text-4xl font-black text-white drop-shadow-lg">{slide.title}</h2>
                  <p className="text-base text-white/90 mt-1 font-medium">{slide.subtitle}</p>
                  <Link href={`/categorie/${slide.id}`} className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-bold px-6 py-2.5 rounded-full mt-4 w-fit shadow-lg hover:bg-gray-100 transition">
                    Acheter maintenant <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          {/* CARTE DROITE - INFOS PAYS */}
          <div className="w-80 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Livraison vers</p>
                  <p className="text-base font-bold text-gray-800">{paysActuel.nom} {paysActuel.drapeau}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Livraison express</p>
                    <p className="text-xs text-gray-400">7 à 50 jours selon mode</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Paiement sécurisé</p>
                    <p className="text-xs text-gray-400">Mobile Money, Carte</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Suivi en temps réel</p>
                    <p className="text-xs text-gray-400">De l'usine à votre porte</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition shadow-md">
              Commander maintenant
            </button>
          </div>
        </div>

        {/* Catégories rapides */}
        <div className="flex justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
          {[
            { name: "Mode", icon: <TrendingUp className="w-4 h-4" />, color: "text-pink-500" },
            { name: "Électronique", icon: <Zap className="w-4 h-4" />, color: "text-blue-500" },
            { name: "Maison", icon: <Star className="w-4 h-4" />, color: "text-emerald-500" },
            { name: "Beauté", icon: <Star className="w-4 h-4" />, color: "text-purple-500" },
            { name: "Sport", icon: <TrendingUp className="w-4 h-4" />, color: "text-orange-500" },
          ].map((cat) => (
            <button key={cat.name} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition">
              {cat.icon} {cat.name}
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