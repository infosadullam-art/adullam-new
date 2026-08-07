"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const REFRESH_INTERVAL = 10 * 60 * 60 * 1000

const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface Product {
  id: string
  name: string
  price: number
  image: string
}

export function CategoriesPourVous() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const timestamp = Date.now()
        const res = await fetch(`${API_BASE}/api/trending/cuisine?limit=20&_t=${timestamp}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          const shuffled = [...data.data].sort(() => Math.random() - 0.5)
          setProducts(
            shuffled.slice(0, 8).map((p: any) => ({
              id: p.id,
              name: p.name || p.title || "Produit",
              price: p.price || 0,
              image: p.image || "/placeholder.jpg",
            }))
          )
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()

    const interval = setInterval(fetchProducts, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 200
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -amount, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
      }
    }
  }

  if (isLoading) {
    return (
      <section className="w-full" style={{ background: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: "#D4372B" }} />
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="w-full" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#0A0A0A" }}>
              Tendances Cuisine
            </h2>
            <p className="text-[9px]" style={{ color: "#AAAAAA" }}>
              Les produits les plus populaires
            </p>
          </div>
          <Link
            href="/categorie/cuisine"
            className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1"
            style={{ color: "#D4372B" }}
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div
          className="rounded-md p-4 lg:p-5 relative overflow-hidden"
          style={{ 
            background: "#0A0A0A",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition-all duration-300 hover:scale-105 hidden lg:block"
            style={{ 
              border: "0.5px solid rgba(255,255,255,0.15)",
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.8)',
              pointerEvents: isHovered ? 'auto' : 'none',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition-all duration-300 hover:scale-105 hidden lg:block"
            style={{ 
              border: "0.5px solid rgba(255,255,255,0.15)",
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.8)',
              pointerEvents: isHovered ? 'auto' : 'none',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex-shrink-0">
              <h3 className="text-sm font-bold" style={{ color: "#fff" }}>
                Tendances Cuisine
              </h3>
              <p className="text-[9px]" style={{ color: "#AAAAAA" }}>
                Les plus populaires
              </p>
            </div>

            <div className="flex-1 w-full lg:w-auto overflow-hidden">
              <div 
                ref={scrollRef}
                className="flex items-center gap-3 overflow-x-auto scroll-smooth pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex-shrink-0 w-[150px] transition-all duration-200 hover:-translate-y-0.5"
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
                          {formatPrice(product.price)}
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