export default function CategoryBlocks() {
  const categories = [
    {
      title: "Maison et cuisine",
      subtitle: "Petits électroménagers",
      image: "/home-kitchen-category.jpg",
    },
    {
      title: "Cadeaux Made in Africa",
      items: ["Cadeaux artisanaux", "Produits naturels"],
      image: "/african-gifts-category.jpg",
    },
    {
      title: "Personnalisez votre commande",
      image: "/personalize-category.jpg",
    },
    {
      title: "-60% à l'achat de 2 articles",
      image: "/promo-60-category.jpg",
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-4 gap-6">
        {categories.map((category, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-5">
              <h3 className="font-bold text-lg text-[#0B1F3F] mb-4 min-h-[56px]">{category.title}</h3>
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-secondary">
                <img
                  src={category.image || `/placeholder.svg?height=200&width=300&query=${category.title}`}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {category.subtitle && (
                <p className="text-sm text-[#007185] hover:text-[#FF6B35] hover:underline cursor-pointer">
                  {category.subtitle}
                </p>
              )}
              {category.items && (
                <div className="space-y-1">
                  {category.items.map((item, itemIdx) => (
                    <p
                      key={itemIdx}
                      className="text-sm text-[#007185] hover:text-[#FF6B35] hover:underline cursor-pointer"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
