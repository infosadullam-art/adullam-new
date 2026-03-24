"use client"

import { useRef } from "react"

interface Category {
  id: string
  name: string
  image: string
}

const categories: Category[] = [
  { id: "1", name: "Électronique", image: "/electronics-icon.png" },
  { id: "2", name: "Mode", image: "/fashion-icon.png" },
  { id: "3", name: "Maison", image: "/home-icon.png" },
  { id: "4", name: "Beauté", image: "/beauty-icon.png" },
  { id: "5", name: "Sports", image: "/sports-icon.png" },
  { id: "6", name: "Cuisine", image: "/kitchen-icon.png" },
  { id: "7", name: "Jouets", image: "/toys-icon.png" },
  { id: "8", name: "Livres", image: "/books-icon.png" },
]

export default function CategoriesSlider() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="px-4 py-6 bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">Catégories</h2>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => (
          <div key={category.id} className="flex-shrink-0 w-20 text-center snap-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-2 hover:bg-gray-200 transition-colors cursor-pointer overflow-hidden">
              <img
                src={category.image || "/placeholder.svg?height=60&width=60&query=category icon"}
                alt={category.name}
                className="w-14 h-14 object-cover"
              />
            </div>
            <p className="text-xs text-foreground font-medium">{category.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
