"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star, ChevronLeft, ChevronRight, TrendingUp, Compass, Zap } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { apiFetch } from "@/lib/api"

// Couleurs de la charte
const brandColor = "#D4372B"
const bgGray = "#FAFAFA"
const surfaceGray = "#F4F4F4"
const textPrimary = "#0A0A0A"
const textSecondary = "#AAAAAA"
const borderColor = "#ECECEC"

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
        const res = await apiFetch(`/api/graph/recommendations/for-you?page=${currentPage}&limit=${itemsPerPage}&sessionId=${sessionId}`)
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
    if (score > 0.9) return { text: 'Match parfait', color: '#22C55E', bg: '#E8F5E9' }
    if (score > 0.8) return { text: 'Excellent', color: '#2D9CDB', bg: '#E8F4FD' }
    if (score > 0.7) return { text: 'Très bon', color: brandColor, bg: '#FFF0F0' }
    return null
  }

  const getSourceBadge = (source: string, score?: number) => {
    const badges: Record<string, { text: string; color: string; bg: string }> = {
      'als': { text: `${Math.round((score || 0.5) * 100)}%`, color: '#22C55E', bg: '#E8F5E9' },
      'session_graph': { text: 'Pour vous', color: '#7B1FA2', bg: '#F3E5F5' },
      'session': { text: 'Pour vous', color: '#7B1FA2', bg: '#F3E5F5' },
      'trend': { text: 'Tendance', color: '#2D9CDB', bg: '#E8F4FD' },
      'new': { text: 'Nouveau', color: '#9B51E0', bg: '#F3E5F5' },
      'random': { text: 'Découverte', color: '#22C55E', bg: '#E8F5E9' },
      'popular': { text: 'Populaire', color: '#F5A623', bg: '#FFF8E1' }
    }
    return badges[source] || null
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
        {/* Hero Banner - Nouvelle charte */}
        <div style={{ background: textPrimary }}>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: brandColor }}
              >
                <Sparkles className="w-5 h-5 text-white" />
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
                  For You
                </h1>
                <p style={{ fontSize: "13px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                  Recommandations personnalisées basées sur vos préférences
                </p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {stats.predictions > 0 && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  <Zap className="w-3 h-3" style={{ color: "#F5A623" }} />
                  {stats.predictions} prédictions
                </span>
              )}
              {stats.diversity > 0 && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  <Compass className="w-3 h-3" style={{ color: "#22C55E" }} />
                  {stats.diversity} découvertes
                </span>
              )}
              {stats.trending > 0 && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  <TrendingUp className="w-3 h-3" style={{ color: "#2D9CDB" }} />
                  {stats.trending} tendances
                </span>
              )}
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
                Recommandé pour vous
              </h2>
              <p style={{ fontSize: "12px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                Mis à jour en temps réel
              </p>
            </div>
            {totalPages > 1 && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: surfaceGray, color: textPrimary }}
              >
                Page {currentPage} / {totalPages}
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }} />
            </div>
          ) : (
            <>
              {/* Grille produits */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
                {products.map((product) => {
                  const sourceBadge = getSourceBadge(product.source, product.forYouScore)
                  const scoreBadge = getScoreBadge(product.forYouScore || 0)
                  
                  return (
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
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Badge source */}
                        {sourceBadge && (
                          <div
                            className="absolute top-2 right-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: sourceBadge.bg, color: sourceBadge.color, border: `0.5px solid ${sourceBadge.color}30` }}
                          >
                            {sourceBadge.text}
                          </div>
                        )}
                        
                        {/* Score badge (ALS seulement) */}
                        {product.source === 'als' && scoreBadge && (
                          <div
                            className="absolute bottom-2 right-2 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: scoreBadge.bg, color: scoreBadge.color }}
                          >
                            {scoreBadge.text}
                          </div>
                        )}
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

                        {/* Raison */}
                        {product.reason && (
                          <p
                            className="line-clamp-1"
                            style={{ fontSize: "9px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}
                          >
                            {product.reason}
                          </p>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex justify-center items-center gap-2 mt-10 pt-5"
                  style={{ borderTop: `0.5px solid ${borderColor}` }}
                >
                  {/* Précédent */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ border: `0.5px solid ${borderColor}`, background: "#fff" }}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: textPrimary }} />
                  </button>

                  {/* Pages */}
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
                      
                      const isActive = currentPage === pageNum
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className="min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: isActive ? brandColor : "#fff",
                            color: isActive ? "#fff" : textPrimary,
                            border: isActive ? "none" : `0.5px solid ${borderColor}`,
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  {/* Suivant */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ border: `0.5px solid ${borderColor}`, background: "#fff" }}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: textPrimary }} />
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