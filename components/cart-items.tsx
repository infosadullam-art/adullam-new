"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  inStock: boolean
  origin: string
}

export function CartItems() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Écouteurs sans fil Bluetooth 5.0",
      price: 5900,
      originalPrice: 8500,
      image: "/black-wireless-earbuds-main-view.jpg",
      quantity: 1,
      inStock: true,
      origin: "Import Chine",
    },
    {
      id: "2",
      name: "Montre connectée Sport",
      price: 19900,
      image: "/black-smartwatch.jpg",
      quantity: 1,
      inStock: true,
      origin: "Import Chine",
    },
    {
      id: "3",
      name: "Powerbank 20000mAh",
      price: 8500,
      originalPrice: 12000,
      image: "/portable-charger.png",
      quantity: 1,
      inStock: true,
      origin: "Import Chine",
    },
  ])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setItems(items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-neutral-light rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-4 mb-2">
                <h3 className="font-semibold text-sm lg:text-base line-clamp-2">{item.name}</h3>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  {item.origin}
                </span>
                {item.inStock ? (
                  <span className="text-xs text-green-600 font-medium">En stock</span>
                ) : (
                  <span className="text-xs text-red-600 font-medium">Rupture de stock</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-lg lg:text-xl font-bold text-brand">{item.price.toLocaleString()} XOF</span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {item.originalPrice.toLocaleString()} XOF
                    </span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-neutral-light transition-colors"
                  >
                    <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                  <span className="px-4 font-semibold text-sm lg:text-base">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-neutral-light transition-colors"
                  >
                    <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
