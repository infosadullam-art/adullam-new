"use client"

import { ProductCard } from "@/components/product-card"
import { useEffect, useRef, useState, useCallback } from "react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useApi } from "@/hooks/useApi"

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
  status: string
  isSeed: boolean
  forYouScore?: number
  reason?: string
  source?: string
  category?: string
  type?: 'prediction' | 'diversity' | 'trending'
}

export function ForYouSection() {
  const { formatPrice } = useCurrencyFormatter()
  const { fetchWithAuth } = useApi()
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titleIndex, setTitleIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const observerRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const initialFetchDone = useRef(false)
  const viewedProducts = useRef<Set<string>>(new Set())
  
  const titles = [
    { main: "Suggestions", sub: "personnalisées pour vous" },
    { main: "Inspirations", sub: "rien que pour vous" },
    { main: "Découvertes", sub: "sélection du moment" },
    { main: "Recommandations", sub: "basées sur vos goûts" },
    { main: "Sélections", sub: "pour votre style" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ✅ Initialiser sessionId uniquement côté client
  useEffect(() => {
    // Récupérer depuis localStorage
    let stored = localStorage.getItem('adullam_session_id')
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem('adullam_session_id', stored)
      console.log(`🔍 [SESSION] Nouveau sessionId créé: ${stored}`)
    } else {
      console.log(`🔍 [SESSION] SessionId existant depuis localStorage: ${stored}`)
    }
    
    setSessionId(stored)
    
    // Sauvegarder dans un cookie pour le backend
    document.cookie = `sessionId=${stored}; path=/; max-age=86400; SameSite=Lax`
    console.log(`🍪 [SESSION] SessionId sauvegardé dans cookie: ${stored}`)
  }, [])

  // ✅ CORRECTION : Utiliser fetchWithAuth et envoyer sessionId
  const trackInteraction = useCallback(async (
    productId: string, 
    type: 'VIEW' | 'CLICK',
    metadata?: any
  ) => {
    if (!sessionId) {
      console.warn('⚠️ [TRACK] SessionId non encore initialisé, attente...')
      return
    }
    
    try {
      const product = products.find(p => p.id === productId)
      
      console.log(`📊 [TRACK] Envoi interaction: ${type} sur ${productId} - Session: ${sessionId}`)
      
      const res = await fetchWithAuth('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type,
          context: 'FOR_YOU',
          sessionId: sessionId,
          metadata: {
            ...metadata,
            page,
            forYouScore: product?.forYouScore,
            recommendationType: product?.type,
            source: product?.source,
            reason: product?.reason
          }
        })
      })
      
      if (!res.ok) {
        console.error(`❌ Erreur tracking ${type}:`, res.status)
      } else {
        console.log(`✅ [TRACK] ${type} envoyé pour ${productId}`)
      }
      
      if (type === 'CLICK' && product?.source === 'random') {
        console.log(`🎯 CLIQUÉ SUR DÉCOUVERTE: ${product.name}`)
      }
      
    } catch (err) {
      console.error('❌ Erreur tracking:', err)
    }
  }, [page, products, fetchWithAuth, sessionId])

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

  const generateReason = (score: number, source?: string, type?: string): string => {
    if (source === 'session_graph') return "Similaire à vos vues"
    if (source === 'session') return "Similaire à vos vues"
    if (source === 'als') return "Basé sur vos goûts"
    if (source === 'trend') return "Tendance de la semaine"
    if (source === 'new') return "Nouveauté"
    if (source === 'random') return "Pour varier les découvertes"
    if (source === 'popular') return "Populaire en ce moment"
    if (type === 'diversity') return "Découverte"
    if (type === 'trending') return "Tendance"
    if (score > 0.9) return "Recommandé"
    if (score > 0.8) return "Pour vous"
    if (score > 0.7) return "Populaire"
    if (score > 0.6) return "Similaire"
    return "Nouveau"
  }

  const fetchForYou = useCallback(async (pageToLoad: number) => {
    if (isLoading || !hasMore) return
    if (!sessionId) {
      console.warn('⚠️ [FOR-YOU] SessionId non encore initialisé, attente...')
      return
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    setIsLoading(true)
    setError(null)

    try {
      const seenIds = products.map(p => p.id).join(',')
      
      // ✅ CORRECTION: Ajouter sessionId dans l'URL
      let url = `/api/graph/recommendations/for-you?page=${pageToLoad}&limit=24&sessionId=${sessionId}`
      if (seenIds) {
        url += `&seenIds=${seenIds}`
      }
      
      console.log(`🔍 [FOR-YOU] Fetch page ${pageToLoad}, Session: ${sessionId}, URL: ${url}`)
      
      const res = await fetchWithAuth(url, {
        signal: abortControllerRef.current.signal,
      })

      console.log(`🔍 [FOR-YOU] Status: ${res.status}`)

      if (!res.ok) {
        if (res.status === 401) {
          setHasMore(false)
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()
      console.log(`🔍 [FOR-YOU] Réponse reçue: ${json.data?.length} produits`)

      if (!json.success || !Array.isArray(json.data)) {
        console.error("❌ Format invalide:", json)
        setHasMore(false)
        return
      }

      if (json.data.length === 0) {
        console.log("⚠️ Pas de produits reçus")
        setHasMore(false)
        setIsLoading(false)
        setInitialized(true)
        return
      }

      const predictionCount = json.data.filter((p: any) => p.type === 'prediction').length
      const diversityCount = json.data.filter((p: any) => p.type === 'diversity').length
      const trendingCount = json.data.filter((p: any) => p.type === 'trending').length
      
      console.log(`📊 Page ${pageToLoad}: ${predictionCount} prédictions, ${diversityCount} diversité, ${trendingCount} tendances`)

      const predictions = json.data.map((p: any) => ({
        id: p.id,
        name: p.name || p.title || 'Produit',
        priceUSD: typeof p.priceUSD === 'number' ? p.priceUSD : (p.price || 0),
        image: p.image || p.images?.[0] || '/placeholder.jpg',
        status: p.status || 'ACTIVE',
        isSeed: false,
        forYouScore: p.forYouScore || p.score || 0.5,
        reason: p.reason || generateReason(p.forYouScore || 0, p.source, p.type),
        source: p.source,
        category: p.category,
        type: p.type || 'diversity'
      }))

      const existingIds = new Set(products.map(p => p.id))
      const newProducts = predictions.filter((p: Product) => !existingIds.has(p.id))

      console.log(`🔍 Nouveaux produits: ${newProducts.length}`)

      if (newProducts.length === 0) {
        console.log('⚠️ Plus de nouveaux produits')
        setHasMore(false)
        setIsLoading(false)
        setInitialized(true)
        return
      }

      setProducts(prev => [...prev, ...newProducts])
      setHasMore(json.meta?.hasMore ?? false)
      
      if (json.meta?.hasMore) {
        setPage(pageToLoad + 1)
      }

    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error("❌ Erreur fetchForYou:", err)
      setError(err.message)
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setInitialized(true)
    }
  }, [isLoading, hasMore, products, fetchWithAuth, sessionId])

  const handleProductClick = (productId: string) => {
    trackInteraction(productId, 'CLICK')
  }

  useEffect(() => {
    if (!initialFetchDone.current && sessionId) {
      initialFetchDone.current = true
      fetchForYou(1)
    }
  }, [fetchForYou, sessionId])

  useEffect(() => {
    if (!initialized || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && hasMore) {
          console.log(`👀 Scroll vers page ${page}`)
          fetchForYou(page)
        }
      },
      { threshold: 0, rootMargin: "500px" }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [page, initialized, hasMore, isLoading, fetchForYou])

  // Créer des groupes de 6 produits
  const rows = []
  for (let i = 0; i < products.length; i += 6) {
    rows.push(products.slice(i, i + 6))
  }

  const bgColors = ["bg-gray-100", "bg-gray-200", "bg-gray-300"]

  // 🔥 AJOUT : Si pas de produits et pas de chargement, afficher un message
  if (!isLoading && products.length === 0 && !error) {
    return (
      <section className="w-full bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-400">Chargement des recommandations...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITRE DYNAMIQUE */}
        <div className="mb-8 relative">
          <div className="overflow-hidden">
            <h2 
              key={titleIndex}
              className="text-2xl lg:text-3xl font-light text-gray-900 transition-all duration-700 ease-in-out transform hover:scale-[1.02]"
            >
              {titles[titleIndex].main}{' '}
              <span className="font-medium text-amber-600 relative inline-block">
                {titles[titleIndex].sub}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></span>
              </span>
            </h2>
          </div>
          <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-amber-200 animate-pulse-slow"></div>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-amber-400 animate-pulse"></span>
            {products.length} articles • mise à jour en continu
          </p>
        </div>

        {/* GRILLE PRODUITS */}
        <div ref={scrollContainerRef} className="space-y-6">
          {error && (
            <div className="text-center py-8 text-red-400 text-sm">
              Erreur: {error}
            </div>
          )}

          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[0, 1, 2].map((blockIndex) => (
                <div key={blockIndex} className={`${bgColors[blockIndex]} rounded-xl p-4 transition-all duration-300 hover:shadow-md`}>
                  <div className="grid grid-cols-2 gap-3">
                    {row.slice(blockIndex * 2, blockIndex * 2 + 2).map((product) => (
                      <div 
                        key={product.id}
                        className="relative group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
                        data-product-id={product.id}
                        onClick={() => handleProductClick(product.id)}
                      >
                        {/* BADGE SESSION GRAPH */}
                        {(product.source === 'session_graph' || product.source === 'session') && (
                          <span className="absolute -top-2 -right-2 z-10 bg-indigo-100 text-indigo-700 text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-indigo-200 animate-pulse">
                            Pour vous
                          </span>
                        )}
                        
                        {/* BADGE ALS */}
                        {product.source === 'als' && (
                          <span className="absolute -top-2 -right-2 z-10 bg-amber-100 text-amber-700 text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-amber-200">
                            {Math.round((product.forYouScore || 0.5) * 100)}%
                          </span>
                        )}
                        
                        {/* BADGE TREND */}
                        {product.source === 'trend' && (
                          <span className="absolute -top-2 -right-2 z-10 bg-blue-100 text-blue-700 text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-blue-200">
                            Tendance
                          </span>
                        )}
                        
                        {/* BADGE NEW */}
                        {product.source === 'new' && (
                          <span className="absolute -top-2 -right-2 z-10 bg-purple-100 text-purple-700 text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-purple-200 animate-pulse">
                            Nouveau
                          </span>
                        )}
                        
                        {/* BADGE RANDOM */}
                        {product.source === 'random' && (
                          <span className="absolute -top-2 -right-2 z-10 bg-green-100 text-green-700 text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-green-200">
                            Découverte
                          </span>
                        )}
                        
                        {/* BADGE POPULAR */}
                        {product.source === 'popular' && (
                          <span className="absolute -top-2 -right-2 z-10 bg-orange-100 text-orange-700 text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-orange-200">
                            Populaire
                          </span>
                        )}
                        
                        {/* RAISON */}
                        {product.reason && (
                          <span className="absolute top-2 left-2 z-10 bg-white/80 text-gray-600 text-[7px] px-1.5 py-0.5 rounded-full border border-gray-200">
                            {product.reason}
                          </span>
                        )}
                        
                        <ProductCard 
                          product={{
                            id: product.id,
                            name: product.name,
                            priceUSD: product.priceUSD,
                            image: product.image
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* LOADER */}
          <div className="w-full">
            <div className="h-8"></div>
            <div ref={observerRef} className="flex justify-center py-4">
              {isLoading && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-6 h-6 border border-gray-200 rounded-full" />
                    <div className="absolute top-0 left-0 w-6 h-6 border border-amber-400 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <span className="text-xs text-gray-400">Chargement...</span>
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <p className="text-xs text-gray-300">
                  {products.length} suggestions
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}