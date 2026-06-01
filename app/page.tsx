"use client"

import { Suspense, useEffect, useState } from "react"
import dynamic from "next/dynamic"

// ── Composants statiques ──
import { Header }        from "@/components/header"
import { MobileHeader }  from "@/components/mobile-header"
import { HeroSection }   from "@/components/hero-section"
import { Footer }        from "@/components/footer"
import MobileNav         from "@/components/mobile-nav"

// ── Chargement progressif contrôlé ──
// Priorité 1: DealCountdown (léger, rapide)
const DealCountdown = dynamic(
  () => import("@/components/deal-countdown").then(m => ({ default: m.DealCountdown })),
  { ssr: false, loading: () => <Skeleton height={120} /> }
)

// Priorité 2: MeilleuresVentesMobile
const MeilleuresVentesMobile = dynamic(
  () => import("@/components/meilleures-ventes-mobile").then(m => ({ default: m.MeilleuresVentesMobile })),
  { ssr: false, loading: () => <Skeleton height={200} /> }
)

// Priorité 3: ModeSection
const ModeSection = dynamic(
  () => import("@/components/mode-section").then(m => ({ default: m.ModeSection })),
  { ssr: false, loading: () => <Skeleton height={280} /> }
)

// Priorité 4: TendanceParPays
const TendanceParPays = dynamic(
  () => import("@/components/tendances-section").then(m => ({ default: m.TendanceParPays })),
  { ssr: false, loading: () => <Skeleton height={200} /> }
)

// Priorité 5: ForYouSection (le plus lourd)
const ForYouSection = dynamic(
  () => import("@/components/for-you-section").then(m => ({ default: m.ForYouSection })),
  { ssr: false, loading: () => <Skeleton height={300} /> }
)

// Desktop sections
const CategoriesPourVous = dynamic(
  () => import("@/components/categories-pour-vous").then(m => ({ default: m.CategoriesPourVous })),
  { ssr: false, loading: () => <Skeleton height={200} /> }
)

const CategoriesMode = dynamic(
  () => import("@/components/categories-mode").then(m => ({ default: m.CategoriesMode })),
  { ssr: false, loading: () => <Skeleton height={240} /> }
)

const RecommandeEntreprise = dynamic(
  () => import("@/components/recommande-entreprise").then(m => ({ default: m.RecommandeEntreprise })),
  { ssr: false, loading: () => <Skeleton height={200} /> }
)

// ── Composant Skeleton ──
function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded-xl"
      style={{ height: `${height}px`, background: "#F4F4F4" }}
    />
  )
}

// ── Gestionnaire d'ordre d'affichage ──
function ProgressiveLoadOrder({ children, onReady }: { children: React.ReactNode; onReady?: () => void }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Petit délai pour laisser le DOM respirer
    const timer = setTimeout(() => setIsReady(true), 50)
    onReady?.()
    return () => clearTimeout(timer)
  }, [onReady])

  if (!isReady) return <Skeleton height={100} />
  return <>{children}</>
}

export default function Home() {
  // 🔥 Force l'ordre d'apparition visuelle
  const [showPriority2, setShowPriority2] = useState(false)
  const [showPriority3, setShowPriority3] = useState(false)
  const [showPriority4, setShowPriority4] = useState(false)
  const [showPriority5, setShowPriority5] = useState(false)

  return (
    <>
      {/* VERSION MOBILE */}
      <div className="lg:hidden min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="sticky top-0 z-50 bg-white" style={{ borderBottom: "0.5px solid #ECECEC" }}>
          <MobileHeader />
        </div>

        <main className="overflow-hidden pb-16">
          <HeroSection />
          <div className="h-2" />

          {/* PRIORITÉ 1 : DealCountdown - charge en premier */}
          <div className="px-4 py-3" style={{ background: "#fff" }}>
            <DealCountdown />
          </div>

          <div className="h-2" />

          {/* PRIORITÉ 2 : Meilleures ventes - charge APRÈS DealCountdown */}
          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority2(true), 100)}>
            {showPriority2 && (
              <div style={{ background: "#fff" }}>
                <MeilleuresVentesMobile />
              </div>
            )}
          </ProgressiveLoadOrder>

          {/* PRIORITÉ 3 : Mode section - charge APRÈS MeilleuresVentes */}
          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority3(true), 200)}>
            {showPriority3 && (
              <div style={{ background: "#fff" }}>
                <ModeSection />
              </div>
            )}
          </ProgressiveLoadOrder>

          {/* PRIORITÉ 4 : Tendances - charge APRÈS ModeSection */}
          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority4(true), 300)}>
            {showPriority4 && (
              <div style={{ background: "#fff" }}>
                <TendanceParPays />
              </div>
            )}
          </ProgressiveLoadOrder>

          {/* PRIORITÉ 5 : For You - charge EN DERNIER */}
          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority5(true), 400)}>
            {showPriority5 && (
              <div style={{ background: "#FAFAFA" }}>
                <ForYouSection />
              </div>
            )}
          </ProgressiveLoadOrder>

          <div className="h-2" />
        </main>

        <Footer />
        <div className="sticky bottom-0 z-50 bg-white" style={{ borderTop: "0.5px solid #ECECEC" }}>
          <MobileNav />
        </div>
      </div>

      {/* VERSION DESKTOP - même logique */}
      <div className="hidden lg:block min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="sticky top-0 z-50 bg-white" style={{ borderBottom: "0.5px solid #ECECEC", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <Header />
        </div>

        <main className="overflow-hidden">
          <div style={{ background: "#0A0A0A" }}>
            <HeroSection />
          </div>
          <div className="h-2.5" />

          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <DealCountdown />
            </div>
          </div>

          <div className="h-2.5" />

          {/* Desktop - charge progressif */}
          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority2(true), 100)}>
            {showPriority2 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <CategoriesPourVous />
                </div>
              </div>
            )}
          </ProgressiveLoadOrder>

          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority3(true), 200)}>
            {showPriority3 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <CategoriesMode />
                </div>
              </div>
            )}
          </ProgressiveLoadOrder>

          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority4(true), 300)}>
            {showPriority4 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <RecommandeEntreprise />
                </div>
              </div>
            )}
          </ProgressiveLoadOrder>

          <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority5(true), 400)}>
            {showPriority5 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <ForYouSection />
                </div>
              </div>
            )}
          </ProgressiveLoadOrder>

          <div className="h-2.5" />
        </main>

        <Footer />
      </div>
    </>
  )
}