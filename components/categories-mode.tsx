"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles, Shirt, Footprints, Baby } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Police Amazon Ember
const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
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
  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>({})

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
              href: "/categorie/mode-hommes",
              products: menProducts.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                priceUSD: p.price,
                image: p.images?.[0] || p.image || "/placeholder.jpg",
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
              href: "/categorie/mode-femmes",
              products: womenProducts.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                priceUSD: p.price,
                image: p.images?.[0] || p.image || "/placeholder.jpg",
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
              href: "/categorie/mode-enfants",
              products: kidsProducts.map((p: any) => ({
                id: p.id,
                name: p.title || p.name,
                priceUSD: p.price,
                image: p.images?.[0] || p.image || "/placeholder.jpg",
              }))
            }
          ])

          setTimeout(() => setVisibleCards({ men: true }), 100)
          setTimeout(() => setVisibleCards(prev => ({ ...prev, women: true })), 200)
          setTimeout(() => setVisibleCards(prev => ({ ...prev, kids: true })), 300)
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
      <section className="w-full py-2" style={{ background: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: "#D4372B" }} />
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="w-full py-2" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - tailles augmentées */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded" style={{ background: "#FFF0F0", borderRadius: "4px" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#D4372B" }} />
            </div>
            <div>
              <h2 className="text-sm lg:text-base font-semibold" style={{ color: "#0A0A0A", fontFamily: amazonFont }}>
                Mode pour toute la famille
              </h2>
              <p className="text-xs lg:text-sm" style={{ color: "#AAAAAA", fontFamily: amazonFont }}>
                Hommes • Femmes • Enfants
              </p>
            </div>
          </div>
          <Link
            href="/categorie/t-shirts-homme"
            className="text-xs lg:text-sm inline-flex items-center gap-1 transition-all duration-200 hover:gap-1.5 hover:opacity-70"
            style={{ color: "#AAAAAA", fontFamily: amazonFont }}
          >
            Voir toute la mode
            <ChevronRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          </Link>
        </div>

        {/* Grille catégories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categories.map((category, index) => {
            const Icon = category.icon
            const isVisible = visibleCards[category.id]
            const delay = index * 100

            return (
              <div 
                key={category.id} 
                className="p-3 space-y-2 transition-all duration-1000 ease-in-out"
                style={{ 
                  background: "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)",
                  border: "0.5px solid #ECECEC",
                  borderRadius: "6px",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms, background 0.3s ease`,
                  animation: "gradientShift 8s ease-in-out infinite",
                  animationDelay: `${index * 2}s`,
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.background = "#FAFAFA"
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                {/* Carte catégorie principale */}
                <Link href={category.href} className="group block">
                  <div
                    className="relative bg-white overflow-hidden transition-all duration-300"
                    style={{ border: "0.5px solid #ECECEC", borderRadius: "6px" }}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="bg-white/90 backdrop-blur-sm p-1 rounded" style={{ border: "0.5px solid rgba(0,0,0,0.08)" }}>
                          <Icon className="w-3 h-3" style={{ color: "#0A0A0A" }} />
                        </div>
                        <h3 className="text-xs font-semibold text-white" style={{ fontFamily: amazonFont }}>
                          {category.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/80" style={{ fontFamily: amazonFont }}>
                          {category.productCount} produits
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white transition-all duration-200 group-hover:gap-1.5" style={{ fontFamily: amazonFont }}>
                          Explorer
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>

                    {index === 1 && (
                      <div
                        className="absolute top-2 right-2 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: "#FFF0F0", color: "#D4372B", border: "0.5px solid rgba(212,55,43,0.2)", fontFamily: amazonFont }}
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
                      className="group block transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div
                        className="bg-white p-2 transition-all duration-300 hover:shadow-sm"
                        style={{ border: "0.5px solid #ECECEC", borderRadius: "6px" }}
                      >
                        <div className="relative aspect-square mb-1.5 overflow-hidden" style={{ background: "#FAFAFA", borderRadius: "4px" }}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <h4 className="text-[11px] font-medium line-clamp-2 min-h-[32px]" style={{ color: "#0A0A0A", fontFamily: amazonFont }}>
                          {product.name}
                        </h4>
                        
                        <p className="text-xs font-semibold mt-1" style={{ color: "#D4372B", fontFamily: amazonFont }}>
                          {formatPrice(product.priceUSD)}
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

      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
          }
          50% {
            background: linear-gradient(135deg, #FFF5F5 0%, #FAFAFA 100%);
          }
          100% {
            background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
          }
        }
      `}</style>
    </section>
  )
}