"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

type Tab = "description" | "specifications" | "reviews"

export function ProductTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("description")

  return (
    <div className="border-t pt-8 mb-8 lg:mb-16">
      {/* Tab Navigation */}
      <div className="flex gap-6 border-b mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("description")}
          className={cn(
            "pb-4 px-2 font-medium text-sm lg:text-base whitespace-nowrap transition-colors border-b-2",
            activeTab === "description"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("specifications")}
          className={cn(
            "pb-4 px-2 font-medium text-sm lg:text-base whitespace-nowrap transition-colors border-b-2",
            activeTab === "specifications"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Caractéristiques
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "pb-4 px-2 font-medium text-sm lg:text-base whitespace-nowrap transition-colors border-b-2",
            activeTab === "reviews"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Avis clients (210)
        </button>
      </div>

      {/* Tab Content */}
      <div className="prose max-w-none">
        {activeTab === "description" && (
          <div className="space-y-4 text-foreground">
            <p className="leading-relaxed">
              Découvrez une expérience audio exceptionnelle avec ces écouteurs sans fil Bluetooth 5.0. Dotés d'une
              technologie de réduction de bruit active, ils vous permettent de vous immerger complètement dans votre
              musique, vos podcasts ou vos appels.
            </p>
            <h3 className="font-semibold text-lg mt-6 mb-3">Caractéristiques principales:</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Bluetooth 5.0 pour une connexion stable et rapide</li>
              <li>Réduction de bruit active (ANC) pour une isolation sonore optimale</li>
              <li>Autonomie de 8 heures en lecture continue, 24 heures avec le boîtier de charge</li>
              <li>Charge rapide: 15 minutes de charge = 2 heures d'écoute</li>
              <li>Résistance à l'eau IPX5</li>
              <li>Contrôles tactiles intuitifs</li>
              <li>Micro intégré pour les appels mains libres</li>
            </ul>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Marque</span>
                <span className="text-muted-foreground">TechSound Pro</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Modèle</span>
                <span className="text-muted-foreground">TS-200</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Version Bluetooth</span>
                <span className="text-muted-foreground">5.0</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Portée</span>
                <span className="text-muted-foreground">10 mètres</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Autonomie</span>
                <span className="text-muted-foreground">8h (24h avec boîtier)</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Temps de charge</span>
                <span className="text-muted-foreground">1.5 heures</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Résistance à l'eau</span>
                <span className="text-muted-foreground">IPX5</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium">Poids</span>
                <span className="text-muted-foreground">5g par écouteur</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Review Summary */}
            <div className="bg-neutral-light p-6 rounded-lg">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-1">4.2</div>
                  <div className="flex items-center gap-1 justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn("w-4 h-4", i < 4 ? "fill-[#FFA500] text-[#FFA500]" : "text-gray-300")}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">210 avis</div>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm w-12">{rating} étoiles</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FFA500]"
                          style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : 3}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {rating === 5 ? 147 : rating === 4 ? 42 : rating === 3 ? 11 : rating === 2 ? 6 : 4}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {[
                {
                  name: "Kouassi A.",
                  rating: 5,
                  date: "15 décembre 2024",
                  comment:
                    "Excellents écouteurs! Le son est clair et la réduction de bruit fonctionne très bien. Je recommande.",
                },
                {
                  name: "Marie D.",
                  rating: 4,
                  date: "10 décembre 2024",
                  comment:
                    "Bon produit dans l'ensemble. L'autonomie est conforme à la description. Seul bémol: le boîtier est un peu gros.",
                },
                {
                  name: "Yao K.",
                  rating: 5,
                  date: "5 décembre 2024",
                  comment: "Livraison rapide et produit conforme. Très satisfait de mon achat!",
                },
              ].map((review, index) => (
                <div key={index} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold mb-1">{review.name}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3 h-3",
                              i < review.rating ? "fill-[#FFA500] text-[#FFA500]" : "text-gray-300",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
