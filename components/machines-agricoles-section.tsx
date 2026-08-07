"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Tractor, Gauge, Cog } from "lucide-react"
import { motion } from "framer-motion"
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
        if (mounted) {
          const shuffled = [...list].sort(() => Math.random() - 0.5)
          setProducts(shuffled.slice(0, 12).map((p: any) => ({
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
    <section className="w-full py-12 lg:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400">
              <span className="w-8 h-px bg-amber-500" />
              Équipement agricole
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-foreground mt-2 tracking-tight">
              Machines Agricoles
            </h2>
            <p className="text-muted-foreground text-sm mt-1 font-light">
              Matériel professionnel pour l'agriculture moderne
            </p>
          </div>
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="group hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
          >
            Voir toute la collection
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {products.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
                }}
              >
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-500 group-hover:border-amber-500/40 group-hover:shadow-xl group-hover:shadow-amber-500/5">
                    <div className="relative aspect-[4/5] bg-muted/20 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 transition-all duration-500 group-hover:from-black/10 group-hover:via-black/5 group-hover:to-black/0" />
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="flex items-center gap-1 text-[10px] text-white/80">
                          <Gauge className="w-3 h-3" />
                          Puissance
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/80">
                          <Cog className="w-3 h-3" />
                          Robustesse
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-foreground/90 line-clamp-2 leading-snug">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {formatPrice(product.priceUSD)}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 group-hover:text-amber-500 transition-colors">
                          Détails →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Link
            href={`/categorie/${CATEGORY_SLUG}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir toute la collection
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}