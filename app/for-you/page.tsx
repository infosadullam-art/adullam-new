"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

export default function ForYouPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stats, setStats] = useState({ predictions: 0, diversity: 0, trending: 0 })
  const itemsPerPage = 48

  useEffect(() => {
    let stored = localStorage.getItem('adullam_session_id')
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem('adullam_session_id', stored)
    }
    setSessionId(stored)
    document.cookie = `sessionId=${stored}; path=/; max-age=86400; SameSite=Lax`
  }, [])

  useEffect(() => {
    const fetchForYou = async () => {
      if (!sessionId) return
      
      setIsLoading(true)
      try {
        const res = await fetch(`/api/graph/recommendations/for-you?page=${currentPage}&limit=${itemsPerPage}&sessionId=${sessionId}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          const predictions = data.data.filter((p: any) => p.type === 'prediction').length
          const diversity = data.data.filter((p: any) => p.type === 'diversity').length
          const trending = data.data.filter((p: any) => p.type === 'trending').length
          
          setStats({ predictions, diversity, trending })
          
          const formattedProducts = data.data.map((p: any) => ({
            id: p.id,
            name: p.name || p.title || 'Produit',
            price: p.priceUSD || p.price || 0,
            image: p.image || '/placeholder.svg',
            source: p.source,
            forYouScore: p.forYouScore || p.score || 0.5,
            reason: p.reason,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0
          }))
          setProducts(formattedProducts)
          setTotalPages(data.meta?.totalPages || Math.ceil((data.meta?.total || 100) / itemsPerPage))
        }
      } catch (error) {
        console.error('Erreur chargement for-you:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForYou()
  }, [sessionId, currentPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getScoreBadge = (score: number) => {
    if (score > 0.9) return { text: 'Match parfait', color: 'bg-green-100 text-green-700' }
    if (score > 0.8) return { text: 'Excellent', color: 'bg-emerald-100 text-emerald-700' }
    if (score > 0.7) return { text: 'Très bon', color: 'bg-blue-100 text-blue-700' }
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        {/* Hero épuré avec hauteur réduite */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
            <Sparkles className="w-8 h-8 mb-2 opacity-90" />
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">For You</h1>
            <p className="text-sm text-gray-300 max-w-2xl mb-3">Recommandations personnalisées basées sur vos préférences</p>
            
            {/* Stats en ligne */}
            {(stats.predictions + stats.diversity + stats.trending) > 0 && (
              <div className="flex flex-wrap gap-3">
                {stats.predictions > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
                    <span className="font-semibold">{stats.predictions}</span>
                    <span className="ml-1 text-white/70">prédictions</span>
                  </div>
                )}
                {stats.diversity > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
                    <span className="font-semibold">{stats.diversity}</span>
                    <span className="ml-1 text-white/70">découvertes</span>
                  </div>
                )}
                {stats.trending > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
                    <span className="font-semibold">{stats.trending}</span>
                    <span className="ml-1 text-white/70">tendances</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recommandé pour vous</h2>
              <p className="text-sm text-gray-500">Mis à jour en temps réel</p>
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} / {totalPages}
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
                {products.map((product) => {
                  const scoreBadge = getScoreBadge(product.forYouScore || 0)
                  
                  return (
                    <a
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group"
                    >
                      <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square relative mb-3 group-hover:shadow-md transition-shadow">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm line-clamp-2 text-gray-800 group-hover:text-gray-900">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">({product.reviews})</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                        {product.reason && (
                          <p className="text-[10px] text-gray-400 line-clamp-1">{product.reason}</p>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-gray-900 text-white'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </>
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