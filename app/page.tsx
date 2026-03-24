"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { HeroSection } from "@/components/hero-section"
import { ProduitsPopulairesSection } from "@/components/produits-populaires-section"
import { ForYouSection } from "@/components/for-you-section"
import { TendanceParPays } from "@/components/tendances-section"
import { ModeSection } from "@/components/mode-section"
import { Footer } from "@/components/footer"
import MobileNav from "@/components/mobile-nav"
import { DealCountdown } from "@/components/deal-countdown"
import { CategoriesPourVous } from "@/components/categories-pour-vous"
import { RecommandeEntreprise } from "@/components/recommande-entreprise"
import { CategoriesMode } from "@/components/categories-mode"
import { MeilleuresVentesMobile } from "@/components/meilleures-ventes-mobile"

export default function Home() {
  return (
    <>
      {/* Version Mobile/Tablette */}
      <div className="lg:hidden min-h-screen bg-white">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <MobileHeader />
        </div>

        <main className="overflow-hidden pb-16"> {/* ← ESPACE POUR LE MOBILE NAV */}
          <HeroSection />
          <div className="h-2.5" />
          
          <div className="bg-[#F2F6F2] px-4 py-4">
            <div className="max-w-7xl mx-auto">
              <DealCountdown />
            </div>
          </div>
          
          <div className="h-2.5" />
          
          <div className="space-y-2.5">
            <div className="bg-[#F2F6F2] px-4 py-4">
              <div className="max-w-7xl mx-auto">
                <MeilleuresVentesMobile />
              </div>
            </div>
            <div className="bg-[#F2F6F2] px-4 py-4">
              <div className="max-w-7xl mx-auto">
                <ModeSection />
              </div>
            </div>
            <div className="bg-[#F2F6F2] px-4 py-4">
              <div className="max-w-7xl mx-auto">
                <TendanceParPays />
              </div>
            </div>
            <div className="bg-[#F2F6F2] px-4 py-4">
              <div className="max-w-7xl mx-auto">
                <ForYouSection />
              </div>
            </div>
          </div>
          
          <div className="h-2.5" />
        </main>

        <Footer />
        
        <div className="sticky bottom-0 z-50 border-t border-gray-100 bg-white">
          <MobileNav />
        </div>
      </div>

      {/* Version Desktop */}
      <div className="hidden lg:block min-h-screen bg-[#F2F6F2]">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <Header />
        </div>

        <main className="overflow-hidden">
          <div className="bg-white">
            <HeroSection />
          </div>
          
          <div className="h-2.5" />
          
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <DealCountdown />
            </div>
          </div>
          
          <div className="h-2.5" />
          
          <div className="space-y-2.5">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <CategoriesPourVous />
              </div>
            </div>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <CategoriesMode />
              </div>
            </div>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <RecommandeEntreprise />
              </div>
            </div>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto space-y-6">
                <ProduitsPopulairesSection />
                <ForYouSection />
              </div>
            </div>
          </div>
          
          <div className="h-2.5" />
        </main>

        <Footer />
      </div>
    </>
  )
}