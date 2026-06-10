"use client"

import Link from "next/link"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// ✅ Configuration des badges selon la source
const badgeConfig: Record<string, { label: string; bg: string; color: string }> = {
  session_graph: { label: "Pour vous", bg: "#F0F4FF", color: "#3B5BDB" },
  session: { label: "Pour vous", bg: "#F0F4FF", color: "#3B5BDB" },
  als: { label: "Recommandé", bg: "#FFF8E1", color: "#E67700" },
  trend: { label: "Tendance", bg: "#FFF0F0", color: "#D4372B" },
  new: { label: "Nouveau", bg: "#F3F0FF", color: "#7048E8" },
  random: { label: "Découverte", bg: "#EBFBEE", color: "#2F9E44" },
  popular: { label: "Populaire", bg: "#FFF4E6", color: "#E67700" },
  abandoned_cart: { label: "Panier", bg: "#FFE4E1", color: "#D4372B" },
  cache: { label: "Pour vous", bg: "#F0F4FF", color: "#3B5BDB" },
  fallback_total: { label: "Nouveauté", bg: "#F3F0FF", color: "#7048E8" }
}

interface ProductCardProps {
  product: {
    id: string | number
    name: string
    priceUSD: number
    image: string
    badge?: string
    source?: string      // ✅ Pour les badges dynamiques
    viewers?: number      // ✅ Pour la preuve sociale
    flag?: string
    rating?: number
    reviews?: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  
  // ✅ Protection si priceUSD est undefined ou null
  const price = typeof product.priceUSD === 'number' && !isNaN(product.priceUSD) 
    ? product.priceUSD 
    : 0

  const formattedPrice = formatPrice(price)
  
  // ✅ Déterminer le badge à afficher (priorité à badge, sinon source)
  let badgeLabel = product.badge
  let badgeStyle = { background: "#1F2937", color: "white" } // default
  
  if (!badgeLabel && product.source) {
    const config = badgeConfig[product.source]
    if (config) {
      badgeLabel = config.label
      badgeStyle = { background: config.bg, color: config.color }
    }
  }
  
  // ✅ Texte de preuve sociale
  const viewersText = product.viewers && product.viewers > 0 
    ? `🔥 ${product.viewers} regardent`
    : null

  return (
    <Link href={`/products/${product.id}`} className="block group">
      {/* SUPPRESSION de border-gray-100 et border-gray-200 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
        
        {/* IMAGE - SUPPRESSION de bg-gray-50 et p-4 réduit */}
        <div className="relative aspect-square">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* BADGE - avec style dynamique */}
          {badgeLabel && (
            <span 
              className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full font-medium z-10"
              style={badgeStyle}
            >
              {badgeLabel}
            </span>
          )}
          
          {/* FLAG */}
          {product.flag && (
            <span className="absolute top-2 right-2 text-lg z-10">
              {product.flag}
            </span>
          )}
          
          {/* VIEWERS - Preuve sociale */}
          {viewersText && (
            <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-full z-10">
              {viewersText}
            </span>
          )}
        </div>

        {/* INFOS */}
        <div className="p-2 lg:p-3">
          <h3 className="text-xs lg:text-sm font-medium text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* RATING */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(product.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {product.reviews && (
                <span className="text-[10px] lg:text-xs text-gray-500">
                  ({product.reviews})
                </span>
              )}
            </div>
          )}

          {/* PRIX */}
          <div className="mt-2">
            <p className="text-sm lg:text-base font-bold" style={{ color: "#D4372B" }}>
              {formattedPrice}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}