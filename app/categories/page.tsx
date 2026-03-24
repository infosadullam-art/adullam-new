"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { useRouter } from "next/navigation"

const categories = [
  { name: "Électronique", slug: "electronique", image: "/placeholder.svg" },
  { name: "Mode", slug: "mode", image: "/placeholder.svg" },
  { name: "Maison & Cuisine", slug: "maison-cuisine", image: "/placeholder.svg" },
  { name: "Beauté & Santé", slug: "beaute-sante", image: "/placeholder.svg" },
  { name: "Sport & Loisirs", slug: "sport-loisirs", image: "/placeholder.svg" },
  { name: "Jouets & Enfants", slug: "jouets-enfants", image: "/placeholder.svg" },
  { name: "Automobile", slug: "automobile", image: "/placeholder.svg" },
  { name: "Informatique", slug: "informatique", image: "/placeholder.svg" },
]

export default function CategoriesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-[#0B1F3F]">Toutes les catégories</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => router.push(`/categorie/${category.slug}`)} // ← lien vers page dynamique
              className="flex flex-col items-center bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative w-full aspect-square bg-neutral-light">
                <Image
                  src={category.image} 
                  alt={category.name} 
                  fill 
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="p-3 w-full text-center">
                <span className="text-[#0B1F3F] font-medium">{category.name}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
