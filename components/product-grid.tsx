import { ProductCard } from "@/components/product-card"

export function ProductGrid() {
  const products = Array(24)
    .fill(null)
    .map((_, i) => ({
      id: `${i + 1}`,
      name: [
        "Écouteurs sans fil Bluetooth",
        "Montre connectée Sport",
        "Chargeur sans fil rapide",
        "Câble USB-C Premium",
        "Powerbank 20000mAh",
        "Support téléphone voiture",
        "Étui de protection premium",
        "Lampe LED bureau",
      ][i % 8],
      price: [5900, 19900, 3500, 1500, 8500, 2000, 2500, 4200][i % 8],
      originalPrice: i % 3 === 0 ? [8500, 25000, 4500, 2000, 12000, 3000, 3500, 6000][i % 8] : undefined,
      image: [
        "/black-wireless-earbuds-main-view.jpg",
        "/black-smartwatch.jpg",
        "/wireless-charger.png",
        "/usb-c-cable.jpg",
        "/portable-charger.png",
        "/car-phone-mount.jpg",
        "/phone-case-premium.jpg",
        "/desk-lamp-led.jpg",
      ][i % 8],
      rating: [4.5, 4.3, 4.7, 4.4, 4.6, 4.2, 4.8, 4.1][i % 8],
      reviews: [210, 156, 89, 234, 178, 112, 156, 67][i % 8],
      badge: i % 3 === 0 ? "-31%" : i % 5 === 0 ? "Tendance" : undefined,
      origin: i % 2 === 0 ? "Import Chine" : "Import local",
    }))

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-light transition-colors disabled:opacity-50">
          Précédent
        </button>
        <button className="px-4 py-2 bg-brand text-white rounded-lg">1</button>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-light transition-colors">
          2
        </button>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-light transition-colors">
          3
        </button>
        <span className="px-2">...</span>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-light transition-colors">
          12
        </button>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-light transition-colors">
          Suivant
        </button>
      </div>
    </div>
  )
}
