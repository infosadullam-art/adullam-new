"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Zap, Tag, Truck, Percent, Shirt, Footprints, Baby } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

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
            { id: "men",   name: "Hommes",  slug: "mode-hommes",  image: "/categories/men-fashion.jpg",   icon: Shirt,      productCount: md.men.length   > 0 ? md.men.length   * 100 : 15000, href: "/categories/mode-hommes",  products: md.men.slice(0, 2)   },
            { id: "women", name: "Femmes",  slug: "mode-femmes",  image: "/categories/women-fashion.jpg", icon: Footprints, productCount: md.women.length > 0 ? md.women.length * 100 : 22000, href: "/categories/mode-femmes",  products: md.women.slice(0, 2) },
            { id: "kids",  name: "Enfants", slug: "mode-enfants", image: "/categories/kids-fashion.jpg",  icon: Baby,       productCount: md.kids.length  > 0 ? md.kids.length  * 100 : 8000,  href: "/categories/mode-enfants", products: md.kids.slice(0, 2)  },
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
      <div style={{ background: "#0A0A0A", padding: "14px 16px" }}>
        <div className="flex items-center justify-between">
          {/* Gauche */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "#D4372B" }}>
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>Flash Mode</p>
              <p style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>Collections exclusives -50%</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5">
            {[{ v: h, u: "h" }, { v: m, u: "m" }, { v: s, u: "s" }].map(({ v, u }, i) => (
              <div key={u} className="flex items-center gap-1.5">
                {i > 0 && <span style={{ color: "#555", fontSize: "12px" }}>:</span>}
                <div style={{ background: "#1A1A1A", borderRadius: "6px", padding: "4px 7px", minWidth: "30px", textAlign: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{fmt(v)}</span>
                  <span style={{ fontSize: "8px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif", marginLeft: "1px" }}>{u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTRES ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: "none", borderBottom: "0.5px solid #F0F0F0" }}>
        {filters.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold flex-shrink-0 transition-all"
            style={{
              background: activeFilter === id ? "#0A0A0A" : "#F4F4F4",
              color: activeFilter === id ? "#fff" : "#555",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {label}
          </button>
        ))}
      </div>

      {/* ── VENTES ÉCLAIR ─────────────────────────────────────── */}
      {flashProducts.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
              ⚡ Ventes éclair mode
            </p>
            <Link href="/flash-mode" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {flashProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block flex-shrink-0" style={{ width: "130px" }}>
                <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #ECECEC", overflow: "hidden" }}>
                  <div className="relative aspect-square" style={{ background: "#FAFAFA" }}>
                    <span className="absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 text-white rounded-md" style={{ background: "#D4372B" }}>
                      -{product.discount}%
                    </span>
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} width={130} height={130} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="px-2 py-2">
                    <p className="truncate mb-0.5" style={{ fontSize: "11px", fontWeight: 500, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>{product.name}</p>
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>{formatPrice(product.priceUSD)}</span>
                      {product.originalPriceUSD && (
                        <span style={{ fontSize: "10px", color: "#AAAAAA", textDecoration: "line-through", fontFamily: "'Poppins', sans-serif" }}>{formatPrice(product.originalPriceUSD)}</span>
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
        <div className="px-4 pb-4" style={{ background: "#FAFAFA" }}>
          <div className="flex items-center justify-between py-3 mb-2">
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>Mode tendance</p>
            <Link href="/mode" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-xl p-3" style={{ background: "#fff", border: "0.5px solid #ECECEC" }}>
                <Link href={category.href} className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "#F4F4F4" }}>
                      <category.icon className="w-4 h-4" style={{ color: "#0A0A0A" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>{category.name}</p>
                      <p style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>{category.productCount.toLocaleString()} produits</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: "#ECECEC" }} />
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  {category.products.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} className="group block">
                      <div style={{ background: "#FAFAFA", borderRadius: "10px", border: "0.5px solid #ECECEC", overflow: "hidden" }}>
                        <div className="relative aspect-square" style={{ background: "#F4F4F4" }}>
                          <Image src={product.image} alt={product.name} width={80} height={80} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-1.5">
                          <p className="truncate" style={{ fontSize: "10px", fontWeight: 500, color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>{product.name}</p>
                          <p style={{ fontSize: "11px", fontWeight: 700, color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>{formatPrice(product.priceUSD)}</p>
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
      <div className="mx-4 my-4 rounded-xl overflow-hidden" style={{ background: "#0A0A0A" }}>
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div>
            <p style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Première commande</p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>-10% de réduction</p>
          </div>
          <div className="flex items-center gap-2">
            <code style={{ fontSize: "12px", fontWeight: 700, color: "#D4372B", letterSpacing: "0.08em", fontFamily: "'Poppins', sans-serif" }}>BIENVENUE10</code>
            <button
              onClick={copyCouponCode}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
              style={{ background: "#D4372B", color: "#fff", fontFamily: "'Poppins', sans-serif" }}
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