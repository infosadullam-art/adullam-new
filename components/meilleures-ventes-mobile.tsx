"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, TrendingUp } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Police Amazon Ember
const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/deals/best-sellers/mobile")
        const data = await res.json()
        if (data.success && data.data) setProducts(data.data)
      } catch (error) {
        console.error("Erreur chargement produits:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (!hasAnimated && scrollRef.current && products.length > 0) {
      setHasAnimated(true)
      setTimeout(() => {
        scrollRef.current?.scrollBy({ left: 150, behavior: "smooth" })
        setTimeout(() => { scrollRef.current?.scrollBy({ left: -150, behavior: "smooth" }) }, 800)
      }, 500)
    }
  }, [hasAnimated, products])

  // ── Skeleton ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="w-full lg:hidden" style={{ background: "#FAFAFA" }}>
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 animate-pulse" style={{ background: "#F4F4F4", borderRadius: "6px" }} />
              <div>
                <div className="h-2.5 w-28 rounded animate-pulse mb-0.5" style={{ background: "#F4F4F4" }} />
                <div className="h-1.5 w-20 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
              </div>
            </div>
            <div className="h-2.5 w-14 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-shrink-0 w-[120px]" style={{ border: "0.5px solid #ECECEC", borderRadius: "6px", overflow: "hidden", background: "#fff" }}>
                <div className="aspect-square animate-pulse" style={{ background: "#F4F4F4" }} />
                <div className="p-1.5">
                  <div className="h-2 w-full rounded animate-pulse mb-1" style={{ background: "#F4F4F4" }} />
                  <div className="h-2.5 w-12 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="w-full lg:hidden" style={{ background: "#FAFAFA" }}>
      <div className="px-4 py-2">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7"
              style={{ background: "#FFF0F0", borderRadius: "6px" }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#D4372B" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: amazonFont, lineHeight: 1.2 }}>
                Meilleures ventes
              </h2>
              <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>
                Glissez pour voir plus
              </p>
            </div>
          </div>
          <Link
            href="/meilleures-ventes"
            className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1"
            style={{ color: "#D4372B", fontFamily: amazonFont }}
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Carrousel */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5"
              style={{ width: "120px" }}
            >
              <div
                className="overflow-hidden transition-all duration-200 hover:shadow-sm"
                style={{ borderRadius: "6px", border: "0.5px solid #ECECEC", background: "#fff" }}
              >
                {/* Rang */}
                <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                  {index < 3 && (
                    <span
                      className="absolute top-1.5 left-1.5 z-10 flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white"
                      style={{ background: index === 0 ? "#F5A623" : index === 1 ? "#AAAAAA" : "#CD7F32" }}
                    >
                      {index + 1}
                    </span>
                  )}
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Infos */}
                <div className="px-1.5 py-1.5">
                  <p
                    className="truncate mb-0.5"
                    style={{ fontSize: "10px", fontWeight: 500, color: "#0A0A0A", fontFamily: amazonFont }}
                  >
                    {product.name}
                  </p>
                  <p
                    style={{ fontSize: "11px", fontWeight: 700, color: "#D4372B", fontFamily: amazonFont }}
                  >
                    {formatPrice(product.priceUSD)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Indicateur scroll */}
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} className="rounded-full" style={{ width: i === 3 ? "12px" : "3px", height: "2px", background: i === 3 ? "#D4372B" : "#ECECEC", transition: "all 0.3s" }} />
          ))}
          <span style={{ fontSize: "8px", color: "#AAAAAA", marginLeft: "3px", fontFamily: amazonFont }}>glissez →</span>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}