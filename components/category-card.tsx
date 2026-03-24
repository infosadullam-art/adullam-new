interface CategoryCardProps {
  category: {
    title: string
    image: string
    subtitle: string
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="p-4">
        <h3 className="text-lg lg:text-xl font-bold mb-2 text-navy">{category.title}</h3>
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
          <img
            src={category.image || "/placeholder.svg"}
            alt={category.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <p className="text-sm text-muted-foreground">{category.subtitle}</p>
      </div>
    </div>
  )
}
