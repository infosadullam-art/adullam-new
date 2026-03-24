import Image from "next/image"

export function CheckoutSummary() {
  const items = [
    {
      name: "Écouteurs sans fil Bluetooth",
      price: 5900,
      quantity: 1,
      image: "/black-wireless-earbuds-main-view.jpg",
    },
    {
      name: "Montre connectée Sport",
      price: 19900,
      quantity: 1,
      image: "/black-smartwatch.jpg",
    },
    {
      name: "Powerbank 20000mAh",
      price: 8500,
      quantity: 1,
      image: "/portable-charger.png",
    },
  ]

  const subtotal = 34300
  const shipping = 2000
  const total = subtotal + shipping

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
      <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>

      {/* Order Items */}
      <div className="space-y-4 mb-6 pb-6 border-b">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="w-16 h-16 bg-neutral-light rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium line-clamp-2 mb-1">{item.name}</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Qté: {item.quantity}</span>
                <span className="font-semibold">{item.price.toLocaleString()} XOF</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-medium">{subtotal.toLocaleString()} XOF</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span className="font-medium">{shipping.toLocaleString()} XOF</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-brand">{total.toLocaleString()} XOF</span>
      </div>
    </div>
  )
}
