"use client"

import { useState, useEffect } from "react"
import { Zap, ArrowRight, Clock, Sparkles, Flame } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { apiFetch } from "@/lib/api"

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

  const brandColor = "#0A0A0A"
  const brandAccent = "#D4372B"
  const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

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
              })),
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
              })),
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
              style={{ background: "#D4372B", borderRadius: "3px", fontFamily: amazonFont }}
            >
              {product.badge}
            </span>
          )}
        </div>

        <div className="px-1.5 py-1.5">
          {!hideName && (
            <p
              className="truncate mb-0.5"
              style={{ fontSize: "9px", fontWeight: 500, color: "#0A0A0A", fontFamily: amazonFont }}
            >
              {product.name || "Produit"}
            </p>
          )}
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#D4372B", fontFamily: amazonFont }}>
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  )

  // Bloc chrono réutilisable (mobile + desktop) avec vrai poids visuel
  const TimeBlock = ({ val, label, big = false }: { val: number; label: string; big?: boolean }) => (
    <div
      className={`flex flex-col items-center justify-center rounded-md shadow-lg shadow-black/20 ${
        big ? "min-w-[70px] px-3 py-2" : "min-w-[38px] px-1.5 py-1"
      }`}
      style={{ background: brandColor }}
    >
      <span className={`font-black leading-none tracking-tight text-white ${big ? "text-2xl" : "text-sm"}`}>
        {fmt(val)}
      </span>
      <span className={`mt-1 font-semibold uppercase leading-none tracking-wider text-white/50 ${big ? "text-[9px]" : "text-[7px]"}`}>
        {label}
      </span>
    </div>
  )

  if (isLoading) {
    return (
      <div className="w-full" style={{ background: "#FAFAFA" }}>
        <div className="px-4 py-6 lg:px-8">
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
        <div className="px-4 py-4 text-center lg:px-8">
          <p className="text-sm" style={{ color: "#D4372B", fontFamily: amazonFont }}>
            {error}
          </p>
        </div>
      </div>
    )
  }

  const containerStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  }
  const itemRise = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  }

  return (
    <div className="w-full" style={{ background: "#FAFAFA" }}>
      {/* ══ BLOC CHRONO ════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ background: "#fff" }}>
        {/* Animation du fond */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] animate-pulse-slow"
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
                  <Zap className="h-4 w-4 text-white" fill="white" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: brandColor, fontFamily: amazonFont }}>
                    FLASH SALE
                  </p>
                  <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>
                    jusqu&apos;à -50%
                  </p>
                </div>
              </div>

              <Link
                href="/deals-du-jour"
                className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1"
                style={{ color: brandAccent, fontFamily: amazonFont }}
              >
                Voir tout
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-1.5 flex items-center justify-between pt-1.5" style={{ borderTop: "0.5px solid #ECECEC" }}>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" style={{ color: "#AAAAAA" }} />
                <span style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>
                  Se termine dans
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { val: timeLeft.hours, label: "h" },
                  { val: timeLeft.minutes, label: "m" },
                  { val: timeLeft.seconds, label: "s" },
                ].map(({ val, label }, idx) => (
                  <div key={label} className="flex items-center gap-1">
                    <TimeBlock val={val} label={label} />
                    {idx < 2 && <span style={{ fontSize: "12px", fontWeight: 700, color: brandAccent, fontFamily: amazonFont }}>:</span>}
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
                <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: "20px", fontWeight: 900, color: brandColor, fontFamily: amazonFont, letterSpacing: "-0.03em" }}>
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
                      fontFamily: amazonFont,
                    }}
                  >
                    <Flame className="inline h-3 w-3" strokeWidth={2.25} /> Limited
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#AAAAAA", fontFamily: amazonFont }}>
                  Jusqu&apos;à -50% · Renouvellement quotidien
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: "#AAAAAA" }} />
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#AAAAAA", fontFamily: amazonFont }}>
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
                    <TimeBlock val={val} label={label} big />
                    {idx < 2 && <span style={{ fontSize: "20px", fontWeight: 900, color: brandAccent, fontFamily: amazonFont }}>:</span>}
                  </div>
                ))}
              </div>

              <Link
                href="/deals-du-jour"
                className="group flex items-center gap-2 rounded px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${brandAccent}, #B82D20)`,
                  fontFamily: amazonFont,
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
                  fontFamily: amazonFont,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <Sparkles className="inline h-3 w-3 text-[#D4372B]" strokeWidth={2.25} /> Sélection
              </h3>
              <span
                style={{
                  fontSize: "7px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: brandAccent,
                  color: "#fff",
                  fontFamily: amazonFont,
                }}
              >
                Nouveau
              </span>
            </div>
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-2 gap-1.5"
            >
              {featuredProducts.slice(0, 4).map((p) => (
                <motion.div key={p.id} variants={itemRise}>
                  <ProductCard product={p} hideName />
                </motion.div>
              ))}
            </motion.div>
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
                  fontFamily: amazonFont,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <Flame className="inline h-3 w-3 text-[#D4372B]" strokeWidth={2.25} /> Best-sellers
              </h3>
              <span
                style={{
                  fontSize: "7px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: "#FFF0F0",
                  color: brandAccent,
                  fontFamily: amazonFont,
                }}
              >
                Top ventes
              </span>
            </div>
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-2 gap-1.5"
            >
              {bestSellers.slice(0, 4).map((p) => (
                <motion.div key={p.id} variants={itemRise}>
                  <ProductCard product={p} hideName />
                </motion.div>
              ))}
            </motion.div>
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
                  fontFamily: amazonFont,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <Sparkles className="inline h-3.5 w-3.5 text-[#D4372B]" strokeWidth={2.25} /> Sélection du moment
              </h3>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: brandAccent,
                  color: "#fff",
                  fontFamily: amazonFont,
                }}
              >
                Nouveau
              </span>
            </div>
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-3 gap-3"
            >
              {featuredProducts.map((p) => (
                <motion.div key={p.id} variants={itemRise}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
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
                  fontFamily: amazonFont,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <Flame className="inline h-3.5 w-3.5 text-[#D4372B]" strokeWidth={2.25} /> Meilleures ventes
              </h3>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "#FFF0F0",
                  color: brandAccent,
                  fontFamily: amazonFont,
                }}
              >
                Top ventes
              </span>
            </div>
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-3 gap-3"
            >
              {bestSellers.map((p) => (
                <motion.div key={p.id} variants={itemRise}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap');

        @font-face {
          font-family: 'Amazon Ember';
          src: url('https://fonts.cdnfonts.com/css/amazon-ember') format('woff2');
          font-weight: 100 900;
          font-style: normal;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.04;
          }
          50% {
            opacity: 0.08;
          }
        }

        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}