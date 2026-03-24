"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles, Clock, Zap, Tag, Truck, Percent, Shirt, Footprints, Baby } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Types
interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
  badge?: string
  moq?: number
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  icon: any
  bgColor: string
  productCount: string
  href: string
  products: Product[]
}

export function ModeSection() {
  const { formatPrice } = useCurrencyFormatter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(13461)

  // Timer pour les offres flash
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Chargement des vrais produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Récupérer les produits populaires
        const res = await fetch('/api/products?limit=12&sort=popular')
        const data = await res.json()
        
        let productsData: any[] = []
        if (data.data && Array.isArray(data.data)) {
          productsData = data.data
        } else if (data.products && Array.isArray(data.products)) {
          productsData = data.products
        }

        if (productsData.length > 0) {
          // Formater les produits
          const formattedProducts = productsData.map((p: any, index: number) => ({
            id: p.id,
            name: p.title || p.name || "Produit",
            priceUSD: p.price || 0,
            image: p.images?.[0] || p.image || "/placeholder.jpg",
            badge: index % 4 === 0 ? "Nouveau" : index % 3 === 0 ? "Tendance" : undefined,
            moq: p.moq || Math.floor(Math.random() * 10) + 5
          }))

          // Créer les catégories avec les produits
          setCategories([
            {
              id: "men",
              name: "Hommes",
              slug: "mode-hommes",
              image: "/categories/men-fashion.jpg",
              icon: Shirt,
              bgColor: "bg-blue-50",
              productCount: "15k+",
              href: "/categories/mode-hommes",
              products: formattedProducts.slice(0, 2)
            },
            {
              id: "women",
              name: "Femmes",
              slug: "mode-femmes",
              image: "/categories/women-fashion.jpg",
              icon: Footprints,
              bgColor: "bg-pink-50",
              productCount: "22k+",
              href: "/categories/mode-femmes",
              products: formattedProducts.slice(2, 4)
            },
            {
              id: "kids",
              name: "Enfants",
              slug: "mode-enfants",
              image: "/categories/kids-fashion.jpg",
              icon: Baby,
              bgColor: "bg-green-50",
              productCount: "8k+",
              href: "/categories/mode-enfants",
              products: formattedProducts.slice(4, 6)
            }
          ])
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60
  const formatTime = (num: number) => String(num).padStart(2, "0")

  // Produits flash pour la bannière
  const flashProducts = [
    {
      id: "flash1",
      name: "T-shirt premium",
      priceUSD: 14.99,
      originalPriceUSD: 29.99,
      image: "/products/tshirt-premium.jpg",
      discount: 50
    },
    {
      id: "flash2",
      name: "Jean slim",
      priceUSD: 24.99,
      originalPriceUSD: 49.99,
      image: "/products/jeans-slim.jpg",
      discount: 50
    },
    {
      id: "flash3",
      name: "Robe fleurie",
      priceUSD: 19.99,
      originalPriceUSD: 39.99,
      image: "/products/floral-dress.jpg",
      discount: 50
    },
    {
      id: "flash4",
      name: "Baskets mode",
      priceUSD: 29.99,
      originalPriceUSD: 59.99,
      image: "/products/fashion-sneakers.jpg",
      discount: 50
    }
  ]

  if (isLoading) {
    return (
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-white">
      {/* BANNIÈRE FLASH - SPÉCIALE MODE */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-purple-900 via-pink-800 to-amber-800 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 border border-white/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Flash Mode</h2>
                <p className="text-[10px] text-white/80">Collections exclusives -50%</p>
              </div>
            </div>
            
            {/* TIMER */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/70" />
                <span className="text-[10px] text-white/70">Fin dans</span>
                <span className="text-sm font-mono font-bold text-white ml-1">{formatTime(hours)}</span>
                <span className="text-[8px] text-white/50">h</span>
                <span className="text-white/30">:</span>
                <span className="text-sm font-mono font-bold text-white">{formatTime(minutes)}</span>
                <span className="text-[8px] text-white/50">m</span>
                <span className="text-white/30">:</span>
                <span className="text-sm font-mono font-bold text-amber-300">{formatTime(seconds)}</span>
                <span className="text-[8px] text-amber-300/70">s</span>
              </div>
            </div>
          </div>
        </div>

        {/* FILTRES RAPIDES */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button className="bg-gray-900 text-white text-xs px-4 py-2 rounded-full whitespace-nowrap font-medium">
              Toute la mode
            </button>
            <button className="bg-white text-gray-700 text-xs px-4 py-2 rounded-full whitespace-nowrap font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
              <Percent className="w-3 h-3 inline mr-1" />
              -50%
            </button>
            <button className="bg-white text-gray-700 text-xs px-4 py-2 rounded-full whitespace-nowrap font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
              <Tag className="w-3 h-3 inline mr-1" />
              Nouveautés
            </button>
            <button className="bg-white text-gray-700 text-xs px-4 py-2 rounded-full whitespace-nowrap font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
              <Truck className="w-3 h-3 inline mr-1" />
              Livraison 24h
            </button>
          </div>
        </div>

        {/* FLASH PRODUITS EN LIGNE */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">⚡ Ventes éclair mode</h3>
            <Link href="/flash-mode" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
              Voir tout
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {flashProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block flex-shrink-0 w-[140px]"
              >
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-gray-200 group-hover:shadow transition-all">
                  <div className="relative aspect-square bg-white p-2">
                    <div className="absolute top-1 left-1 z-10 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      -{product.discount}%
                    </div>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={140}
                      height={140}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-gray-900 truncate">{product.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-bold text-red-600">{formatPrice(product.priceUSD)}</span>
                      <span className="text-[9px] text-gray-400 line-through">{formatPrice(product.originalPriceUSD)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3 BLOCS MODE AVEC PRODUITS */}
      <div className="px-4 py-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">Mode tendance</h2>
          </div>
          <Link href="/mode" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
            Voir toute la mode
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 BLOCS EN GRILLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className={`${category.bgColor} rounded-xl p-3`}>
              
              {/* EN-TÊTE CATÉGORIE */}
              <Link href={category.href} className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <category.icon className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    <p className="text-[9px] text-gray-500">{category.productCount} produits</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {/* 2 PRODUITS EN LIGNE */}
              <div className="grid grid-cols-2 gap-2">
                {category.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-lg p-2 border border-gray-100 group-hover:border-gray-200 group-hover:shadow-sm transition-all">
                      <div className="relative aspect-square mb-1">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                        />
                        {product.badge && (
                          <span className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[6px] font-medium px-1 py-0.5 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[10px] font-medium text-gray-900 truncate">{product.name}</h4>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">{formatPrice(product.priceUSD)}</p>
                      {product.moq && (
                        <p className="text-[7px] text-gray-400">MOQ: {product.moq}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BANDEAU PROMO */}
      <div className="px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/80 uppercase tracking-wider">Livraison offerte</p>
            <p className="text-sm font-bold text-white">Dès 50€ d'achat</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <p className="text-xs font-medium text-white">CODE: MODE24</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}