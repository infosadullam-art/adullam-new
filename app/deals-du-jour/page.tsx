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
      <div className="min-h-screen bg-white">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
              <TrendingUp className="w-8 h-8 mb-2 opacity-90" />
              <h1 className="text-3xl lg:text-4xl font-bold mb-1">Deals du jour</h1>
              <p className="text-sm text-gray-300 max-w-2xl">Profitez des meilleures offres sélectionnées pour vous aujourd'hui</p>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
              <TrendingUp className="w-8 h-8 mb-2 opacity-90" />
              <h1 className="text-3xl lg:text-4xl font-bold mb-1">Deals du jour</h1>
              <p className="text-sm text-gray-300 max-w-2xl">Profitez des meilleures offres sélectionnées pour vous aujourd'hui</p>
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
            <TrendingUp className="w-8 h-8 mb-2 opacity-90" />
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">Deals du jour</h1>
            <p className="text-sm text-gray-300 max-w-2xl">Profitez des meilleures offres sélectionnées pour vous aujourd'hui</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Offres du jour</h2>
            <p className="text-sm text-gray-500">{products.length} produits en promotion</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square relative mb-3 group-hover:shadow-md transition-shadow">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {product.badge}
                    </div>
                  )}
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