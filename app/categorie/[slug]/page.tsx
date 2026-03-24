"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { ChevronRight, ChevronDown, SlidersHorizontal, Grid3x3, LayoutGrid, Star, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { categoriesApi, productsApi } from "@/lib/admin/api-client"
import { useParams } from "next/navigation"

export default function CategoryPage() {
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const params = useParams()
  const slug = params.slug as string

  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("popular")
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    brands: [] as string[],
    rating: 0,
    origin: [] as string[],
  })

  // ✅ FONCTION CORRIGÉE : Un produit est en stock SAUF si stock = 0
  const isProductInStock = (product: any): boolean => {
    // Si stock n'existe pas → En stock
    if (product.stock === undefined || product.stock === null) return true
    
    // Si stock est un nombre
    if (typeof product.stock === 'number') {
      return product.stock > 0
    }
    
    // Si stock est un string
    if (typeof product.stock === 'string') {
      return parseInt(product.stock) > 0
    }
    
    // Si inStock est défini
    if (product.inStock !== undefined) {
      return product.inStock === true
    }
    
    // Par défaut → En stock
    return true
  }

  // Fonction pour convertir un titre en slug
  const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-')
  }

  // Charger les données
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        console.log("🔍 Chargement pour slug:", slug)
        
        // 1. Récupérer toutes les catégories
        const categoriesRes = await categoriesApi.list()
        console.log("📦 Catégories reçues:", categoriesRes)
        
        if (!categoriesRes.success) {
          console.log("❌ Erreur chargement catégories")
          setLoading(false)
          return
        }
        
        const categories = categoriesRes.data as any[]
        
        // 2. Trouver la catégorie par slug
        let foundCategory = categories.find(c => c.slug === slug)
        console.log("🎯 Recherche par slug exact:", foundCategory?.name)
        
        // 3. Si pas trouvé, chercher par correspondance
        if (!foundCategory) {
          const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ').toLowerCase()
          
          foundCategory = categories.find(c => {
            const catName = c.name.toLowerCase()
            const catSlug = titleToSlug(c.name)
            
            return (
              catName === decodedSlug ||
              catSlug === slug ||
              catName.includes(decodedSlug) ||
              decodedSlug.includes(catName)
            )
          })
          console.log("🎯 Recherche alternative:", foundCategory?.name)
        }
        
        if (!foundCategory) {
          console.log("❌ Aucune catégorie trouvée")
          setLoading(false)
          return
        }
        
        setCategory(foundCategory)
        console.log("✅ Catégorie trouvée ID:", foundCategory.id)
        
        // 4. Récupérer les produits de cette catégorie
        console.log("🔍 Appel productsApi avec categoryId:", foundCategory.id)
        const productsRes = await productsApi.list({ 
          categoryId: foundCategory.id,
          limit: 100
        })
        
        console.log("📦 Réponse produits brute:", productsRes)
        
        if (productsRes.success) {
          const productsData = productsRes.data || []
          console.log(`✅ ${productsData.length} produits trouvés`)
          setProducts(productsData)
        } else {
          console.log("❌ productsRes.success = false")
          setProducts([])
        }
        
      } catch (error) {
        console.error("❌ Erreur:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) {
      loadData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Catégorie non trouvée</h1>
          <p className="text-muted-foreground mb-4">Le slug recherché : {decodeURIComponent(slug)}</p>
          <Link href="/" className="text-brand hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-[400px] bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">Filtres</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {/* Price Range */}
              <div>
                <h3 className="font-bold mb-4 flex items-center justify-between">
                  Prix ({getCurrencySymbol()})
                  <ChevronDown className="w-5 h-5" />
                </h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [0, Number.parseInt(e.target.value)] })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{formatPrice(0)}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-4 flex items-center justify-between">
                  Marque
                  <ChevronDown className="w-5 h-5" />
                </h3>
                <div className="space-y-2">
                  {["Samsung", "Apple", "Xiaomi", "Huawei", "Sony"].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-4 flex items-center justify-between">
                  Note
                  <ChevronDown className="w-5 h-5" />
                </h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm ml-1">& plus</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Origin */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-4 flex items-center justify-between">
                  Origine
                  <ChevronDown className="w-5 h-5" />
                </h3>
                <div className="space-y-2">
                  {["Import local", "Import Chine", "Import USA", "Import Europe"].map((origin) => (
                    <label key={origin} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{origin}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors">
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20 lg:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-muted-foreground hover:text-brand">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{category.name}</span>
          </div>

          {/* Category Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-3xl font-bold mb-1">{category.name}</h1>
            <p className="text-sm text-muted-foreground">
              {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Mobile Toolbar */}
          <div className="lg:hidden flex items-center justify-between gap-2 mb-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg border text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm"
            >
              <option value="popular">Populaire</option>
              <option value="price-asc">Prix ↑</option>
              <option value="price-desc">Prix ↓</option>
              <option value="newest">Nouveautés</option>
              <option value="rating">Notes</option>
            </select>
          </div>

          {/* Desktop Toolbar */}
          <div className="hidden lg:block bg-white rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="popular">Plus populaire</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="newest">Plus récent</option>
                  <option value="rating">Meilleures notes</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-brand text-white" : "hover:bg-neutral-light"}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-brand text-white" : "hover:bg-neutral-light"}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg p-6 space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-bold mb-4 flex items-center justify-between">
                    Prix ({getCurrencySymbol()})
                    <ChevronDown className="w-5 h-5" />
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({ ...filters, priceRange: [0, Number.parseInt(e.target.value)] })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{formatPrice(0)}</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4 flex items-center justify-between">
                    Marque
                    <ChevronDown className="w-5 h-5" />
                  </h3>
                  <div className="space-y-2">
                    {["Samsung", "Apple", "Xiaomi", "Huawei", "Sony"].map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4 flex items-center justify-between">
                    Note
                    <ChevronDown className="w-5 h-5" />
                  </h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="text-sm ml-1">& plus</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Origin */}
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4 flex items-center justify-between">
                    Origine
                    <ChevronDown className="w-5 h-5" />
                  </h3>
                  <div className="space-y-2">
                    {["Import local", "Import Chine", "Import USA", "Import Europe"].map((origin) => (
                      <label key={origin} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{origin}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors">
                  Appliquer les filtres
                </button>
              </div>
            </div>

            {/* Product Grid - AVEC LA CORRECTION */}
            <div className="lg:col-span-3">
              {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-muted-foreground">Aucun produit dans cette catégorie pour le moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    // ✅ Utiliser la fonction corrigée
                    const inStock = isProductInStock(product)
                    
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}  // ✅ Correction : products au lieu de produit
                        className={`bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-shadow ${
                          !inStock ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="relative aspect-square bg-neutral-light">
                          <Image
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.title}
                            width={200}
                            height={200}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                          {product.featured && (
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-700">
                              Nouveauté
                            </div>
                          )}
                          {/* ✅ N'affiche Rupture que si vraiment en rupture */}
                          {!inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="bg-white px-2 py-0.5 rounded text-[10px] font-semibold">Rupture</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <h3 className="font-medium text-xs mb-1 line-clamp-2">{product.title}</h3>
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 ${
                                  i < Math.floor(product.avgRating || 4.5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-[10px] text-muted-foreground ml-0.5">({product.purchaseCount || 0})</span>
                          </div>
                          <div className="flex items-baseline gap-1 flex-wrap">
                            <span className="text-brand font-bold text-xs">{formatPrice(product.price)}</span>
                            {product.oldPrice && product.oldPrice > product.price && (
                              <span className="text-[9px] text-muted-foreground line-through">
                                {formatPrice(product.oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}