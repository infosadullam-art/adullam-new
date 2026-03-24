"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Star } from "lucide-react"

interface Product {
  id: string
  name: string
  price: string
  image: string
  origin: string
  originFlag?: string
  countdown?: boolean
  rating?: number
  reviewCount?: number
}

const dealsRow1: Product[] = [
  {
    id: "1",
    name: "Écouteurs sans fil",
    price: "5,900 XOF",
    image: "/black-wireless-earbuds.jpg",
    origin: "Import local",
    originFlag: "🇨🇮",
    countdown: true,
  },
  {
    id: "2",
    name: "Robe Africaine",
    price: "3,200 XOF",
    image: "/colorful-african-dress.png",
    origin: "Import local",
  },
  {
    id: "3",
    name: "Mixeur",
    price: "9,500 XOF",
    image: "/electric-blender.jpg",
    origin: "Import Chine",
    originFlag: "🇨🇳",
    countdown: true,
  },
]

const dealsRow2: Product[] = [
  {
    id: "4",
    name: "Sandales en cuir",
    price: "3,200 XOF",
    image: "/brown-leather-sandals.jpg",
    origin: "Import local",
    rating: 5,
    reviewCount: 210,
  },
  {
    id: "5",
    name: "Café premium",
    price: "1,000 XOF",
    image: "/rustic-coffee-bag.png",
    origin: "Import Chine",
    rating: 5,
    reviewCount: 210,
  },
  {
    id: "6",
    name: "Bracelet",
    price: "12,000 XOF",
    image: "/colorful-beaded-bracelet.png",
    origin: "Import Chine",
    rating: 5,
    reviewCount: 210,
  },
]

export default function DealsSection() {
  const [countdown, setCountdown] = useState(12861) // 03:14:21

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="relative aspect-square bg-gray-50">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <p className="text-base font-bold text-foreground mb-1">
          <span className="text-lg">{product.price.split(" ")[0].replace("*", "")}</span>{" "}
          <span className="text-xs font-normal">XOF</span>
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          {product.origin} {product.originFlag}
        </p>
        {product.countdown && (
          <div className="bg-primary text-white text-xs px-2 py-1 rounded text-center font-medium">
            {formatTime(countdown)}
          </div>
        )}
        {product.rating && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <section className="px-4 py-4">
      {/* First row */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#8B1538] uppercase">Offres du jour</h2>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs rounded-md font-medium">
            {formatTime(countdown)}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {dealsRow1.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Second row */}
      <div>
        <h2 className="text-base font-bold text-[#8B1538] uppercase mb-4">Offres du jour</h2>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {dealsRow2.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
