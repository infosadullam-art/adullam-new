"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { TrendingUp, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useState, useEffect } from "react"

interface Product {
  id: string | number
  name: string
  price: number
  image: string
  badge?: string
  rank?: number | null
  rating?: number
  reviews?: number
}

export default function DealsDuJourPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // ✅ Utiliser l'API flash-sales existante
        const res = await fetch('/api/deals/flash-sales?limit=24')
        const data = await res.json()
        
        if (data.success && data.data) {
          const formattedProducts = data.data.map((p: any, index: number) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image || '/placeholder.jpg',
            badge: p.discount ? `-${p.discount}%` : undefined,
            rank: index < 3 ? index + 1 : null,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0
          }))
          setProducts(formattedProducts)
        }
      } catch (error) {
        console.error('❌ Erreur chargement deals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeals()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
              <TrendingUp className="w-10 h-10 mb-4" />
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Deals du jour</h1>
              <p className="text-xl mb-6 max-w-2xl">Profitez des meilleures offres sélectionnées pour vous aujourd'hui</p>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
              <TrendingUp className="w-10 h-10 mb-4" />
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Deals du jour</h1>
              <p className="text-xl mb-6 max-w-2xl">Profitez des meilleures offres sélectionnées pour vous aujourd'hui</p>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 text-center">
            <p className="text-gray-500">Aucune offre disponible pour le moment</p>
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <TrendingUp className="w-10 h-10 mb-4" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Deals du jour</h1>
            <p className="text-xl mb-6 max-w-2xl">Profitez des meilleures offres sélectionnées pour vous aujourd'hui</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <h2 className="text-2xl font-bold mb-2">Offres du jour</h2>
          <p className="text-muted-foreground mb-6">
            {products.length} produits en promotion
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-neutral-light relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform"
                  />
                  {product.badge && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2 text-gray-800">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
                  </div>
                  <span className="text-brand font-bold text-sm">{formatPrice(product.price)}</span>
                </div>
              </Link>
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