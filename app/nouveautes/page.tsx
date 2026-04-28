"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

export default function NouveautesPage() {
  const { formatPrice } = useCurrencyFormatter()

  const products = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: ["Écouteurs Bluetooth", "Montre Sport", "Powerbank", "Chargeur", "Câble USB-C", "Support auto"][i % 6],
    price: [59, 199, 85, 35, 15, 20][i % 6],
    rating: 4.3,
    reviews: Math.floor(Math.random() * 50) + 10,
  }))

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
            <Sparkles className="w-8 h-8 mb-2 opacity-90" />
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">Nouveautés</h1>
            <p className="text-sm text-gray-300 max-w-2xl">Découvrez les derniers produits ajoutés à notre catalogue</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Nouveaux produits</h2>
            <p className="text-sm text-gray-500">Ajoutés au cours des 7 derniers jours</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square relative mb-3 group-hover:shadow-md transition-shadow">
                  <Image
                    src="/placeholder.svg"
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    Nouveau
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2 text-gray-800 group-hover:text-gray-900">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}