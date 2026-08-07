"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Tractor } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const CATEGORY_ID = "6298cdeb-49bd-43b5-a64d-520bc2fdb6a1"
const CATEGORY_SLUG = "machines-agricoles"
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000

const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
}

export function MachinesAgricolesSection() {
  const { formatPrice } = useCurrencyFormatter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
          setProducts(shuffled.slice(0, 10).map((p: any) => ({
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

  // Version desktop - grille
  const DesktopGrid = () => {
    if (products.length === 0) return null

    return (
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md" style={{ background: "#FFF8F0" }}>
              <Tractor className="w-3.5 h-3.5" style={{ color: "#F5A623" }} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#0A0A0A" }}>
                Machines Agricoles
              </h2>
              <p className="text-[9px]" style={{ color: "#AAAAAA" }}>
                Équipement professionnel
              </p>
            </div>
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1"
            style={{ color: "#D4372B" }}
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {products.slice(0, 6).map((product, index) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block transition-all duration-200 hover:-translate-y-0.5">
              <div
                className="overflow-hidden transition-all duration-200 hover:shadow-sm"
                style={{
                  borderRadius: "6px",
                  border: "0.5px solid #ECECEC",
                  background: "#fff",
                }}
              >
                <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-1.5 py-1.5">
                  <p
                    className="truncate mb-0.5"
                    style={{ fontSize: "9px", fontWeight: 500, color: "#0A0A0A" }}
                  >
                    {product.name}
                  </p>
                  <p
                    style={{ fontSize: "10px", fontWeight: 700, color: "#D4372B" }}
                  >
                    {formatPrice(product.priceUSD)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Version mobile - carrousel avec fond noir
  const MobileCarousel = () => {
    if (isLoading) {
      return (
        <div className="lg:hidden px-4 py-2">
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
      )
    }

    if (products.length === 0) return null

    return (
      <div className="lg:hidden px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7" style={{ background: "#FFF8F0", borderRadius: "6px" }}>
              <Tractor className="w-3.5 h-3.5" style={{ color: "#F5A623" }} />
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: amazonFont }}>
                Machines Agricoles
              </p>
              <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>
                Équipement professionnel
              </p>
            </div>
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1"
            style={{ color: "#D4372B", fontFamily: amazonFont }}
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div
          className="rounded-md p-4 relative overflow-hidden"
          style={{ background: "#0A0A0A" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded" style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
              <Tractor className="w-5 h-5" style={{ color: "#F5A623" }} />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: "#fff", fontFamily: amazonFont }}>
                Machines Agricoles
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>
                Équipement professionnel
              </p>
            </div>
          </div>

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
                  <p className="text-xs font-bold mt-1" style={{ color: "#D4372B", fontFamily: amazonFont }}>
                    {formatPrice(product.priceUSD)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isLoading && products.length === 0) return null

  return (
    <section className="w-full py-4 lg:py-6" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DesktopGrid />
        <MobileCarousel />
      </div>
    </section>
  )
}