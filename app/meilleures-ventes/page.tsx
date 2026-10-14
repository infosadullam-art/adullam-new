"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { TrendingUp, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { apiFetch } from "@/lib/api"

// Poppins pour le latin, pile du site (Cairo en arabe) en repli
const poppins = "'Poppins', var(--font-amazon)"

export default function MeilleuresVentesPage() {
  const t = useTranslations("listPages")
  const { formatPrice } = useCurrencyFormatter()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 48

  useEffect(() => {
    const fetchBestSellers = async () => {
      setIsLoading(true)
      try {
        const res = await apiFetch(`/api/best-sellers?page=${currentPage}&limit=${itemsPerPage}`)
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
          setTotalPages(data.meta.totalPages || 1)
        }
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBestSellers()
  }, [currentPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="pb-20 lg:pb-12">

        {/* ── HERO BANNER ───────────────────────────────────────── */}
        <div style={{ background: "#0A0A0A" }}>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: "#D4372B" }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: poppins,
                    fontWeight: 900,
                    fontSize: "clamp(22px, 4vw, 36px)",
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  {t("bsTitle")}
                </h1>
                <p style={{ fontSize: "13px", color: "#AAAAAA", fontFamily: poppins }}>
                  {t("bsSubtitle")}
                </p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {[
                { label: t("updatedDaily"), dot: "#22C55E" },
                { label: t("bsPillDelivery"), dot: "#D4372B" },
                { label: t("bsPillPrices"), dot: "#F5A623" },
              ].map(({ label, dot }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontFamily: poppins,
                  }}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENU ───────────────────────────────────────────── */}
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-8">

          {/* Header section */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2
                style={{
                  fontFamily: poppins,
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "#0A0A0A",
                  letterSpacing: "-0.02em",
                }}
              >
                {t("bsSection")}
              </h2>
              <p style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: poppins }}>
                {t("updatedDaily")}
              </p>
            </div>
            {totalPages > 1 && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "#F4F4F4", color: "#0A0A0A", fontFamily: poppins }}
              >
                {t("pageOf", { current: currentPage, total: totalPages })}
              </span>
            )}
          </div>

          {/* ── LOADING ─────────────────────────────────────────── */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div
                    className="aspect-square rounded-xl mb-2"
                    style={{ background: "#F4F4F4" }}
                  />
                  <div className="h-3 rounded mb-1.5" style={{ background: "#F4F4F4", width: "80%" }} />
                  <div className="h-3 rounded mb-1.5" style={{ background: "#F4F4F4", width: "60%" }} />
                  <div className="h-4 rounded" style={{ background: "#F4F4F4", width: "40%" }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ── GRILLE PRODUITS ───────────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
                {products.map((product, index) => (
                  <a
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-square overflow-hidden mb-2.5 transition-all duration-200 group-hover:shadow-md"
                      style={{ borderRadius: "12px", background: "#fff", border: "0.5px solid #ECECEC" }}
                    >
                      {/* Rang badge — top 3 */}
                      {index < 3 && (
                        <span
                          className="absolute top-2 start-2 z-10 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                          style={{
                            background: index === 0 ? "#F5A623" : index === 1 ? "#AAAAAA" : "#CD7F32",
                          }}
                        >
                          {index + 1}
                        </span>
                      )}
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Infos */}
                    <div className="space-y-1">
                      <h3
                        className="line-clamp-2"
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#0A0A0A",
                          fontFamily: poppins,
                          lineHeight: 1.4,
                        }}
                      >
                        {product.name}
                      </h3>

                      {/* Étoiles */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
                          ))}
                        </div>
                        <span style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: poppins }}>
                          ({product.reviews})
                        </span>
                      </div>

                      {/* Prix */}
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#D4372B",
                          fontFamily: poppins,
                        }}
                      >
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              {/* ── PAGINATION ───────────────────────────────── */}
              {totalPages > 1 && (
                <div
                  className="flex justify-center items-center gap-2 mt-10 pt-5"
                  style={{ borderTop: "0.5px solid #ECECEC" }}
                >
                  {/* Précédent */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                    style={{ border: "0.5px solid #ECECEC", background: "#fff" }}
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" style={{ color: "#0A0A0A" }} />
                  </button>

                  {/* Pages */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      const isActive = currentPage === pageNum

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className="min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all focus:outline-none"
                          style={{
                            background: isActive ? "#D4372B" : "#fff",
                            color: isActive ? "#fff" : "#0A0A0A",
                            border: isActive ? "none" : "0.5px solid #ECECEC",
                            fontFamily: poppins,
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  {/* Suivant */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                    style={{ border: "0.5px solid #ECECEC", background: "#fff" }}
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" style={{ color: "#0A0A0A" }} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  )
}