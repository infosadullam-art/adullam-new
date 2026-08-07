"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Camera, ArrowUpRight } from "lucide-react"
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
    <section className="w-full py-4 lg:py-6 bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20">
              <Camera className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">Photo &amp; Caméra</h2>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Appareils &amp; accessoires</p>
            </div>
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="group flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Voir tout
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="relative rounded-lg overflow-hidden bg-card border border-border transition-all duration-300 hover:border-red-500/30 hover:shadow-md">
                    <div className="relative aspect-square bg-muted/20 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-2 group-hover:translate-y-0">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10px] font-medium text-foreground/90 line-clamp-2 leading-tight min-h-[28px]">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {formatPrice(product.priceUSD)}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50 group-hover:text-red-500 transition-colors">
                          Voir
                        </span>
                      </div>
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