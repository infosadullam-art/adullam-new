"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLocale } from "@/context/LocaleProvider"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { ChevronRight, TrendingUp, MapPin } from "lucide-react"

interface TrendingProduct {
  id: string
  name: string
  priceUSD: number
  image: string
  views: number
  orders: number
  trend: number
  badge?: string
  flag?: string
}

interface CountryTrend {
  code: string
  name: string
  flag: string
  products: TrendingProduct[]
  topCategory?: string
  trendScore: number
}

const pays = {
  CI: { nom: "Côte d'Ivoire", drapeau: "🇨🇮", code: "CI" },
  SN: { nom: "Sénégal",       drapeau: "🇸🇳", code: "SN" },
  CM: { nom: "Cameroun",      drapeau: "🇨🇲", code: "CM" },
  MA: { nom: "Maroc",         drapeau: "🇲🇦", code: "MA" },
  TN: { nom: "Tunisie",       drapeau: "🇹🇳", code: "TN" },
  DZ: { nom: "Algérie",       drapeau: "🇩🇿", code: "DZ" },
  BF: { nom: "Burkina Faso",  drapeau: "🇧🇫", code: "BF" },
  ML: { nom: "Mali",          drapeau: "🇲🇱", code: "ML" },
  NE: { nom: "Niger",         drapeau: "🇳🇪", code: "NE" },
  TG: { nom: "Togo",          drapeau: "🇹🇬", code: "TG" },
  BJ: { nom: "Bénin",         drapeau: "🇧🇯", code: "BJ" },
  CG: { nom: "Congo",         drapeau: "🇨🇬", code: "CG" },
  GA: { nom: "Gabon",         drapeau: "🇬🇦", code: "GA" },
}

const fallbackTrends: Record<string, CountryTrend> = {
  CI: { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", trendScore: 94, topCategory: "Électronique",
    products: [
      { id: "1", name: "Écouteurs sans fil",  priceUSD: 9.63,  image: "/wireless-earbuds-black.jpg",  views: 1234, orders: 89, trend: 34, flag: "🇨🇳" },
      { id: "2", name: "Montre connectée",    priceUSD: 24.52, image: "/black-smartwatch.jpg",         views: 987,  orders: 67, trend: 28, flag: "🇨🇳" },
      { id: "3", name: "Robe africaine",      priceUSD: 22.87, image: "/colorful-african-dress.png",   views: 876,  orders: 54, trend: 45, flag: "🇨🇮" },
      { id: "4", name: "Mixeur cuisine",      priceUSD: 15.51, image: "/kitchen-blender.png",          views: 654,  orders: 43, trend: 22, flag: "🇨🇳" },
      { id: "5", name: "Sandales cuir",       priceUSD: 8.16,  image: "/leather-sandals-brown.jpg",    views: 543,  orders: 38, trend: 18, flag: "🇨🇮" },
      { id: "6", name: "Parfum de luxe",      priceUSD: 32.64, image: "/essential-oils-perfume.jpg",   views: 432,  orders: 29, trend: 52, flag: "🇫🇷" },
    ]
  },
  SN: { code: "SN", name: "Sénégal", flag: "🇸🇳", trendScore: 87, topCategory: "Mode",
    products: [
      { id: "1", name: "Boubou sénégalais", priceUSD: 40.80, image: "/senegalese-boubou.jpg",       views: 1567, orders: 112, trend: 67, flag: "🇸🇳" },
      { id: "2", name: "Montre connectée",  priceUSD: 24.52, image: "/black-smartwatch.jpg",         views: 876,  orders: 54,  trend: 23, flag: "🇨🇳" },
      { id: "3", name: "Écouteurs sans fil",priceUSD: 9.63,  image: "/wireless-earbuds-black.jpg",  views: 765,  orders: 48,  trend: 31, flag: "🇨🇳" },
      { id: "4", name: "Cosmétiques bio",   priceUSD: 12.25, image: "/camel-milk-skincare.jpg",      views: 654,  orders: 41,  trend: 44, flag: "🇲🇦" },
    ]
  },
  CM: { code: "CM", name: "Cameroun", flag: "🇨🇲", trendScore: 82, topCategory: "Maison",
    products: [
      { id: "1", name: "Ustensiles cuisine", priceUSD: 6.53,  image: "/kitchen-utensils.jpg",        views: 987, orders: 76, trend: 41, flag: "🇨🇳" },
      { id: "2", name: "Ventilateur",        priceUSD: 32.64, image: "/fan.jpg",                     views: 876, orders: 65, trend: 38, flag: "🇨🇳" },
      { id: "3", name: "Écouteurs sans fil", priceUSD: 9.63,  image: "/wireless-earbuds-black.jpg",  views: 765, orders: 54, trend: 27, flag: "🇨🇳" },
    ]
  },
}

export function TendanceParPays() {
  const { country } = useLocale()
  const { formatPrice } = useCurrencyFormatter()
  const [trends, setTrends] = useState<CountryTrend | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState(country)
  const [showCountrySelector, setShowCountrySelector] = useState(false)

  const paysActuel = pays[selectedCountry as keyof typeof pays] || pays.CI

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/graph/trending?country=${selectedCountry}&limit=6`)
        const data = await res.json()
        if (data.success) setTrends(data.trend)
        else setTrends(fallbackTrends[selectedCountry as keyof typeof fallbackTrends] || fallbackTrends.CI)
      } catch {
        setTrends(fallbackTrends[selectedCountry as keyof typeof fallbackTrends] || fallbackTrends.CI)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrends()
  }, [selectedCountry])

  // ── Sélecteur pays ─────────────────────────────────────────
  const CountrySelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowCountrySelector(!showCountrySelector)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
        style={{ background: "#F4F4F4", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
      >
        <span>{paysActuel.drapeau}</span>
        <span>{paysActuel.nom}</span>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: "#AAAAAA", transform: showCountrySelector ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {showCountrySelector && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowCountrySelector(false)} />
          <div className="absolute right-0 mt-2 z-50 overflow-y-auto" style={{ width: "220px", maxHeight: "320px", background: "#fff", borderRadius: "14px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", padding: "6px" }}>
            {Object.values(pays).map((p) => (
              <button
                key={p.code}
                onClick={() => { setSelectedCountry(p.code); setShowCountrySelector(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
                style={{
                  background: selectedCountry === p.code ? "#FFF0F0" : "transparent",
                  color: selectedCountry === p.code ? "#D4372B" : "#0A0A0A",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <span style={{ fontSize: "16px" }}>{p.drapeau}</span>
                <span className="flex-1">{p.nom}</span>
                {selectedCountry === p.code && <span style={{ color: "#D4372B", fontSize: "12px" }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="w-full" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-5 w-48 rounded mb-6" style={{ background: "#F4F4F4" }} />
            <div className="flex gap-3 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[130px]" style={{ border: "0.5px solid #ECECEC", borderRadius: "12px", overflow: "hidden" }}>
                  <div className="aspect-square" style={{ background: "#F4F4F4" }} />
                  <div className="p-2">
                    <div className="h-2.5 w-full rounded mb-1.5" style={{ background: "#F4F4F4" }} />
                    <div className="h-3 w-16 rounded" style={{ background: "#F4F4F4" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!trends) return null

  // ── MOBILE ─────────────────────────────────────────────────
  const MobileTrend = () => (
    <div className="lg:hidden px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "#FFF0F0" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#D4372B" }} />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
              Tendances {paysActuel.drapeau}
            </p>
            <p style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
              {trends.topCategory} · +{trends.trendScore}% cette semaine
            </p>
          </div>
        </div>
        <CountrySelector />
      </div>

      {/* Scroll */}
      <div className="overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-3 min-w-max pb-2">
          {trends.products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block" style={{ width: "130px" }}>
              <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #ECECEC", overflow: "hidden" }}>
                <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                  {product.trend > 30 && (
                    <span className="absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 text-white rounded-md" style={{ background: "#D4372B" }}>
                      +{product.trend}%
                    </span>
                  )}
                  {product.flag && (
                    <span className="absolute top-2 right-2 text-sm z-10">{product.flag}</span>
                  )}
                  <Image src={product.image} alt={product.name} width={120} height={120} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="px-2 py-2">
                  <p className="truncate mb-0.5" style={{ fontSize: "11px", fontWeight: 500, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>{formatPrice(product.priceUSD)}</p>
                    <span style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>{product.views} vues</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4372B" }} />
          <span style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>Mise à jour en temps réel</span>
        </div>
        <Link href={`/trending/${selectedCountry}`} className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
          Voir tout <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )

  // ── DESKTOP ─────────────────────────────────────────────────
  const DesktopTrend = () => (
    <div className="hidden lg:block rounded-2xl p-6" style={{ border: "0.5px solid #ECECEC", background: "#fff" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "#FFF0F0" }}>
            <TrendingUp className="w-5 h-5" style={{ color: "#D4372B" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}>
              Tendances · {paysActuel.nom} {paysActuel.drapeau}
            </h2>
            <p style={{ fontSize: "13px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
              Les produits les plus populaires cette semaine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#FAFAFA", border: "0.5px solid #ECECEC" }}>
            <MapPin className="w-4 h-4" style={{ color: "#AAAAAA" }} />
            <span style={{ fontSize: "13px", color: "#555", fontFamily: "'Poppins', sans-serif" }}>{trends.topCategory} en tête</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>+{trends.trendScore}%</span>
          </div>
          <CountrySelector />
        </div>
      </div>

      {/* Grille 6 colonnes */}
      <div className="grid grid-cols-6 gap-3">
        {trends.products.slice(0, 6).map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="group block">
            <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #ECECEC", padding: "10px" }} className="transition-all hover:shadow-md">
              <div className="relative aspect-square mb-3" style={{ background: "#FAFAFA", borderRadius: "8px" }}>
                <span className="absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 text-white rounded-md" style={{ background: "#D4372B" }}>
                  +{product.trend}%
                </span>
                {product.flag && (
                  <span className="absolute top-2 right-2 text-sm z-10 px-1 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}>
                    {product.flag}
                  </span>
                )}
                <Image src={product.image} alt={product.name} width={120} height={120} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="truncate mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>{product.name}</p>
              <div className="flex items-center justify-between">
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>{formatPrice(product.priceUSD)}</p>
                <span style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>{product.orders} cmd</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "0.5px solid #F0F0F0" }}>
        <div className="flex items-center gap-4" style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
          <span>📊 Basé sur les 7 derniers jours</span>
          <span>•</span>
          <span>👥 {trends.products.reduce((a, p) => a + p.views, 0).toLocaleString()} vues</span>
        </div>
        <Link href={`/trending/${selectedCountry}`} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
          Voir toutes les tendances <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )

  return (
    <section className="w-full" style={{ background: "#fff" }}>
      <div className="max-w-7xl mx-auto">
        <MobileTrend />
        <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-8">
          <DesktopTrend />
        </div>
      </div>
      <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}