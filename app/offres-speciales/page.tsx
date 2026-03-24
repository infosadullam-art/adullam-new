"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import  MobileNav  from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Zap, Timer, Star } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter" // ✅ AJOUTÉ

export default function OffresSpecialesPage() {
  // ✅ HOOK DE DEVISE DYNAMIQUE
  const { formatPrice } = useCurrencyFormatter()

  const products = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: ["Écouteurs Bluetooth", "Montre Sport", "Powerbank", "Support auto", "Chargeur rapide"][i % 5],
    price: [59, 199, 85, 20, 35][i % 5], // ✅ Prix en USD
    oldPrice: [120, 350, 150, 45, 65][i % 5], // ✅ Anciens prix en USD
    rating: 4.5,
    reviews: Math.floor(Math.random() * 200) + 80,
  }))

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <Zap className="w-10 h-10 mb-4" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Offres Spéciales</h1>
            <p className="text-xl mb-6 max-w-2xl">Prix imbattables et quantités limitées</p>
            <div className="flex items-center gap-3 bg-white/20 rounded-lg px-6 py-4 inline-flex">
              <Timer className="w-6 h-6" />
              <span className="font-semibold">Se termine dans:</span>
              <div className="flex gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">03</div>
                  <div className="text-xs">Heures</div>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">14</div>
                  <div className="text-xs">Minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">Ventes Flash du Jour</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-neutral-light relative">
                  <Image
                    src="/placeholder.svg"
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    {/* ✅ PRIX DYNAMIQUE */}
                    <span className="text-brand font-bold">{formatPrice(product.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  </div>
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