"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Zap, Timer, Star } from "lucide-react"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

export default function OffresSpecialesPage() {
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<any[]>([])
  const [flashSale, setFlashSale] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Timer dynamique depuis l'API
  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await fetch('/api/deals/flash-sales/current')
        const data = await res.json()
        if (data.success && data.hasActiveSale) {
          setFlashSale(data.sale)
          setTimeLeft(data.timeLeft)
        }
      } catch (error) {
        console.error('Erreur flash sale:', error)
      }
    }
    fetchFlashSale()

    // Timer qui décompte chaque seconde
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Charger les produits flash sales - CORRIGÉ
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/deals/flash-sales?limit=48')
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <Zap className="w-10 h-10 mb-4" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Offres Spéciales</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-6">Prix imbattables et quantités limitées</p>
            
            <div className="flex items-center gap-3 bg-white/20 rounded-xl px-6 py-3 w-fit backdrop-blur-sm">
              <Timer className="w-5 h-5" />
              <span className="font-medium">Se termine dans :</span>
              <div className="flex gap-1">
                <div className="bg-black/30 rounded-lg px-2 py-1 text-center min-w-[50px]">
                  <div className="text-2xl font-bold">{formatNumber(timeLeft.hours)}</div>
                  <div className="text-[10px]">Heures</div>
                </div>
                <span className="text-2xl font-bold self-center">:</span>
                <div className="bg-black/30 rounded-lg px-2 py-1 text-center min-w-[50px]">
                  <div className="text-2xl font-bold">{formatNumber(timeLeft.minutes)}</div>
                  <div className="text-[10px]">Minutes</div>
                </div>
                <span className="text-2xl font-bold self-center">:</span>
                <div className="bg-black/30 rounded-lg px-2 py-1 text-center min-w-[50px]">
                  <div className="text-2xl font-bold">{formatNumber(timeLeft.seconds)}</div>
                  <div className="text-[10px]">Secondes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ventes Flash</h2>
              <p className="text-sm text-gray-500">Profitez des réductions avant la fin du timer</p>
            </div>
            {flashSale && (
              <div className="text-sm text-gray-500">
                Jusqu'à -{flashSale.discount}%
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
              {products.map((product) => (
                <a key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square relative mb-3 group-hover:shadow-md transition-shadow">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm line-clamp-2 text-gray-800 group-hover:text-gray-900">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
                      {product.oldPrice && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          
          {products.length === 0 && !isLoading && (
            <div className="text-center py-20 text-gray-500">
              Aucune offre spéciale pour le moment
            </div>
          )}
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}