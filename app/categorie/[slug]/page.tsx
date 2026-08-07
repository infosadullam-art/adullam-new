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

  const isProductInStock = (product: any): boolean => {
    if (product.stock === undefined || product.stock === null) return true
    if (typeof product.stock === "number") return product.stock > 0
    if (typeof product.stock === "string") return parseInt(product.stock) > 0
    if (product.inStock !== undefined) return product.inStock === true
    return true
  }

  const titleToSlug = (title: string) => title.toLowerCase().replace(/ /g, "-")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const categoriesRes = await categoriesApi.list()
        console.log("📦 categoriesRes:", categoriesRes)
        
        if (!categoriesRes.success) { 
          console.error("❌ Erreur categoriesApi.list:", categoriesRes)
          setLoading(false)
          return 
        }

        // ✅ CORRECTION : la route /api/categories peut renvoyer soit
        // { success: true, data: [...] } (liste complète, cas public)
        // soit { success: true, data: { data: [...], meta: {...} } } (cas paginé/admin)
        const categories = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data?.data || []
        console.log("📦 categories extraites:", categories.length)

        let foundCategory = categories.find((c: any) => c.slug === slug)

        if (!foundCategory) {
          const decodedSlug = decodeURIComponent(slug).replace(/-/g, " ").toLowerCase()
          foundCategory = categories.find((c: any) => {
            const catName = c.name.toLowerCase()
            const catSlug = titleToSlug(c.name)
            return catName === decodedSlug || catSlug === slug || catName.includes(decodedSlug) || decodedSlug.includes(catName)
          })
        }

        if (foundCategory) {
          setCategory(foundCategory)
          console.log("✅ Catégorie trouvée:", foundCategory.name)
          
          const productsRes = await productsApi.list({ categoryId: foundCategory.id, limit: 100 })
          console.log("📦 productsRes:", productsRes)
          
          if (productsRes.success) {
            // ✅ productsApi.list retourne { success: true, data: { data: [...], meta: {...} } }
            const productList = productsRes.data?.data || []
            setProducts(productList)
            console.log("✅ Produits chargés:", productList.length)
          }
        } else {
          console.warn("⚠️ Catégorie non trouvée pour slug:", slug)
        }
      } catch (error) {
        console.error("❌ Erreur chargement:", error)
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl mb-2" style={{ background: "#F4F4F4" }} />
                <div className="h-3 rounded mb-1.5" style={{ background: "#F4F4F4", width: "80%" }} />
                <div className="h-4 rounded" style={{ background: "#F4F4F4", width: "40%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <div className="text-center py-16 px-4">
          <p className="text-lg font-semibold mb-2" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
            Catégorie introuvable
          </p>
          <p className="text-sm mb-4" style={{ color: "#AAAAAA" }}>
            Slug : {decodeURIComponent(slug)}
          </p>
          <Link
            href="/"
            className="text-sm font-semibold"
            style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <h3
          className="flex items-center justify-between mb-3"
          style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          Prix ({getCurrencySymbol()})
          <ChevronDown className="w-4 h-4" style={{ color: "#AAAAAA" }} />
        </h3>
        <input
          type="range" min="0" max="50000"
          value={filters.priceRange[1]}
          onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })}
          className="w-full accent-[#D4372B]"
        />
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: "11px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>{formatPrice(0)}</span>
          <span style={{ fontSize: "11px", color: "#D4372B", fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>{formatPrice(filters.priceRange[1])}</span>
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid #F0F0F0", paddingTop: "16px" }}>
        <h3
          className="flex items-center justify-between mb-3"
          style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          Marque <ChevronDown className="w-4 h-4" style={{ color: "#AAAAAA" }} />
        </h3>
        <div className="space-y-2">
          {["Samsung", "Apple", "Xiaomi", "Huawei", "Sony"].map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded accent-[#D4372B]" />
              <span style={{ fontSize: "13px", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid #F0F0F0", paddingTop: "16px" }}>
        <h3
          className="flex items-center justify-between mb-3"
          style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          Note <ChevronDown className="w-4 h-4" style={{ color: "#AAAAAA" }} />
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded accent-[#D4372B]" />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-[#F5A623] text-[#F5A623]" : "text-[#ECECEC]"}`} />
                ))}
                <span style={{ fontSize: "11px", color: "#AAAAAA", marginLeft: "3px", fontFamily: "'Poppins', sans-serif" }}>& plus</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid #F0F0F0", paddingTop: "16px" }}>
        <h3
          className="flex items-center justify-between mb-3"
          style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          Origine <ChevronDown className="w-4 h-4" style={{ color: "#AAAAAA" }} />
        </h3>
        <div className="space-y-2">
          {["Import local", "Import Chine", "Import USA", "Import Europe"].map((origin) => (
            <label key={origin} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded accent-[#D4372B]" />
              <span style={{ fontSize: "13px", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>{origin}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-colors"
        style={{ background: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
      >
        Appliquer les filtres
      </button>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      {showFilters && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowFilters(false)}
        >
          <div
            className="absolute right-0 top-0 h-full overflow-y-auto"
            style={{ width: "85%", maxWidth: "360px", background: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 flex items-center justify-between px-5 py-4"
              style={{ background: "#fff", borderBottom: "0.5px solid #F0F0F0" }}
            >
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                Filtres
              </p>
              <button
                onClick={() => setShowFilters(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg focus:outline-none"
                style={{ background: "#F4F4F4" }}
              >
                <X className="w-4 h-4" style={{ color: "#0A0A0A" }} />
              </button>
            </div>
            <div className="px-5 py-5">
              <FilterContent />
            </div>
          </div>
        </div>
      )}

      <main className="pb-20 lg:pb-10">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 lg:py-6">

          <div className="hidden lg:flex items-center gap-1.5 text-xs mb-4" style={{ color: "#AAAAAA" }}>
            <Link href="/" className="hover:text-[#D4372B] transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Accueil
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#0A0A0A", fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}>{category.name}</span>
          </div>

          <div className="mb-4 lg:mb-5">
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(18px, 3vw, 28px)",
                color: "#0A0A0A",
                letterSpacing: "-0.02em",
              }}
            >
              {category.name}
            </h1>
            <p style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif", marginTop: "2px" }}>
              {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="lg:hidden flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              style={{ background: "#fff", border: "0.5px solid #ECECEC", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "#fff",
                border: "0.5px solid #ECECEC",
                borderRadius: "10px",
                color: "#0A0A0A",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <option value="popular">Populaire</option>
              <option value="price-asc">Prix ↑</option>
              <option value="price-desc">Prix ↓</option>
              <option value="newest">Nouveautés</option>
              <option value="rating">Notes</option>
            </select>
          </div>

          <div
            className="hidden lg:flex items-center justify-between p-4 rounded-xl mb-5"
            style={{ background: "#fff", border: "0.5px solid #ECECEC" }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "13px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm focus:outline-none"
                style={{
                  background: "#F4F4F4",
                  borderRadius: "8px",
                  border: "none",
                  color: "#0A0A0A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                }}
              >
                <option value="popular">Plus populaire</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="newest">Nouveautés</option>
                <option value="rating">Meilleures notes</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className="p-2 rounded-lg transition-colors focus:outline-none"
                style={{ background: viewMode === "grid" ? "#D4372B" : "#F4F4F4" }}
              >
                <Grid3x3 className="w-4 h-4" style={{ color: viewMode === "grid" ? "#fff" : "#AAAAAA" }} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded-lg transition-colors focus:outline-none"
                style={{ background: viewMode === "list" ? "#D4372B" : "#F4F4F4" }}
              >
                <LayoutGrid className="w-4 h-4" style={{ color: viewMode === "list" ? "#fff" : "#AAAAAA" }} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-5">

            <div className="hidden lg:block lg:col-span-1">
              <div className="rounded-xl p-5 sticky top-20" style={{ background: "#fff", border: "0.5px solid #ECECEC" }}>
                <FilterContent />
              </div>
            </div>

            <div className="lg:col-span-3">
              {products.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 rounded-xl"
                  style={{ background: "#fff", border: "0.5px solid #ECECEC" }}
                >
                  <p style={{ fontSize: "14px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                    Aucun produit dans cette catégorie
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    const inStock = isProductInStock(product)
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group block"
                        style={{ opacity: inStock ? 1 : 0.7 }}
                      >
                        <div
                          className="overflow-hidden transition-all duration-200 group-hover:shadow-md"
                          style={{ borderRadius: "12px", border: "0.5px solid #ECECEC", background: "#fff" }}
                        >
                          <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                            <Image
                              src={product.images?.[0] || "/placeholder.svg"}
                              alt={product.title}
                              width={200}
                              height={200}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.featured && (
                              <span
                                className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white"
                                style={{ background: "#D4372B" }}
                              >
                                Nouveauté
                              </span>
                            )}
                            {!inStock && (
                              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                                  style={{ background: "#fff", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                                >
                                  Rupture
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-2.5">
                            <h3
                              className="line-clamp-2 mb-1"
                              style={{ fontSize: "11px", fontWeight: 500, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif", lineHeight: 1.4 }}
                            >
                              {product.title}
                            </h3>

                            <div className="flex items-center gap-1 mb-1.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-2.5 h-2.5 ${i < Math.floor(product.avgRating || 4.5) ? "fill-[#F5A623] text-[#F5A623]" : "text-[#ECECEC]"}`}
                                />
                              ))}
                              <span style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                                ({product.purchaseCount || 0})
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span
                                style={{ fontSize: "13px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
                              >
                                {formatPrice(product.price)}
                              </span>
                              {product.oldPrice && product.oldPrice > product.price && (
                                <span
                                  style={{ fontSize: "10px", color: "#AAAAAA", textDecoration: "line-through", fontFamily: "'Poppins', sans-serif" }}
                                >
                                  {formatPrice(product.oldPrice)}
                                </span>
                              )}
                            </div>
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
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  )
}