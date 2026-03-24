"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLocale } from "@/context/LocaleProvider"
import { ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  image: string
  productCount: number
  subcategories?: string[]
  score?: number
}

export function CategoriesSection() {
  const { country } = useLocale() // ✅ currency n'était pas utilisé
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/graph/categories?country=${country}&limit=12`)
        const data = await res.json()
        
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error("Erreur chargement catégories", error)
        setCategories(fallbackCategories)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [country])

  const fallbackCategories: Category[] = [
    { id: "1", name: "Électronique", slug: "electronique", image: "/cat-electronics.jpg", productCount: 1234, score: 0.95 },
    { id: "2", name: "Mode", slug: "mode", image: "/cat-fashion.jpg", productCount: 892, score: 0.92 },
    { id: "3", name: "Maison", slug: "maison", image: "/cat-home.jpg", productCount: 756, score: 0.88 },
    { id: "4", name: "Beauté", slug: "beaute", image: "/cat-beauty.jpg", productCount: 645, score: 0.85 },
    { id: "5", name: "Sport", slug: "sport", image: "/cat-sports.jpg", productCount: 523, score: 0.82 },
    { id: "6", name: "Alimentaire", slug: "alimentaire", image: "/cat-food.jpg", productCount: 412, score: 0.78 },
    { id: "7", name: "Bijoux", slug: "bijoux", image: "/cat-jewelry.jpg", productCount: 389, score: 0.75 },
    { id: "8", name: "Enfants", slug: "enfants", image: "/cat-kids.jpg", productCount: 267, score: 0.72 },
  ]

  if (isLoading) {
    return (
      <section className="w-full bg-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ========== VERSION MOBILE ==========
  const MobileCategories = () => (
    <div className="lg:hidden space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Catégories</h2>
          <p className="text-xs text-gray-500 mt-0.5">Basé sur vos préférences</p>
        </div>
        <Link href="/categories" className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-900">
          Voir tout
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 min-w-max pb-2">
          {categories.slice(0, 12).map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group block w-[90px]">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:border-gray-200 transition-all">
                <div className="relative aspect-square mb-2">
                  <Image
                    src={category.image || "/placeholder.svg"} // ✅ CORRIGÉ
                    alt={category.name}
                    width={60}
                    height={60}
                    className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-[11px] font-medium text-gray-900 text-center line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-[9px] text-gray-400 text-center mt-0.5">
                  {category.productCount 
                    ? (category.productCount > 999 
                      ? `${(category.productCount / 1000).toFixed(1)}k` 
                      : category.productCount)
                    : '0'} produits
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="text-[10px] text-gray-500">
          {categories.length} catégories • Mises en avant pour vous
        </span>
      </div>
    </div>
  )

  // ========== VERSION DESKTOP ==========
  const DesktopCategories = () => (
    <div className="hidden lg:block bg-gray-50/80 rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Catégories populaires</h2>
          <p className="text-sm text-gray-500 mt-1">Découvrez nos sélections par catégorie</p>
        </div>
        <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
          Explorer
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {categories.slice(0, 8).map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`} className="group block">
            <div className="bg-white rounded-xl p-4 border border-gray-100 group-hover:border-gray-200 group-hover:shadow-sm transition-all">
              <div className="relative aspect-square mb-3">
                <Image
                  src={category.image || "/placeholder.svg"} // ✅ CORRIGÉ
                  alt={category.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">{category.name}</h3>
              <p className="text-xs text-gray-400 text-center mt-1">
                {category.productCount?.toLocaleString() || 0} produits {/* ✅ CORRIGÉ */}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {categories[0]?.score && (
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Pertinence: {Math.round((categories[0]?.score || 0) * 100)}%
          </span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400">Basé sur vos interactions</span>
        </div>
      )}
    </div>
  )

  return (
    <section className="w-full bg-white py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MobileCategories />
        <DesktopCategories />
      </div>
    </section>
  )
}