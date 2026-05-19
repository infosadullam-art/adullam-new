"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { TrendingUp, Star, Zap, Clock, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useState, useEffect } from "react"

// Couleurs de la charte
const brandColor = "#D4372B"
const bgGray = "#FAFAFA"
const surfaceGray = "#F4F4F4"
const textPrimary = "#0A0A0A"
const textSecondary = "#AAAAAA"
const borderColor = "#ECECEC"

interface Product {
  id: string | number
  name: string
  price: number
  image: string
  badge?: string
  rank?: number | null
  rating?: number
  reviews?: number
}

export default function DealsDuJourPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('/api/deals/flash-sales?limit=24')
        const data = await res.json()
        
        if (data.success && data.data) {
          const formattedProducts = data.data.map((p: any, index: number) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image || '/placeholder.jpg',
            badge: p.discount ? `-${p.discount}%` : undefined,
            rank: index < 3 ? index + 1 : null,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0
          }))
          setProducts(formattedProducts)
        }
      } catch (error) {
        console.error('❌ Erreur chargement deals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeals()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: bgGray }}>
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div style={{ background: textPrimary }}>
            <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: brandColor }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold mb-1" style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.03em" }}>
                    Deals du jour
                  </h1>
                  <p className="text-sm" style={{ color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                    Profitez des meilleures offres sélectionnées pour vous aujourd'hui
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }} />
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: bgGray }}>
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div style={{ background: textPrimary }}>
            <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: brandColor }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold mb-1" style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.03em" }}>
                    Deals du jour
                  </h1>
                  <p className="text-sm" style={{ color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                    Profitez des meilleures offres sélectionnées pour vous aujourd'hui
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 text-center">
            <p className="text-sm" style={{ color: textSecondary }}>Aucune offre disponible pour le moment</p>
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

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
                <TrendingUp className="w-5 h-5 text-white" />
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
                  Deals du jour
                </h1>
                <p style={{ fontSize: "13px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                  Profitez des meilleures offres sélectionnées pour vous aujourd'hui
                </p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {[
                { label: "Offres limitées", dot: brandColor },
                { label: "Livraison rapide", dot: "#22C55E" },
                { label: "Paiement sécurisé", dot: "#2D9CDB" },
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
                Offres du jour
              </h2>
              <p style={{ fontSize: "12px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                {products.length} produits en promotion
              </p>
            </div>
          </div>

          {/* Grille produits */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block"
              >
                {/* Image */}
                <div
                  className="relative aspect-square overflow-hidden mb-2.5 transition-all duration-200 group-hover:shadow-md"
                  style={{ borderRadius: "12px", background: "#fff", border: `0.5px solid ${borderColor}` }}
                >
                  {/* Rang badge — top 3 */}
                  {product.rank && product.rank <= 3 && (
                    <span
                      className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                      style={{
                        background: product.rank === 1 ? "#F5A623" : product.rank === 2 ? "#AAAAAA" : "#CD7F32",
                      }}
                    >
                      {product.rank}
                    </span>
                  )}
                  
                  {/* Badge offre */}
                  {product.badge && (
                    <div
                      className="absolute top-2 right-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: brandColor, color: "#fff" }}
                    >
                      {product.badge}
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
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Prix */}
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}