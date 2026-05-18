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
      <section className="w-full lg:hidden" style={{ background: "#fff" }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: "#F4F4F4" }} />
              <div>
                <div className="h-3 w-28 rounded animate-pulse mb-1" style={{ background: "#F4F4F4" }} />
                <div className="h-2 w-20 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
              </div>
            </div>
            <div className="h-3 w-14 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-shrink-0 w-[130px]" style={{ border: "0.5px solid #ECECEC", borderRadius: "12px", overflow: "hidden" }}>
                <div className="aspect-square animate-pulse" style={{ background: "#F4F4F4" }} />
                <div className="p-2">
                  <div className="h-2.5 w-full rounded animate-pulse mb-1.5" style={{ background: "#F4F4F4" }} />
                  <div className="h-3 w-16 rounded animate-pulse" style={{ background: "#F4F4F4" }} />
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
    <section className="w-full lg:hidden" style={{ background: "#fff" }}>
      <div className="px-4 py-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "#FFF0F0" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: "#D4372B" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", lineHeight: 1.2 }}>
                Meilleures ventes
              </h2>
              <p style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                Glissez pour voir plus
              </p>
            </div>
          </div>
          <Link
            href="/meilleures-ventes"
            className="flex items-center gap-0.5 text-xs font-semibold"
            style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carrousel */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block flex-shrink-0"
              style={{ width: "130px" }}
            >
              <div
                className="overflow-hidden transition-all duration-200"
                style={{ borderRadius: "12px", border: "0.5px solid #ECECEC", background: "#fff" }}
              >
                {/* Rang */}
                <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                  {index < 3 && (
                    <span
                      className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                      style={{ background: index === 0 ? "#F5A623" : index === 1 ? "#AAAAAA" : "#CD7F32" }}
                    >
                      {index + 1}
                    </span>
                  )}
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={130}
                    height={130}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Infos */}
                <div className="px-2 py-2">
                  <p
                    className="truncate mb-1"
                    style={{ fontSize: "11px", fontWeight: 500, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {product.name}
                  </p>
                  <p
                    style={{ fontSize: "13px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {formatPrice(product.priceUSD)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Indicateur scroll */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {[0,1,2,3].map(i => (
            <div key={i} className="rounded-full" style={{ width: i === 3 ? "14px" : "4px", height: "3px", background: i === 3 ? "#D4372B" : "#ECECEC", transition: "all 0.3s" }} />
          ))}
          <span style={{ fontSize: "9px", color: "#AAAAAA", marginLeft: "4px", fontFamily: "'Poppins', sans-serif" }}>glissez →</span>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}