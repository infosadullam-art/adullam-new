"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Heart, Share2 } from "lucide-react"
import Image from "next/image"

interface FeedItem {
  id: number
  title: string
  description: string
  image?: string
  likes: number
  comments: number
}

export default function FeedPage() {
  const feedItems: FeedItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Post intéressant ${i + 1}`,
    description: `Ceci est une description courte pour le post numéro ${i + 1}.`,
    image: i % 2 === 0 ? `/placeholder.svg?height=300&width=300` : undefined,
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
  }))

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
        <h1 className="text-2xl lg:text-3xl font-bold mb-6">Fil d’actualité</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
              {item.image && (
                <div className="relative w-full aspect-square bg-neutral-light">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{item.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#C72C1C]" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>{item.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <button className="px-4 py-2 border rounded-lg hover:bg-neutral-light">Précédent</button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-lg ${page === 1 ? "bg-[#C72C1C] text-white" : "border hover:bg-neutral-light"}`}
            >
              {page}
            </button>
          ))}
          <button className="px-4 py-2 border rounded-lg hover:bg-neutral-light">Suivant</button>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
