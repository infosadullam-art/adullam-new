"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Tractor, ArrowRight } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const CATEGORY_ID = "6298cdeb-49bd-43b5-a64d-520bc2fdb6a1"
const CATEGORY_SLUG = "machines-agricoles"
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000

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
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        const timestamp = Date.now()
        const res = await fetch(
          `${API_BASE}/api/products?categoryId=${CATEGORY_ID}&limit=12&_t=${timestamp}`
        )
        const data = await res.json()
        const list: any[] = data.data || data.products || []
        if (mounted) setProducts(list.map(normalize))
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
    <section ref={sectionRef} className="w-full bg-background py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              <span className="w-6 h-px bg-amber-500" />
              Équipement agricole
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-light text-foreground mt-1.5 tracking-tight">
              Machines Agricoles
            </h2>
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="group hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grille */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {products.slice(0, 12).map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}

        {/* Lien mobile */}
        <div className="sm:hidden mt-4 text-center">
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProductCard({
  product,
  index,
  formatPrice,
}: {
  product: Product
  index: number
  formatPrice: (n: number) => string
}) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg bg-surface border border-border transition-all duration-500 group-hover:border-amber-500/30 group-hover:shadow-lg group-hover:shadow-amber-500/5">
        <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover p-4 transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Overlay gradient subtil au survol */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 transition-colors duration-500 group-hover:from-black/5 group-hover:via-black/0 group-hover:to-black/0" />
        </div>
        <div className="p-3">
          <p className="text-xs text-foreground/80 line-clamp-2 leading-snug font-light">
            {product.name}
          </p>
          <p className="text-sm font-medium text-foreground mt-1.5 tracking-tight">
            {formatPrice(product.priceUSD)}
          </p>
        </div>
      </div>
    </Link>
  )
}