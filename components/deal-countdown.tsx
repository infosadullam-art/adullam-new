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

  // ✅ APPEL AUX 3 APIs SPÉCIFIQUES
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔄 Chargement des données...')
        
        // Appels parallèles aux 3 APIs
        const [featuredRes, bestSellersRes, flashSaleRes] = await Promise.all([
          fetch('/api/deals/featured?limit=4'),
          fetch('/api/deals/best-sellers?limit=4'),
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

  // ✅ ProductCard avec URL corrigée
  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-50 w-full max-w-[150px] mx-auto">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name || "Produit"}
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-amber-400 text-[10px] font-medium px-1.5 py-0.5 rounded text-gray-900">
              {product.badge}
            </span>
          )}
        </div>
        <div className="p-2 lg:p-3 text-center">
          <h3 className="text-xs lg:text-sm font-medium text-gray-900 truncate mb-1">
            {product.name || "Produit"}
          </h3>
          <span className="text-sm lg:text-base font-bold text-gray-900">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
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
    <div className="w-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-4">
          {/* Mobile */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 p-1.5 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Offres éclair</h3>
                  <p className="text-[10px] text-gray-500">Jusqu'à -50%</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-600">Fin dans</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="bg-gray-50 px-2 py-1 rounded-md min-w-[45px] text-center">
                  <span className="text-sm font-bold text-gray-900">{formatNumber(timeLeft.hours)}</span>
                  <span className="text-[8px] text-gray-500 ml-0.5">h</span>
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <div className="bg-gray-50 px-2 py-1 rounded-md min-w-[45px] text-center">
                  <span className="text-sm font-bold text-gray-900">{formatNumber(timeLeft.minutes)}</span>
                  <span className="text-[8px] text-gray-500 ml-0.5">m</span>
                </div>
                <span className="text-gray-300 text-sm">:</span>
                <div className="bg-amber-50 px-2 py-1 rounded-md min-w-[45px] text-center">
                  <span className="text-sm font-bold text-amber-600">{formatNumber(timeLeft.seconds)}</span>
                  <span className="text-[8px] text-amber-500 ml-0.5">s</span>
                </div>
              </div>
              {/* CORRECTION ICI - redirection vers deals-du-jour */}
              <Link href="/deals-du-jour" className="flex items-center gap-1 text-xs font-medium text-gray-900">
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 p-2.5 rounded-xl">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Offres éclair</h2>
                <p className="text-sm text-gray-500">Jusqu'à -50% · Renouvellement quotidien</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Fin dans</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="bg-gray-50 px-3 py-2 rounded-lg min-w-[70px] text-center">
                    <span className="text-xl font-bold text-gray-900">{formatNumber(timeLeft.hours)}</span>
                    <span className="text-xs text-gray-500 ml-1">h</span>
                  </div>
                  <span className="text-gray-300 text-xl">:</span>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg min-w-[70px] text-center">
                    <span className="text-xl font-bold text-gray-900">{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-xs text-gray-500 ml-1">m</span>
                  </div>
                  <span className="text-gray-300 text-xl">:</span>
                  <div className="bg-amber-50 px-3 py-2 rounded-lg min-w-[70px] text-center">
                    <span className="text-xl font-bold text-amber-600">{formatNumber(timeLeft.seconds)}</span>
                    <span className="text-xs text-amber-500 ml-1">s</span>
                  </div>
                </div>
              </div>
              {/* CORRECTION ICI - redirection vers deals-du-jour */}
              <Link 
                href="/deals-du-jour" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
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
        <div className="grid grid-cols-2 gap-3 lg:gap-6">
          
          {/* Bloc 1 - Sélection du moment */}
          <div className="bg-gray-50 rounded-xl p-3 lg:p-4">
            <h3 className="text-[10px] lg:text-xs font-medium text-gray-500 mb-3 lg:mb-4 uppercase tracking-wider">
              Sélection du moment
            </h3>
            {featuredProducts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucun produit disponible</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Bloc 2 - Meilleures ventes */}
          <div className="bg-gray-100 rounded-xl p-3 lg:p-4">
            <h3 className="text-[10px] lg:text-xs font-medium text-gray-500 mb-3 lg:mb-4 uppercase tracking-wider">
              Meilleures ventes
            </h3>
            {bestSellers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucun produit disponible</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
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