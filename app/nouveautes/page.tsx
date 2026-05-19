"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Couleurs de la charte
const brandColor = "#D4372B"
const bgGray = "#FAFAFA"
const surfaceGray = "#F4F4F4"
const textPrimary = "#0A0A0A"
const textSecondary = "#AAAAAA"
const borderColor = "#ECECEC"

export default function NouveautesPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 48

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/new-arrivals?page=${currentPage}&limit=${itemsPerPage}`)
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
          setTotalPages(data.meta.totalPages || 1)
        }
      } catch (error) {
        console.error('Erreur chargement nouveautés:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNewArrivals()
  }, [currentPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
                  Nouveautés
                </h1>
                <p style={{ fontSize: "13px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                  Découvrez les derniers produits ajoutés à notre catalogue
                </p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {[
                { label: "Ajouts récents", dot: "#22C55E" },
                { label: "Tendances", dot: brandColor },
                { label: "Exclusivités", dot: "#F5A623" },
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
                Nouveaux produits
              </h2>
              <p style={{ fontSize: "12px", color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
                Ajoutés récemment
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
                      <div
                        className="absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#22C55E20", color: "#22C55E", border: `0.5px solid #22C55E30` }}
                      >
                        Nouveau
                      </div>
                      <Image
                        src={product.image}
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
                  </a>
                ))}
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