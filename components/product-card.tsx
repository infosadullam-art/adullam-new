"use client"

import Link from "next/link"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface ProductCardProps {
  product: {
    id: string | number
    name: string
    priceUSD: number
    image: string
    badge?: string
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

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
        
        {/* IMAGE */}
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* BADGE */}
          {product.badge && (
            <span className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          
          {/* FLAG */}
          {product.flag && (
            <span className="absolute top-2 right-2 text-lg">
              {product.flag}
            </span>
          )}
        </div>

        {/* INFOS */}
        <div className="p-2 lg:p-3">
          <h3 className="text-xs lg:text-sm font-medium text-gray-900 truncate mb-1">
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
                        ? "text-yellow-400"
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

          {/* PRIX EN ROUGE */}
          <div className="mt-2">
            <p className="text-sm lg:text-base font-bold text-red-500">
              {formattedPrice}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}