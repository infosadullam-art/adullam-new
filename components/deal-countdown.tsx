"use client"

import { useState, useEffect } from "react"
import { Zap, ArrowRight, Clock, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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

  const brandColor    = "#0A0A0A"
  const brandAccent   = "#D4372B"

  // Police Amazon Ember
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
        if (prev.hours > 0)   return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [hasFlashSale])

  const fmt = (n: number) => n.toString().padStart(2, "0")

  const ProductCard = ({ product, hideName = false }: { product: Product; hideName?: boolean }) => (
    <Link href={`/products/${product.id}`} className="group block">
      <div
        className="bg-white overflow-hidden transition-all duration-300 hover:shadow-md"
        style={{
          borderRadius: "4px",
          border: "0.5px solid #ECECEC",
        }}
      >
        <div className="relative w-full aspect-square bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5]">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name || "Produit"}
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span
              className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 text-white"
              style={{ background: "#D4372B", borderRadius: "3px" }}
            >
              {product.badge}
            </span>
          )}
        </div>

        <div className="px-2 py-2">
          {!hideName && (
            <p
              className="text-[11px] font-medium truncate mb-1"
              style={{ color: "#0A0A0A", fontFamily: amazonFont }}
            >
              {product.name || "Produit"}
            </p>
          )}
          <p
            className="text-[13px] font-bold"
            style={{ color: "#D4372B", fontFamily: amazonFont }}
          >
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
          <div className="animate-pulse flex justify-center items-center h-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#D4372B] border-t-transparent animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full" style={{ background: "#FAFAFA" }}>
        <div className="px-4 py-4 text-center">
          <p className="text-sm" style={{ color: "#D4372B", fontFamily: amazonFont }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ background: "#FAFAFA" }}>
      {/* ══ BLOC CHRONO ════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5 animate-pulse-slow"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${brandAccent} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        
        <div className="px-4 py-3 lg:px-8 lg:py-3">
          
          {/* VERSION MOBILE */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded"
                  style={{ background: `linear-gradient(135deg, ${brandAccent}, #B82D20)` }}
                >
                  <Zap className="w-4 h-4 text-white" fill="white" />
                </div>
                <div>
                  <p
                    className="text-sm font-black tracking-tight"
                    style={{ color: brandColor, fontFamily: amazonFont }}
                  >
                    FLASH SALE
                  </p>
                  <p
                    className="text-[10px] font-medium"
                    style={{ color: "#AAAAAA", fontFamily: amazonFont }}
                  >
                    jusqu'à -50%
                  </p>
                </div>
              </div>
              
              <Link
                href="/deals-du-jour"
                className="flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: brandAccent, fontFamily: amazonFont }}
              >
                Voir tout
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ECECEC]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" style={{ color: "#AAAAAA" }} />
                <span className="text-[10px] font-medium" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>
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
                      className="flex flex-col items-center justify-center min-w-[38px] px-1.5 py-1 rounded"
                      style={{
                        background: brandColor,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      <span
                        className="text-sm font-black leading-none tracking-tight"
                        style={{ color: "#fff", fontFamily: amazonFont }}
                      >
                        {fmt(val)}
                      </span>
                      <span
                        className="text-[7px] font-medium leading-none mt-0.5"
                        style={{ color: "rgba(255,255,255,0.6)", fontFamily: amazonFont }}
                      >
                        {label}
                      </span>
                    </div>
                    {label !== "s" && (
                      <span className="text-sm font-bold" style={{ color: "#D4372B", fontFamily: amazonFont }}>:</span>
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
                className="flex items-center justify-center w-12 h-12 rounded"
                style={{
                  background: `linear-gradient(135deg, ${brandAccent}, #B82D20)`,
                  boxShadow: "0 4px 12px rgba(212,55,43,0.25)",
                }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="text-xl font-black tracking-tight"
                    style={{ color: brandColor, fontFamily: amazonFont, letterSpacing: "-0.03em" }}
                  >
                    FLASH SALE
                  </h2>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#FFF0F0", color: brandAccent, fontFamily: amazonFont }}
                  >
                    🔥 Limited
                  </span>
                </div>
                <p className="text-sm" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>
                  Jusqu'à -50% · Renouvellement quotidien
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: "#AAAAAA" }} />
                <span className="text-sm font-medium" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>
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
                      className="flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded"
                      style={{
                        background: brandColor,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      }}
                    >
                      <span
                        className="text-2xl font-black leading-none tracking-tight"
                        style={{ color: "#fff", fontFamily: amazonFont }}
                      >
                        {fmt(val)}
                      </span>
                      <span
                        className="text-[9px] font-semibold leading-none mt-1.5 tracking-wider"
                        style={{ color: "rgba(255,255,255,0.5)", fontFamily: amazonFont }}
                      >
                        {label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <span className="text-xl font-black" style={{ color: brandAccent, fontFamily: amazonFont }}>:</span>
                    )}
                  </div>
                ))}
              </div>

              <Link
                href="/deals-du-jour"
                className="group flex items-center gap-2 px-5 py-2.5 text-white rounded text-sm font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${brandAccent}, #B82D20)`,
                  fontFamily: amazonFont,
                  position: "relative",
                  zIndex: 10,
                }}
              >
                Voir toutes les offres
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BLOCS PRODUITS ════════════════════════════════════════ */}
      <div className="px-4 lg:px-8 py-3 lg:py-2">
        
        {/* MOBILE - fond blanc mais animation conservée */}
        <div className="grid grid-cols-2 gap-2 lg:hidden">
          
          <div 
            className="rounded p-2 transition-all duration-1000 ease-in-out"
            style={{ 
              background: "#fff",
              border: "0.5px solid #ECECEC",
              animation: "gradientShift 8s ease-in-out infinite",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider" style={{ color: brandColor, fontFamily: amazonFont, letterSpacing: "0.1em" }}>
                ✨ Sélection
              </h3>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: brandAccent, color: "#fff", fontFamily: amazonFont }}>
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
            className="rounded p-2 transition-all duration-1000 ease-in-out"
            style={{ 
              background: "#fff",
              border: "0.5px solid #ECECEC",
              animation: "gradientShift 8s ease-in-out infinite",
              animationDelay: "2s",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider" style={{ color: brandColor, fontFamily: amazonFont, letterSpacing: "0.1em" }}>
                🔥 Best-sellers
              </h3>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FFF0F0", color: brandAccent, fontFamily: amazonFont }}>
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

        {/* DESKTOP - garde le dégradé animé */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-2">
          
          <div 
            className="rounded p-4 transition-all duration-1000 ease-in-out"
            style={{ 
              background: "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)",
              border: "0.5px solid #ECECEC",
              animation: "gradientShift 8s ease-in-out infinite",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black uppercase tracking-wider" style={{ color: brandColor, fontFamily: amazonFont, letterSpacing: "0.1em" }}>
                ✨ Sélection du moment
              </h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: brandAccent, color: "#fff", fontFamily: amazonFont }}>
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
            className="rounded p-4 transition-all duration-1000 ease-in-out"
            style={{ 
              background: "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)",
              border: "0.5px solid #ECECEC",
              animation: "gradientShift 8s ease-in-out infinite",
              animationDelay: "2s",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black uppercase tracking-wider" style={{ color: brandColor, fontFamily: amazonFont, letterSpacing: "0.1em" }}>
                🔥 Meilleures ventes
              </h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF0F0", color: brandAccent, fontFamily: amazonFont }}>
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

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap');
        
        @font-face {
          font-family: 'Amazon Ember';
          src: url('https://fonts.cdnfonts.com/css/amazon-ember') format('woff2');
          font-weight: 100 900;
          font-style: normal;
        }
        
        @keyframes gradientShift {
          0% { background: #fff; }
          50% { background: #FFF5F5; }
          100% { background: #fff; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.12; }
        }
        
        .animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}