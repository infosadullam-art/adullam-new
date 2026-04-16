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

  // ========== VERSION MOBILE ==========
  const MobileHero = () => (
    <div className="lg:hidden bg-white font-poppins">
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
                index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  // ========== VERSION DESKTOP - FOND BLEU DÉGRADÉ ANIMÉ ==========
  const DesktopHero = () => (
    <div className="hidden lg:block relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden font-poppins animate-gradient">
      <style jsx>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
      
      <div className="relative max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl font-bold tracking-tight text-white">
              Achetez direct
              <br />
              <span className="text-amber-400">des usines du monde entier</span>
            </h1>

            <p className="text-lg text-white/90 max-w-lg">
              Adulam connecte les acheteurs africains aux meilleurs fournisseurs de Chine, 
              Dubaï, Turquie, USA et Europe.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="text-sm text-white/70">Fournisseurs :</span>
              <span className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">🇨🇳 Chine</span>
              <span className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">🇦🇪 Dubaï</span>
              <span className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">🇹🇷 Turquie</span>
              <span className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">🇺🇸 USA</span>
              <span className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">🇪🇺 Europe</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20">
              <Image
                src="/hero-image.jpg"
                alt="Adulam"
                width={600}
                height={256}
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute bottom-4 right-4 bg-amber-500 rounded-lg px-4 py-2">
                <p className="text-white font-bold text-lg">-30%</p>
                <p className="text-white/80 text-[10px]">Première commande</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-12 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-white">Livraison porte-à-porte</p>
              <p className="text-sm text-white/60">50j • 15j • 7j</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-white">Paiement sécurisé</p>
              <p className="text-sm text-white/60">Mobile Money, Carte</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-white">Suivi en temps réel</p>
              <p className="text-sm text-white/60">De l'usine à votre porte</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <span className="text-amber-400 font-bold text-lg">-50%</span>
            </div>
            <div>
              <p className="font-medium text-white">Jusqu'à -50%</p>
              <p className="text-sm text-white/60">Offres flash</p>
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