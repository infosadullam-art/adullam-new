"use client"

import { useState, useEffect } from "react"
import { Zap, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Types
interface Product {
  id: string
  name: string
  price: number
  image: string
  badge?: string
}

interface FlashSaleData {
  hasActiveSale: boolean
  timeLeft: {
    hours: number
    minutes: number
    seconds: number
  }
  sale?: {
    id: string
    productId: string
    productName: string
    productImage: string
    discount: number
    originalPrice: number
    discountedPrice: number
  }
}

export function DealCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [hasFlashSale, setHasFlashSale] = useState(false)
  const [flashSaleData, setFlashSaleData] = useState<FlashSaleData | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { formatPrice } = useCurrencyFormatter()

  // ── Couleurs desktop (inchangées) ──────────────────────────
  const brandColor    = "#2B4F3C"
  const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)"
  const brandLight    = "#E8F3E8"

  // ── Fetch data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [featuredRes, bestSellersRes, flashSaleRes] = await Promise.all([
          fetch("/api/deals/featured?limit=6"),
          fetch("/api/deals/best-sellers?limit=6"),
          fetch("/api/deals/flash-sales/current"),
        ])

        if (featuredRes.ok) {
          const featuredData = await featuredRes.json()
          if (featuredData.success && featuredData.data) {
            setFeaturedProducts(
              featuredData.data.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                price: p.price,
                image: p.image || "/placeholder.jpg",
                badge: p.badge,
              }))
            )
          }
        }

        if (bestSellersRes.ok) {
          const bestSellersData = await bestSellersRes.json()
          if (bestSellersData.success && bestSellersData.data) {
            setBestSellers(
              bestSellersData.data.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                price: p.price,
                image: p.image || "/placeholder.jpg",
                badge: p.badge || (p.purchaseCount > 1000 ? "🔥 Best-seller" : undefined),
              }))
            )
          }
        }

        if (flashSaleRes.ok) {
          const flashData = await flashSaleRes.json()
          if (flashData.success) {
            setFlashSaleData(flashData)
            setHasFlashSale(flashData.hasActiveSale)
            if (flashData.hasActiveSale) setTimeLeft(flashData.timeLeft)
          }
        }
      } catch (err) {
        setError("Impossible de charger les offres")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // ── Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (!hasFlashSale) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0)   return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [hasFlashSale])

  const fmt = (n: number) => n.toString().padStart(2, "0")

  // ── ProductCard mobile ──────────────────────────────────────
  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.id}`} className="group block">
      <div
        className="bg-white overflow-hidden transition-all duration-200"
        style={{
          borderRadius: "10px",
          border: "0.5px solid #ECECEC",
        }}
      >
        {/* Image */}
        <div className="relative w-full aspect-square bg-[#FAFAFA]">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name || "Produit"}
            fill
            sizes="(max-width: 768px) 140px, 200px"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span
              className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 text-white"
              style={{ background: "#D4372B", borderRadius: "5px" }}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Infos */}
        <div className="px-2 py-2">
          <p
            className="text-[11px] font-medium truncate mb-1"
            style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
          >
            {product.name || "Produit"}
          </p>
          <p
            className="text-[13px] font-bold"
            style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
          >
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  )

  // ── Loading skeleton mobile ─────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full bg-white font-poppins">
        {/* Skeleton header mobile */}
        <div className="lg:hidden px-0 pt-3 pb-3" style={{ borderBottom: "0.5px solid #ECECEC" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: "#F4F4F4" }} />
              <div>
                <div className="h-3 w-20 rounded animate-pulse mb-1" style={{ background: "#F4F4F4" }} />
                <div className="h-2 w-14 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
              </div>
            </div>
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-10 h-8 rounded-lg animate-pulse" style={{ background: "#F4F4F4" }} />
              ))}
            </div>
          </div>
        </div>
        {/* Skeleton grid */}
        <div className="lg:hidden px-0 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {[0,1].map(col => (
              <div key={col} className="rounded-xl p-3" style={{ background: "#FAFAFA", border: "0.5px solid #ECECEC" }}>
                <div className="h-3 w-24 rounded animate-pulse mb-3" style={{ background: "#ECECEC" }} />
                <div className="grid grid-cols-2 gap-2">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="rounded-xl overflow-hidden" style={{ border: "0.5px solid #ECECEC" }}>
                      <div className="aspect-square animate-pulse" style={{ background: "#F4F4F4" }} />
                      <div className="p-2">
                        <div className="h-2 w-full rounded animate-pulse mb-1.5" style={{ background: "#F4F4F4" }} />
                        <div className="h-3 w-16 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop spinner inchangé */}
        <div className="hidden lg:flex justify-center items-center h-40 bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }} />
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 text-center">
          <p className="text-sm" style={{ color: "#D4372B" }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white font-poppins">

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div style={{ borderBottom: "0.5px solid #ECECEC" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-4">

          {/* ── MOBILE header ─────────────────────────────────── */}
          <div className="lg:hidden flex items-center justify-between">

            {/* Gauche : icône + titre */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: "#D4372B" }}
              >
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <div>
                <p
                  className="text-xs font-bold leading-tight"
                  style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                >
                  Vente flash
                </p>
                <p
                  className="text-[10px] leading-tight"
                  style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}
                >
                  Jusqu'à -50%
                </p>
              </div>
            </div>

            {/* Droite : timer + lien */}
            <div className="flex items-center gap-2.5">
              {/* Blocs timer */}
              <div className="flex items-center gap-1">
                {[
                  { val: timeLeft.hours,   unit: "h" },
                  { val: timeLeft.minutes, unit: "m" },
                  { val: timeLeft.seconds, unit: "s" },
                ].map(({ val, unit }, i) => (
                  <div key={unit} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="text-xs font-bold" style={{ color: "#ECECEC" }}>:</span>
                    )}
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{
                        background: "#0A0A0A",
                        borderRadius: "7px",
                        minWidth: "34px",
                        padding: "4px 6px",
                      }}
                    >
                      <span
                        className="text-sm font-bold leading-none"
                        style={{ color: "#fff", fontFamily: "'Poppins', sans-serif" }}
                      >
                        {fmt(val)}
                      </span>
                      <span
                        className="text-[8px] leading-none mt-0.5"
                        style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}
                      >
                        {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voir tout */}
              <Link
                href="/deals-du-jour"
                className="flex items-center gap-0.5 text-[11px] font-semibold"
                style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
              >
                Tout
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* ── DESKTOP header (inchangé) ──────────────────────── */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl" style={{ background: brandLight }}>
                <Zap className="w-5 h-5" style={{ color: brandColor }} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 font-poppins">Offres éclair</h2>
                <p className="text-sm text-gray-500 font-poppins">Jusqu'à -50% · Renouvellement quotidien</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-sm font-poppins">Fin dans</span>
                </div>
                <div className="flex items-center gap-1">
                  {[
                    { val: timeLeft.hours,   unit: "h" },
                    { val: timeLeft.minutes, unit: "m" },
                    { val: timeLeft.seconds, unit: "s" },
                  ].map(({ val, unit }, i) => (
                    <div key={unit} className="flex items-center gap-1">
                      {i > 0 && <span className="text-gray-300 text-xl">:</span>}
                      <div className="px-3 py-2 rounded-lg min-w-[70px] text-center" style={{ background: brandLight }}>
                        <span className="text-xl font-bold font-poppins" style={{ color: brandColor }}>{fmt(val)}</span>
                        <span className="text-xs text-gray-500 ml-1 font-poppins">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/deals-du-jour"
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg font-poppins"
                style={{ background: brandGradient }}
              >
                Voir toutes les offres
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ══ PRODUITS ════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="grid grid-cols-2 gap-3 lg:gap-6">

          {/* Bloc 1 — Sélection du moment */}
          <div
            className="rounded-xl p-3 lg:p-4"
            style={{ background: "#FAFAFA", border: "0.5px solid #ECECEC" }}
          >
            {/* Label section mobile */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", letterSpacing: "0.08em" }}
              >
                Sélection
              </p>
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "#FFF0F0", color: "#D4372B" }}
              >
                Nouveau
              </span>
            </div>
            {/* Label section desktop (inchangé) */}
            <h3
              className="hidden lg:block text-xs font-medium uppercase tracking-wider mb-4 font-poppins"
              style={{ color: brandColor }}
            >
              Sélection du moment
            </h3>

            {featuredProducts.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#AAAAAA" }}>Aucun produit disponible</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 lg:hidden">
                  {featuredProducts.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                <div className="hidden lg:grid lg:grid-cols-3 gap-3">
                  {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>

          {/* Bloc 2 — Meilleures ventes */}
          <div
            className="rounded-xl p-3 lg:p-4"
            style={{ background: "#FAFAFA", border: "0.5px solid #ECECEC" }}
          >
            {/* Label section mobile */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", letterSpacing: "0.08em" }}
              >
                Top ventes
              </p>
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "#FFF0F0", color: "#D4372B" }}
              >
                🔥
              </span>
            </div>
            {/* Label section desktop (inchangé) */}
            <h3
              className="hidden lg:block text-xs font-medium uppercase tracking-wider mb-4 font-poppins"
              style={{ color: brandColor }}
            >
              Meilleures ventes
            </h3>

            {bestSellers.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#AAAAAA" }}>Aucun produit disponible</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 lg:hidden">
                  {bestSellers.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                <div className="hidden lg:grid lg:grid-cols-3 gap-3">
                  {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
