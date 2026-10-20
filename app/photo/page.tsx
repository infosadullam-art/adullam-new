"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Camera } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface Product {
  id: string
  title: string
  image: string
  price: number
  category?: string
  categorySlug?: string
  inStock?: boolean
}

export default function PhotoResultsPage() {
  const t = useTranslations("search")
  const tCat = useTranslations("categories")
  const { formatPrice } = useCurrencyFormatter()
  const [loaded, setLoaded] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [thumb, setThumb] = useState("")
  const [debug, setDebug] = useState("")

  const catName = (slug?: string, name?: string) =>
    slug && !slug.includes(".") && tCat.has(slug) ? tCat(slug) : name

  useEffect(() => {
    const load = () => {
      try {
        const w = (window as any).__photoSearch
        const raw = sessionStorage.getItem("photoSearch")
        const saved = w || (raw ? JSON.parse(raw) : null)
        const list: Product[] = saved?.products || []
        setProducts(list)
        setThumb(saved?.thumb || "")
        setDebug("memoire=" + (!!w) + " stockage=" + (raw ? raw.length : 0) + " produits=" + list.length)
      } catch (e) {
        setProducts([])
        setDebug("erreur de lecture")
      }
      setLoaded(true)
    }
    load()
    window.addEventListener("photo-search-updated", load)
    return () => window.removeEventListener("photo-search-updated", load)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block"><Header /></div>
      <div className="block lg:hidden"><MobileHeader /></div>

      <main className="pb-28 lg:pb-0">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            {thumb && <img src={thumb} alt="" className="h-12 w-12 rounded-md border object-cover" />}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Résultats pour votre photo</h2>
              {loaded && products.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">{products.length} produits similaires</p>
              )}
            </div>
          </div>

          {loaded && products.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun produit similaire trouvé</h3>
              <p className="text-gray-500 mb-2">
                Essayez avec une photo plus nette, bien éclairée, avec le produit au centre.
              </p>
              <p className="text-xs text-gray-400 mb-6">diagnostic : {debug}</p>
              <Link
                href="/categories"
                className="inline-block px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
              >
                {t("browseCategories")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="border rounded-lg p-3 hover:shadow-lg transition-all group relative"
                >
                  <div className="relative w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.title}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {product.inStock === false && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-medium">{t("outOfStock")}</span>
                      </div>
                    )}
                  </div>
                  {product.category && (
                    <p className="text-xs text-gray-400 mb-1">{catName(product.categorySlug, product.category)}</p>
                  )}
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-brand transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-base font-bold text-brand">{formatPrice(product.price)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <div className="hidden lg:block"><Footer /></div>
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}