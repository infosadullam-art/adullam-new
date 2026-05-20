"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface Product {
  id: string
  name: string
  price: number
  image: string
}

const slides = [
  { id: 1, image: "/slides/Spring-1.jpg", title: "Collection printemps", href: "/categorie/robe" },
  { id: 2, image: "/slides/Spring-2.jpg", title: "Nouveautés mode",      href: "/categorie/montres" },
  { id: 3, image: "/slides/Spring-3.jpg", title: "Tendances 2026",       href: "/categorie/cuisine" },
]

export function CategoriesPourVous() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideHeight, setSlideHeight] = useState<number | null>(null)
  const productContainerRef = useRef<HTMLDivElement>(null)
  const { formatPrice } = useCurrencyFormatter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/trending/cuisine?limit=4")
        const data = await res.json()
        if (data.success && data.data) {
          setProducts(data.data.map((p: any) => ({
            id: p.id,
            name: p.name || p.title || "Produit",
            price: p.price || 0,
            image: p.image || "/placeholder.jpg",
          })))
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (productContainerRef.current && !slideHeight) {
      setTimeout(() => {
        if (productContainerRef.current) setSlideHeight(productContainerRef.current.offsetHeight)
      }, 100)
    }
  }, [products, slideHeight])

  useEffect(() => {
    const handleResize = () => {
      if (productContainerRef.current) setSlideHeight(productContainerRef.current.offsetHeight)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full" style={{ background: "#0A0A0A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "#D4372B" }} />
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="w-full" style={{ background: "#0A0A0A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ display: "inline-block", width: "3px", height: "18px", background: "#D4372B", borderRadius: "2px" }} />
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
                Tendances Cuisine 🔥
              </h2>
              <p style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                Les produits les plus populaires
              </p>
            </div>
          </div>
          <Link
            href="/categorie/cuisine"
            className="flex items-center gap-0.5 text-xs font-semibold"
            style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grille 4 produits + slide */}
        <div className="grid grid-cols-6 gap-2">

          {/* Produits — 4 colonnes */}
          <div className="col-span-4" ref={productContainerRef}>
            <div className="grid grid-cols-4 gap-2">
              {products.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                  <div
                    className="overflow-hidden transition-all duration-200 group-hover:shadow-md"
                    style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="px-2 py-2">
                      <p
                        className="truncate mb-0.5"
                        style={{ fontSize: "10px", fontWeight: 500, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                      >
                        {product.name}
                      </p>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Slide — 2 colonnes */}
          <div className="col-span-2">
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: "12px",
                height: slideHeight ? `${slideHeight}px` : "auto",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {slides.map((slide, index) => (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 10 : 0 }}
                >
                  <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)" }} />
                  <div className="absolute bottom-2.5 left-3 right-3 z-10">
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff", fontFamily: "'Poppins', sans-serif", lineHeight: 1.2 }}>
                      {slide.title}
                    </p>
                    <span className="flex items-center gap-0.5 mt-1" style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontFamily: "'Poppins', sans-serif" }}>
                      Découvrir <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}

              {/* Dots */}
              <div className="absolute bottom-2.5 right-3 z-20 flex gap-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    style={{
                      width: i === currentSlide ? "16px" : "4px",
                      height: "3px",
                      borderRadius: "2px",
                      background: i === currentSlide ? "#D4372B" : "rgba(255,255,255,0.4)",
                      transition: "all 0.3s ease",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}