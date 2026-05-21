"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// ── Composants LÉGERS → import statique (dans le bundle initial) ──
// Ces composants sont visibles immédiatement → pas de lazy loading
import { Header }        from "@/components/header"
import { MobileHeader }  from "@/components/mobile-header"
import { HeroSection }   from "@/components/hero-section"
import { Footer }        from "@/components/footer"
import MobileNav         from "@/components/mobile-nav"

// ── Composants LOURDS → dynamic import (chargés après hydration) ──
// Chaque dynamic() crée un chunk JS séparé → bundle initial réduit
// → React s'hydrate plus vite → clics réactifs dès l'ouverture

const DealCountdown = dynamic(
  () => import("@/components/deal-countdown").then(m => ({ default: m.DealCountdown })),
  {
    ssr: false, // Pas de SSR → pas de mismatch hydration
    loading: () => (
      <div className="animate-pulse rounded-xl mx-0" style={{ height: "120px", background: "#F4F4F4" }} />
    ),
  }
)

const MeilleuresVentesMobile = dynamic(
  () => import("@/components/meilleures-ventes-mobile").then(m => ({ default: m.MeilleuresVentesMobile })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl" style={{ height: "200px", background: "#F4F4F4" }} />
    ),
  }
)

const ModeSection = dynamic(
  () => import("@/components/mode-section").then(m => ({ default: m.ModeSection })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl" style={{ height: "280px", background: "#F4F4F4" }} />
    ),
  }
)

const TendanceParPays = dynamic(
  () => import("@/components/tendances-section").then(m => ({ default: m.TendanceParPays })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl" style={{ height: "200px", background: "#F4F4F4" }} />
    ),
  }
)

const ForYouSection = dynamic(
  () => import("@/components/for-you-section").then(m => ({ default: m.ForYouSection })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl" style={{ height: "300px", background: "#F4F4F4" }} />
    ),
  }
)

// Desktop only
const CategoriesPourVous = dynamic(
  () => import("@/components/categories-pour-vous").then(m => ({ default: m.CategoriesPourVous })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl" style={{ height: "200px", background: "#F4F4F4" }} />
    ),
  }
)

const CategoriesMode = dynamic(
  () => import("@/components/categories-mode").then(m => ({ default: m.CategoriesMode })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl" style={{ height: "240px", background: "#F4F4F4" }} />
    ),
  }
)

const RecommandeEntreprise = dynamic(
  () => import("@/components/recommande-entreprise").then(m => ({ default: m.RecommandeEntreprise })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl" style={{ height: "200px", background: "#F4F4F4" }} />
    ),
  }
)

// ── Skeleton réutilisable ─────────────────────────────────────
function SectionSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-xl"
      style={{ height: `${height}px`, background: "#F4F4F4" }}
    />
  )
}

export default function Home() {
  return (
    <>
      {/* ══ VERSION MOBILE/TABLETTE ══════════════════════════ */}
      <div className="lg:hidden min-h-screen" style={{ background: "#FAFAFA" }}>

        {/* Header sticky — statique, hydraté immédiatement */}
        <div className="sticky top-0 z-50 bg-white" style={{ borderBottom: "0.5px solid #ECECEC" }}>
          <MobileHeader />
        </div>

        <main className="overflow-hidden pb-16">

          {/* Hero — statique, visible immédiatement */}
          <HeroSection />

          <div className="h-2" />

          {/* DealCountdown — lazy */}
          <div className="px-4 py-3" style={{ background: "#fff" }}>
            <Suspense fallback={<SectionSkeleton height={120} />}>
              <DealCountdown />
            </Suspense>
          </div>

          <div className="h-2" />

          <div className="space-y-2">

            {/* Meilleures ventes mobile — lazy */}
            <div style={{ background: "#fff" }}>
              <Suspense fallback={<div className="px-4"><SectionSkeleton height={200} /></div>}>
                <MeilleuresVentesMobile />
              </Suspense>
            </div>

            {/* Mode section — lazy */}
            <div style={{ background: "#fff" }}>
              <Suspense fallback={<div className="px-4"><SectionSkeleton height={280} /></div>}>
                <ModeSection />
              </Suspense>
            </div>

            {/* Tendances — lazy */}
            <div style={{ background: "#fff" }}>
              <Suspense fallback={<div className="px-4"><SectionSkeleton height={200} /></div>}>
                <TendanceParPays />
              </Suspense>
            </div>

            {/* For You — lazy, le plus lourd → en dernier */}
            <div style={{ background: "#FAFAFA" }}>
              <Suspense fallback={<div className="px-4"><SectionSkeleton height={300} /></div>}>
                <ForYouSection />
              </Suspense>
            </div>

          </div>

          <div className="h-2" />
        </main>

        <Footer />

        {/* Nav bottom sticky — statique */}
        <div className="sticky bottom-0 z-50 bg-white" style={{ borderTop: "0.5px solid #ECECEC" }}>
          <MobileNav />
        </div>
      </div>

      {/* ══ VERSION DESKTOP ══════════════════════════════════ */}
      <div className="hidden lg:block min-h-screen" style={{ background: "#FAFAFA" }}>

        {/* Header sticky — statique */}
        <div className="sticky top-0 z-50 bg-white" style={{ borderBottom: "0.5px solid #ECECEC", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <Header />
        </div>

        <main className="overflow-hidden">

          {/* Hero — statique */}
          <div style={{ background: "#0A0A0A" }}>
            <HeroSection />
          </div>

          <div className="h-2.5" />

          {/* DealCountdown */}
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Suspense fallback={<SectionSkeleton height={140} />}>
                <DealCountdown />
              </Suspense>
            </div>
          </div>

          <div className="h-2.5" />

          <div className="space-y-2.5">

            {/* CategoriesPourVous */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <Suspense fallback={<SectionSkeleton height={200} />}>
                  <CategoriesPourVous />
                </Suspense>
              </div>
            </div>

            {/* CategoriesMode */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <Suspense fallback={<SectionSkeleton height={240} />}>
                  <CategoriesMode />
                </Suspense>
              </div>
            </div>

            {/* RecommandeEntreprise */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <Suspense fallback={<SectionSkeleton height={200} />}>
                  <RecommandeEntreprise />
                </Suspense>
              </div>
            </div>

            {/* ForYouSection — en dernier, le plus lourd */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <Suspense fallback={<SectionSkeleton height={400} />}>
                  <ForYouSection />
                </Suspense>
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