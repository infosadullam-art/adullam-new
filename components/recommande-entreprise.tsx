"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Zap, ChevronRight } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Types
interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
  moq: number
}

export function RecommandeEntreprise() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Chargement des produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=10&sort=popular')
        const data = await res.json()
        
        let productsData: any[] = []
        if (data.data && Array.isArray(data.data)) {
          productsData = data.data
        } else if (data.products && Array.isArray(data.products)) {
          productsData = data.products
        }

        if (productsData.length > 0) {
          const formattedProducts = productsData.map((p: any) => ({
            id: p.id,
            name: p.title || p.name || "Produit",
            priceUSD: p.price || 0,
            image: p.images?.[0] || p.image || "/placeholder.jpg",
            moq: p.moq || Math.floor(Math.random() * 20) + 5
          }))
          
          setProducts(formattedProducts.slice(0, 8))
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Fonction pour faire défiler
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = 200
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Loading
  if (isLoading) {
    return (
      <section className="w-full bg-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2A44]" />
          </div>
        </div>
      </section>
    )
  }

  // Si pas de produits
  if (products.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITRE */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
            Recommandé pour votre entreprise
          </h2>
          <Link
            href="/catalogue/entreprise"
            className="text-sm text-gray-500 hover:text-[#0F2A44] flex items-center gap-1 transition-colors"
          >
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* BANDE BLEU NUIT */}
        <div className="bg-[#0F2A44] rounded-2xl p-6 lg:p-8 shadow-xl relative">
          
          {/* FLECHES DE NAVIGATION */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-full transition-all hidden lg:block"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-full transition-all hidden lg:block"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* FLEX ROW */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            
            {/* ZAP ICON + TITRE */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white whitespace-nowrap">
                Customisation rapide
              </h3>
            </div>

            {/* PRODUITS EN SLIDE */}
            <div className="flex-1 w-full lg:w-auto overflow-hidden">
              <div 
                ref={scrollRef}
                className="flex items-center gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex-shrink-0 w-[180px]"
                  >
                    <div className="bg-white rounded-xl border border-white/20 p-3 group-hover:border-white/40 group-hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                      
                      {/* IMAGE */}
                      <div className="relative aspect-square mb-2 bg-gray-50 rounded-lg overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* INFOS */}
                      <h4 className="text-xs font-medium text-gray-900 line-clamp-2 min-h-[32px]">
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(product.priceUSD)}
                        </p>
                        <p className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          MOQ: {product.moq}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STYLE POUR CACHER LA SCROLLBAR */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}