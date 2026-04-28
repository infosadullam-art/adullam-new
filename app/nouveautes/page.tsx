"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

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
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
            <Sparkles className="w-8 h-8 mb-2 opacity-90" />
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">Nouveautés</h1>
            <p className="text-sm text-gray-300 max-w-2xl">Découvrez les derniers produits ajoutés à notre catalogue</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nouveaux produits</h2>
              <p className="text-sm text-gray-500">Ajoutés récemment</p>
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
                {products.map((product) => (
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
                      <div className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Nouveau
                      </div>
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
                    </div>
                  </a>
                ))}
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