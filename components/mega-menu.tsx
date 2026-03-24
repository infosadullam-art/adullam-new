"use client"

import { useState } from "react"

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState(0)

  const categories = [
    {
      name: "Électronique",
      subcategories: ["Téléphones", "Ordinateurs", "TV & Audio", "Accessoires", "Gaming"],
    },
    {
      name: "Mode",
      subcategories: ["Vêtements Hommes", "Vêtements Femmes", "Chaussures", "Sacs", "Montres"],
    },
    {
      name: "Maison & Cuisine",
      subcategories: ["Électroménager", "Meubles", "Décoration", "Cuisine", "Jardin"],
    },
    {
      name: "Beauté & Santé",
      subcategories: ["Parfums", "Soins", "Maquillage", "Fitness", "Bien-être"],
    },
    {
      name: "Sports",
      subcategories: ["Vêtements Sport", "Chaussures Sport", "Équipement", "Outdoor"],
    },
  ]

  return (
    <div className="absolute left-0 right-0 bg-white border-t border-b border-border shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-5 gap-8">
          {categories.map((category, idx) => (
            <div key={idx}>
              {/* TITRE AVEC ÉTAT ACTIF */}
              <button
                onClick={() => setActiveCategory(idx)}
                className={`font-bold mb-3 text-left w-full transition-colors ${
                  activeCategory === idx
                    ? "text-[#0B1F3F]"
                    : "text-[#0B1F3F]/70"
                }`}
              >
                {category.name}
              </button>

              {/* BARRE ACTIVE */}
              <div
                className={`h-[3px] w-10 mb-3 transition-all ${
                  activeCategory === idx ? "bg-[#FF6B35]" : "bg-transparent"
                }`}
              />

              <ul className="space-y-2">
                {category.subcategories.map((sub, subIdx) => (
                  <li key={subIdx}>
                    <button className="text-sm text-muted-foreground hover:text-[#FF6B35] hover:underline">
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
