interface Product {
  id: string
  name: string
  price: string
  image: string
}

const trendingProducts: Product[] = [
  {
    id: "1",
    name: "Chaussures colorées",
    price: "8,200 XOF",
    image: "/colorful-sneakers.png",
  },
  {
    id: "2",
    name: "Montre intelligente",
    price: "19,900 XOF",
    image: "/black-smartwatch.jpg",
  },
  {
    id: "3",
    name: "Montre sport",
    price: "21,900 XOF",
    image: "/sport-smartwatch.jpg",
  },
]

export default function TrendingSection() {
  return (
    <section className="px-4 py-4">
      <h2 className="text-base font-bold text-[#8B1538] mb-4">Tendances du moment</h2>

      <div className="grid grid-cols-3 gap-3">
        {trendingProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="relative aspect-square bg-gray-50">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-base font-bold text-foreground">
                <span className="text-lg">{product.price.split(" ")[0].replace("*", "")}</span>{" "}
                <span className="text-xs font-normal">XOF</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
