// app/search/page.tsx - Version corrigée sans flash
"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { Search, Loader2, Filter, X } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useTranslations } from "next-intl"

interface Product {
  id: string
  title: string
  image: string
  price: number
  category?: string
  categorySlug?: string
  inStock?: boolean
  rating?: number
  reviews?: number
}

function SearchContent() {
  const t = useTranslations("search")
  const tCat = useTranslations("categories")
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const photoKey = searchParams.get('photo') || ''
  const hasPhoto = photoKey !== ''
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [photoThumb, setPhotoThumb] = useState('')
  const [photoDebug, setPhotoDebug] = useState('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [availableCategories, setAvailableCategories] = useState<Array<{name: string, slug: string, count: number}>>([])
  
  const { formatPrice } = useCurrencyFormatter()

  // Nom de catégorie traduit via les messages (clé = slug), sinon nom renvoyé par l'API
  const catName = (slug?: string, name?: string) =>
    slug && !slug.includes(".") && tCat.has(slug) ? tCat(slug) : name

  useEffect(() => {
    const fetchSearchResults = async () => {
        if (hasPhoto) {
          try {
            const saved = (window as any).__photoSearch || JSON.parse(sessionStorage.getItem('photoSearch') || 'null')
            const list = saved?.products || []
            setPhotoDebug('win=' + (!!(window as any).__photoSearch) + ' ss=' + (sessionStorage.getItem('photoSearch') || '').length + ' n=' + list.length)
            setProducts(list)
            setPagination({ total: list.length, page: 1, totalPages: 1 })
            setPhotoThumb(saved?.thumb || '')
          } catch (e) {
            setProducts([])
          }
          setIsLoading(false)
          setIsInitialLoad(false)
          return
        }
      if (!query && !hasPhoto) {
        setIsLoading(false)
        setIsInitialLoad(false)
        return
      }
      
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('q', query)
        if (selectedCategory) params.append('category', selectedCategory)
        if (sortBy !== 'relevance') params.append('sort', sortBy)
        params.append('page', pagination.page.toString())
        params.append('limit', '20')
        
        if (priceRange[1] < 1000) {
          params.append('maxPrice', priceRange[1].toString())
        }

        const res = await apiFetch(`/api/search?${params.toString()}`)
        const data = await res.json()

        if (data.success) {
          setProducts(data.data)
          setPagination(data.pagination)
          setAvailableCategories(data.filters?.categories || [])
          
          if (data.filters?.priceRange?.max > 0) {
            setPriceRange([0, data.filters.priceRange.max])
          }
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("❌ Erreur chargement:", error)
        setProducts([])
      } finally {
        setIsLoading(false)
        setIsInitialLoad(false)
      }
    }

    fetchSearchResults()
  }, [query, photoKey, selectedCategory, sortBy, pagination.page, priceRange[1]])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetFilters = () => {
    setSelectedCategory('')
    setPriceRange([0, 1000])
    setSortBy('relevance')
    setPagination(prev => ({ ...prev, page: 1 }))
    setShowFilters(false)
  }

  // ✅ Évite le flash : écran de chargement initial
  if (isInitialLoad && (query || hasPhoto)) {
    return (
      <div className="min-h-screen bg-white">
        <div className="hidden lg:block"><Header /></div>
        <div className="block lg:hidden"><MobileHeader /></div>
        <main className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-white">
        <div className="hidden lg:block"><Header /></div>
        <div className="block lg:hidden"><MobileHeader /></div>
        
        <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 sm:py-12">
          <div className="text-center">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t("startTitle")}</h2>
            <p className="text-sm sm:text-base text-gray-500">
              {t("startText")}
            </p>
          </div>
        </main>

        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block"><Header /></div>
      <div className="block lg:hidden"><MobileHeader /></div>

      <main className="pb-28 lg:pb-0">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4 lg:py-6">

          {/* En-tête recherche - responsive */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {hasPhoto ? (<span className="inline-flex items-center gap-3">{photoThumb && <img src={photoThumb} alt="" className="h-10 w-10 rounded-md border object-cover" />}Résultats pour votre photo</span>) : t("resultsFor", { query })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isLoading ? t("searching") : t("resultsCount", { count: pagination.total })}
                </p>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={hasPhoto ? "hidden" : "lg:hidden flex items-center justify-center gap-2 px-4 py-2 border rounded-lg bg-white"}
              >
                <Filter className="w-4 h-4" />
                {t("filters")}
              </button>
            </div>
          </div>

          {/* Barre de tri - desktop */}
          <div className={hasPhoto ? "hidden" : "hidden lg:flex justify-end mb-6"}>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="relevance">{t("sortRelevance")}</option>
              <option value="price-asc">{t("sortPriceAsc")}</option>
              <option value="price-desc">{t("sortPriceDesc")}</option>
              <option value="rating">{t("sortRating")}</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("noResults")}</h3>
                  {hasPhoto && <p className="text-xs text-gray-400 mb-2">debug photo : {photoDebug}</p>}
              <p className="text-gray-500 mb-6">
                {t("noResultsHint")}
              </p>
              <Link 
                href="/categories" 
                className="inline-block px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
              >
                {t("browseCategories")}
              </Link>
            </div>
          ) : (
            <div className={hasPhoto ? "grid gap-6" : "grid lg:grid-cols-4 gap-6"}>
              
              {/* Sidebar filtres */}
              <div className={hasPhoto ? "hidden" : "hidden lg:block lg:col-span-1"}>
                <div className="bg-gray-50 rounded-lg p-4 sticky top-24">
                  <h3 className="font-bold mb-4">{t("filters")}</h3>
                  
                  {availableCategories.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">{t("categories")}</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedCategory('')
                            setPagination(prev => ({ ...prev, page: 1 }))
                          }}
                          className={`block w-full text-start px-2 py-1 rounded text-sm ${
                            !selectedCategory ? 'bg-brand text-white' : 'hover:bg-gray-200'
                          }`}
                        >
                          {t("all")}
                        </button>
                        {availableCategories.map(cat => (
                          <button
                            key={cat.slug}
                            onClick={() => {
                              setSelectedCategory(cat.slug)
                              setPagination(prev => ({ ...prev, page: 1 }))
                            }}
                            className={`block w-full text-start px-2 py-1 rounded text-sm ${
                              selectedCategory === cat.slug ? 'bg-brand text-white' : 'hover:bg-gray-200'
                            }`}
                          >
                            {catName(cat.slug, cat.name)} ({cat.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">{t("maxPrice")}</h4>
                    <input
                      type="range"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[1]}
                      onChange={(e) => {
                        setPriceRange([0, Number(e.target.value)])
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm mt-1">
                      <span>{formatPrice(0)}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm"
                  >
                    {t("reset")}
                  </button>
                </div>
              </div>

              {/* Grille des résultats */}
              <div className={hasPhoto ? "" : "lg:col-span-3"}>
                {/* Tri mobile */}
                <div className={hasPhoto ? "hidden" : "lg:hidden mb-4"}>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="relevance">{t("sortRelevance")}</option>
                    <option value="price-asc">{t("sortPriceAsc")}</option>
                    <option value="price-desc">{t("sortPriceDesc")}</option>
                    <option value="rating">{t("sortRating")}</option>
                  </select>
                </div>

                {/* Grille produits */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="border rounded-lg p-3 hover:shadow-lg transition-all group relative"
                    >
                      <div className="relative w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                        <Image
                          src={product.image || '/placeholder.jpg'}
                          alt={product.title}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white px-3 py-1 rounded-full text-xs font-medium">
                              {t("outOfStock")}
                            </span>
                          </div>
                        )}
                      </div>

                      {product.category && (
                        <p className="text-xs text-gray-400 mb-1">{catName(product.categorySlug, product.category)}</p>
                      )}

                      <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-brand transition-colors">
                        {product.title}
                      </h3>
                      
                      <p className="text-base font-bold text-brand">
                        {formatPrice(product.price)}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 sm:px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
                    >
                      {t("previous")}
                    </button>
                    
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
                        .map((p, i, arr) => (
                          <div key={p} className="inline-flex items-center">
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="px-1 sm:px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 px-2 sm:px-3 rounded-lg text-sm sm:text-base ${
                                p === pagination.page
                                  ? 'bg-brand text-white'
                                  : 'border hover:bg-gray-50'
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 sm:px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
                    >
                      {t("next")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal filtres mobile */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute end-0 top-0 bottom-0 w-4/5 max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">{t("filters")}</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {availableCategories.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">{t("categories")}</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setPagination(prev => ({ ...prev, page: 1 }))
                      setShowFilters(false)
                    }}
                    className={`block w-full text-start px-2 py-1 rounded text-sm ${
                      !selectedCategory ? 'bg-brand text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {t("all")}
                  </button>
                  {availableCategories.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setSelectedCategory(cat.slug)
                        setPagination(prev => ({ ...prev, page: 1 }))
                        setShowFilters(false)
                      }}
                      className={`block w-full text-start px-2 py-1 rounded text-sm ${
                        selectedCategory === cat.slug ? 'bg-brand text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {catName(cat.slug, cat.name)} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-medium mb-2">{t("maxPrice")}</h4>
              <input
                type="range"
                min="0"
                max={priceRange[1]}
                value={priceRange[1]}
                onChange={(e) => {
                  setPriceRange([0, Number(e.target.value)])
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="w-full"
              />
              <div className="flex justify-between text-sm mt-1">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="w-full px-4 py-2 bg-brand text-white rounded-lg"
            >
              {t("applyFilters")}
            </button>
          </div>
        </div>
      )}

      <div className="hidden lg:block"><Footer /></div>
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}

function SearchLoadingFallback() {
  const t = useTranslations("search")
  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block"><Header /></div>
      <div className="block lg:hidden"><MobileHeader /></div>
      <main className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t("loadingSearch")}</p>
        </div>
      </main>
      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchContent />
    </Suspense>
  )
}