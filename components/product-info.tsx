"use client"

import { cn } from "@/lib/utils"

import { Star, Heart, Share2, Minus, Plus, ShoppingCart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ProductInfo() {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Écouteurs sans fil Bluetooth 5.0 avec réduction de bruit active
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-4 h-4", i < 4 ? "fill-[#FFA500] text-[#FFA500]" : "text-gray-300")} />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">(210 avis)</span>
          <span className="text-sm text-green-600 font-medium">En stock</span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl lg:text-4xl font-bold text-brand">5,900 XOF</span>
          <span className="text-xl text-muted-foreground line-through">8,500 XOF</span>
          <span className="px-2 py-1 bg-red-100 text-brand text-sm font-semibold rounded">-31%</span>
        </div>
        <p className="text-sm text-muted-foreground">Prix TTC, livraison non comprise</p>
      </div>

      {/* Key Features */}
      <div className="space-y-3 bg-neutral-light p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-brand" />
          <span>Livraison rapide en 24-48h</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
          </svg>
          <span>Garantie 1 an</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3v-8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Paiement sécurisé</span>
        </div>
      </div>

      {/* Product Origin */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Origine:</span>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
          Import Chine
        </span>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Quantité</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-neutral-light transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-6 font-semibold">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-neutral-light transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">Stock disponible: 47 unités</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full bg-brand hover:bg-brand-hover text-white h-12 text-base font-semibold">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Ajouter au panier
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold border-brand text-brand hover:bg-brand hover:text-white bg-transparent"
        >
          Acheter maintenant
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 bg-transparent"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-brand text-brand")} />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Seller Info */}
      <div className="border-t pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Vendu par</span>
          <span className="font-semibold">Adullam Electronics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[#FFA500] text-[#FFA500]" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">(2,340 évaluations)</span>
        </div>
      </div>
    </div>
  )
}
