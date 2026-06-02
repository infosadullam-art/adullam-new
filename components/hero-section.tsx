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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [paysActuel, setPaysActuel] = useState(() => {
    if (typeof window === 'undefined') return pays.CI
    return pays[country as keyof typeof pays] || pays.CI
  })
  const [isVisible, setIsVisible] = useState(false)
  const [animatedText, setAnimatedText] = useState("")
  const [textIndex, setTextIndex] = useState(0)

  const fullText = "Achetez direct des usines du monde"

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setPaysActuel(pays[country as keyof typeof pays] || pays.CI)
  }, [country])

  // Animation d'apparition de la section
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Animation du texte lettre par lettre (desktop seulement)
  useEffect(() => {
    if (textIndex < fullText.length) {
      const timer = setTimeout(() => {
        setAnimatedText(prev => prev + fullText[textIndex])
        setTextIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [textIndex])

  const MobileHero = () => (
    <div 
      className="lg:hidden relative overflow-hidden"
      style={{ 
        height: "220px",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
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
              className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full mb-3 animate-fade-in"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "0.5px solid rgba(255,255,255,0.3)" }}
            >
              <MapPin className="w-3 h-3 text-white" />
              <span style={{ fontSize: "10px", fontWeight: 500, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
                {paysActuel.nom} {paysActuel.drapeau}
              </span>
            </div>

            <span
              className="w-fit px-2 py-0.5 rounded-md mb-1.5 text-white animate-slide-up"
              style={{ background: "#D4372B", fontSize: "10px", fontWeight: 700, fontFamily: "'Poppins', sans-serif", animationDelay: "0.1s" }}
            >
              {slide.badge}
            </span>

            <h1 
              className="animate-slide-up"
              style={{ 
                fontSize: "22px", 
                fontWeight: 900, 
                color: "#fff", 
                lineHeight: 1.1, 
                letterSpacing: "-0.03em", 
                fontFamily: "'Poppins', sans-serif", 
                marginBottom: "4px",
                animationDelay: "0.2s",
              }}
            >
              {slide.title}
            </h1>
            
            <p 
              className="animate-slide-up"
              style={{ 
                fontSize: "12px", 
                color: "rgba(255,255,255,0.7)", 
                fontFamily: "'Poppins', sans-serif", 
                marginBottom: "14px",
                animationDelay: "0.3s",
              }}
            >
              {slide.subtitle}
            </p>

            <Link
              href={slide.href}
              className="flex items-center gap-1.5 w-fit animate-slide-up group"
              style={{
                background: "#fff",
                color: "#0A0A0A",
                borderRadius: "8px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                animationDelay: "0.4s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              Découvrir {slide.offre}
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
        className="absolute top-4 right-4 z-30 flex flex-col items-center justify-center animate-pulse-subtle"
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

  const DesktopHero = () => (
    <div 
      className="hidden lg:block"
      style={{ 
        background: "#0A0A0A",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-14 items-center">

          {/* Gauche — Texte */}
          <div>
            <div 
              className="flex items-center gap-2 flex-wrap mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <span style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>Direct depuis :</span>
              {suppliers.map((s, idx) => (
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
                    transition: "all 0.2s ease",
                    animationDelay: `${0.1 + idx * 0.05}s`,
                  }}
                  className="animate-fade-in hover:bg-white/15 hover:scale-105"
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
              className="animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {animatedText}
              <span className="animate-blink" style={{ color: "#D4372B", display: "inline-block" }}>|</span>
              <br />
              <span style={{ color: "#D4372B" }}>des usines du monde</span>
            </h1>

            <p 
              className="animate-slide-up"
              style={{ 
                fontSize: "16px", 
                color: "#AAAAAA", 
                lineHeight: 1.6, 
                fontFamily: "'Poppins', sans-serif", 
                maxWidth: "420px", 
                marginBottom: "32px",
                animationDelay: "0.3s",
              }}
            >
              Adullam connecte les acheteurs africains aux meilleurs fournisseurs de Chine, Dubaï, Turquie, USA et Europe.
            </p>

            <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Link
                href="/for-you"
                className="group"
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
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)"
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(212,55,43,0.3)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                Explorer la boutique
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/boutique-noel"
                className="group"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D4372B"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
                  e.currentTarget.style.transform = "translateY(0)"
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
                  borderRadius: "16px", 
                  overflow: "hidden",
                  transform: index === currentSlide ? 'scale(1)' : 'scale(0.95)',
                }}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />

                <div className="absolute top-4 left-4 z-10">
                  <Link
                    href={slide.href}
                    className="flex items-center gap-1.5 w-fit group"
                    style={{
                      background: "#fff",
                      color: "#0A0A0A",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      fontFamily: "'Poppins', sans-serif",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Découvrir {slide.offre}
                    <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div>
                    <p className="text-[11px] text-white/60 font-poppins">{slide.badge}</p>
                    <p className="text-[18px] font-extrabold text-white font-poppins tracking-tight">{slide.title}</p>
                  </div>
                  <div
                    className="flex flex-col items-center"
                    style={{
                      background: "#D4372B",
                      borderRadius: "10px",
                      padding: "8px 14px",
                    }}
                  >
                    <span className="text-[20px] font-black text-white leading-none font-poppins">{slide.offre}</span>
                    <span className="text-[9px] text-white/70 font-poppins">aujourd'hui</span>
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
                    height: "3px",
                    width: i === currentSlide ? "24px" : "8px",
                    borderRadius: "2px",
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
          className="grid grid-cols-3 gap-0 mt-8 animate-fade-in"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "20px", animationDelay: "0.5s" }}
        >
          {trustItems.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 group"
              style={{ 
                borderRight: i < 2 ? "0.5px solid rgba(255,255,255,0.08)" : "none", 
                paddingRight: i < 2 ? "32px" : "0", 
                paddingLeft: i > 0 ? "32px" : "0",
                transition: "all 0.2s ease",
              }}
            >
              <div 
                className="rounded-lg p-2 transition-all duration-300 group-hover:scale-110"
                style={{ background: "rgba(212,55,43,0.15)" }}
              >
                <Icon className="w-5 h-5 transition-colors duration-300 group-hover:text-[#D4372B]" style={{ color: "#D4372B" }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white font-poppins transition-all duration-200 group-hover:translate-x-0.5">{label}</p>
                <p className="text-[12px] text-[#AAAAAA] font-poppins">{sub}</p>
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

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulseSubtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-subtle {
          animation: pulseSubtle 2s ease-in-out infinite;
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </>
  )
}