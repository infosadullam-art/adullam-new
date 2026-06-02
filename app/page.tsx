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
const DealCountdown = dynamic(
  () => import("@/components/deal-countdown").then(m => ({ default: m.DealCountdown })),
  { ssr: false, loading: () => <Skeleton height={120} /> }
)

const MeilleuresVentesMobile = dynamic(
  () => import("@/components/meilleures-ventes-mobile").then(m => ({ default: m.MeilleuresVentesMobile })),
  { ssr: false, loading: () => <Skeleton height={200} /> }
)

const ModeSection = dynamic(
  () => import("@/components/mode-section").then(m => ({ default: m.ModeSection })),
  { ssr: false, loading: () => <Skeleton height={280} /> }
)

const TendanceParPays = dynamic(
  () => import("@/components/tendances-section").then(m => ({ default: m.TendanceParPays })),
  { ssr: false, loading: () => <Skeleton height={200} /> }
)

const ForYouSection = dynamic(
  () => import("@/components/for-you-section").then(m => ({ default: m.ForYouSection })),
  { ssr: false, loading: () => <Skeleton height={300} /> }
)

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

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded-xl"
      style={{ height: `${height}px`, background: "#F4F4F4" }}
    />
  )
}

// ── Section animée avec fade-in ──
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [showPriority2, setShowPriority2] = useState(false)
  const [showPriority3, setShowPriority3] = useState(false)
  const [showPriority4, setShowPriority4] = useState(false)
  const [showPriority5, setShowPriority5] = useState(false)
  const [pageReady, setPageReady] = useState(false)

  // Animation globale de la page
  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        opacity: pageReady ? 1 : 0,
        transition: 'opacity 0.4s ease-in',
      }}
    >
      {/* VERSION MOBILE */}
      <div className="lg:hidden min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="sticky top-0 z-50 bg-white" style={{ borderBottom: "0.5px solid #ECECEC" }}>
          <MobileHeader />
        </div>

        <main className="overflow-hidden pb-16">
          <AnimatedSection delay={0}>
            <HeroSection />
          </AnimatedSection>
          <div className="h-2" />

          <AnimatedSection delay={100}>
            <div className="px-4 py-3" style={{ background: "#fff" }}>
              <DealCountdown />
            </div>
          </AnimatedSection>
          <div className="h-2" />

          <AnimatedSection delay={200}>
            {showPriority2 && (
              <div style={{ background: "#fff" }}>
                <MeilleuresVentesMobile />
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={300}>
            {showPriority3 && (
              <div style={{ background: "#fff" }}>
                <ModeSection />
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={400}>
            {showPriority4 && (
              <div style={{ background: "#fff" }}>
                <TendanceParPays />
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={500}>
            {showPriority5 && (
              <div style={{ background: "#FAFAFA" }}>
                <ForYouSection />
              </div>
            )}
          </AnimatedSection>

          <div className="h-2" />
        </main>

        <Footer />
        <div className="sticky bottom-0 z-50 bg-white" style={{ borderTop: "0.5px solid #ECECEC" }}>
          <MobileNav />
        </div>
      </div>

      {/* VERSION DESKTOP */}
      <div className="hidden lg:block min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="sticky top-0 z-50 bg-white" style={{ borderBottom: "0.5px solid #ECECEC", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <Header />
        </div>

        <main className="overflow-hidden">
          <AnimatedSection delay={0}>
            <div style={{ background: "#0A0A0A" }}>
              <HeroSection />
            </div>
          </AnimatedSection>
          <div className="h-2.5" />

          <AnimatedSection delay={100}>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <DealCountdown />
              </div>
            </div>
          </AnimatedSection>
          <div className="h-2.5" />

          <AnimatedSection delay={200}>
            {showPriority2 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <CategoriesPourVous />
                </div>
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={300}>
            {showPriority3 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <CategoriesMode />
                </div>
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={400}>
            {showPriority4 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <RecommandeEntreprise />
                </div>
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={500}>
            {showPriority5 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <ForYouSection />
                </div>
              </div>
            )}
          </AnimatedSection>

          <div className="h-2.5" />
        </main>

        <Footer />
      </div>

      {/* Timeline pour déclencher le chargement des sections */}
      <div style={{ display: 'none' }}>
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority2(true), 100)} />
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority3(true), 200)} />
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority4(true), 300)} />
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority5(true), 400)} />
      </div>
    </div>
  )
}

// Garder ce composant pour la compatibilité
function ProgressiveLoadOrder({ children, onReady }: { children?: React.ReactNode; onReady?: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onReady?.(), 50)
    return () => clearTimeout(timer)
  }, [onReady])

  return <>{children}</>
}