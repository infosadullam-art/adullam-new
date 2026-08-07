"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLocale } from "@/context/LocaleProvider"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { ChevronRight, TrendingUp, MapPin } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const REFRESH_INTERVAL = 10 * 60 * 60 * 1000

const isDev = process.env.NODE_ENV !== "production"
function devLog(...args: any[]) {
  if (isDev) console.log(...args)
}

const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

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
        devLog(`📦 [TRENDS] Fetch - ${new Date().toLocaleTimeString()}`)
        
        const timestamp = Date.now()
        const res = await fetch(`${API_BASE}/api/graph/trending?country=${selectedCountry}&limit=20&_t=${timestamp}`)
        const data = await res.json()
        
        if (data.success) {
          const shuffled = [...data.trend.products].sort(() => Math.random() - 0.5)
          const trendCopy = { ...data.trend, products: shuffled }
          setTrends(trendCopy)
          devLog(`📦 [TRENDS] ${data.trend.products.length} produits récupérés, mélangés`)
        } else {
          const fallback = fallbackTrends[selectedCountry as keyof typeof fallbackTrends] || fallbackTrends.CI
          const shuffled = [...fallback.products].sort(() => Math.random() - 0.5)
          setTrends({ ...fallback, products: shuffled })
        }
      } catch {
        const fallback = fallbackTrends[selectedCountry as keyof typeof fallbackTrends] || fallbackTrends.CI
        const shuffled = [...fallback.products].sort(() => Math.random() - 0.5)
        setTrends({ ...fallback, products: shuffled })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrends()

    const interval = setInterval(() => {
      devLog(`🔄 [TRENDS] Nouveaux produits - ${new Date().toLocaleTimeString()}`)
      fetchTrends()
    }, REFRESH_INTERVAL)

    return () => {
      devLog(`🧹 [TRENDS] Nettoyage`)
      clearInterval(interval)
    }
  }, [selectedCountry])

  const CountrySelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowCountrySelector(!showCountrySelector)}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105"
        style={{ background: "#F4F4F4", color: "#0A0A0A", fontFamily: amazonFont, borderRadius: "20px" }}
      >
        <span>{paysActuel.drapeau}</span>
        <span>{paysActuel.nom}</span>
        <ChevronRight className="w-3 h-3" style={{ color: "#AAAAAA", transform: showCountrySelector ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {showCountrySelector && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowCountrySelector(false)} />
          <div className="absolute right-0 mt-2 z-50 overflow-y-auto" style={{ width: "200px", maxHeight: "280px", background: "#fff", borderRadius: "8px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", padding: "4px" }}>
            {Object.values(pays).map((p) => (
              <button
                key={p.code}
                onClick={() => { setSelectedCountry(p.code); setShowCountrySelector(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-all duration-200 hover:bg-[#FFF0F0]"
                style={{
                  background: selectedCountry === p.code ? "#FFF0F0" : "transparent",
                  color: selectedCountry === p.code ? "#D4372B" : "#0A0A0A",
                  fontFamily: amazonFont,
                  borderRadius: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>{p.drapeau}</span>
                <span className="flex-1">{p.nom}</span>
                {selectedCountry === p.code && <span style={{ color: "#D4372B", fontSize: "10px" }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <section className="w-full py-3" style={{ background: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: "#D4372B" }} />
          </div>
        </div>
      </section>
    )
  }

  if (!trends) return null

  return (
    <section className="w-full py-3" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7" style={{ background: "#FFF0F0", borderRadius: "4px" }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#D4372B" }} />
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: amazonFont }}>
                Tendances · {paysActuel.drapeau}
              </p>
              <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>
                {trends.topCategory} · +{trends.trendScore}%
              </p>
            </div>
          </div>
          <Link
            href="/meilleures-ventes"
            className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1"
            style={{ color: "#D4372B", fontFamily: amazonFont }}
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {trends.products.slice(0, 6).map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block transition-all duration-200 hover:-translate-y-0.5">
              <div className="rounded-md p-2 transition-all duration-300 hover:shadow-sm" style={{ background: "#fff", border: "0.5px solid #ECECEC" }}>
                <div className="relative aspect-square mb-1.5 rounded overflow-hidden" style={{ background: "#FAFAFA" }}>
                  {product.trend > 30 && (
                    <span className="absolute top-1 left-1 z-10 text-[8px] font-bold px-1 py-0.5 text-white" style={{ background: "#D4372B", borderRadius: "3px" }}>
                      +{product.trend}%
                    </span>
                  )}
                  {product.flag && (
                    <span className="absolute top-1 right-1 text-xs z-10">{product.flag}</span>
                  )}
                  <Image src={product.image} alt={product.name} width={100} height={100} className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105" />
                </div>
                <h4 className="truncate text-[10px] font-medium min-h-[20px]" style={{ color: "#0A0A0A", fontFamily: amazonFont }}>
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs font-bold" style={{ color: "#D4372B", fontFamily: amazonFont }}>
                    {formatPrice(product.priceUSD)}
                  </p>
                  <span className="text-[8px]" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>{product.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "0.5px solid #F0F0F0" }}>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full" style={{ background: "#D4372B" }} />
            <span style={{ fontSize: "8px", color: "#AAAAAA", fontFamily: amazonFont }}>Mise à jour en temps réel</span>
          </div>
          <CountrySelector />
        </div>
      </div>
    </section>
  )
}