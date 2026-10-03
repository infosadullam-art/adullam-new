"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLocale } from "@/context/LocaleProvider"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { ChevronRight, TrendingUp, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import { getCountryName } from "@/lib/country-config"
import { withLocale } from "@/lib/locale-client"

// ════════════════════════════════════════════════════════════
// API - Changement de produits toutes les 10h
// ════════════════════════════════════════════════════════════

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const REFRESH_INTERVAL = 10 * 60 * 60 * 1000 // 10 heures

// 🔧 Logger conditionnel : actif seulement en dev, silencieux en production
const isDev = process.env.NODE_ENV !== "production"
function devLog(...args: any[]) {
  if (isDev) console.log(...args)
}

// ════════════════════════════════════════════════════════════

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

// Pays proposés dans le sélecteur de tendances (ceux pour lesquels le backend a des données).
const TREND_COUNTRIES = ["CI", "SN", "CM", "MA", "TN", "DZ", "BF", "ML", "NE", "TG", "BJ", "CG", "GA"]

// Drapeau dérivé du code pays (indicateurs régionaux Unicode) : aucune table à maintenir.
function flagOf(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

// Textes : clés de traduction (messages "trends.fallback.*"), résolues dans getFallback().
const fallbackTrends: Record<string, CountryTrend> = {
  CI: { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", trendScore: 94, topCategory: "electronics",
    products: [
      { id: "1", name: "earbuds",  priceUSD: 9.63,  image: "/wireless-earbuds-black.jpg",  views: 1234, orders: 89, trend: 34, flag: "🇨🇳" },
      { id: "2", name: "smartwatch",    priceUSD: 24.52, image: "/black-smartwatch.jpg",         views: 987,  orders: 67, trend: 28, flag: "🇨🇳" },
      { id: "3", name: "africanDress",      priceUSD: 22.87, image: "/colorful-african-dress.png",   views: 876,  orders: 54, trend: 45, flag: "🇨🇮" },
      { id: "4", name: "blender",      priceUSD: 15.51, image: "/kitchen-blender.png",          views: 654,  orders: 43, trend: 22, flag: "🇨🇳" },
      { id: "5", name: "leatherSandals",       priceUSD: 8.16,  image: "/leather-sandals-brown.jpg",    views: 543,  orders: 38, trend: 18, flag: "🇨🇮" },
      { id: "6", name: "luxuryPerfume",      priceUSD: 32.64, image: "/essential-oils-perfume.jpg",   views: 432,  orders: 29, trend: 52, flag: "🇫🇷" },
    ]
  },
  SN: { code: "SN", name: "Sénégal", flag: "🇸🇳", trendScore: 87, topCategory: "fashion",
    products: [
      { id: "1", name: "boubou", priceUSD: 40.80, image: "/senegalese-boubou.jpg",       views: 1567, orders: 112, trend: 67, flag: "🇸🇳" },
      { id: "2", name: "smartwatch",  priceUSD: 24.52, image: "/black-smartwatch.jpg",         views: 876,  orders: 54,  trend: 23, flag: "🇨🇳" },
      { id: "3", name: "earbuds",priceUSD: 9.63,  image: "/wireless-earbuds-black.jpg",  views: 765,  orders: 48,  trend: 31, flag: "🇨🇳" },
      { id: "4", name: "organicCosmetics",   priceUSD: 12.25, image: "/camel-milk-skincare.jpg",      views: 654,  orders: 41,  trend: 44, flag: "🇲🇦" },
    ]
  },
  CM: { code: "CM", name: "Cameroun", flag: "🇨🇲", trendScore: 82, topCategory: "home",
    products: [
      { id: "1", name: "kitchenUtensils", priceUSD: 6.53,  image: "/kitchen-utensils.jpg",        views: 987, orders: 76, trend: 41, flag: "🇨🇳" },
      { id: "2", name: "fan",        priceUSD: 32.64, image: "/fan.jpg",                     views: 876, orders: 65, trend: 38, flag: "🇨🇳" },
      { id: "3", name: "earbuds", priceUSD: 9.63,  image: "/wireless-earbuds-black.jpg",  views: 765, orders: 54, trend: 27, flag: "🇨🇳" },
    ]
  },
}

export function TendanceParPays() {
  const { country, language, locale } = useLocale()
  const t = useTranslations("trends")
  const { formatPrice } = useCurrencyFormatter()
  const [trends, setTrends] = useState<CountryTrend | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState(country)
  const [showCountrySelector, setShowCountrySelector] = useState(false)

  const countryOption = (code: string) => ({
    code,
    nom: getCountryName(code, language),
    drapeau: flagOf(code),
  })
  const paysActuel = countryOption(selectedCountry)
  const trendCountries = TREND_COUNTRIES.map(countryOption)

  // Données de secours (API indisponible) traduites dans la langue du visiteur.
  const getFallback = (code: string): CountryTrend => {
    const base = fallbackTrends[code as keyof typeof fallbackTrends] || fallbackTrends.CI
    return {
      ...base,
      topCategory: base.topCategory ? t(`fallback.categories.${base.topCategory}`) : undefined,
      products: base.products.map((p) => ({ ...p, name: t(`fallback.products.${p.name}`) })),
    }
  }

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true)
        devLog(`📦 [TRENDS] Fetch - ${new Date().toLocaleTimeString()}`)
        
        const timestamp = Date.now()
        const res = await fetch(withLocale(`${API_BASE}/api/graph/trending?country=${selectedCountry}&limit=20&_t=${timestamp}`))
        const data = await res.json()
        
        if (data.success) {
          const shuffled = [...data.trend.products].sort(() => Math.random() - 0.5)
          const trendCopy = { ...data.trend, products: shuffled }
          setTrends(trendCopy)
          devLog(`📦 [TRENDS] ${data.trend.products.length} produits récupérés, mélangés`)
        } else {
          const fallback = getFallback(selectedCountry)
          const shuffled = [...fallback.products].sort(() => Math.random() - 0.5)
          setTrends({ ...fallback, products: shuffled })
        }
      } catch {
        const fallback = getFallback(selectedCountry)
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
          <div className="absolute end-0 mt-2 z-50 overflow-y-auto" style={{ width: "200px", maxHeight: "280px", background: "#fff", borderRadius: "8px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", padding: "4px" }}>
            {trendCountries.map((p) => (
              <button
                key={p.code}
                onClick={() => { setSelectedCountry(p.code); setShowCountrySelector(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-start transition-all duration-200 hover:bg-[#FFF0F0]"
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
      <section className="w-full" style={{ background: "#fff" }}>
        <div className="px-4 py-3">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded" style={{ background: "#F4F4F4", borderRadius: "4px" }} />
                <div>
                  <div className="h-3 w-28 rounded mb-1" style={{ background: "#F4F4F4" }} />
                  <div className="h-2 w-20 rounded" style={{ background: "#F4F4F4" }} />
                </div>
              </div>
              <div className="h-6 w-20 rounded" style={{ background: "#F4F4F4", borderRadius: "20px" }} />
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[110px]" style={{ border: "0.5px solid #ECECEC", borderRadius: "6px", overflow: "hidden" }}>
                  <div className="aspect-square" style={{ background: "#F4F4F4" }} />
                  <div className="p-1.5">
                    <div className="h-2 w-full rounded mb-1" style={{ background: "#F4F4F4" }} />
                    <div className="h-2.5 w-12 rounded" style={{ background: "#F4F4F4" }} />
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

  const MobileTrend = () => (
    <div className="lg:hidden px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7" style={{ background: "#FFF0F0", borderRadius: "4px" }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#D4372B" }} />
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: amazonFont }}>
              {t("title")} {paysActuel.drapeau}
            </p>
            <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>
              {trends.topCategory} · <bdi dir="ltr">+{trends.trendScore}%</bdi>
            </p>
          </div>
        </div>
        <CountrySelector />
      </div>

      <div className="overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2 min-w-max">
          {trends.products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block transition-all duration-200 hover:-translate-y-0.5" style={{ width: "110px" }}>
              <div style={{ background: "#fff", borderRadius: "6px", border: "0.5px solid #ECECEC", overflow: "hidden" }}>
                <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                  {product.trend > 30 && (
                    <span className="absolute top-1 start-1 z-10 text-[8px] font-bold px-1 py-0.5 text-white" style={{ background: "#D4372B", borderRadius: "3px" }}>
                      <bdi dir="ltr">+{product.trend}%</bdi>
                    </span>
                  )}
                  {product.flag && (
                    <span className="absolute top-1 end-1 text-xs z-10">{product.flag}</span>
                  )}
                  <Image src={product.image} alt={product.name} width={110} height={110} className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="px-1.5 py-1.5">
                  <p className="truncate mb-0.5" style={{ fontSize: "9px", fontWeight: 500, color: "#0A0A0A", fontFamily: amazonFont }}>{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#D4372B", fontFamily: amazonFont }}>{formatPrice(product.priceUSD)}</p>
                    <span style={{ fontSize: "8px", color: "#AAAAAA", fontFamily: amazonFont }}>{product.views}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full" style={{ background: "#D4372B" }} />
          <span style={{ fontSize: "8px", color: "#AAAAAA", fontFamily: amazonFont }}>{t("liveUpdate")}</span>
        </div>
        <Link href="/meilleures-ventes" className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1" style={{ color: "#D4372B", fontFamily: amazonFont }}>
          {t("seeAll")} <ChevronRight className="w-2.5 h-2.5 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  )

  const DesktopTrend = () => (
    <div className="hidden lg:block rounded-xl p-5" style={{ border: "0.5px solid #ECECEC", background: "#fff" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9" style={{ background: "#FFF0F0", borderRadius: "6px" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#D4372B" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0A0A0A", fontFamily: amazonFont, letterSpacing: "-0.02em" }}>
              {t("titleCountry", { country: paysActuel.nom })} {paysActuel.drapeau}
            </h2>
            <p style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: amazonFont }}>
              {t("popularThisWeek")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1" style={{ background: "#FAFAFA", border: "0.5px solid #ECECEC", borderRadius: "6px" }}>
            <MapPin className="w-3 h-3" style={{ color: "#AAAAAA" }} />
            <span style={{ fontSize: "12px", color: "#555", fontFamily: amazonFont }}>{t("topCategoryLead", { category: trends.topCategory ?? "" })}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#D4372B", fontFamily: amazonFont }}><bdi dir="ltr">+{trends.trendScore}%</bdi></span>
          </div>
          <CountrySelector />
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {trends.products.slice(0, 6).map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="group block">
            <div style={{ background: "#fff", borderRadius: "6px", border: "0.5px solid #ECECEC", padding: "8px" }} className="transition-all duration-200 hover:shadow-sm">
              <div className="relative aspect-square mb-2" style={{ background: "#FAFAFA", borderRadius: "4px" }}>
                <span className="absolute top-1 start-1 z-10 text-[8px] font-bold px-1 py-0.5 text-white" style={{ background: "#D4372B", borderRadius: "3px" }}>
                  <bdi dir="ltr">+{product.trend}%</bdi>
                </span>
                {product.flag && (
                  <span className="absolute top-1 end-1 text-xs z-10 px-0.5 rounded" style={{ background: "rgba(255,255,255,0.8)" }}>
                    {product.flag}
                  </span>
                )}
                <Image src={product.image} alt={product.name} width={100} height={100} className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105" />
              </div>
              <p className="truncate mb-1" style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", fontFamily: amazonFont }}>{product.name}</p>
              <div className="flex items-center justify-between">
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#D4372B", fontFamily: amazonFont }}>{formatPrice(product.priceUSD)}</p>
                <span style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>{t("orders", { count: product.orders })}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "0.5px solid #F0F0F0" }}>
        <div className="flex items-center gap-3" style={{ fontSize: "11px", color: "#AAAAAA", fontFamily: amazonFont }}>
          <span>📊 {t("basedOnDays")}</span>
          <span>•</span>
          <span>👥 {t("views", { count: new Intl.NumberFormat(locale).format(trends.products.reduce((a, p) => a + p.views, 0)) })}</span>
        </div>
        <Link href="/meilleures-ventes" className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 hover:gap-1.5" style={{ color: "#D4372B", fontFamily: amazonFont }}>
          {t("seeAllTrends")} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  )

  return (
    <section className="w-full" style={{ background: "#fff" }}>
      <div className="max-w-7xl mx-auto">
        <MobileTrend />
        <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-4">
          <DesktopTrend />
        </div>
      </div>
      <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}