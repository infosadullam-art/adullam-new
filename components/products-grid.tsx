import { Star } from "lucide-react"

interface ProductsGridProps {
  section: "popular" | "bestsellers" | "new"
  title: string
}

export default function ProductsGrid({ section, title }: ProductsGridProps) {
  const products = [
    {
      id: 1,
      name: "Soin des mains",
      price: "5 900 XOF",
      image: "/product-hand-cream.jpg",
      rating: 4.5,
      reviews: 210,
    },
    {
      id: 2,
      name: "Soin des camand..",
      price: "8 500 XOF",
      image: "/product-hair-care.jpg",
      rating: 4.8,
      reviews: 189,
    },
    {
      id: 3,
      name: "Santé & Bien-être",
      price: "12 000 XOF",
      image: "/product-wellness.jpg",
      rating: 4.6,
      reviews: 156,
    },
    {
      id: 4,
      name: "Réputer, sameles",
      price: "15 900 XOF",
      image: "/product-electronics.jpg",
      rating: 4.3,
      reviews: 98,
    },
    {
      id: 5,
      name: "Mode & Accessoires",
      price: "22 500 XOF",
      image: "/product-fashion.jpg",
      rating: 4.7,
      reviews: 342,
    },
    {
      id: 6,
      name: "Electronique",
      price: "45 000 XOF",
      image: "/product-watch.jpg",
      rating: 4.9,
      reviews: 421,
    },
    {
      id: 7,
      name: "Soie et utlialies",
      price: "8 200 XOF",
      image: "/product-silk.jpg",
      rating: 4.4,
      reviews: 267,
    },
    {
      id: 8,
      name: "Csquets sadores",
      price: "18 900 XOF",
      image: "/product-perfume.jpg",
      rating: 4.5,
      reviews: 178,
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0B1F3F]">{title}</h2>
        <button className="text-[#007185] hover:text-[#FF6B35] hover:underline font-medium text-sm">Voir atout</button>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group border border-border"
          >
            <div className="aspect-square relative overflow-hidden bg-white p-4">
              <img
                src={product.image || `/placeholder.svg?height=180&width=180&query=${product.name}`}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 pt-2">
              <h3 className="text-xs font-normal text-foreground mb-2 line-clamp-2 leading-tight">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-[#FFA41C] fill-[#FFA41C]" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm font-normal text-foreground">
                <span className="font-bold">{product.price}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
