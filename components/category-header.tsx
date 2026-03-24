"use client"

import { SlidersHorizontal, Grid3x3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface CategoryHeaderProps {
  onToggleFilters: () => void
}

export function CategoryHeader({ onToggleFilters }: CategoryHeaderProps) {
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="py-6 lg:py-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Électronique</h1>
          <p className="text-muted-foreground">2,847 produits</p>
        </div>

        {/* Desktop View Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-brand text-white border-brand" : "bg-transparent"}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-brand text-white border-brand" : "bg-transparent"}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters and Sort Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Mobile Filter Button */}
        <Button onClick={onToggleFilters} variant="outline" className="lg:hidden flex-1 bg-transparent">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtres
        </Button>

        {/* Sort Dropdown */}
        <div className="flex-1 lg:flex-initial">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand text-sm"
          >
            <option value="popular">Les plus populaires</option>
            <option value="newest">Les plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Meilleures notes</option>
          </select>
        </div>
      </div>
    </div>
  )
}
