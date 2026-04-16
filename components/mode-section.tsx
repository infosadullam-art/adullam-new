"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles, Clock, Zap, Tag, Truck, Percent, Shirt, Footprints, Baby } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface Product {
  id: string
  name: string
  priceUSD: number
  originalPriceUSD?: number
  image: string
  badge?: string
  moq?: number
  discount?: number
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  icon: any
  bgColor: string
  productCount: number
  href: string
  products: Product[]
}

interface ModeData {
  men: Product[]
  women: Product[]
  kids: Product[]
}

export function ModeSection() {
  const { formatPrice } = useCurrencyFormatter()
  const [categories, setCategories] = useState<Category[]>([])
  const [flashProducts, setFlashProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(13461)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        const res = await fetch('/api/categories/mode')
        const data = await res.json()
        
        const flashRes = await fetch('/api/products?limit=8&sort=discount')
        const flashData = await flashRes.json()

        let flashList: any[] = []
        if (flashData.data && Array.isArray(flashData.data)) {
          flashList = flashData.data
        } else if (flashData.products && Array.isArray(flashData.products)) {
          flashList = flashData.products
        }

        const formattedFlashProducts = flashList.slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.title || p.name || "Produit",
          priceUSD: p.salePrice || p.price || 0,
          originalPriceUSD: p.price || p.originalPrice || 0,
          image: p.images?.[0] || p.image || "/placeholder.jpg",
          discount: p.discount || Math.round(((p.price - (p.salePrice || p.price)) / p.price) * 100) || 40,
          badge: "Flash"
        }))

        setFlashProducts(formattedFlashProducts)

        if (data.success && data.data) {
          const modeData = data.data as ModeData
          
          const categoriesData = [
            {
              id: "men",
              name: "Hommes",
              slug: "mode-hommes",
              image: "/categories/men-fashion.jpg",
              icon: Shirt,
              bgColor: "bg-blue-50",
              productCount: modeData.men.length > 0 ? modeData.men.length * 100 : 15000,
              href: "/categories/mode-hommes",
              products: modeData.men.slice(0, 2)
            },
            {
              id: "women",
              name: "Femmes",
              slug: "mode-femmes",
              image: "/categories/women-fashion.jpg",
              icon: Footprints,
              bgColor: "bg-pink-50",
              productCount: modeData.women.length > 0 ? modeData.women.length * 100 : 22000,
              href: "/categories/mode-femmes",
              products: modeData.women.slice(0, 2)
            },
            {
              id: "kids",
              name: "Enfants",
              slug: "mode-enfants",
              image: "/categories/kids-fashion.jpg",
              icon: Baby,
              bgColor: "bg-green-50",
              productCount: modeData.kids.length > 0 ? modeData.kids.length * 100 : 8000,
              href: "/categories/mode-enfants",
              products: modeData.kids.slice(0, 2)
            }
          ]
          
          setCategories(categoriesData)
        }

      } catch (error) {
        console.error("Erreur chargement données:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60
  const formatTime = (num: number) => String(num).padStart(2, "0")

  const copyCouponCode = () => {
    navigator.clipboard.writeText("BIENVENUE10")
    alert("Code promo copié ! -10% sur votre première commande")
  }

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

        {flashProducts.length > 0 && (
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
                        {product.originalPriceUSD && (
                          <span className="text-[9px] text-gray-400 line-through">{formatPrice(product.originalPriceUSD)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {categories.length > 0 && (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className={`${category.bgColor} rounded-xl p-3`}>
                
                <Link href={category.href} className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm">
                      <category.icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                      <p className="text-[9px] text-gray-500">{category.productCount.toLocaleString()} produits</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

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
      )}

      <div className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-white" />
            <div>
              <p className="text-[7px] text-white/80 uppercase tracking-wider">Première commande</p>
              <p className="text-[10px] font-bold text-white">-10%</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5">
            <code className="text-[9px] font-bold text-white tracking-wider">BIENVENUE10</code>
            <button 
              onClick={copyCouponCode}
              className="bg-white text-amber-600 px-1.5 py-0.5 rounded text-[7px] font-bold hover:bg-gray-100 transition-colors"
            >
              Copier
            </button>
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