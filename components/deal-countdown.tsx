"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// ════════════════════════════════════════════════════════════
// ICÔNES — mêmes dessins maison que le header (trait 1.6,
// jonctions arrondies) : fini lucide, une seule identité SVG.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string }

const IconBolt = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12.8 3.5 6 13.2h4.6L10.6 20.5 18 10.3h-4.7L12.8 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.18" />
  </svg>
)

const IconArrowRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12h15.5M14 6.2 19.8 12l-5.8 5.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconClock = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7.6V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconSparkle = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3.5c.5 3.2 1.3 4 4.5 4.5-3.2.5-4 1.3-4.5 4.5-.5-3.2-1.3-4-4.5-4.5 3.2-.5 4-1.3 4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M18.3 14.5c.3 1.5.6 1.9 2.1 2.2-1.5.3-1.8.7-2.1 2.2-.3-1.5-.6-1.9-2.1-2.2 1.5-.3 1.8-.7 2.1-2.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)

const IconFlame = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 3.2c1.3 2.4-.4 3.8-1.4 5-1.4 1.7-2.1 3-2.1 4.7a3.5 3.5 0 0 0 7 0c0-.9-.3-1.6-.7-2.3.9.6 1.7 1.8 1.7 3.4a4.5 4.5 0 0 1-9 0c0-4.4 3.2-6 4.5-10.8Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
    />
  </svg>
)

// ════════════════════════════════════════════════════════════
// API - Changement de produits toutes les 6h
// ════════════════════════════════════════════════════════════

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000 // 6 heures

// Messages du bandeau défilant (façon ticker Alibaba/AliExpress)
const tickerMessages = ["Jusqu'à -50%", "Renouvellement quotidien", "Stock limité", "Livraison rapide"]

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

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

// Bandeau défilant réutilisable
function Ticker({ className }: { className?: string }) {
  return (
    <div className={`overflow-hidden ${className || ""}`}>
      <div className="marquee">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-2 pr-6 shrink-0">
            {tickerMessages.map((msg, i) => (
              <span key={i} className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                {msg}
                <span className="h-1 w-1 rounded-full bg-border-strong" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Étiquette avec balayage lumineux (façon badge promo Alibaba/AliExpress)
function ShineTag({ children, tone = "accent" }: { children: React.ReactNode; tone?: "accent" | "dark" }) {
  return (
    <span
      className={`badge-shine inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-bold text-white ${
        tone === "accent" ? "bg-accent" : "bg-brand"
      }`}
    >
      {children}
    </span>
  )
}

// ════════════════════════════════════════════════════════════
// COMPOSANT
// ════════════════════════════════════════════════════════════

export function DealCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [hasFlashSale, setHasFlashSale] = useState(false)
  const [flashSaleData, setFlashSaleData] = useState<FlashSaleData | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { formatPrice } = useCurrencyFormatter()

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log(`📦 [DEALS] Fetch - ${new Date().toLocaleTimeString()}`)
        setIsLoading(true)
        setError(null)

        const timestamp = Date.now()

        const [featuredRes, bestSellersRes, flashRes] = await Promise.all([
          fetch(`${API_BASE}/api/deals/featured?limit=20&_t=${timestamp}`),
          fetch(`${API_BASE}/api/deals/best-sellers?limit=20&_t=${timestamp}`),
          fetch(`${API_BASE}/api/deals/flash-sales/current?_t=${timestamp}`),
        ])

        const featuredData = await featuredRes.json()
        const bestSellersData = await bestSellersRes.json()
        const flashData = await flashRes.json()

        if (featuredData.success && featuredData.data) {
          const shuffled = [...featuredData.data].sort(() => Math.random() - 0.5)
          setFeaturedProducts(
            shuffled.slice(0, 6).map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              price: p.price,
              image: p.image || "/placeholder.jpg",
              badge: p.badge,
            }))
          )
          console.log(`📦 [DEALS] ${featuredData.data.length} featured récupérés, 6 affichés`)
        }

        if (bestSellersData.success && bestSellersData.data) {
          const shuffled = [...bestSellersData.data].sort(() => Math.random() - 0.5)
          setBestSellers(
            shuffled.slice(0, 6).map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              price: p.price,
              image: p.image || "/placeholder.jpg",
              badge: p.badge || (p.purchaseCount > 1000 ? "Best-seller" : undefined),
            }))
          )
          console.log(`📦 [DEALS] ${bestSellersData.data.length} best-sellers récupérés, 6 affichés`)
        }

        if (flashData.success) {
          setFlashSaleData(flashData)
          setHasFlashSale(flashData.hasActiveSale)
          if (flashData.hasActiveSale) setTimeLeft(flashData.timeLeft)
        }

        console.log(`✅ [DEALS] Fetch terminé - ${new Date().toLocaleTimeString()}`)
      } catch (err) {
        console.error("❌ [DEALS] Erreur:", err)
        setError("Impossible de charger les offres")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()

    // ✅ Changement de produits toutes les 6h
    const interval = setInterval(() => {
      console.log(`🔄 [DEALS] Nouveaux produits - ${new Date().toLocaleTimeString()}`)
      fetchAllData()
    }, REFRESH_INTERVAL)

    return () => {
      console.log(`🧹 [DEALS] Nettoyage`)
      clearInterval(interval)
    }
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
    <Link href={`/products/${product.id}`} className="group block overflow-hidden rounded-md bg-background shadow-xs transition-shadow duration-300 hover:shadow-sm">
      <div className="media-zoom relative w-full aspect-square bg-surface">
        <Image
          src={product.image || "/placeholder.jpg"}
          alt={product.name || "Produit"}
          fill
          sizes="(max-width: 768px) 150px, 200px"
          className="object-contain p-1.5"
        />
        {product.badge && (
          <span className="badge-shine absolute top-1.5 left-1.5 rounded-sm bg-accent px-1.5 py-0.5 text-[9px] font-bold text-white">
            {product.badge}
          </span>
        )}
      </div>

      <div className="px-2 py-2">
        {!hideName && (
          <p className="truncate mb-0.5 text-[11px] font-medium text-foreground">
            {product.name || "Produit"}
          </p>
        )}
        <p className="text-xs font-bold text-accent tabular-nums">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )

  // Chrono unique en continu (plus de grille de 3 blocs séparés)
  const Countdown = ({ h, m, s, big = false }: { h: number; m: number; s: number; big?: boolean }) => (
    <div className={`inline-flex items-center rounded-md bg-brand ${big ? "gap-[3px] px-4 py-2.5" : "gap-[2px] px-2.5 py-1.5"}`}>
      <span className={`font-black text-white tabular-nums ${big ? "text-2xl" : "text-sm"}`}>{fmt(h)}</span>
      <span className={`font-black text-accent ${big ? "text-2xl" : "text-sm"}`} style={{ animation: "colonBlink 1.4s ease-in-out infinite" }}>:</span>
      <span className={`font-black text-white tabular-nums ${big ? "text-2xl" : "text-sm"}`}>{fmt(m)}</span>
      <span className={`font-black text-accent ${big ? "text-2xl" : "text-sm"}`} style={{ animation: "colonBlink 1.4s ease-in-out infinite" }}>:</span>
      <span className={`font-black text-white tabular-nums ${big ? "text-2xl" : "text-sm"}`}>{fmt(s)}</span>
    </div>
  )

  if (isLoading) {
    return (
      <div className="w-full bg-surface">
        <div className="py-6">
          <div className="flex h-20 animate-pulse items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-surface">
        <div className="py-4 text-center">
          <p className="text-sm text-accent">{error}</p>
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
    <div className="w-[calc(100%+32px)] lg:w-full -mx-4 lg:mx-0 bg-surface">
      <div className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] animate-pulse-slow"
          style={{ background: "radial-gradient(circle at 0% 0%, var(--accent) 0%, transparent 70%)" }}
        />

        {/* ── MOBILE ── */}
        <div className="py-3 lg:hidden">
          <div className="flex items-center justify-between px-4 mb-1.5">
            <div className="flex items-center gap-1.5">
              <IconBolt className="h-4 w-4 text-accent" />
              <p className="text-sm font-black tracking-tight text-foreground">FLASH SALE</p>
              <ShineTag>Limited</ShineTag>
            </div>

            <Link href="/deals-du-jour" className="flex items-center gap-1 text-[11px] font-semibold text-accent transition-opacity duration-200 hover:opacity-70">
              Voir tout
              <IconArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 pt-1">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <IconClock className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">Fin dans</span>
              </div>
              <Ticker className="max-w-[170px]" />
            </div>
            <Countdown h={timeLeft.hours} m={timeLeft.minutes} s={timeLeft.seconds} />
          </div>
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden lg:block mx-auto max-w-6xl px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBolt className="h-6 w-6 text-accent" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-[-0.03em] text-foreground">FLASH SALE</h2>
                  <ShineTag>
                    <IconFlame className="h-3 w-3" />
                    Limited
                  </ShineTag>
                </div>
                <Ticker className="mt-0.5 max-w-[340px]" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Fin dans</span>
              </div>

              <Countdown h={timeLeft.hours} m={timeLeft.minutes} s={timeLeft.seconds} big />

              <Link
                href="/deals-du-jour"
                className="group flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-accent-hover"
              >
                Voir toutes les offres
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRILLES PRODUITS — MOBILE ── */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-2 p-2">
          <div className="rounded-md bg-background">
            <div className="p-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1 text-xs font-bold text-foreground">
                  <IconSparkle className="h-3.5 w-3.5 text-accent" />
                  Sélection
                </h3>
                <ShineTag>Nouveau</ShineTag>
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
          </div>

          <div className="rounded-md bg-background">
            <div className="p-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1 text-xs font-bold text-foreground">
                  <IconFlame className="h-3.5 w-3.5 text-accent" />
                  Best-sellers
                </h3>
                <ShineTag tone="dark">Top ventes</ShineTag>
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
        </div>
      </div>

      {/* ── GRILLES PRODUITS — DESKTOP ── */}
      <div className="hidden lg:block mx-auto max-w-6xl px-8 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <IconSparkle className="h-4 w-4 text-accent" />
                Sélection du moment
              </h3>
              <ShineTag>Nouveau</ShineTag>
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

          <div className="rounded-md bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <IconFlame className="h-4 w-4 text-accent" />
                Meilleures ventes
              </h3>
              <ShineTag tone="dark">Top ventes</ShineTag>
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
        @keyframes pulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }

        /* Balayage lumineux sur les étiquettes promo (façon Alibaba/AliExpress) — ralenti */
        @keyframes badge-shine-sweep {
          0%   { transform: translate3d(-130%, 0, 0) skewX(-18deg); opacity: 0; }
          6%   { opacity: 1; }
          28%  { opacity: 1; animation-timing-function: ease-out; }
          34%  { transform: translate3d(220%, 0, 0) skewX(-18deg); opacity: 0; }
          100% { transform: translate3d(220%, 0, 0) skewX(-18deg); opacity: 0; }
        }
        .badge-shine { position: relative; overflow: hidden; isolation: isolate; }
        .badge-shine::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 35%;
          height: 100%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.65), transparent);
          animation: badge-shine-sweep 5.5s linear infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: translate3d(-130%, 0, 0) skewX(-18deg);
        }

        /* Clignotement doux des deux-points du chrono */
        @keyframes colonBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  )
}