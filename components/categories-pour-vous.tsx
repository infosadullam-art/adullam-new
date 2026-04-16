"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Types
interface Product {
  id: string
  name: string
  price: number
  image: string
}

const slides = [
  {
    id: 1,
    image: "/slides/Spring-1.jpg",
    title: "Collection printemps",
    href: "/collections/printemps",
  },
  {
    id: 2,
    image: "/slides/Spring-2.jpg",
    title: "Nouveautés mode",
    href: "/collections/nouveautes",
  },
  {
    id: 3,
    image: "/slides/Spring-3.jpg",
    title: "Tendances 2026",
    href: "/collections/tendances",
  },
]

export function CategoriesPourVous() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideHeight, setSlideHeight] = useState<number | null>(null)
  const productContainerRef = useRef<HTMLDivElement>(null)
  const slideContainerRef = useRef<HTMLDivElement>(null)

  // Hook de devise dynamique
  const { formatPrice } = useCurrencyFormatter()

  // ✅ CHARGEMENT DES PRODUITS TENDANCES (exemple: cuisine)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/trending/cuisine?limit=4')
        const data = await res.json()
        
        console.log("📦 Réponse API trending:", data)
        
        if (data.success && data.data) {
          const formattedProducts = data.data.map((p: any) => ({
            id: p.id,
            name: p.name || p.title || "Produit",
            price: p.price || 0,
            image: p.image || "/placeholder.jpg"
          }))
          setProducts(formattedProducts)
          console.log(`✅ ${formattedProducts.length} produits tendances chargés`)
        } else {
          console.log("⚠️ Aucun produit trouvé")
        }
      } catch (error) {
        console.error("❌ Erreur chargement produits:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  // Auto-défilement du slide images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Ajuster la hauteur du slide à celle des produits
  useEffect(() => {
    if (productContainerRef.current && !slideHeight) {
      setTimeout(() => {
        if (productContainerRef.current) {
          setSlideHeight(productContainerRef.current.offsetHeight)
        }
      }, 100)
    }
  }, [products, slideHeight])

  // Recalculer si la fenêtre est redimensionnée
  useEffect(() => {
    const handleResize = () => {
      if (productContainerRef.current) {
        setSlideHeight(productContainerRef.current.offsetHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Loading
  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
          </div>
        </div>
      </div>
    )
  }

  // Si pas de produits, on n'affiche rien
  if (products.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        
        {/* TITRE */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
            <div>
              <h2 className="text-sm font-medium text-white">
                Tendances Cuisine 🔥
              </h2>
              <p className="text-[9px] text-white/60 mt-0.5">
                Les produits les plus populaires
              </p>
            </div>
          </div>
          <Link
            href="/categories/cuisine"
            className="text-[10px] text-white/50 hover:text-white transition-colors flex items-center gap-0.5"
          >
            Voir tout
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* GRILLE 4/2 */}
        <div className="grid grid-cols-6 gap-2">
          
          {/* GRILLE PRODUITS TENDANCES */}
          <div className="col-span-4" ref={productContainerRef}>
            <div className="grid grid-cols-4 gap-2">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:shadow-lg transition-all border border-white/20 hover:border-white/40">
                    <div className="relative aspect-square p-2">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-1.5">
                      <h3 className="text-[10px] font-medium text-white/90 truncate">
                        {product.name}
                      </h3>
                      <p className="text-[9px] font-semibold text-red-400 mt-0.5">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* SLIDE IMAGES */}
          <div className="col-span-2">
            <div 
              ref={slideContainerRef}
              className="relative rounded-lg overflow-hidden w-full"
              style={{ height: slideHeight ? `${slideHeight}px` : 'auto' }}
            >
              {slides.map((slide, index) => (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-xs font-medium text-white line-clamp-1">{slide.title}</h3>
                    <span className="text-[8px] text-white/80 flex items-center gap-0.5 mt-0.5">
                      Découvrir
                      <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </Link>
              ))}

              {/* INDICATEURS */}
              <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-1 h-1 rounded-full transition-all ${
                      index === currentSlide ? "w-2 bg-amber-400" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}