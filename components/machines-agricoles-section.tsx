"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Tractor } from "lucide-react"
import { motion } from "framer-motion"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const CATEGORY_ID = "6298cdeb-49bd-43b5-a64d-520bc2fdb6a1" // Machines Agricoles
const CATEGORY_SLUG = "machines-agricoles"
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

export function MachinesAgricolesSection() {
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
    <section className="w-full bg-background py-6 relative overflow-hidden">
      {/* Trame technique en filigrane — signature du bloc */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07] pointer-events-none text-foreground"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400 mb-1">
              <Tractor className="w-3.5 h-3.5" />
              Direct usine
            </span>
            <h2 className="font-display text-xl lg:text-2xl font-semibold text-foreground">
              Machines Agricoles
            </h2>
            <span className="block h-[3px] w-10 mt-1.5 bg-amber-500 rounded-full" />
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
                className="flex-1 min-w-[160px] aspect-[4/5] rounded-xl bg-muted animate-pulse"
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
                <MachineCard
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
                <MachineCard key={product.id} product={product} index={i} formatPrice={formatPrice} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function MachineCard({
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
        <div className="relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 group-hover:border-amber-500/50 group-hover:shadow-lg group-hover:shadow-amber-500/5">
          <div className="relative aspect-[4/5] bg-muted/40">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
            {/* Coin "fiche technique" — signature au survol */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500/0 group-hover:border-amber-500/70 transition-colors duration-300" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500/0 group-hover:border-amber-500/70 transition-colors duration-300" />
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