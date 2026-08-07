"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// ── Composants statiques ──
import { Header }        from "@/components/header"
import { MobileHeader }  from "@/components/mobile-header"
import { HeroSection }   from "@/components/hero-section"
import { Footer }        from "@/components/footer"
import MobileNav         from "@/components/mobile-nav"

// ── Chargement progressif contrôlé (ssr: true par défaut pour hydratation)
const DealCountdown = dynamic(
  () => import("@/components/deal-countdown").then(m => ({ default: m.DealCountdown })),
  { loading: () => <Skeleton height={120} /> }
)

const MeilleuresVentesMobile = dynamic(
  () => import("@/components/meilleures-ventes-mobile").then(m => ({ default: m.MeilleuresVentesMobile })),
  { loading: () => <Skeleton height={200} /> }
)

const ModeSection = dynamic(
  () => import("@/components/mode-section").then(m => ({ default: m.ModeSection })),
  { loading: () => <Skeleton height={280} /> }
)

const TendanceParPays = dynamic(
  () => import("@/components/tendances-section").then(m => ({ default: m.TendanceParPays })),
  { loading: () => <Skeleton height={200} /> }
)

const ForYouSection = dynamic(
  () => import("@/components/for-you-section").then(m => ({ default: m.ForYouSection })),
  { loading: () => <Skeleton height={300} /> }
)

const CategoriesPourVous = dynamic(
  () => import("@/components/categories-pour-vous").then(m => ({ default: m.CategoriesPourVous })),
  { loading: () => <Skeleton height={200} /> }
)

const CategoriesMode = dynamic(
  () => import("@/components/categories-mode").then(m => ({ default: m.CategoriesMode })),
  { loading: () => <Skeleton height={240} /> }
)

const RecommandeEntreprise = dynamic(
  () => import("@/components/recommande-entreprise").then(m => ({ default: m.RecommandeEntreprise })),
  { loading: () => <Skeleton height={200} /> }
)

const MachinesAgricolesSection = dynamic(
  () => import("@/components/machines-agricoles-section").then(m => ({ default: m.MachinesAgricolesSection })),
  { loading: () => <Skeleton height={280} /> }
)

const PhotoCameraSection = dynamic(
  () => import("@/components/photo-camera-section").then(m => ({ default: m.PhotoCameraSection })),
  { loading: () => <Skeleton height={280} /> }
)

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="shimmer rounded-lg"
      style={{ height: `${height}px` }}
    />
  )
}

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
        transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
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
  const [showPriority6, setShowPriority6] = useState(false)
  const [pageReady, setPageReady] = useState(false)

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
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/50 to-background" />
        
        <div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.12]"
          style={{
            background: "radial-gradient(circle, #D4372B 0%, transparent 70%)",
            animation: "floatPremium 20s ease-in-out infinite",
          }}
        />
        
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] opacity-[0.10]"
          style={{
            background: "radial-gradient(circle, #F5A623 0%, transparent 70%)",
            animation: "floatPremium 22s ease-in-out infinite reverse",
            animationDelay: "-5s",
          }}
        />
        
        <div 
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #D4372B 0%, transparent 70%)",
            animation: "floatPremium 18s ease-in-out infinite",
            animationDelay: "-10s",
          }}
        />

        <div 
          className="absolute top-[10%] right-[20%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #FF6B5A 0%, transparent 70%)",
            animation: "floatPremium 25s ease-in-out infinite",
            animationDelay: "-15s",
          }}
        />

        <style jsx>{`
          @keyframes floatPremium {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(60px, -40px) scale(1.1);
            }
            50% {
              transform: translate(-30px, 60px) scale(0.9);
            }
            75% {
              transform: translate(40px, 30px) scale(1.05);
            }
          }
        `}</style>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/50 to-background" />
        
        <div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.12]"
          style={{
            background: "radial-gradient(circle, #D4372B 0%, transparent 70%)",
            animation: "floatPremium 20s ease-in-out infinite",
          }}
        />
        
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] opacity-[0.10]"
          style={{
            background: "radial-gradient(circle, #F5A623 0%, transparent 70%)",
            animation: "floatPremium 22s ease-in-out infinite reverse",
            animationDelay: "-5s",
          }}
        />
        
        <div 
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #D4372B 0%, transparent 70%)",
            animation: "floatPremium 18s ease-in-out infinite",
            animationDelay: "-10s",
          }}
        />

        <div 
          className="absolute top-[10%] right-[20%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #FF6B5A 0%, transparent 70%)",
            animation: "floatPremium 25s ease-in-out infinite",
            animationDelay: "-15s",
          }}
        />

        <style jsx>{`
          @keyframes floatPremium {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(60px, -40px) scale(1.1);
            }
            50% {
              transform: translate(-30px, 60px) scale(0.9);
            }
            75% {
              transform: translate(40px, 30px) scale(1.05);
            }
          }
        `}</style>
      </div>

      {/* VERSION MOBILE */}
      <div className="lg:hidden min-h-screen bg-transparent">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <MobileHeader />
        </div>

        <main className="overflow-hidden pb-16">
          <AnimatedSection delay={0}>
            <HeroSection />
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="px-4 py-2">
              <DealCountdown />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            {showPriority2 && (
              <MeilleuresVentesMobile />
            )}
          </AnimatedSection>

          <AnimatedSection delay={250}>
            {showPriority6 && (
              <>
                <MachinesAgricolesSection />
                <PhotoCameraSection />
              </>
            )}
          </AnimatedSection>

          <AnimatedSection delay={300}>
            {showPriority3 && (
              <ModeSection />
            )}
          </AnimatedSection>

          <AnimatedSection delay={400}>
            {showPriority4 && (
              <TendanceParPays />
            )}
          </AnimatedSection>

          <AnimatedSection delay={500}>
            {showPriority5 && (
              <ForYouSection />
            )}
          </AnimatedSection>
        </main>

        <Footer />
        <div className="sticky bottom-0 z-50 bg-background/80 backdrop-blur-md border-t border-border">
          <MobileNav />
        </div>
      </div>

      {/* VERSION DESKTOP */}
      <div className="hidden lg:block min-h-screen bg-transparent">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <Header />
        </div>

        <main className="overflow-hidden">
          <AnimatedSection delay={0}>
            <div className="bg-brand">
              <HeroSection />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <DealCountdown />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            {showPriority2 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <CategoriesPourVous />
                </div>
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={250}>
            {showPriority6 && (
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <MachinesAgricolesSection />
                  <PhotoCameraSection />
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
        </main>

        <Footer />
      </div>

      {/* Timeline pour déclencher le chargement des sections */}
      <div style={{ display: 'none' }}>
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority2(true), 100)} />
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority6(true), 150)} />
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority3(true), 200)} />
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority4(true), 300)} />
        <ProgressiveLoadOrder onReady={() => setTimeout(() => setShowPriority5(true), 400)} />
      </div>
    </div>
  )
}

function ProgressiveLoadOrder({ children, onReady }: { children?: React.ReactNode; onReady?: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onReady?.(), 50)
    return () => clearTimeout(timer)
  }, [onReady])

  return <>{children}</>
}