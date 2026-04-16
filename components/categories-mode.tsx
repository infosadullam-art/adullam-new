"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles, Shirt, Footprints, Baby } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Types
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

  // Chargement des produits
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
          // Répartir les produits
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
              bgColor: "bg-blue-50", // Bleu très pâle
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
              bgColor: "bg-pink-50", // Rose très pâle
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
              bgColor: "bg-green-50", // Vert très pâle
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

  // Loading
  if (isLoading) {
    return (
      <section className="w-full bg-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
          </div>
        </div>
      </section>
    )
  }

  // Si pas de catégories
  if (categories.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITRE */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                Mode pour toute la famille
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Hommes • Femmes • Enfants
              </p>
            </div>
          </div>
          <Link
            href="/categories/mode"
            className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
          >
            Voir toute la mode
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 BLOCS AVEC COULEURS DOUCES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div 
                key={category.id} 
                className={`${category.bgColor} ${category.hoverColor} ${category.textColor} rounded-2xl p-5 space-y-4 shadow-sm transition-all duration-300 hover:shadow-md`}
              >
                {/* BLOC CATÉGORIE */}
                <Link
                  href={category.href}
                  className="group block"
                >
                  <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 group-hover:border-gray-300 group-hover:shadow-md transition-all duration-300">
                    
                    {/* IMAGE */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    {/* CONTENU */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      
                      {/* ICÔNE + TITRE */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-lg border border-white/50">
                          <Icon className="w-4 h-4 text-gray-700" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          {category.name}
                        </h3>
                      </div>

                      {/* STATS + CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/80">
                          {category.productCount} produits
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-white group-hover:gap-2 transition-all">
                          Explorer
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* BADGE TRENDING PLUS SUBTIL */}
                    {index === 1 && (
                      <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full border border-amber-200">
                        Tendance
                      </div>
                    )}
                  </div>
                </Link>

                {/* PRODUITS */}
                <div className="grid grid-cols-2 gap-3">
                  {category.products.slice(0, 2).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-xl border border-gray-200 p-3 group-hover:border-gray-300 group-hover:shadow-sm transition-all">
                        
                        {/* IMAGE */}
                        <div className="relative aspect-square mb-2 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* INFOS */}
                        <h4 className="text-xs font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatPrice(product.priceUSD)}
                        </p>
                        
                        <p className="text-[10px] text-gray-500 mt-0.5">
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