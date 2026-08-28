"use client"

import Link from "next/link"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// ✅ Configuration des badges selon la source
// Un seul langage visuel : étiquette pleine sombre par défaut,
// accent (rouge) réservé aux badges à caractère promotionnel.
const badgeConfig: Record<string, { label: string; tone: "dark" | "accent" }> = {
  session_graph: { label: "Pour vous", tone: "dark" },
  session: { label: "Pour vous", tone: "dark" },
  als: { label: "Recommandé", tone: "dark" },
  trend: { label: "Tendance", tone: "accent" },
  new: { label: "Nouveau", tone: "dark" },
  random: { label: "Découverte", tone: "dark" },
  popular: { label: "Populaire", tone: "dark" },
  abandoned_cart: { label: "Panier", tone: "accent" },
  cache: { label: "Pour vous", tone: "dark" },
  fallback_total: { label: "Nouveauté", tone: "dark" },
  chat: { label: "💬 Adu", tone: "accent" },
  chat_category: { label: "💬 Catégorie", tone: "dark" },
  selected_product: { label: "🔍 Similaire", tone: "dark" },
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
    reason?: string       // ✅ Pourquoi ce produit
    isSelected?: boolean  // ✅ Poids fort
  }
  onClick?: () => void   // ✅ Pour le chat
  size?: 'sm' | 'md' | 'lg'
}

export function ProductCard({ product, onClick, size = 'md' }: ProductCardProps) {
  const { formatPrice } = useCurrencyFormatter()

  // ✅ Protection si priceUSD est undefined ou null
  const price = typeof product.priceUSD === 'number' && !isNaN(product.priceUSD)
    ? product.priceUSD
    : 0

  const formattedPrice = formatPrice(price)

  // ✅ Déterminer le badge à afficher (priorité à badge, sinon source)
  let badgeLabel = product.badge
  let badgeTone: "dark" | "accent" = "dark"

  if (!badgeLabel && product.source) {
    const config = badgeConfig[product.source]
    if (config) {
      badgeLabel = config.label
      badgeTone = config.tone
    }
  }

  // ✅ Texte de preuve sociale
  const viewersText = product.viewers && product.viewers > 0
    ? `${product.viewers} regardent`
    : null

  // ✅ Taille du composant
  const sizeClasses = {
    sm: {
      image: 'aspect-[3/4]',
      padding: 'p-2',
      name: 'text-xs',
      price: 'text-sm',
      badge: 'text-[8px] px-1.5 py-0.5',
    },
    md: {
      image: 'aspect-square',
      padding: 'p-2 lg:p-3',
      name: 'text-xs lg:text-sm',
      price: 'text-sm lg:text-base',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    lg: {
      image: 'aspect-square',
      padding: 'p-3 lg:p-4',
      name: 'text-sm lg:text-base',
      price: 'text-base lg:text-lg',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
  }

  const classes = sizeClasses[size] || sizeClasses.md

  // ✅ Si onClick est fourni, on utilise un div (pour le chat)
  // Sinon, un Link (pour le catalogue)
  const Wrapper = onClick ? 'div' : Link
  const wrapperProps = onClick
    ? { onClick, className: "block cursor-pointer" }
    : { href: `/products/${product.id}`, className: "block group" }

  return (
    <Wrapper {...wrapperProps}>
      <div
        className="rounded-md bg-background overflow-hidden shadow-xs transition-shadow duration-300 hover:shadow-sm"
        style={product.isSelected ? { boxShadow: "var(--shadow-accent)" } : undefined}
      >

        {/* IMAGE */}
        <div className={`media-zoom relative ${classes.image} bg-surface`}>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-contain p-4"
          />

          {/* BADGE */}
          {badgeLabel && (
            <span
              className={`absolute top-2 left-2 rounded-sm font-medium z-10 text-white ${classes.badge}`}
              style={{ background: badgeTone === "accent" ? "var(--accent)" : "color-mix(in oklab, var(--foreground) 82%, transparent)" }}
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
            <span className="absolute bottom-2 left-2 rounded-sm bg-brand/75 px-1.5 py-0.5 text-[10px] text-white z-10">
              {viewersText}
            </span>
          )}

          {/* ✅ BADGE "SÉLECTIONNÉ" (poids fort) */}
          {product.isSelected && (
            <span className="absolute bottom-2 right-2 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] text-white z-10">
              Sélectionné
            </span>
          )}
        </div>

        {/* INFOS */}
        <div className={classes.padding}>
          <h3 className={`${classes.name} font-medium text-foreground truncate mb-1`}>
            {product.name}
          </h3>

          {/* ✅ RAISON (pour le chat) */}
          {product.reason && (
            <p className="text-[10px] text-muted-foreground mb-1 truncate">
              {product.reason}
            </p>
          )}

          {/* RATING */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-3 h-3"
                    style={{ color: star <= Math.round(product.rating || 0) ? "var(--accent-amber)" : "var(--border-strong)" }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {product.reviews && (
                <span className="text-[10px] lg:text-xs text-muted-foreground">
                  ({product.reviews})
                </span>
              )}
            </div>
          )}

          {/* PRIX */}
          <div className="mt-2">
            <p className={`${classes.price} font-bold text-accent tabular-nums`}>
              {formattedPrice}
            </p>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}