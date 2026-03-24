"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Sparkles, Star } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter" // ✅ AJOUTÉ

export default function NouveautesPage() {
  // ✅ HOOK DE DEVISE DYNAMIQUE
  const { formatPrice } = useCurrencyFormatter()

  const products = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: ["Écouteurs Bluetooth", "Montre Sport", "Powerbank", "Chargeur", "Câble USB-C", "Support auto"][i % 6],
    price: [59, 199, 85, 35, 15, 20][i % 6], // ✅ Prix en USD
    rating: 4.3,
    reviews: Math.floor(Math.random() * 50) + 10,
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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <Sparkles className="w-10 h-10 mb-4" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Nouveautés</h1>
            <p className="text-xl mb-6 max-w-2xl">Découvrez les derniers produits ajoutés à notre catalogue</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <h2 className="text-2xl font-bold mb-2">Nouveaux produits</h2>
          <p className="text-muted-foreground mb-6">Ajoutés au cours des 7 derniers jours</p>
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
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    Nouveau
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
                  {/* ✅ PRIX DYNAMIQUE */}
                  <span className="text-brand font-bold">{formatPrice(product.price)}</span>
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