"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, TrendingUp } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
}

export function MeilleuresVentesMobile() {
  const { formatPrice } = useCurrencyFormatter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Chargement des vrais produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // === APPEL À LA NOUVELLE API ===
        const res = await fetch('/api/deals/best-sellers/mobile')
        const data = await res.json()
        
        if (data.success && data.data) {
          // Les données sont déjà formatées par l'API
          setProducts(data.data)
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  // Animation de scroll au chargement de la section
  useEffect(() => {
    if (!hasAnimated && scrollRef.current && products.length > 0) {
      setHasAnimated(true)
      
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollBy({ left: 150, behavior: "smooth" })
          
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollBy({ left: -150, behavior: "smooth" })
            }
          }, 800)
        }
      }, 500)
    }
  }, [hasAnimated, products])

  if (isLoading) {
    return (
      <section className="w-full bg-gray-50 py-[10px] lg:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-gray-50 py-[10px] lg:hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* EN-TÊTE SECTION */}
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Meilleures ventes
              </h2>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Glissez pour voir plus →
              </p>
            </div>
          </div>
          <Link
            href="/meilleures-ventes"
            className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-900"
          >
            Voir tout
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARROUSEL HORIZONTAL */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-[10px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block flex-shrink-0 w-[140px]"
            >
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden group-hover:border-gray-300 group-hover:shadow-md transition-all">
                
                {/* IMAGE */}
                <div className="relative aspect-square bg-gray-50 p-3">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={140}
                    height={140}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* INFOS */}
                <div className="p-2">
                  <h3 className="text-xs font-medium text-gray-900 truncate">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formatPrice(product.priceUSD)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* INDICATEURS DE SCROLL */}
        <div className="flex items-center justify-center gap-1 mt-[10px]">
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" />
          <span className="text-[8px] text-gray-400 ml-1">← glissez</span>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}