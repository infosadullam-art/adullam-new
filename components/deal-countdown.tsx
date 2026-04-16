"use client"

import { useState, useEffect } from "react"
import { Clock, Zap, ArrowRight } from "lucide-react"
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
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [hasFlashSale, setHasFlashSale] = useState(false)
  const [flashSaleData, setFlashSaleData] = useState<FlashSaleData | null>(null)
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { formatPrice } = useCurrencyFormatter()

  // Couleurs de la marque
  const brandColor = "#2B4F3C"
  const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)"
  const brandLight = "#E8F3E8"
  const brandHover = "#1E3A2C"

  // ✅ APPEL AUX 3 APIs SPÉCIFIQUES
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔄 Chargement des données...')
        
        // Appels parallèles aux 3 APIs (6 produits pour desktop)
        const [featuredRes, bestSellersRes, flashSaleRes] = await Promise.all([
          fetch('/api/deals/featured?limit=6'),
          fetch('/api/deals/best-sellers?limit=6'),
          fetch('/api/deals/flash-sales/current')
        ])
        
        // Traitement des réponses
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json()
          console.log('✅ Featured:', featuredData)
          if (featuredData.success && featuredData.data) {
            const formatted = featuredData.data.map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              price: p.price,
              image: p.image || '/placeholder.jpg',
              badge: p.badge
            }))
            setFeaturedProducts(formatted)
          }
        } else {
          console.warn('⚠️ API featured non disponible')
        }

        if (bestSellersRes.ok) {
          const bestSellersData = await bestSellersRes.json()
          console.log('✅ Best-sellers:', bestSellersData)
          if (bestSellersData.success && bestSellersData.data) {
            const formatted = bestSellersData.data.map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              price: p.price,
              image: p.image || '/placeholder.jpg',
              badge: p.badge || (p.purchaseCount > 1000 ? '🔥 Best-seller' : undefined)
            }))
            setBestSellers(formatted)
          }
        } else {
          console.warn('⚠️ API best-sellers non disponible')
        }

        if (flashSaleRes.ok) {
          const flashSaleData = await flashSaleRes.json()
          console.log('✅ Flash sale:', flashSaleData)
          if (flashSaleData.success) {
            setFlashSaleData(flashSaleData)
            setHasFlashSale(flashSaleData.hasActiveSale)
            if (flashSaleData.hasActiveSale) {
              setTimeLeft(flashSaleData.timeLeft)
            }
          }
        } else {
          console.warn('⚠️ API flash-sales non disponible')
        }

      } catch (err) {
        console.error('❌ Erreur:', err)
        setError('Impossible de charger les offres')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // ✅ Timer countdown (seulement si flash sale active)
  useEffect(() => {
    if (!hasFlashSale) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasFlashSale])

  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  // ✅ ProductCard
  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100">
        <div className="relative aspect-square bg-white w-full max-w-[150px] mx-auto">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name || "Produit"}
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span 
              className="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded text-white"
              style={{ background: brandGradient }}
            >
              {product.badge}
            </span>
          )}
        </div>
        <div className="p-2 lg:p-3 text-center">
          <h3 className="text-xs lg:text-sm font-medium text-gray-800 truncate mb-1 group-hover:text-[#2B4F3C] transition-colors font-poppins">
            {product.name || "Produit"}
          </h3>
          <span className="text-sm lg:text-base font-bold text-orange-600 font-poppins">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  )

  // Loading
  if (isLoading) {
    return (
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }} />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white font-poppins">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-4">
          {/* Mobile - inchangé */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: brandLight }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: brandColor }} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 font-poppins">Offres éclair</h3>
                  <p className="text-[10px] text-gray-500 font-poppins">Jusqu'à -50%</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: brandLight }}>
                <Clock className="w-3 h-3" style={{ color: brandColor }} />
                <span className="text-[10px] text-gray-600 font-poppins">Fin dans</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="px-2 py-1 rounded-md min-w-[45px] text-center" style={{ background: brandLight }}>
                  <span className="text-sm font-bold font-poppins" style={{ color: brandColor }}>{formatNumber(timeLeft.hours)}</span>
                  <span className="text-[8px] text-gray-500 ml-0.5 font-poppins">h</span>
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <div className="px-2 py-1 rounded-md min-w-[45px] text-center" style={{ background: brandLight }}>
                  <span className="text-sm font-bold font-poppins" style={{ color: brandColor }}>{formatNumber(timeLeft.minutes)}</span>
                  <span className="text-[8px] text-gray-500 ml-0.5 font-poppins">m</span>
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <div className="px-2 py-1 rounded-md min-w-[45px] text-center" style={{ background: brandLight }}>
                  <span className="text-sm font-bold font-poppins" style={{ color: brandColor }}>{formatNumber(timeLeft.seconds)}</span>
                  <span className="text-[8px] text-gray-500 ml-0.5 font-poppins">s</span>
                </div>
              </div>
              <Link 
                href="/deals-du-jour" 
                className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80 font-poppins"
                style={{ color: brandColor }}
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Desktop - inchangé */}
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
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-poppins">Fin dans</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="px-3 py-2 rounded-lg min-w-[70px] text-center" style={{ background: brandLight }}>
                    <span className="text-xl font-bold font-poppins" style={{ color: brandColor }}>{formatNumber(timeLeft.hours)}</span>
                    <span className="text-xs text-gray-500 ml-1 font-poppins">h</span>
                  </div>
                  <span className="text-gray-300 text-xl">:</span>
                  <div className="px-3 py-2 rounded-lg min-w-[70px] text-center" style={{ background: brandLight }}>
                    <span className="text-xl font-bold font-poppins" style={{ color: brandColor }}>{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-xs text-gray-500 ml-1 font-poppins">m</span>
                  </div>
                  <span className="text-gray-300 text-xl">:</span>
                  <div className="px-3 py-2 rounded-lg min-w-[70px] text-center" style={{ background: brandLight }}>
                    <span className="text-xl font-bold font-poppins" style={{ color: brandColor }}>{formatNumber(timeLeft.seconds)}</span>
                    <span className="text-xs text-gray-500 ml-1 font-poppins">s</span>
                  </div>
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

      {/* Produits */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
        {/* Mobile: 2 colonnes, Desktop: 2 blocs côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
          
          {/* Bloc 1 - Sélection du moment */}
          <div className="rounded-xl p-3 lg:p-4 transition-all hover:shadow-md" style={{ background: brandLight }}>
            <h3 className="text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-3 lg:mb-4 font-poppins" style={{ color: brandColor }}>
              Sélection du moment
            </h3>
            {featuredProducts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 font-poppins">Aucun produit disponible</p>
            ) : (
              <>
                {/* Mobile: 2 colonnes (garder l'original) */}
                <div className="grid grid-cols-2 gap-2 lg:hidden">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Desktop: 3 colonnes (6 produits) */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-3">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bloc 2 - Meilleures ventes */}
          <div className="rounded-xl p-3 lg:p-4 transition-all hover:shadow-md" style={{ background: brandLight }}>
            <h3 className="text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-3 lg:mb-4 font-poppins" style={{ color: brandColor }}>
              Meilleures ventes
            </h3>
            {bestSellers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 font-poppins">Aucun produit disponible</p>
            ) : (
              <>
                {/* Mobile: 2 colonnes (garder l'original) */}
                <div className="grid grid-cols-2 gap-2 lg:hidden">
                  {bestSellers.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Desktop: 3 colonnes (6 produits) */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-3">
                  {bestSellers.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}