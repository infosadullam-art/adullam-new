"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Zap, Timer, Star, Sparkles } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Couleurs de la charte
const brandColor = "#D4372B"
const bgGray = "#FAFAFA"
const surfaceGray = "#F4F4F4"
const textPrimary = "#0A0A0A"
const textSecondary = "#AAAAAA"
const borderColor = "#ECECEC"

export default function OffresSpecialesPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<any[]>([])
  const [flashSale, setFlashSale] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await fetch('/api/deals/flash-sales/current')
        const data = await res.json()
        if (data.success && data.hasActiveSale) {
          setFlashSale(data.sale)
          setTimeLeft(data.timeLeft)
        }
      } catch (error) {
        console.error('Erreur flash sale:', error)
      }
    }
    fetchFlashSale()

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/deals/flash-sales?limit=48')
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <div className="min-h-screen" style={{ background: bgGray }}>
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        {/* Hero Banner */}
        <div style={{ background: textPrimary }}>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: brandColor }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(22px, 4vw, 36px)",
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  Offres Spéciales
                </h1>
                <p style={{ fontSize: "13px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                  Prix imbattables et quantités limitées
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-3 mt-4 px-4 py-2 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)" }}>
              <Timer className="w-4 h-4" style={{ color: textSecondary }} />
              <span className="text-sm font-medium" style={{ color: "#fff" }}>Se termine dans :</span>
              <div className="flex gap-1">
                <div className="rounded-lg px-2 py-0.5 text-center min-w-[40px]" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="text-xl font-bold text-white">{formatNumber(timeLeft.hours)}</div>
                  <div className="text-[8px]" style={{ color: textSecondary }}>Heures</div>
                </div>
                <span className="text-xl font-bold text-white self-center">:</span>
                <div className="rounded-lg px-2 py-0.5 text-center min-w-[40px]" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="text-xl font-bold text-white">{formatNumber(timeLeft.minutes)}</div>
                  <div className="text-[8px]" style={{ color: textSecondary }}>Minutes</div>
                </div>
                <span className="text-xl font-bold text-white self-center">:</span>
                <div className="rounded-lg px-2 py-0.5 text-center min-w-[40px]" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="text-xl font-bold text-white">{formatNumber(timeLeft.seconds)}</div>
                  <div className="text-[8px]" style={{ color: textSecondary }}>Secondes</div>
                </div>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {[
                { label: "Économies garanties", dot: "#22C55E" },
                { label: "Stock limité", dot: brandColor },
                { label: "Meilleurs prix", dot: "#F5A623" },
              ].map(({ label, dot }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
          
          {/* Header section */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: textPrimary,
                  letterSpacing: "-0.02em",
                }}
              >
                Ventes Flash
              </h2>
              <p style={{ fontSize: "12px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                Profitez des réductions avant la fin du timer
              </p>
            </div>
            {flashSale && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: surfaceGray, color: textPrimary }}
              >
                Jusqu'à -{flashSale.discount}%
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: textSecondary }}>Aucune offre spéciale pour le moment</p>
            </div>
          ) : (
            /* Grille produits */
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
              {products.map((product) => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square overflow-hidden mb-2.5 transition-all duration-200 group-hover:shadow-md"
                    style={{ borderRadius: "12px", background: "#fff", border: `0.5px solid ${borderColor}` }}
                  >
                    {/* Badge offre */}
                    {product.discount > 0 && (
                      <div
                        className="absolute top-2 right-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: brandColor, color: "#fff" }}
                      >
                        -{product.discount}%
                      </div>
                    )}
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Infos */}
                  <div className="space-y-1">
                    <h3
                      className="line-clamp-2"
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: textPrimary,
                        fontFamily: "'Poppins', sans-serif",
                        lineHeight: 1.4,
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* Étoiles */}
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
                        ))}
                      </div>
                      <span style={{ fontSize: "10px", color: textSecondary }}>
                        ({product.reviews || 0})
                      </span>
                    </div>

                    {/* Prix */}
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: brandColor,
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {formatPrice(product.price)}
                      </p>
                      {product.oldPrice && (
                        <p
                          className="text-xs line-through"
                          style={{ color: textSecondary }}
                        >
                          {formatPrice(product.oldPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}