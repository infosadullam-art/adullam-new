"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, Tag } from "lucide-react"
import { useState } from "react"

export function CartSummary() {
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  const subtotal = 34300
  const discount = promoApplied ? 3430 : 0
  const shipping = 2000
  const total = subtotal - discount + shipping

  const applyPromo = () => {
    if (promoCode.trim()) {
      setPromoApplied(true)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
      <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Code promo</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Entrez votre code"
              disabled={promoApplied}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-neutral-light disabled:cursor-not-allowed"
            />
          </div>
          <Button
            onClick={applyPromo}
            disabled={promoApplied || !promoCode.trim()}
            variant="outline"
            className="px-4 whitespace-nowrap bg-transparent"
          >
            {promoApplied ? "Appliqué" : "Appliquer"}
          </Button>
        </div>
        {promoApplied && <p className="text-sm text-green-600 mt-2">Code promo appliqué avec succès!</p>}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total (3 articles)</span>
          <span className="font-medium">{subtotal.toLocaleString()} XOF</span>
        </div>
        {promoApplied && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Réduction (10%)</span>
            <span className="font-medium text-green-600">-{discount.toLocaleString()} XOF</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span className="font-medium">{shipping.toLocaleString()} XOF</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-brand">{total.toLocaleString()} XOF</span>
      </div>

      {/* Checkout Button */}
      <Button className="w-full bg-brand hover:bg-brand-hover text-white h-12 text-base font-semibold mb-3">
        <ShoppingBag className="w-5 h-5 mr-2" />
        Passer la commande
      </Button>

      <a href="/" className="block text-center text-sm text-brand hover:underline font-medium py-2">
        Continuer mes achats
      </a>

      {/* Security Info */}
      <div className="mt-6 pt-6 border-t space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Paiement 100% sécurisé</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Livraison rapide 24-48h</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3v-8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Retour gratuit sous 14 jours</span>
        </div>
      </div>
    </div>
  )
}
