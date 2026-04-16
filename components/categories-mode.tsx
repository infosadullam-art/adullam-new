"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles, Shirt, Footprints, Baby } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
  moq: number
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  icon: any
  bgColor: string
  hoverColor: string
  textColor: string
  description: string
  productCount: string
  href: string
  products: Product[]
}

export function CategoriesMode() {
  const { formatPrice } = useCurrencyFormatter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=20&sort=popular')
        const data = await res.json()
        
        let products: any[] = []
        if (data.data && Array.isArray(data.data)) {
          products = data.data
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products
        }

        if (products.length > 0) {
          const menProducts = products.filter((_, i) => i % 3 === 0).slice(0, 2)
          const womenProducts = products.filter((_, i) => i % 3 === 1).slice(0, 2)
          const kidsProducts = products.filter((_, i) => i % 3 === 2).slice(0, 2)

          setCategories([
            {
              id: "men",
              name: "Mode Hommes",
              slug: "mode-hommes",
              image: "/categories/men-fashion.jpg",
              icon: Shirt,
              bgColor: "bg-blue-50",
              hoverColor: "hover:bg-blue-100",
              textColor: "text-gray-900",
              description: "Vêtements, chaussures, accessoires",
              productCount: "15k+",
              href: "/categories/mode-hommes",
              products: menProducts.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                priceUSD: p.price,
                image: p.images?.[0] || p.image || "/placeholder.jpg",
                moq: p.moq || Math.floor(Math.random() * 10) + 5
              }))
            },
            {
              id: "women",
              name: "Mode Femmes",
              slug: "mode-femmes",
              image: "/categories/women-fashion.jpg",
              icon: Footprints,
              bgColor: "bg-pink-50",
              hoverColor: "hover:bg-pink-100",
              textColor: "text-gray-900",
              description: "Robes, sacs, chaussures",
              productCount: "22k+",
              href: "/categories/mode-femmes",
              products: womenProducts.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                priceUSD: p.price,
                image: p.images?.[0] || p.image || "/placeholder.jpg",
                moq: p.moq || Math.floor(Math.random() * 10) + 5
              }))
            },
            {
              id: "kids",
              name: "Mode Enfants",
              slug: "mode-enfants",
              image: "/categories/kids-fashion.jpg",
              icon: Baby,
              bgColor: "bg-green-50",
              hoverColor: "hover:bg-green-100",
              textColor: "text-gray-900",
              description: "Vêtements, chaussures, accessoires",
              productCount: "8k+",
              href: "/categories/mode-enfants",
              products: kidsProducts.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                priceUSD: p.price,
                image: p.images?.[0] || p.image || "/placeholder.jpg",
                moq: p.moq || Math.floor(Math.random() * 10) + 5
              }))
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

  if (isLoading) {
    return (
      <section className="w-full bg-white py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-white py-4 lg:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-semibold text-gray-900">
                Mode pour toute la famille
              </h2>
              <p className="text-xs text-gray-500">
                Hommes • Femmes • Enfants
              </p>
            </div>
          </div>
          <Link
            href="/categories/mode"
            className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
          >
            Voir toute la mode
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div 
                key={category.id} 
                className={`${category.bgColor} ${category.hoverColor} ${category.textColor} rounded-xl p-3 space-y-3 shadow-sm transition-all duration-300 hover:shadow-md`}
              >
                <Link
                  href={category.href}
                  className="group block"
                >
                  <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 group-hover:border-gray-300 group-hover:shadow-md transition-all duration-300">
                    
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-white/50">
                          <Icon className="w-3 h-3 text-gray-700" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">
                          {category.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/80">
                          {category.productCount} produits
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white group-hover:gap-2 transition-all">
                          Explorer
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {index === 1 && (
                      <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-[9px] font-medium px-1.5 py-0.5 rounded-full border border-amber-200">
                        Tendance
                      </div>
                    )}
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  {category.products.slice(0, 2).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 p-2 group-hover:border-gray-300 group-hover:shadow-sm transition-all">
                        
                        <div className="relative aspect-square mb-1 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <h4 className="text-[10px] font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">
                          {formatPrice(product.priceUSD)}
                        </p>
                        
                        <p className="text-[8px] text-gray-500">
                          MOQ: {product.moq}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}