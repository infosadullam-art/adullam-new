"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Camera } from "lucide-react"
import { motion } from "framer-motion"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const CATEGORY_ID = "dfae7859-f3dd-4c74-8457-d1fee7d4c3fb"
const CATEGORY_SLUG = "photo-et-camera"
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000

const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

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
          setProducts(shuffled.slice(0, 6).map((p: any) => ({
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

  if (!isLoading && products.length === 0) return null

  return (
    <section className="w-full" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#0A0A0A" }}>
              Photo &amp; Caméra
            </h2>
            <p className="text-[9px]" style={{ color: "#AAAAAA" }}>
              Appareils &amp; accessoires
            </p>
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
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
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-md bg-muted animate-pulse" />
              ))
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link href={`/products/${product.id}`} className="group block transition-all duration-200 hover:-translate-y-0.5">
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
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}