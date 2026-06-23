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
                // NOTE: l'API ne fournit pas toujours `badge` ; fallback marketing si forte demande.
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
    <Link href={`/products/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-md border border-border bg-card transition-all duration-300 group-hover:border-[#D4372B]/40 group-hover:shadow-md">
        <div className="relative aspect-square w-full bg-muted">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name || "Produit"}
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute left-2 top-2 rounded-sm bg-[#D4372B] px-1.5 py-0.5 text-[9px] font-bold text-white">
              {product.badge}
            </span>
          )}
        </div>

        <div className="px-2 py-2">
          {!hideName && (
            <p className="mb-1 truncate text-[11px] font-medium text-foreground">{product.name || "Produit"}</p>
          )}
          <p className="text-[13px] font-bold text-[#D4372B]">{formatPrice(product.price)}</p>
        </div>
      </div>
    </Link>
  )

  // Bloc chrono réutilisable (mobile + desktop) avec vrai poids visuel
  const TimeBlock = ({ val, label, big = false }: { val: number; label: string; big?: boolean }) => (
    <div
      className={`flex flex-col items-center justify-center rounded-md bg-[#0A0A0A] shadow-lg shadow-black/20 ${
        big ? "min-w-[70px] px-3 py-2" : "min-w-[38px] px-1.5 py-1"
      }`}
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
      <div className="w-full bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
          <div className="flex h-20 animate-pulse items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4372B] border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-background">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center lg:px-8">
          <p className="text-sm text-[#D4372B]">{error}</p>
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
    <div className="w-full bg-background">
      {/* ══ BLOC CHRONO ════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-border bg-muted/40">
        {/* halo d'urgence discret (pas de blob flou générique : radial subtil ancré au coin) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: "radial-gradient(circle at 0% 0%, #D4372B 0%, transparent 60%)" }}
        />

        <div className="mx-auto max-w-6xl px-4 py-3 lg:px-8">
          {/* VERSION MOBILE */}
          <div className="lg:hidden">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#D4372B]">
                  <Zap className="h-4 w-4 text-white" fill="white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight text-foreground">FLASH SALE</p>
                  <p className="text-[10px] font-medium text-muted-foreground">jusqu&apos;à -50%</p>
                </div>
              </div>

              <Link href="/deals-du-jour" className="flex items-center gap-1 text-[11px] font-semibold text-[#D4372B]">
                Voir tout
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">Se termine dans</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { val: timeLeft.hours, label: "h" },
                  { val: timeLeft.minutes, label: "m" },
                  { val: timeLeft.seconds, label: "s" },
                ].map(({ val, label }, idx) => (
                  <div key={label} className="flex items-center gap-1">
                    <TimeBlock val={val} label={label} />
                    {idx < 2 && <span className="text-sm font-bold text-[#D4372B]">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VERSION DESKTOP */}
          <div className="hidden lg:flex lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#D4372B] shadow-lg shadow-[#D4372B]/25">
                <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-[-0.03em] text-foreground">FLASH SALE</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#D4372B]/10 px-2 py-0.5 text-[10px] font-bold text-[#D4372B]">
                    <Flame className="h-3 w-3" strokeWidth={2.25} />
                    Limited
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Jusqu&apos;à -50% · Renouvellement quotidien</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Fin dans</span>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { val: timeLeft.hours, label: "HEURES" },
                  { val: timeLeft.minutes, label: "MINUTES" },
                  { val: timeLeft.seconds, label: "SECONDES" },
                ].map(({ val, label }, idx) => (
                  <div key={label} className="flex items-center gap-2">
                    <TimeBlock val={val} label={label} big />
                    {idx < 2 && <span className="text-xl font-black text-[#D4372B]">:</span>}
                  </div>
                ))}
              </div>

              <Link
                href="/deals-du-jour"
                className="group flex items-center gap-2 rounded-md bg-[#D4372B] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#D4372B]/25 transition-all duration-300 hover:brightness-110 hover:shadow-xl"
              >
                Voir toutes les offres
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BLOCS PRODUITS ════════════════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-4 py-4 lg:px-8">
        {/* MOBILE */}
        <div className="grid grid-cols-2 gap-2 lg:hidden">
          <div className="rounded-md border border-border bg-card p-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-foreground">
                <Sparkles className="h-3 w-3 text-[#D4372B]" strokeWidth={2.25} />
                Sélection
              </h3>
              <span className="rounded-full bg-[#D4372B] px-1.5 py-0.5 text-[8px] font-bold text-white">Nouveau</span>
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

          <div className="rounded-md border border-border bg-card p-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-foreground">
                <Flame className="h-3 w-3 text-[#D4372B]" strokeWidth={2.25} />
                Best-sellers
              </h3>
              <span className="rounded-full bg-[#D4372B]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#D4372B]">
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
        <div className="hidden gap-3 lg:grid lg:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-[#D4372B]" strokeWidth={2.25} />
                Sélection du moment
              </h3>
              <span className="rounded-full bg-[#D4372B] px-2 py-0.5 text-[9px] font-bold text-white">Nouveau</span>
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

          <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-foreground">
                <Flame className="h-3.5 w-3.5 text-[#D4372B]" strokeWidth={2.25} />
                Meilleures ventes
              </h3>
              <span className="rounded-full bg-[#D4372B]/10 px-2 py-0.5 text-[9px] font-bold text-[#D4372B]">
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
    </div>
  )
}
