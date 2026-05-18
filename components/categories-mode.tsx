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
              bgColor: "#F4F4F4",
              hoverColor: "#FAFAFA",
              textColor: "#0A0A0A",
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
              bgColor: "#F4F4F4",
              hoverColor: "#FAFAFA",
              textColor: "#0A0A0A",
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
              bgColor: "#F4F4F4",
              hoverColor: "#FAFAFA",
              textColor: "#0A0A0A",
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
      <section className="w-full py-4 lg:py-6" style={{ background: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "#D4372B" }} />
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="w-full py-4 lg:py-6" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: "#FFF0F0" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#D4372B" }} />
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-semibold" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                Mode pour toute la famille
              </h2>
              <p className="text-xs" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                Hommes • Femmes • Enfants
              </p>
            </div>
          </div>
          <Link
            href="/categories/mode"
            className="text-xs inline-flex items-center gap-1 transition-colors hover:opacity-70"
            style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}
          >
            Voir toute la mode
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Grille catégories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div 
                key={category.id} 
                className="rounded-xl p-3 space-y-3 transition-all duration-300"
                style={{ background: category.bgColor, border: "0.5px solid #ECECEC" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = category.bgColor; e.currentTarget.style.boxShadow = "none" }}
              >
                {/* Carte catégorie principale */}
                <Link href={category.href} className="group block">
                  <div
                    className="relative bg-white rounded-xl overflow-hidden transition-all duration-300"
                    style={{ border: "0.5px solid #ECECEC" }}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg" style={{ border: "0.5px solid rgba(0,0,0,0.08)" }}>
                          <Icon className="w-3 h-3" style={{ color: "#0A0A0A" }} />
                        </div>
                        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {category.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {category.productCount} produits
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white group-hover:gap-2 transition-all" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          Explorer
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {index === 1 && (
                      <div
                        className="absolute top-2 right-2 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: "#FFF0F0", color: "#D4372B", border: "0.5px solid rgba(212,55,43,0.2)", fontFamily: "'Poppins', sans-serif" }}
                      >
                        Tendance
                      </div>
                    )}
                  </div>
                </Link>

                {/* Produits associés */}
                <div className="grid grid-cols-2 gap-2">
                  {category.products.slice(0, 2).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group block"
                    >
                      <div
                        className="bg-white rounded-lg p-2 transition-all duration-300"
                        style={{ border: "0.5px solid #ECECEC" }}
                      >
                        <div className="relative aspect-square mb-1 rounded-lg overflow-hidden" style={{ background: "#FAFAFA" }}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <h4 className="text-[10px] font-medium line-clamp-1" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                          {product.name}
                        </h4>
                        
                        <p className="text-xs font-semibold mt-0.5" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                          {formatPrice(product.priceUSD)}
                        </p>
                        
                        <p className="text-[8px]" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
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