"use client"

import { useState, useEffect } from "react"
import { Zap, ArrowRight, Clock, Sparkles, Flame } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { apiFetch } from "@/lib/api"

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

  const brandColor = "#0A0A0A"
  const brandAccent = "#D4372B"

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [featuredRes, bestSellersRes, flashSaleRes] = await Promise.all([
          apiFetch("/api/deals/featured?limit=6"),
          apiFetch("/api/deals/best-sellers?limit=6"),
          apiFetch("/api/deals/flash-sales/current"),
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
                badge: p.badge || (p.purchaseCount > 1000 ? "Best-seller" : undefined),
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
        console.error("Erreur chargement offres:", err)
        setError("Impossible de charger les offres")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  useEffect(() => {
    if (!hasFlashSale) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [hasFlashSale])

  const fmt = (n: number) => n.toString().padStart(2, "0")

  const ProductCard = ({ product, hideName = false }: { product: Product; hideName?: boolean }) => (
    <Link href={`/products/${product.id}`} className="group block transition-all duration-200 hover:-translate-y-0.5">
      <div
        className="overflow-hidden transition-all duration-200 hover:shadow-md"
        style={{
          background: "#fff",
          borderRadius: "6px",
          border: "0.5px solid #ECECEC",
        }}
      >
        <div className="relative w-full aspect-square" style={{ background: "#FAFAFA" }}>
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name || "Produit"}
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
          />
          {product.badge && (
            <span
              className="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 text-white"
              style={{ background: "#D4372B", borderRadius: "3px" }}
            >
              {product.badge}
            </span>
          )}
        </div>

        <div className="px-1.5 py-1.5">
          {!hideName && (
            <p
              className="truncate mb-0.5"
              style={{ fontSize: "9px", fontWeight: 500, color: "#0A0A0A" }}
            >
              {product.name || "Produit"}
            </p>
          )}
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#D4372B" }}>
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  )

  if (isLoading) {
    return (
      <div className="w-full" style={{ background: "#FAFAFA" }}>
        <div className="px-4 py-4">
          <div className="flex h-20 animate-pulse items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4372B] border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full" style={{ background: "#FAFAFA" }}>
        <div className="px-4 py-4 text-center">
          <p className="text-sm" style={{ color: "#D4372B" }}>
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ background: "#FAFAFA" }}>
      {/* ══ BLOC CHRONO ════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ background: "#fff" }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${brandAccent} 0%, transparent 70%)`,
          }}
        />

        <div className="px-4 py-3 lg:px-8 lg:py-3">
          {/* VERSION MOBILE */}
          <div className="lg:hidden">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded"
                  style={{ background: `linear-gradient(135deg, ${brandAccent}, #B82D20)` }}
                >
                  <Zap className="h-4 w-4 text-white" fill="white" />
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: brandColor }}>
                    FLASH SALE
                  </p>
                  <p style={{ fontSize: "9px", color: "#AAAAAA" }}>
                    jusqu'à -50%
                  </p>
                </div>
              </div>

              <Link
                href="/deals-du-jour"
                className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1"
                style={{ color: brandAccent }}
              >
                Voir tout
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-1.5 flex items-center justify-between pt-1.5" style={{ borderTop: "0.5px solid #ECECEC" }}>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" style={{ color: "#AAAAAA" }} />
                <span style={{ fontSize: "9px", color: "#AAAAAA" }}>
                  Se termine dans
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { val: timeLeft.hours, label: "h" },
                  { val: timeLeft.minutes, label: "m" },
                  { val: timeLeft.seconds, label: "s" },
                ].map(({ val, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div
                      className="flex flex-col items-center justify-center min-w-[32px] rounded px-1 py-0.5"
                      style={{ background: brandColor, borderRadius: "4px" }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                        {fmt(val)}
                      </span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>
                        {label}
                      </span>
                    </div>
                    {label !== "s" && (
                      <span style={{ fontSize: "12px", fontWeight: 700, color: brandAccent }}>
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VERSION DESKTOP */}
          <div className="hidden lg:flex lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded"
                style={{
                  background: `linear-gradient(135deg, ${brandAccent}, #B82D20)`,
                  boxShadow: "0 4px 12px rgba(212,55,43,0.25)",
                }}
              >
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: "20px", fontWeight: 900, color: brandColor, letterSpacing: "-0.03em" }}>
                    FLASH SALE
                  </h2>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: "#FFF0F0",
                      color: brandAccent,
                    }}
                  >
                    <Flame className="inline h-3 w-3" /> Limited
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#AAAAAA" }}>
                  Jusqu'à -50% · Renouvellement quotidien
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: "#AAAAAA" }} />
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#AAAAAA" }}>
                  Fin dans
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { val: timeLeft.hours, label: "HEURES" },
                  { val: timeLeft.minutes, label: "MINUTES" },
                  { val: timeLeft.seconds, label: "SECONDES" },
                ].map(({ val, label }, idx) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className="flex flex-col items-center justify-center min-w-[70px] rounded px-3 py-2"
                      style={{ background: brandColor, borderRadius: "6px" }}
                    >
                      <span style={{ fontSize: "24px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                        {fmt(val)}
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.5)",
                          letterSpacing: "0.05em",
                          marginTop: "2px",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <span style={{ fontSize: "20px", fontWeight: 900, color: brandAccent }}>
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <Link
                href="/deals-du-jour"
                className="group flex items-center gap-2 rounded px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${brandAccent}, #B82D20)`,
                  borderRadius: "6px",
                }}
              >
                Voir toutes les offres
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BLOCS PRODUITS ════════════════════════════════════════ */}
      <div className="px-4 py-3 lg:px-8 lg:py-2">
        {/* MOBILE */}
        <div className="grid grid-cols-2 gap-2 lg:hidden">
          <div
            className="rounded p-2"
            style={{
              background: "#fff",
              border: "0.5px solid #ECECEC",
              borderRadius: "6px",
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <h3
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: brandColor,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                ✨ Sélection
              </h3>
              <span
                style={{
                  fontSize: "7px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: brandAccent,
                  color: "#fff",
                }}
              >
                Nouveau
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {featuredProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} hideName={true} />
              ))}
            </div>
          </div>

          <div
            className="rounded p-2"
            style={{
              background: "#fff",
              border: "0.5px solid #ECECEC",
              borderRadius: "6px",
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <h3
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: brandColor,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                🔥 Best-sellers
              </h3>
              <span
                style={{
                  fontSize: "7px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: "#FFF0F0",
                  color: brandAccent,
                }}
              >
                Top ventes
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {bestSellers.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} hideName={true} />
              ))}
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden grid-cols-2 gap-2 lg:grid">
          <div
            className="rounded p-4"
            style={{
              background: "#fff",
              border: "0.5px solid #ECECEC",
              borderRadius: "6px",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: brandColor,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                ✨ Sélection du moment
              </h3>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: brandAccent,
                  color: "#fff",
                }}
              >
                Nouveau
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} hideName={false} />
              ))}
            </div>
          </div>

          <div
            className="rounded p-4"
            style={{
              background: "#fff",
              border: "0.5px solid #ECECEC",
              borderRadius: "6px",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: brandColor,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                🔥 Meilleures ventes
              </h3>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "#FFF0F0",
                  color: brandAccent,
                }}
              >
                Top ventes
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} hideName={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}