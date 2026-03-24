"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function CategoryFilters() {
  const [openSections, setOpenSections] = useState({
    price: true,
    brand: true,
    rating: true,
    origin: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm space-y-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Filtres</h2>
        <button className="text-sm text-brand hover:underline">Réinitialiser</button>
      </div>

      {/* Price Filter */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3 font-semibold"
        >
          Prix
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.price && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Moins de 5,000 XOF</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">5,000 - 10,000 XOF</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">10,000 - 20,000 XOF</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">20,000 - 50,000 XOF</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Plus de 50,000 XOF</span>
            </label>
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="border-t pt-6">
        <button
          onClick={() => toggleSection("brand")}
          className="flex items-center justify-between w-full mb-3 font-semibold"
        >
          Marque
          {openSections.brand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.brand && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Samsung</span>
              <span className="text-xs text-muted-foreground ml-auto">(234)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Apple</span>
              <span className="text-xs text-muted-foreground ml-auto">(187)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Xiaomi</span>
              <span className="text-xs text-muted-foreground ml-auto">(156)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Huawei</span>
              <span className="text-xs text-muted-foreground ml-auto">(142)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Sony</span>
              <span className="text-xs text-muted-foreground ml-auto">(98)</span>
            </label>
            <button className="text-sm text-brand hover:underline mt-2">Voir plus</button>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-t pt-6">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full mb-3 font-semibold"
        >
          Note client
          {openSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={cn("w-3 h-3", i < rating ? "text-[#FFA500] fill-[#FFA500]" : "text-gray-300")}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="currentColor"
                      />
                    </svg>
                  ))}
                  <span className="text-sm ml-1">et plus</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Origin Filter */}
      <div className="border-t pt-6">
        <button
          onClick={() => toggleSection("origin")}
          className="flex items-center justify-between w-full mb-3 font-semibold"
        >
          Origine
          {openSections.origin ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.origin && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Import Chine</span>
              <span className="text-xs text-muted-foreground ml-auto">(1,234)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Import local</span>
              <span className="text-xs text-muted-foreground ml-auto">(567)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Made in Africa</span>
              <span className="text-xs text-muted-foreground ml-auto">(189)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
