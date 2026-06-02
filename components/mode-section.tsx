"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Zap, Tag, Truck, Percent, Shirt, Footprints, Baby } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Police Amazon Ember
const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface Product {
  id: string
  name: string
  priceUSD: number
  originalPriceUSD?: number
  image: string
  badge?: string
  moq?: number
  discount?: number
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  icon: any
  productCount: number
  href: string
  products: Product[]
}

interface ModeData {
  men: Product[]
  women: Product[]
  kids: Product[]
}

export function ModeSection() {
  const { formatPrice } = useCurrencyFormatter()
  const [categories, setCategories] = useState<Category[]>([])
  const [flashProducts, setFlashProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(13461)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [modeRes, flashRes] = await Promise.all([
          fetch("/api/categories/mode"),
          fetch("/api/products?limit=8&sort=discount"),
        ])

        const flashData = await flashRes.json()
        let flashList: any[] = flashData.data || flashData.products || []
        setFlashProducts(
          flashList.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.title || p.name || "Produit",
            priceUSD: p.salePrice || p.price || 0,
            originalPriceUSD: p.price || p.originalPrice || 0,
            image: p.images?.[0] || p.image || "/placeholder.jpg",
            discount: p.discount || Math.round(((p.price - (p.salePrice || p.price)) / p.price) * 100) || 40,
          }))
        )

        const modeData = await modeRes.json()
        if (modeData.success && modeData.data) {
          const md = modeData.data as ModeData
          setCategories([
            { id: "men",   name: "Hommes",  slug: "mode-hommes",  image: "/categories/men-fashion.jpg",   icon: Shirt,      productCount: md.men.length   > 0 ? md.men.length   * 100 : 15000, href: "/categorie/t-shirts-homme",  products: md.men.slice(0, 2)   },
            { id: "women", name: "Femmes",  slug: "mode-femmes",  image: "/categories/women-fashion.jpg", icon: Footprints, productCount: md.women.length > 0 ? md.women.length * 100 : 22000, href: "/categorie/robes",  products: md.women.slice(0, 2) },
            { id: "kids",  name: "Enfants", slug: "mode-enfants", image: "/categories/kids-fashion.jpg",  icon: Baby,       productCount: md.kids.length  > 0 ? md.kids.length  * 100 : 8000,  href: "/categorie/mode-enfants", products: md.kids.slice(0, 2)  },
          ])
        }
      } catch (error) {
        console.error("Erreur chargement données:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const h = Math.floor(timeLeft / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60
  const fmt = (n: number) => String(n).padStart(2, "0")

  const copyCouponCode = () => {
    navigator.clipboard.writeText("BIENVENUE10")
    alert("Code promo copié ! -10% sur votre première commande")
  }

  const filters = [
    { id: "all", label: "Toute la mode" },
    { id: "promo", label: "-50%", icon: Percent },
    { id: "new", label: "Nouveautés", icon: Tag },
    { id: "fast", label: "Livraison 24h", icon: Truck },
  ]

  if (isLoading) {
    return (
      <section className="w-full" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#D4372B" }} />
        </div>
      </section>
    )
  }

  return (
    <section className="w-full" style={{ background: "#fff" }}>

      {/* ── HEADER FLASH ──────────────────────────────────────── */}
      <div style={{ background: "#0A0A0A", padding: "12px 16px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded" style={{ background: "#D4372B" }}>
              <Zap className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", fontFamily: amazonFont }}>Flash Mode</p>
              <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>Collections exclusives -50%</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[{ v: h, u: "h" }, { v: m, u: "m" }, { v: s, u: "s" }].map(({ v, u }, i) => (
              <div key={u} className="flex items-center gap-1">
                {i > 0 && <span style={{ color: "#555", fontSize: "11px" }}>:</span>}
                <div style={{ background: "#1A1A1A", borderRadius: "4px", padding: "3px 5px", minWidth: "26px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", fontFamily: amazonFont }}>{fmt(v)}</span>
                  <span style={{ fontSize: "7px", color: "#AAAAAA", fontFamily: amazonFont, marginLeft: "1px" }}>{u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTRES ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2" style={{ scrollbarWidth: "none", borderBottom: "0.5px solid #F0F0F0" }}>
        {filters.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold flex-shrink-0 transition-all duration-200 hover:scale-105"
            style={{
              background: activeFilter === id ? "#0A0A0A" : "#F4F4F4",
              color: activeFilter === id ? "#fff" : "#555",
              fontFamily: amazonFont,
              borderRadius: "20px",
            }}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {label}
          </button>
        ))}
      </div>

      {/* ── VENTES ÉCLAIR ─────────────────────────────────────── */}
      {flashProducts.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: amazonFont }}>
              ⚡ Ventes éclair mode
            </p>
            <Link href="/categorie/sacs-et-maroquinerie" className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1" style={{ color: "#D4372B", fontFamily: amazonFont }}>
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {flashProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5" style={{ width: "120px" }}>
                <div style={{ background: "#fff", borderRadius: "6px", border: "0.5px solid #ECECEC", overflow: "hidden" }}>
                  <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                    <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-bold px-1.5 py-0.5 text-white rounded" style={{ background: "#D4372B" }}>
                      -{product.discount}%
                    </span>
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} width={120} height={120} className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="px-1.5 py-1.5">
                    <p className="truncate mb-0.5" style={{ fontSize: "10px", fontWeight: 500, color: "#0A0A0A", fontFamily: amazonFont }}>{product.name}</p>
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#D4372B", fontFamily: amazonFont }}>{formatPrice(product.priceUSD)}</span>
                      {product.originalPriceUSD && (
                        <span style={{ fontSize: "9px", color: "#AAAAAA", textDecoration: "line-through", fontFamily: amazonFont }}>{formatPrice(product.originalPriceUSD)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── CATÉGORIES MODE ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="px-4 pb-3" style={{ background: "#FAFAFA" }}>
          <div className="flex items-center justify-between py-2 mb-2">
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: amazonFont }}>Mode tendance</p>
            <Link href="/categorie/montres" className="flex items-center gap-0.5 text-[10px] font-semibold transition-all duration-200 hover:gap-1" style={{ color: "#D4372B", fontFamily: amazonFont }}>
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg p-2 transition-all duration-200 hover:shadow-sm" style={{ background: "#fff", border: "0.5px solid #ECECEC", borderRadius: "6px" }}>
                <Link href={category.href} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded" style={{ background: "#F4F4F4" }}>
                      <category.icon className="w-3.5 h-3.5" style={{ color: "#0A0A0A" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#0A0A0A", fontFamily: amazonFont }}>{category.name}</p>
                      <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont }}>{category.productCount.toLocaleString()} produits</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "#ECECEC" }} />
                </Link>

                <div className="grid grid-cols-2 gap-1.5">
                  {category.products.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} className="group block transition-all duration-200 hover:-translate-y-0.5">
                      <div style={{ background: "#FAFAFA", borderRadius: "6px", border: "0.5px solid #ECECEC", overflow: "hidden" }}>
                        <div className="relative aspect-square" style={{ background: "#F4F4F4" }}>
                          <Image src={product.image} alt={product.name} width={80} height={80} className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="p-1">
                          <p className="truncate" style={{ fontSize: "9px", fontWeight: 500, color: "#0A0A0A", fontFamily: amazonFont }}>{product.name}</p>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#D4372B", fontFamily: amazonFont }}>{formatPrice(product.priceUSD)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BANNIÈRE PROMO ─────────────────────────────────────── */}
      <div className="mx-4 my-3 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md" style={{ background: "#0A0A0A", borderRadius: "6px" }}>
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <div>
            <p style={{ fontSize: "9px", color: "#AAAAAA", fontFamily: amazonFont, textTransform: "uppercase", letterSpacing: "0.06em" }}>Première commande</p>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", fontFamily: amazonFont }}>-10% de réduction</p>
          </div>
          <div className="flex items-center gap-1.5">
            <code style={{ fontSize: "10px", fontWeight: 700, color: "#D4372B", letterSpacing: "0.08em", fontFamily: amazonFont }}>BIENVENUE10</code>
            <button
              onClick={copyCouponCode}
              className="text-[9px] font-bold px-2 py-1 rounded transition-all duration-200 hover:scale-105"
              style={{ background: "#D4372B", color: "#fff", fontFamily: amazonFont, borderRadius: "4px" }}
            >
              Copier
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}