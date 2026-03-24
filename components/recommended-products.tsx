import { ProductCard } from "@/components/product-card"

export function RecommendedProducts() {
  const products = [
    {
      id: "1",
      name: "Câble USB-C Premium",
      price: 1500,
      image: "/usb-c-cable.jpg",
      rating: 4.7,
      reviews: 234,
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
      name: "Étui de protection premium",
      price: 2500,
      image: "/phone-case-premium.jpg",
      rating: 4.6,
      reviews: 156,
      origin: "Import Chine",
    },
    {
      id: "4",
      name: "Support téléphone voiture",
      price: 2000,
      image: "/car-phone-mount.jpg",
      rating: 4.4,
      reviews: 112,
      origin: "Import Chine",
    },
  ]

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold text-foreground mb-6">Vous pourriez aussi aimer</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}
