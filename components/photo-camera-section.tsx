"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Camera } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const CATEGORY_ID = "dfae7859-f3dd-4c74-8457-d1fee7d4c3fb"
const CATEGORY_SLUG = "photo-et-camera"
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
}

export function PhotoCameraSection() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        const timestamp = Date.now()
        const res = await fetch(
          `${API_BASE}/api/products?categoryId=${CATEGORY_ID}&limit=20&_t=${timestamp}`
        )
        const data = await res.json()
        const list: any[] = data.data || data.products || []
        if (mounted) {
          const shuffled = [...list].sort(() => Math.random() - 0.5)
          setProducts(shuffled.slice(0, 8).map((p: any) => ({
            id: p.id,
            name: p.title || p.name || "Produit",
            priceUSD: p.price || 0,
            image: p.images?.[0] || p.image || "/placeholder.jpg",
          })))
        }
      } catch {
        // silencieux
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -280 : 280
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  if (!isLoading && products.length === 0) return null

  return (
    <section className="w-full py-6 lg:py-8" style={{ background: "#FAFAFA", borderTop: "1px solid #ECECEC" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-red-600 mb-0.5">
              <Camera className="w-3.5 h-3.5" />
              Matériel photo
            </span>
            <h2 className="text-lg lg:text-xl font-semibold text-foreground">
              Photo &amp; Caméra
            </h2>
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="text-xs flex items-center gap-1 transition-all duration-200 hover:gap-1.5 text-muted-foreground hover:text-foreground"
          >
            Voir tout
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 min-w-[160px] aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div
            className="relative rounded-lg p-4 lg:p-5 overflow-hidden"
            style={{ background: "#0A0A0A" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition-all duration-300 hidden lg:block"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.8)',
                pointerEvents: isHovered ? 'auto' : 'none',
                border: "0.5px solid rgba(255,255,255,0.15)",
              }}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition-all duration-300 hidden lg:block"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.8)',
                pointerEvents: isHovered ? 'auto' : 'none',
                border: "0.5px solid rgba(255,255,255,0.15)",
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="p-2 rounded" style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                  <Camera className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm lg:text-base font-semibold text-white">Photo &amp; vidéo</h3>
                  <p className="text-[10px] mt-0.5 text-white/50">Direct usine</p>
                </div>
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
                      className="group flex-shrink-0 w-[140px] lg:w-[160px] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="bg-white rounded-md p-2 transition-all duration-300 hover:shadow-md" style={{ border: "0.5px solid #ECECEC" }}>
                        <div className="relative aspect-square mb-1.5 rounded overflow-hidden" style={{ background: "#FAFAFA" }}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="text-[10px] font-medium line-clamp-2 min-h-[28px]" style={{ color: "#0A0A0A" }}>
                          {product.name}
                        </h4>
                        <p className="text-xs font-bold mt-1" style={{ color: "#D4372B" }}>
                          {formatPrice(product.priceUSD)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}