"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"

// ============================================================
// ICONES SVG MAISON
// (stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
// strokeLinejoin="round", viewBox 0 0 24 24 — cohérent avec le
// reste du site)
// ============================================================
function TrendingUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9 5.8 20.3l1.6-6.8L2.2 8.9l6.9-.6L12 2Z" />
    </svg>
  )
}

interface Product {
  id: string | number
  name: string
  price: number
  image: string
  badge?: string
  rank?: number | null
  rating?: number
  reviews?: number
}

export default function DealsDuJourPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await apiFetch('/api/deals/flash-sales?limit=24')
        const data = await res.json()
        
        if (data.success && data.data) {
          const formattedProducts = data.data.map((p: any, index: number) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image || '/placeholder.jpg',
            badge: p.discount ? `-${p.discount}%` : undefined,
            rank: index < 3 ? index + 1 : null,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0
          }))
          setProducts(formattedProducts)
        }
      } catch (error) {
        console.error('❌ Erreur chargement deals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeals()
  }, [])

  // Bandeau héro — toujours sombre par choix de branding, indépendant du thème clair/sombre du site
  const HeroBanner = () => (
    <div className="bg-neutral-950">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold mb-1 text-white tracking-tight">
              Deals du jour
            </h1>
            <p className="text-sm text-neutral-400">
              Profitez des meilleures offres sélectionnées pour vous aujourd'hui
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <HeroBanner />
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="pb-20 lg:pb-8">
          <HeroBanner />
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune offre disponible pour le moment</p>
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        {/* Hero Banner */}
        <div className="bg-neutral-950">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-black text-white tracking-tight leading-[1.1]" style={{ fontSize: "clamp(22px, 4vw, 36px)" }}>
                  Deals du jour
                </h1>
                <p className="text-[13px] text-neutral-400">
                  Profitez des meilleures offres sélectionnées pour vous aujourd'hui
                </p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {[
                { label: "Offres limitées", dot: "bg-accent" },
                { label: "Livraison rapide", dot: "bg-green-500" },
                { label: "Paiement sécurisé", dot: "bg-sky-500" },
              ].map(({ label, dot }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white"
                >
                  <span className={`w-[5px] h-[5px] rounded-full inline-block flex-shrink-0 ${dot}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
          
          {/* Header section */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-extrabold text-[16px] text-foreground tracking-tight">
                Offres du jour
              </h2>
              <p className="text-[12px] text-muted-foreground">
                {products.length} produits en promotion
              </p>
            </div>
          </div>

          {/* Grille produits */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden mb-2.5 rounded-xl bg-card shadow-xs transition-all duration-200 group-hover:shadow-md">
                  {/* Rang badge — top 3 */}
                  {product.rank && product.rank <= 3 && (
                    <span
                      className={`absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white ${
                        product.rank === 1 ? "bg-accent-amber" : product.rank === 2 ? "bg-zinc-400" : "bg-amber-700"
                      }`}
                    >
                      {product.rank}
                    </span>
                  )}
                  
                  {/* Badge offre */}
                  {product.badge && (
                    <div className="absolute top-2 right-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-white">
                      {product.badge}
                    </div>
                  )}
                  
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Infos */}
                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-[12px] font-medium text-foreground leading-[1.4]">
                    {product.name}
                  </h3>

                  {/* Étoiles */}
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-accent-amber text-accent-amber" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Prix */}
                  <p className="text-[13px] font-bold text-accent">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
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