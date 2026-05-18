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
      <section className="w-full py-8 lg:py-12" style={{ background: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#D4372B" }} />
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
    <section className="w-full py-8 lg:py-12" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITRE */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-semibold mb-1" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}>
              Recommandé pour votre entreprise
            </h2>
            <p className="text-sm" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
              Produits populaires pour les professionnels
            </p>
          </div>
          <Link
            href="/catalogue/entreprise"
            className="text-sm flex items-center gap-1 transition-colors hover:opacity-70"
            style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
          >
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* BANDE PRINCIPALE */}
        <div
          className="rounded-2xl p-6 lg:p-8 relative overflow-hidden"
          style={{ background: "#0A0A0A", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
        >
          
          {/* FLECHES DE NAVIGATION */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-all hidden lg:block"
            style={{ border: "0.5px solid rgba(255,255,255,0.2)" }}
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-all hidden lg:block"
            style={{ border: "0.5px solid rgba(255,255,255,0.2)" }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* CONTENU FLEX */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            
            {/* ZAP ICON + TITRE */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.15)" }}
              >
                <Zap className="w-6 h-6" style={{ color: "#D4372B" }} />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-semibold" style={{ color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
                  Customisation rapide
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                  Quantités adaptées aux pros
                </p>
              </div>
            </div>

            {/* PRODUITS EN SLIDE */}
            <div className="flex-1 w-full lg:w-auto overflow-hidden">
              <div 
                ref={scrollRef}
                className="flex items-center gap-4 overflow-x-auto scroll-smooth pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex-shrink-0 w-[180px]"
                  >
                    <div
                      className="bg-white rounded-xl p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      style={{ border: "0.5px solid #ECECEC" }}
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-square mb-2 rounded-lg overflow-hidden" style={{ background: "#FAFAFA" }}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* INFOS */}
                      <h4 className="text-xs font-medium line-clamp-2 min-h-[32px]" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-bold" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                          {formatPrice(product.priceUSD)}
                        </p>
                        <p
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "#F4F4F4", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}
                        >
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