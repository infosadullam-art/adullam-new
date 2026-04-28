"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useState, useEffect, useRef, useCallback } from "react"

interface Product {
  id: string | number
  name: string
  price: number
  image: string
  badge?: string
  rank?: number | null
  rating?: number
  reviews?: number
  source?: string
  forYouScore?: number
  reason?: string
}

export default function ForYouPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stats, setStats] = useState({ predictions: 0, diversity: 0, trending: 0 })
  
  const loaderRef = useRef<HTMLDivElement | null>(null)

  // ✅ Initialiser sessionId
  useEffect(() => {
    let stored = localStorage.getItem('adullam_session_id')
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem('adullam_session_id', stored)
    }
    setSessionId(stored)
    document.cookie = `sessionId=${stored}; path=/; max-age=86400; SameSite=Lax`
  }, [])

  // ✅ Charger les recommandations avec pagination
  const fetchRecommendations = useCallback(async (pageToLoad: number) => {
    if (!sessionId || isLoading || !hasMore) return
    
    setIsLoading(true)
    try {
      const seenIds = products.map(p => p.id).join(',')
      let url = `/api/graph/recommendations/for-you?page=${pageToLoad}&limit=24&sessionId=${sessionId}`
      if (seenIds) url += `&seenIds=${seenIds}`
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success && data.data) {
        const newProducts = data.data.map((p: any) => ({
          id: p.id,
          name: p.name || p.title || 'Produit',
          price: p.priceUSD || p.price || 0,
          image: p.image || '/placeholder.jpg',
          source: p.source,
          forYouScore: p.forYouScore || p.score || 0.5,
          reason: p.reason,
          rating: p.rating || 4.5,
          reviews: p.reviews || 0
        }))
        
        // Éviter les doublons
        const existingIds = new Set(products.map(p => p.id))
        const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id))
        
        if (uniqueNewProducts.length === 0) {
          setHasMore(false)
        } else {
          setProducts(prev => [...prev, ...uniqueNewProducts])
          
          // Mettre à jour les stats
          const predictions = data.data.filter((p: any) => p.type === 'prediction').length
          const diversity = data.data.filter((p: any) => p.type === 'diversity').length
          const trending = data.data.filter((p: any) => p.type === 'trending').length
          setStats(prev => ({
            predictions: prev.predictions + predictions,
            diversity: prev.diversity + diversity,
            trending: prev.trending + trending
          }))
        }
        
        setHasMore(data.meta?.hasMore ?? false)
        if (data.meta?.hasMore) {
          setPage(pageToLoad + 1)
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement for-you:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, isLoading, hasMore, products])

  // ✅ Chargement initial
  useEffect(() => {
    if (sessionId && products.length === 0) {
      fetchRecommendations(1)
    }
  }, [sessionId, fetchRecommendations, products.length])

  // ✅ Scroll infini
  useEffect(() => {
    if (!hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && hasMore) {
          fetchRecommendations(page)
        }
      },
      { threshold: 0, rootMargin: "500px" }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [page, hasMore, isLoading, fetchRecommendations])

  // Badge de score
  const getScoreBadge = (score: number) => {
    if (score > 0.9) return { text: 'Match parfait', color: 'bg-green-100 text-green-700' }
    if (score > 0.8) return { text: 'Excellent', color: 'bg-emerald-100 text-emerald-700' }
    if (score > 0.7) return { text: 'Très bon', color: 'bg-blue-100 text-blue-700' }
    return null
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
              <Sparkles className="w-10 h-10 mb-4 animate-pulse" />
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">For You</h1>
              <p className="text-xl mb-6 max-w-2xl opacity-90">Recommandations personnalisées</p>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
              <Sparkles className="w-10 h-10 mb-4" />
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">For You</h1>
              <p className="text-xl mb-6 max-w-2xl">Recommandations personnalisées</p>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 text-center">
            <p className="text-gray-500">Aucune recommandation pour le moment</p>
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <Sparkles className="w-10 h-10 mb-4 animate-pulse" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">For You</h1>
            <p className="text-xl mb-6 max-w-2xl opacity-90">Recommandations personnalisées basées sur vos préférences</p>
            
            {(stats.predictions + stats.diversity + stats.trending) > 0 && (
              <div className="flex flex-wrap gap-3">
                {stats.predictions > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
                    <span className="font-semibold">{stats.predictions}</span>
                    <span className="ml-1 text-white/70">prédictions</span>
                  </div>
                )}
                {stats.diversity > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
                    <span className="font-semibold">{stats.diversity}</span>
                    <span className="ml-1 text-white/70">découvertes</span>
                  </div>
                )}
                {stats.trending > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
                    <span className="font-semibold">{stats.trending}</span>
                    <span className="ml-1 text-white/70">tendances</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recommandé pour vous</h2>
              <p className="text-sm text-gray-500 mt-1">
                {products.length} articles • mise à jour en continu
              </p>
            </div>
            {stats.predictions > 0 && (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-purple-400 animate-pulse"></span>
                IA active
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
            {products.map((product) => {
              const scoreBadge = getScoreBadge(product.forYouScore || 0)
              
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-neutral-light relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform"
                    />
                    
                    {product.source === 'als' && scoreBadge && (
                      <div className={`absolute top-2 right-2 ${scoreBadge.color} text-xs font-bold px-1.5 py-0.5 rounded-full`}>
                        {Math.round((product.forYouScore || 0.5) * 100)}%
                      </div>
                    )}
                    {(product.source === 'session_graph' || product.source === 'session') && (
                      <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Pour vous
                      </div>
                    )}
                    {product.source === 'trend' && (
                      <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Tendance
                      </div>
                    )}
                    {product.source === 'new' && (
                      <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Nouveau
                      </div>
                    )}
                    {product.source === 'random' && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Découverte
                      </div>
                    )}
                    {product.source === 'popular' && (
                      <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Populaire
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 text-gray-800">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
                    </div>
                    <span className="text-brand font-bold text-sm">{formatPrice(product.price)}</span>
                    {product.reason && (
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{product.reason}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Loader pour scroll infini */}
          <div ref={loaderRef} className="flex justify-center py-8">
            {isLoading && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 border border-gray-200 rounded-full" />
                  <div className="absolute top-0 left-0 w-8 h-8 border border-purple-400 rounded-full border-t-transparent animate-spin" />
                </div>
                <span className="text-sm text-gray-400">Chargement...</span>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-sm text-gray-400">{products.length} recommandations</p>
            )}
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