import { ProductCard } from "@/components/product-card"

export function RelatedProducts() {
  const relatedProducts = [
    {
      id: "1",
      name: "Montre connectée Sport",
      price: 19900,
      originalPrice: 25000,
      image: "/black-smartwatch.jpg",
      rating: 4.5,
      reviews: 156,
      badge: "Tendance",
      origin: "Import Chine",
    },
    {
      id: "2",
      name: "Chargeur sans fil rapide",
      price: 3500,
      image: "/wireless-charger.png",
      rating: 4.3,
      reviews: 89,
      origin: "Import local",
    },
    {
      id: "3",
      name: "Câble USB-C Premium",
      price: 1500,
      image: "/usb-c-cable.jpg",
      rating: 4.7,
      reviews: 234,
      origin: "Import Chine",
    },
    {
      id: "4",
      name: "Powerbank 20000mAh",
      price: 8500,
      originalPrice: 12000,
      image: "/portable-charger.png",
      rating: 4.4,
      reviews: 178,
      badge: "-29%",
      origin: "Import Chine",
    },
  ]

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Produits similaires</h2>
        <a href="#" className="text-brand hover:underline text-sm font-medium">
          Voir tout
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}
