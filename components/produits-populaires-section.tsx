"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, ChevronLeft, TrendingUp } from "lucide-react"

// Types
interface Category {
  id: string
  title: string
  name: string
  image: string
  subtitle: string
  slug: string
  productCount?: number
}

export function ProduitsPopulairesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Chargement des vraies catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories?limit=20')
        const data = await res.json()
        
        let categoriesData: any[] = []
        if (data.data && Array.isArray(data.data)) {
          categoriesData = data.data
        } else if (data.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories
        }

        if (categoriesData.length > 0) {
          const formattedCategories = categoriesData.map((c: any, index: number) => ({
            id: c.id,
            title: c.name,
            name: c.name,
            image: [
              "/hand-cream-and-soap.jpg",
              "/camel-milk-skincare.jpg",
              "/health-wellness-belt.jpg",
              "/vr-headset-gaming.jpg",
              "/high-heels-shoes.jpg",
              "/black-smartwatch.jpg",
              "/silk-fabric-heels.jpg",
              "/essential-oils-perfume.jpg",
              "/jewelry.jpg",
              "/sports.jpg",
              "/car-accessories.jpg",
              "/books.jpg"
            ][index % 12] || "/placeholder.jpg",
            subtitle: c.description?.substring(0, 30) || "Découvrir",
            slug: c.slug,
            productCount: c._count?.products || 0
          }))
          
          setCategories(formattedCategories)
        }
      } catch (error) {
        console.error("Erreur chargement catégories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  // Loading
  if (isLoading) {
    return (
      <section className="hidden lg:block w-full bg-white py-6">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
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
    <section className="hidden lg:block w-full bg-white py-6">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* EN-TÊTE COMPACT */}
        <div className="flex items-end justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-amber-400 rounded-full" />
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                Catégories populaires
              </h2>
            </div>
            <p className="text-xs text-gray-500 pl-3">
              Faites défiler pour découvrir toutes nos catégories
            </p>
          </div>
          
          <Link
            href="/categories"
            className="group inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>Toutes les catégories</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* CARROUSEL */}
        <div className="relative group">
          
          {/* FLÈCHE GAUCHE */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Défiler vers la gauche"
            disabled={categories.length <= 6}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* CONTENEUR SCROLLABLE */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group/card block flex-shrink-0 w-[120px]"
              >
                <div className="bg-white rounded-xl border border-gray-100 p-3 hover:border-gray-200 hover:shadow-sm transition-all duration-300 relative">
                  
                  {/* IMAGE */}
                  <div className="relative aspect-square mb-2">
                    <div className="absolute inset-0 bg-gray-50 rounded-lg group-hover/card:scale-105 transition-transform duration-300" />
                    <Image
                      src={category.image}
                      alt={category.title}
                      width={80}
                      height={80}
                      className="relative z-10 w-full h-full object-contain p-2"
                    />
                  </div>

                  {/* TITRE */}
                  <h3 className="text-xs font-medium text-gray-900 text-center line-clamp-1">
                    {category.title}
                  </h3>
                  
                  {/* SOUS-TITRE */}
                  <p className="text-[10px] text-gray-400 text-center mt-0.5 line-clamp-1">
                    {category.subtitle}
                  </p>

                  {/* INDICATEUR DE SURVOL */}
                  <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-gray-300 group-hover/card:bg-amber-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* FLÈCHE DROITE */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Défiler vers la droite"
            disabled={categories.length <= 6}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* INDICATEUR COMPACT */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-[10px] text-gray-400">Glissez ou utilisez les flèches</span>
          <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
          <span className="text-[10px] text-gray-400">{categories.length} catégories</span>
        </div>

        {/* BANDEAU STATISTIQUE MINCE */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="bg-gray-100 p-1 rounded-full">
              <TrendingUp className="w-3 h-3 text-gray-500" />
            </div>
            <span className="text-[10px] text-gray-500">
              +{Math.floor(categories.length * 80)} produits
            </span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500">
              🇨🇮 🇸🇳 🇨🇲
            </span>
            <span className="text-[10px] text-gray-400">
              Top pays
            </span>
          </div>
        </div>
      </div>

      {/* STYLE POUR CACHER LA SCROLLBAR */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}