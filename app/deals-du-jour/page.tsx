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

  // Chargement des vrais produits depuis les APIs
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        console.log('🔄 Début chargement deals du jour...')
        
        // Appels parallèles aux APIs existantes
        const [featuredRes, bestSellersRes] = await Promise.all([
          fetch('/api/deals/featured?limit=12'),
          fetch('/api/deals/best-sellers?limit=12')
        ])

        console.log('📊 Status featured:', featuredRes.status)
        console.log('📊 Status best-sellers:', bestSellersRes.status)

        let featuredProducts: Product[] = []
        let bestSellers: Product[] = []

        // Traitement des produits featured
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json()
          console.log('✅ Données featured reçues:', featuredData)
          
          if (featuredData.success) {
            featuredProducts = (featuredData.data || []).map((p: any, index: number) => ({
              id: p.id,
              name: p.title || p.name,
              price: p.price,
              image: p.image || '/placeholder.jpg',
              badge: p.badge || (index < 3 ? '⭐ Vedette' : undefined),
              rank: index < 3 ? index + 1 : null,
              rating: 4.7,
              reviews: Math.floor(Math.random() * 300) + 150
            }))
            console.log(`📦 ${featuredProducts.length} produits featured`)
          }
        } else {
          console.warn('⚠️ API featured non disponible')
        }

        // Traitement des meilleures ventes
        if (bestSellersRes.ok) {
          const bestSellersData = await bestSellersRes.json()
          console.log('✅ Données best-sellers reçues:', bestSellersData)
          
          if (bestSellersData.success) {
            bestSellers = (bestSellersData.data || []).map((p: any, index: number) => ({
              id: p.id,
              name: p.title || p.name,
              price: p.price,
              image: p.image || '/placeholder.jpg',
              badge: p.badge || (p.purchaseCount > 1000 ? '🔥 Best-seller' : undefined),
              rank: index < 3 ? index + 1 : null,
              rating: 4.7,
              reviews: p.purchaseCount || Math.floor(Math.random() * 300) + 150
            }))
            console.log(`📦 ${bestSellers.length} produits best-sellers`)
          }
        } else {
          console.warn('⚠️ API best-sellers non disponible')
        }

        // Fusionner et mélanger les produits
        const allProducts = [...featuredProducts, ...bestSellers]
          .filter((p, index, self) => 
            index === self.findIndex((t) => t.id === p.id) // Éviter doublons
          )
          .sort(() => Math.random() - 0.5) // Mélange aléatoire
          .slice(0, 24) // Garder 24 max

        console.log(`🎯 Total produits après fusion: ${allProducts.length}`)
        setProducts(allProducts)

      } catch (error) {
        console.error('❌ Erreur chargement deals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeals()
  }, [])

  // Loading
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

  // Pas de produits
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
        {/* Hero */}
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
            {products.length} produits sélectionnés
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                  {product.rank && (
                    <div className="absolute top-2 left-2 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold text-sm">
                      #{product.rank}
                    </div>
                  )}
                  {product.badge && !product.rank && (
                    <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.reviews || Math.floor(Math.random() * 300) + 150})
                    </span>
                  </div>
                  <span className="text-brand font-bold">
                    {formatPrice(product.price)}
                  </span>
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