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
  trend: number // +XX% sur 7 jours
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
  CG: { nom: "Congo", drapeau: "🇨🇬", code: "CG" },
  GA: { nom: "Gabon", drapeau: "🇬🇦", code: "GA" },
}

export function TendanceParPays() {
  const { country, locale } = useLocale()
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
        // 👇 APPEL GRAPH - Tendances par pays
        const res = await fetch(`/api/graph/trending?country=${selectedCountry}&limit=6`)
        const data = await res.json()
        
        if (data.success) {
          setTrends(data.trend)
        }
      } catch (error) {
        console.error("Erreur chargement tendances", error)
        // Fallback data
        setTrends(fallbackTrends[selectedCountry as keyof typeof fallbackTrends] || fallbackTrends.CI)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrends()
  }, [selectedCountry])

  // Fallback data
  const fallbackTrends: Record<string, CountryTrend> = {
    CI: {
      code: "CI",
      name: "Côte d'Ivoire",
      flag: "🇨🇮",
      trendScore: 94,
      topCategory: "Électronique",
      products: [
        { id: "1", name: "Écouteurs sans fil", priceUSD: 9.63, image: "/wireless-earbuds-black.jpg", views: 1234, orders: 89, trend: 34, badge: "Tendance", flag: "🇨🇳" },
        { id: "2", name: "Montre connectée", priceUSD: 24.52, image: "/black-smartwatch.jpg", views: 987, orders: 67, trend: 28, badge: "Populaire", flag: "🇨🇳" },
        { id: "3", name: "Robe africaine", priceUSD: 22.87, image: "/colorful-african-dress.png", views: 876, orders: 54, trend: 45, badge: "🔥 +45%", flag: "🇨🇮" },
        { id: "4", name: "Mixeur cuisine", priceUSD: 15.51, image: "/kitchen-blender.png", views: 654, orders: 43, trend: 22, badge: "Promo", flag: "🇨🇳" },
        { id: "5", name: "Sandales cuir", priceUSD: 8.16, image: "/leather-sandals-brown.jpg", views: 543, orders: 38, trend: 18, flag: "🇨🇮" },
        { id: "6", name: "Parfum de luxe", priceUSD: 32.64, image: "/essential-oils-perfume.jpg", views: 432, orders: 29, trend: 52, badge: "🚀 Tendance", flag: "🇫🇷" },
      ]
    },
    SN: {
      code: "SN",
      name: "Sénégal",
      flag: "🇸🇳",
      trendScore: 87,
      topCategory: "Mode",
      products: [
        { id: "1", name: "Boubou sénégalais", priceUSD: 40.80, image: "/senegalese-boubou.jpg", views: 1567, orders: 112, trend: 67, badge: "⭐ Tendance", flag: "🇸🇳" },
        { id: "2", name: "Montre connectée", priceUSD: 24.52, image: "/black-smartwatch.jpg", views: 876, orders: 54, trend: 23, flag: "🇨🇳" },
        { id: "3", name: "Écouteurs sans fil", priceUSD: 9.63, image: "/wireless-earbuds-black.jpg", views: 765, orders: 48, trend: 31, badge: "Populaire", flag: "🇨🇳" },
        { id: "4", name: "Cosmétiques bio", priceUSD: 12.25, image: "/camel-milk-skincare.jpg", views: 654, orders: 41, trend: 44, badge: "🌿 Naturel", flag: "🇲🇦" },
      ]
    },
    CM: {
      code: "CM",
      name: "Cameroun",
      flag: "🇨🇲",
      trendScore: 82,
      topCategory: "Maison",
      products: [
        { id: "1", name: "Ustensiles cuisine", priceUSD: 6.53, image: "/kitchen-utensils.jpg", views: 987, orders: 76, trend: 41, badge: "⭐ Tendance", flag: "🇨🇳" },
        { id: "2", name: "Ventilateur", priceUSD: 32.64, image: "/fan.jpg", views: 876, orders: 65, trend: 38, flag: "🇨🇳" },
        { id: "3", name: "Écouteurs sans fil", priceUSD: 9.63, image: "/wireless-earbuds-black.jpg", views: 765, orders: 54, trend: 27, flag: "🇨🇳" },
      ]
    }
  }

  // ========== SÉLECTEUR DE PAYS ==========
  const CountrySelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowCountrySelector(!showCountrySelector)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
      >
        <span className="text-base">{paysActuel.drapeau}</span>
        <span className="text-gray-700">{paysActuel.nom}</span>
        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showCountrySelector ? 'rotate-90' : ''}`} />
      </button>

      {showCountrySelector && (
        <>
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setShowCountrySelector(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2 max-h-96 overflow-y-auto">
            {Object.values(pays).map((p) => (
              <button
                key={p.code}
                onClick={() => {
                  setSelectedCountry(p.code)
                  setShowCountrySelector(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  selectedCountry === p.code ? 'bg-amber-50 text-amber-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{p.drapeau}</span>
                <span className="flex-1 text-left">{p.nom}</span>
                {selectedCountry === p.code && (
                  <span className="text-amber-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <section className="w-full bg-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 w-64 bg-gray-200 rounded mb-6" />
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!trends) return null

  // ========== VERSION MOBILE ==========
  const MobileTrend = () => (
    <div className="lg:hidden space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-lg">
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Tendances {paysActuel.drapeau}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {trends.topCategory} · +{trends.trendScore}% cette semaine
            </p>
          </div>
        </div>
        <CountrySelector />
      </div>

      {/* SCROLL HORIZONTAL */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 min-w-max pb-2">
          {trends.products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block w-[140px]"
            >
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden group-hover:border-gray-200 group-hover:shadow-sm transition-all">
                {/* IMAGE */}
                <div className="relative aspect-square bg-gray-50 p-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* BADGE TENDANCE */}
                  {product.trend > 30 && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full">
                      +{product.trend}%
                    </span>
                  )}
                  {/* FLAG FOURNISSEUR */}
                  {product.flag && (
                    <span className="absolute top-2 right-2 text-sm">
                      {product.flag}
                    </span>
                  )}
                </div>
                {/* INFOS */}
                <div className="p-2">
                  <h3 className="text-xs font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(product.priceUSD)}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {product.views} vues
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          <span className="text-[10px] text-gray-500">
            Mise à jour en temps réel
          </span>
        </div>
        <Link 
          href={`/trending/${selectedCountry}`}
          className="inline-flex items-center gap-0.5 text-xs text-orange-600 font-medium"
        >
          Voir toutes les tendances
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )

  // ========== VERSION DESKTOP ==========
  const DesktopTrend = () => (
    <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2.5 rounded-xl">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Tendances • {paysActuel.nom} {paysActuel.drapeau}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Les produits les plus populaires cette semaine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{trends.topCategory} en tête</span>
            <span className="text-orange-600 font-medium ml-1">+{trends.trendScore}%</span>
          </div>
          <CountrySelector />
        </div>
      </div>

      {/* GRILLE 6 COLONNES */}
      <div className="grid grid-cols-6 gap-4">
        {trends.products.slice(0, 6).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block"
          >
            <div className="bg-white rounded-xl border border-gray-100 p-3 group-hover:border-gray-200 group-hover:shadow-md transition-all">
              {/* IMAGE */}
              <div className="relative aspect-square bg-gray-50 mb-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={120}
                  height={120}
                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                />
                {/* BADGE TENDANCE */}
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full">
                  +{product.trend}%
                </span>
                {/* FLAG FOURNISSEUR */}
                {product.flag && (
                  <span className="absolute top-2 right-2 text-sm bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                    {product.flag}
                  </span>
                )}
              </div>
              {/* INFOS */}
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-base font-bold text-gray-900">
                  {formatPrice(product.priceUSD)}
                </p>
                <span className="text-xs text-gray-400">
                  {product.orders} commandes
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>📊 Basé sur les 7 derniers jours</span>
          <span>•</span>
          <span>👥 {trends.products.reduce((acc, p) => acc + p.views, 0).toLocaleString()} vues</span>
        </div>
        <Link
          href={`/trending/${selectedCountry}`}
          className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Voir toutes les tendances
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )

  return (
    <section className="w-full bg-white py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MobileTrend />
        <DesktopTrend />
      </div>
    </section>
  )
}