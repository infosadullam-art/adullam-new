"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, ChevronRight, Truck, Shield, Clock, TrendingUp, Star } from "lucide-react"
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
  { id: 1, image: "/hero-fashion.jpg", title: "Mode", subtitle: "Collections tendances", badge: "-30%", bg: "from-pink-600/50" },
  { id: 2, image: "/hero-electronics.jpg", title: "Électronique", subtitle: "Smartphones & accessoires", badge: "-25%", bg: "from-blue-600/50" },
  { id: 3, image: "/hero-home.jpg", title: "Maison", subtitle: "Équipez votre intérieur", badge: "-40%", bg: "from-emerald-600/50" },
]

export function HeroSection() {
  const { country } = useLocale()
  const paysActuel = pays[country as keyof typeof pays] || pays.CI
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  // ========== MOBILE - STYLE ALIBABA ==========
  const MobileHero = () => (
    <div className="lg:hidden bg-white">
      {/* BANDEAU ALIBABA */}
      <div className="bg-[#ff6a00] text-white text-center py-1 text-[10px] font-medium">
        🔥 Livraison internationale • Paiement sécurisé
      </div>

      <div className="relative h-[140px] overflow-hidden">
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
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1">
                  {slide.badge}
                </span>
                <h2 className="text-lg font-bold text-white">{slide.title}</h2>
                <p className="text-[10px] text-white/70">{slide.subtitle}</p>
                <Link href={`/categorie/${slide.id}`} className="inline-flex items-center gap-0.5 bg-white text-gray-800 text-[10px] font-medium px-2.5 py-1 rounded-full mt-1.5 shadow-sm">
                  Shop <ChevronRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-0.5 rounded-full transition-all ${
                index === currentSlide ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ICÔNES RAPIDES */}
      <div className="grid grid-cols-4 gap-1 px-2 py-2 border-b border-gray-100">
        {[
          { icon: TrendingUp, label: "Tendances", color: "text-orange-500" },
          { icon: Star, label: "Best-sellers", color: "text-amber-500" },
          { icon: Truck, label: "Livraison", color: "text-blue-500" },
          { icon: Shield, label: "Sécurisé", color: "text-green-500" },
        ].map((item, i) => (
          <button key={i} className="flex flex-col items-center gap-0.5 py-1">
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-[9px] text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // ========== DESKTOP - STYLE ALIBABA (2/3 HAUTEUR) ==========
  const DesktopHero = () => (
    <div className="hidden lg:block bg-white">
      {/* BANDEAU ALIBABA */}
      <div className="bg-[#ff6a00] text-white text-center py-1.5 text-xs font-medium">
        🔥 LIVRAISON MONDIALE • PAIEMENT SÉCURISÉ • SATISFAIT OU REMBOURSÉ
      </div>

      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="grid grid-cols-4 gap-4">
          {/* SLIDER - 3/4 */}
          <div className="col-span-3 relative h-[240px] rounded-lg overflow-hidden shadow-md">
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
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full w-fit mb-1">
                    {slide.badge}
                  </span>
                  <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
                  <p className="text-sm text-white/80 mt-0.5">{slide.subtitle}</p>
                  <Link href={`/categorie/${slide.id}`} className="inline-flex items-center gap-1 bg-white text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full mt-2 w-fit shadow-md hover:bg-gray-50 transition">
                    Acheter maintenant <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
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

          {/* CARTE LATÉRALE - 1/4 */}
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#ff6a00]" />
                <span className="text-sm font-semibold">{paysActuel.nom} {paysActuel.drapeau}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Truck className="w-3.5 h-3.5 text-[#ff6a00]" />
                  <span>Livraison 7-50 jours</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Shield className="w-3.5 h-3.5 text-[#ff6a00]" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-[#ff6a00]" />
                  <span>Suivi en temps réel</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-3 bg-[#ff6a00] text-white text-xs font-semibold py-1.5 rounded hover:bg-[#e55a00] transition">
              Voir les offres
            </button>
          </div>
        </div>

        {/* CATÉGORIES RAPIDES */}
        <div className="flex gap-6 mt-4 pt-3 border-t border-gray-100">
          {["Mode", "Électronique", "Maison", "Beauté", "Sport", "Jouets"].map((cat) => (
            <button key={cat} className="text-sm text-gray-600 hover:text-[#ff6a00] transition">
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