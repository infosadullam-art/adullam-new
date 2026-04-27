"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { TrendingUp, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

export default function MeilleuresVentesPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 24 // 8x3 lignes sur desktop

  useEffect(() => {
    const fetchBestSellers = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/best-sellers?page=${currentPage}&limit=${itemsPerPage}`)
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
          setTotalPages(data.meta.totalPages || 1)
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBestSellers()
  }, [currentPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
        {/* Hero */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <TrendingUp className="w-10 h-10 mb-4" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Meilleures Ventes</h1>
            <p className="text-xl mb-6 max-w-2xl">Les produits les plus populaires choisis par nos clients</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Top 100 des ventes</h2>
              <p className="text-muted-foreground">Mis à jour chaque heure</p>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} / {totalPages}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
            </div>
          ) : (
            <>
              {/* Grid: 2 colonnes mobile, 8 colonnes desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-8 gap-3 lg:gap-4">
                {products.map((product, idx) => (
                  <a
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-neutral-light relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                      {/* Badge rang pour top 3 */}
                      {product.rank <= 3 && (
                        <div className="absolute top-1 left-1 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                          {product.rank === 1 && "🥇"}
                          {product.rank === 2 && "🥈"}
                          {product.rank === 3 && "🥉"}
                        </div>
                      )}
                    </div>
                    <div className="p-2 lg:p-3">
                      <h3 className="font-medium text-xs lg:text-sm mb-1 line-clamp-2 text-gray-800">{product.name}</h3>
                      <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 lg:w-3 lg:h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-[10px] lg:text-xs text-gray-400 ml-1">({product.reviews})</span>
                      </div>
                      <span className="text-brand font-bold text-xs lg:text-sm">{formatPrice(product.price)}</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 lg:mt-12">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-1 lg:gap-2">
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
                          className={`min-w-[32px] h-8 lg:min-w-[40px] lg:h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-brand text-white'
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
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
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