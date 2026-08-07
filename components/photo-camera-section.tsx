"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Camera } from "lucide-react"
import { motion } from "framer-motion"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const CATEGORY_ID = "dfae7859-f3dd-4c74-8457-d1fee7d4c3fb" // Photo & Caméra
const CATEGORY_SLUG = "photo-et-camera"
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000 // 6h

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
}

function normalize(p: any): Product {
  return {
    id: p.id,
    name: p.title || p.name || "Produit",
    priceUSD: p.salePrice || p.price || 0,
    image: p.images?.[0] || p.image || "/placeholder.jpg",
  }
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
          `${API_BASE}/api/products?categoryId=${CATEGORY_ID}&limit=16&_t=${timestamp}`
        )
        const data = await res.json()
        const list: any[] = data.data || data.products || []
        if (mounted) setProducts(list.map(normalize))
      } catch {
        // silencieux — la section se masque simplement si vide
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
    <section className="w-full bg-background py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-primary mb-1">
              <Camera className="w-3.5 h-3.5" />
              Direct usine
            </span>
            <h2 className="font-display text-xl lg:text-2xl font-semibold text-foreground">
              Photo &amp; Caméra
            </h2>
            <span className="block h-[3px] w-10 mt-1.5 bg-primary rounded-full" />
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tout
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 min-w-[160px] aspect-square rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile — carrousel horizontal */}
            <div
              className="flex lg:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {products.slice(0, 10).map((product, i) => (
                <CameraCard
                  key={product.id}
                  product={product}
                  index={i}
                  formatPrice={formatPrice}
                  className="w-[150px] flex-shrink-0 snap-start"
                />
              ))}
            </div>

            {/* Desktop — grille */}
            <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-4">
              {products.slice(0, 10).map((product, i) => (
                <CameraCard key={product.id} product={product} index={i} formatPrice={formatPrice} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function CameraCard({
  product,
  index,
  formatPrice,
  className = "",
}: {
  product: Product
  index: number
  formatPrice: (n: number) => string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
          <div className="relative aspect-square bg-muted/40">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
            {/* Cadre viseur — se referme au survol, signature du bloc */}
            {(["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2",
               "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"]
            ).map((pos, idx) => (
              <span
                key={idx}
                className={`absolute w-3 h-3 border-primary/0 group-hover:border-primary/70 transition-all duration-300 ${pos}`}
                style={{ transitionDelay: `${idx * 40}ms` }}
              />
            ))}
          </div>
          <div className="p-2.5 border-t border-border">
            <p className="text-xs font-medium text-foreground line-clamp-2 min-h-[32px] leading-snug">
              {product.name}
            </p>
            <p className="text-sm font-bold text-foreground mt-1">{formatPrice(product.priceUSD)}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}