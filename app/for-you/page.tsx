"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { useApi } from "@/hooks/useApi"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface Product {
  id: string
  name: string
  title?: string
  priceUSD: number
  image: string
  status: string
  rating?: number
  reviews?: number
  forYouScore?: number
  reason?: string
  type?: 'prediction' | 'diversity' | 'trending'
}

export default function ForYouPage() {
  const { formatPrice } = useCurrencyFormatter()
  const { fetchWithAuth } = useApi()
  
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    predictions: 0,
    diversity: 0,
    trending: 0
  })
  
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const viewedProducts = useRef<Set<string>>(new Set())
  const sessionId = useRef<string>(crypto.randomUUID())

  // ✅ TRACKER UNE INTERACTION
  const trackInteraction = useCallback(async (
    productId: string, 
    type: 'VIEW' | 'CLICK',
    metadata?: any
  ) => {
    try {
      const product = products.find(p => p.id === productId)
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type,
          context: 'FOR_YOU',
          sessionId: sessionId.current,
          page: 'for-you-page',
          metadata: {
            ...metadata,
            page,
            forYouScore: product?.forYouScore,
            recommendationType: product?.type,
            reason: product?.reason
          }
        })
      })
    } catch (err) {
      console.error('❌ Erreur tracking:', err)
    }
  }, [page, products])

  // ✅ TRACKER LES VUES
  useEffect(() => {
    if (!products.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const productId = entry.target.getAttribute('data-product-id')
            if (productId && !viewedProducts.current.has(productId)) {
              viewedProducts.current.add(productId)
              trackInteraction(productId, 'VIEW')
            }
          }
        })
      },
      { threshold: 0.3, rootMargin: "50px" }
    )

    document.querySelectorAll('[data-product-id]').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [products, trackInteraction])

  // ✅ CHARGER LES RECOMMANDATIONS
  const fetchForYou = useCallback(async (pageToLoad: number) => {
    if (isLoading || !hasMore) return
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    setIsLoading(true)
    setError(null)

    try {
      const seenIds = products.map(p => p.id).join(',')
      
      let url = `/api/graph/recommendations/for-you?page=${pageToLoad}&limit=24`
      if (seenIds) {
        url += `&seenIds=${seenIds}`
      }
      
      console.log(`🔍 Fetch page ${pageToLoad} pour For You page`)
      
      const res = await fetchWithAuth(url, {
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        if (res.status === 401) {
          setHasMore(false)
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()

      if (!json.success || !Array.isArray(json.data)) {
        setHasMore(false)
        return
      }

      const predictionCount = json.data.filter((p: any) => p.type === 'prediction').length
      const diversityCount = json.data.filter((p: any) => p.type === 'diversity').length
      const trendingCount = json.data.filter((p: any) => p.type === 'trending').length
      
      console.log(`📊 Page ${pageToLoad}: ${predictionCount} prédictions, ${diversityCount} diversité, ${trendingCount} tendances`)
      
      setStats(prev => ({
        predictions: prev.predictions + predictionCount,
        diversity: prev.diversity + diversityCount,
        trending: prev.trending + trendingCount
      }))

      const newProducts = json.data.map((p: any) => ({
        id: p.id,
        name: p.name || p.title || 'Produit',
        title: p.title || p.name || 'Produit',
        priceUSD: typeof p.priceUSD === 'number' ? p.priceUSD : 0,
        image: p.image || '/placeholder.svg',
        status: p.status || 'ACTIVE',
        rating: p.rating || 4.5,
        reviews: p.reviews || Math.floor(Math.random() * 200) + 50,
        forYouScore: p.forYouScore || p.score || 0.5,
        reason: p.reason || generateReason(p.forYouScore || 0, p.type),
        type: p.type || 'prediction'
      }))

      const existingIds = new Set(products.map(p => p.id))
      const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id))

      if (uniqueNewProducts.length === 0) {
        console.log('⚠️ Plus de nouveaux produits')
        setHasMore(false)
        setIsLoading(false)
        setInitialized(true)
        abortControllerRef.current = null
        return
      }

      setProducts(prev => [...prev, ...uniqueNewProducts])

      setHasMore(json.meta?.hasMore ?? false)
      if (json.meta?.hasMore) {
        setPage(pageToLoad + 1)
      }

    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error("❌ Erreur Graph:", err)
      setError(err.message)
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setInitialized(true)
    }
  }, [isLoading, hasMore, products, fetchWithAuth])

  const generateReason = (score: number, type?: string): string => {
    if (type === 'diversity') return "Découverte"
    if (type === 'trending') return "Tendance"
    if (score > 0.9) return "Recommandé"
    if (score > 0.8) return "Pour vous"
    if (score > 0.7) return "Populaire"
    if (score > 0.6) return "Similaire"
    return "Nouveau"
  }

  const handleProductClick = (productId: string) => {
    trackInteraction(productId, 'CLICK')
  }

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    fetchForYou(1)
  }, [])

  // ✅ SCROLL INFINI
  useEffect(() => {
    if (!initialized || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && hasMore) {
          fetchForYou(page)
        }
      },
      { 
        threshold: 0,
        rootMargin: "500px"
      }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [page, initialized, hasMore, isLoading, fetchForYou])

  // Badge de score
  const getScoreBadge = (score: number) => {
    if (score > 0.9) return { text: 'Match parfait', color: 'bg-green-100 text-green-700' }
    if (score > 0.8) return { text: 'Excellent', color: 'bg-emerald-100 text-emerald-700' }
    if (score > 0.7) return { text: 'Très bon', color: 'bg-blue-100 text-blue-700' }
    if (score > 0.6) return { text: 'Bon', color: 'bg-indigo-100 text-indigo-700' }
    return null
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
        {/* Hero avec stats */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <Sparkles className="w-10 h-10 mb-4 animate-pulse" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">For You</h1>
            <p className="text-xl mb-6 max-w-2xl opacity-90">
              Recommandations personnalisées basées sur vos préférences
            </p>
            
            {/* Stats en temps réel */}
            {stats.predictions + stats.diversity + stats.trending > 0 && (
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="font-semibold">{stats.predictions}</span>
                  <span className="ml-2 text-white/70">prédictions</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="font-semibold">{stats.diversity}</span>
                  <span className="ml-2 text-white/70">découvertes</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="font-semibold">{stats.trending}</span>
                  <span className="ml-2 text-white/70">tendances</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          {/* En-tête dynamique */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recommandé pour vous
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {products.length} articles • mise à jour en temps réel
              </p>
            </div>
            {stats.predictions > 0 && (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-purple-400 animate-pulse"></span>
                IA active
              </div>
            )}
          </div>

          {error && (
            <div className="text-center py-8 text-red-400 bg-red-50 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Grille produits */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => {
              const scoreBadge = getScoreBadge(product.forYouScore || 0)
              
              return (
                <div
                  key={product.id}
                  data-product-id={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
                >
                  {/* Badge de score */}
                  {product.forYouScore && product.forYouScore > 0.7 && (
                    <span className={`absolute top-2 left-2 z-10 text-xs font-medium px-2 py-1 rounded-full ${scoreBadge?.color}`}>
                      {scoreBadge?.text}
                    </span>
                  )}

                  {/* Badge de type */}
                  {product.type === 'diversity' && (
                    <span className="absolute top-2 right-2 z-10 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full border border-purple-200">
                      Découverte
                    </span>
                  )}
                  {product.type === 'trending' && (
                    <span className="absolute top-2 right-2 z-10 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full border border-blue-200">
                      Tendance
                    </span>
                  )}
                  {product.type === 'prediction' && product.forYouScore && product.forYouScore > 0.8 && (
                    <span className="absolute top-2 right-2 z-10 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full border border-amber-200">
                      {Math.round(product.forYouScore * 100)}%
                    </span>
                  )}

                  {/* Image */}
                  <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                    <Image
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Contenu */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 text-gray-900">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({product.reviews || 0})
                      </span>
                    </div>

                    {/* Prix */}
                    <span className="text-brand font-bold">
                      {formatPrice(product.priceUSD)}
                    </span>

                    {/* Raison (pour mobile) */}
                    {product.reason && (
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                        {product.reason}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Loader infini */}
          <div ref={loaderRef} className="flex justify-center py-8">
            {isLoading && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 border border-gray-200 rounded-full" />
                  <div className="absolute top-0 left-0 w-8 h-8 border border-purple-400 rounded-full border-t-transparent animate-spin" />
                </div>
                <span className="text-sm text-gray-400">Chargement des recommandations...</span>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-sm text-gray-300">
                {products.length} recommandations • fin de la liste
              </p>
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