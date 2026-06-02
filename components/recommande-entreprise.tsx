"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Zap, ChevronRight } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Police Amazon Ember
const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
}

export function RecommandeEntreprise() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  if (isLoading) {
    return (
      <section className="w-full py-3" style={{ background: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: "#D4372B" }} />
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="w-full py-3" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITRE - hauteur réduite */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold mb-0.5" style={{ color: "#0A0A0A", fontFamily: amazonFont, letterSpacing: "-0.02em" }}>
              Recommandé pour votre entreprise
            </h2>
            <p className="text-xs" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>
              Produits populaires pour les professionnels
            </p>
          </div>
          <Link
            href="/products?category=entreprise"
            className="text-xs flex items-center gap-1 transition-all duration-200 hover:gap-1.5 hover:opacity-70"
            style={{ color: "#D4372B", fontFamily: amazonFont }}
          >
            Voir tout
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* BANDE PRINCIPALE - animation de fond comme deal-countdown */}
        <div
          className="rounded-md p-4 lg:p-5 relative overflow-hidden transition-all duration-1000 ease-in-out"
          style={{ 
            background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            animation: "gradientShift 8s ease-in-out infinite",
          }}
        >
          
          {/* FLECHES DE NAVIGATION */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition-all duration-200 hover:scale-105 hidden lg:block"
            style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition-all duration-200 hover:scale-105 hidden lg:block"
            style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* CONTENU FLEX */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            
            {/* ZAP ICON + TITRE */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="p-2 rounded"
                style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.1)" }}
              >
                <Zap className="w-5 h-5" style={{ color: "#D4372B" }} />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold" style={{ color: "#fff", fontFamily: amazonFont }}>
                  Customisation rapide
                </h3>
                <p className="text-[10px] mt-0.5" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>
                  Quantités adaptées aux pros
                </p>
              </div>
            </div>

            {/* PRODUITS EN SLIDE */}
            <div className="flex-1 w-full lg:w-auto overflow-hidden">
              <div 
                ref={scrollRef}
                className="flex items-center gap-3 overflow-x-auto scroll-smooth pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {products.map((product, idx) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex-shrink-0 w-[150px] transition-all duration-200 hover:-translate-y-0.5"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div
                      className="bg-white rounded-md p-2 transition-all duration-300 hover:shadow-md"
                      style={{ border: "0.5px solid #ECECEC" }}
                    >
                      <div className="relative aspect-square mb-1.5 rounded overflow-hidden" style={{ background: "#FAFAFA" }}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <h4 className="text-[10px] font-medium line-clamp-2 min-h-[28px]" style={{ color: "#0A0A0A", fontFamily: amazonFont }}>
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-bold" style={{ color: "#D4372B", fontFamily: amazonFont }}>
                          {formatPrice(product.priceUSD)}
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

      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);
          }
          50% {
            background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
          }
          100% {
            background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);
          }
        }
        
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