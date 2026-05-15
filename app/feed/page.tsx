"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Heart, Share2, Clock, Sparkles, Rocket } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface FeedItem {
  id: number
  title: string
  description: string
  image?: string
  likes: number
  comments: number
}

export default function FeedPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const feedItems: FeedItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Post intéressant ${i + 1}`,
    description: `Ceci est une description courte pour le post numéro ${i + 1}.`,
    image: i % 2 === 0 ? `/placeholder.svg?height=300&width=300` : undefined,
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
  }))

  return (
    <div className="min-h-screen bg-neutral-light pb-20 lg:pb-0">
      {/* Header */}
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 relative">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6">Fil d'actualité</h1>

        {/* Contenu original avec overlay */}
        <div className="relative min-h-[calc(100vh-200px)]">
          {/* Design original (flouté) */}
          <div className="blur-sm opacity-40 pointer-events-none select-none">
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
            <div className="flex justify-center mt-8">
              <div className="overflow-x-auto pb-2 max-w-full">
                <div className="flex justify-center gap-2 min-w-max">
                  <button className="px-3 py-2 border rounded-lg hover:bg-neutral-light whitespace-nowrap">Précédent</button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button key={page} className={`px-4 py-2 rounded-lg whitespace-nowrap ${page === 1 ? "bg-[#C72C1C] text-white" : "border hover:bg-neutral-light"}`}>
                      {page}
                    </button>
                  ))}
                  <button className="px-3 py-2 border rounded-lg hover:bg-neutral-light whitespace-nowrap">Suivant</button>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay animé professionnel - POSITION FIXE */}
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-md z-50 transition-all duration-700" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className={`transform transition-all duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
              {/* Animation de particules / cercle pulsant */}
              <div className="relative mb-6 flex justify-center">
                <div className="absolute rounded-full bg-[#C72C1C]/20 animate-ping" style={{ animationDuration: '1.5s', width: '80px', height: '80px' }}></div>
                <div className="absolute rounded-full bg-[#C72C1C]/10 animate-pulse" style={{ animationDuration: '2s', width: '100px', height: '100px' }}></div>
                <div className="relative bg-gradient-to-br from-[#C72C1C] to-[#E85D4C] rounded-full p-5 shadow-xl">
                  <Rocket className="w-12 h-12 text-white animate-bounce" style={{ animationDuration: '1s' }} />
                </div>
              </div>

              {/* Texte animé */}
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#C72C1C] to-[#E85D4C] bg-clip-text text-transparent mb-3 text-center animate-pulse">
                Bientôt disponible
              </h2>
              
              <p className="text-gray-600 text-center max-w-md mb-2 px-4">
                Nous préparons quelque chose de spécial pour vous.
              </p>
              <p className="text-gray-400 text-sm text-center max-w-md mb-8 px-4">
                Cette fonctionnalité arrivera très prochainement. Restez connectés !
              </p>

              {/* Barre de progression animée */}
              <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-8 mx-auto">
                <div className="h-full bg-gradient-to-r from-[#C72C1C] to-[#E85D4C] rounded-full animate-progress" style={{ width: '65%', animation: 'progress 2s ease-in-out infinite' }}></div>
              </div>

              {/* Bouton de retour */}
              <button 
                onClick={() => window.location.href = "/"}
                className="group relative px-8 py-3 bg-white border-2 border-[#C72C1C] text-[#C72C1C] rounded-full font-medium overflow-hidden transition-all hover:bg-[#C72C1C] hover:text-white hover:shadow-lg mx-auto block"
              >
                <span className="relative z-10">Retour à l'accueil</span>
                <div className="absolute inset-0 bg-[#C72C1C] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>

              {/* Badge "Coming soon" */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Coming soon</span>
                <Sparkles className="w-3 h-3 text-[#C72C1C]" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Styles pour l'animation de la barre de progression */}
      <style jsx global>{`
        @keyframes progress {
          0% { width: 30%; opacity: 0.7; }
          50% { width: 70%; opacity: 1; }
          100% { width: 30%; opacity: 0.7; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}