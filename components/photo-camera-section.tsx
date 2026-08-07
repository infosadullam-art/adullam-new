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
    <section className="w-full py-4 lg:py-6" style={{ background: "#0A0A0A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <Camera className="w-3.5 h-3.5" style={{ color: "#D4372B" }} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#fff" }}>
                Photo &amp; Caméra
              </h2>
              <p className="text-[9px]" style={{ color: "#AAAAAA" }}>
                Appareils &amp; accessoires
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

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/products/${product.id}`} className="group block transition-all duration-200 hover:-translate-y-0.5">
                  <div
                    className="overflow-hidden transition-all duration-200 hover:shadow-sm"
                    style={{
                      borderRadius: "8px",
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}