"use client"

import { ProductCard } from "@/components/product-card"
import { useEffect, useRef, useState, useCallback } from "react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useApi } from "@/hooks/useApi"

interface Product {
  id: string
  name: string
  priceUSD: number
  image: string
  status: string
  isSeed: boolean
  forYouScore?: number
  reason?: string
  source?: string
  category?: string
  type?: "prediction" | "diversity" | "trending"
}

const badgeConfig: Record<string, { label: string; bg: string; color: string }> = {
  session_graph: { label: "Pour vous",  bg: "#F0F4FF", color: "#3B5BDB" },
  session:       { label: "Pour vous",  bg: "#F0F4FF", color: "#3B5BDB" },
  als:           { label: "Recommandé", bg: "#FFF8E1", color: "#E67700" },
  trend:         { label: "Tendance",   bg: "#FFF0F0", color: "#D4372B" },
  new:           { label: "Nouveau",    bg: "#F3F0FF", color: "#7048E8" },
  random:        { label: "Découverte", bg: "#EBFBEE", color: "#2F9E44" },
  popular:       { label: "Populaire",  bg: "#FFF4E6", color: "#E67700" },
  emergency:     { label: "Populaire",  bg: "#FFF4E6", color: "#E67700" },
}

export function ForYouSection() {
  const { fetchWithAuth } = useApi()

  const [products, setProducts]       = useState<Product[]>([])
  const [isLoading, setIsLoading]     = useState(false)
  const [hasMore, setHasMore]         = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [titleIndex, setTitleIndex]   = useState(0)
  const [sessionId, setSessionId]     = useState<string | null>(null)

  // ── Refs stables ───────────────────────────────────────────
  // Utilise des refs pour tout ce qui change souvent
  // → évite de re-créer fetchForYou à chaque render
  // → évite la race condition removeChild qui crashait React
  const observerRef        = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialFetchDone   = useRef(false)
  const isFetchingRef      = useRef(false)
  const pageRef            = useRef(1)
  const productsRef        = useRef<Product[]>([])
  const hasMoreRef         = useRef(true)
  const viewedProducts     = useRef<Set<string>>(new Set())
  const trackQueueRef      = useRef<Set<string>>(new Set())

  const titles = [
    { main: "Suggestions",     sub: "personnalisées pour vous" },
    { main: "Inspirations",    sub: "rien que pour vous" },
    { main: "Découvertes",     sub: "sélection du moment" },
    { main: "Recommandations", sub: "basées sur vos goûts" },
    { main: "Sélections",      sub: "pour votre style" },
  ]

  // ── Titre rotatif ──────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setTitleIndex(p => (p + 1) % titles.length), 5000)
    return () => clearInterval(i)
  }, [])

  // ── Session ID ─────────────────────────────────────────────
  useEffect(() => {
    let stored = localStorage.getItem("adullam_session_id")
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem("adullam_session_id", stored)
    }
    setSessionId(stored)
    document.cookie = `sessionId=${stored}; path=/; max-age=86400; SameSite=Lax`
  }, [])

  // ── Track interaction ──────────────────────────────────────
  // FIX : deps minimales → plus de boucle d'appels /api/track
  const trackInteraction = useCallback(async (
    productId: string,
    type: "VIEW" | "CLICK"
  ) => {
    if (!sessionId) return

    // Déduplique — un seul VIEW par produit par session
    const key = `${type}-${productId}`
    if (type === "VIEW" && trackQueueRef.current.has(key)) return
    trackQueueRef.current.add(key)

    try {
      await fetchWithAuth("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, type, context: "FOR_YOU", sessionId }),
      })
    } catch {
      // Silencieux — le tracking ne doit jamais crasher l'UI
    }
  }, [sessionId, fetchWithAuth]) // Deps minimales et stables

  // ── Observer visibilité ────────────────────────────────────
  useEffect(() => {
    if (!products.length) return

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute("data-product-id")
          if (id && !viewedProducts.current.has(id)) {
            viewedProducts.current.add(id)
            trackInteraction(id, "VIEW")
          }
        }
      })
    }, { threshold: 0.3, rootMargin: "50px" })

    document.querySelectorAll("[data-product-id]").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [products, trackInteraction])

  // ── Fetch principal ────────────────────────────────────────
  const fetchForYou = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current || !sessionId) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    isFetchingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      // FIX CRITIQUE : plus de seenIds dans l'URL
      // Avant : ?seenIds=id1,id2,...id120 → URL 2000+ chars → tronquée → SyntaxError
      // Après : le serveur Python lit directement la session Redis pour dédupliquer
      const url = `/api/graph/recommendations/for-you?page=${pageRef.current}&limit=24&sessionId=${sessionId}`

      const res = await fetchWithAuth(url, {
        signal: abortControllerRef.current.signal,
      })

      // FIX : guard réponse vide → évite SyntaxError
      const text = await res.text()
      if (!text || text.trim() === "") {
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      // FIX : guard JSON invalide (HTML d'erreur, proxy qui tronque, etc.)
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        console.error("[ForYou] Réponse non-JSON:", text.slice(0, 100))
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      if (res.status === 401) { hasMoreRef.current = false; setHasMore(false); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      // FIX : filtrer les IDs génériques qui n'existent pas en base
      const existingIds = new Set(productsRef.current.map(p => p.id))
      const newProducts: Product[] = json.data
        .filter((p: any) =>
          p.id &&
          !p.id.startsWith("fallback_") &&
          !p.id.startsWith("emergency_") &&
          !existingIds.has(p.id)
        )
        .map((p: any) => ({
          id:          p.id,
          name:        p.name || p.title || "Produit",
          priceUSD:    p.price || p.priceUSD || 0,
          image:       p.image || "/placeholder.jpg",
          status:      p.status || "active",
          isSeed:      p.isSeed || false,
          forYouScore: p.forYouScore,
          reason:      p.reason,
          source:      p.source,
          category:    p.category,
          type:        p.type,
        }))

      if (newProducts.length === 0) {
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      // Mise à jour ref ET state
      // Ref pour la logique (pas de re-render), State pour l'affichage
      productsRef.current = [...productsRef.current, ...newProducts]
      setProducts([...productsRef.current])

      // FIX hasMore : true SEULEMENT si serveur le dit ET nouveaux produits reçus
      const more = (json.meta?.hasMore === true) && (newProducts.length > 0)
      hasMoreRef.current = more
      setHasMore(more)
      if (more) pageRef.current += 1

    } catch (err: any) {
      if (err?.name === "AbortError") return
      console.error("[ForYou] Erreur:", err.message)
      setError(err.message)
      hasMoreRef.current = false
      setHasMore(false)
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
      setInitialized(true)
    }
  }, [sessionId, fetchWithAuth]) // Deps minimales → function stable

  // ── Premier chargement ─────────────────────────────────────
  useEffect(() => {
    if (!initialFetchDone.current && sessionId) {
      initialFetchDone.current = true
      fetchForYou()
    }
  }, [fetchForYou, sessionId])

  // ── Infinite scroll ────────────────────────────────────────
  // FIX : ne se recrée que quand initialized change
  // → plus de re-création de l'observer à chaque render
  useEffect(() => {
    if (!initialized) return

    const observer = new IntersectionObserver(entries => {
      if (
        entries[0]?.isIntersecting &&
        !isFetchingRef.current &&
        hasMoreRef.current
      ) {
        fetchForYou()
      }
    }, { threshold: 0, rootMargin: "400px" })

    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [initialized, fetchForYou])

  // ── Rendu ──────────────────────────────────────────────────
  const rows: Product[][] = []
  for (let i = 0; i < products.length; i += 6) {
    rows.push(products.slice(i, i + 6))
  }

  if (!isLoading && products.length === 0 && !error) {
    return (
      <section className="w-full py-12" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p style={{ color: "#AAAAAA", fontSize: "14px", fontFamily: "'Poppins', sans-serif" }}>
            Chargement des recommandations...
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-10 lg:py-14" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Titre rotatif */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span style={{
              display: "inline-block", width: "3px", height: "20px",
              background: "#D4372B", borderRadius: "2px",
            }} />
            <h2
              key={titleIndex}
              style={{
                fontSize: "20px", fontWeight: 800, color: "#0A0A0A",
                fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em",
              }}
            >
              {titles[titleIndex].main}{" "}
              <span style={{ color: "#D4372B" }}>{titles[titleIndex].sub}</span>
            </h2>
          </div>
          <p
            className="flex items-center gap-1.5"
            style={{ fontSize: "12px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}
          >
            <span style={{
              display: "inline-block", width: "6px", height: "6px",
              borderRadius: "50%", background: "#D4372B",
            }} />
            {products.length} articles · mise à jour en continu
          </p>
        </div>

        {/* Grille produits */}
        <div className="space-y-4">

          {error && (
            <div
              className="text-center py-6"
              style={{ color: "#D4372B", fontSize: "13px", fontFamily: "'Poppins', sans-serif" }}
            >
              Erreur de chargement — réessai au prochain scroll
            </div>
          )}

          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[0, 1, 2].map((blockIndex) => (
                <div
                  key={blockIndex}
                  className="rounded-xl p-3"
                  style={{ background: "#fff", border: "0.5px solid #ECECEC" }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {row.slice(blockIndex * 2, blockIndex * 2 + 2).map((product) => {
                      const badge = product.source ? badgeConfig[product.source] : null
                      return (
                        <div
                          key={product.id}
                          className="relative cursor-pointer"
                          data-product-id={product.id}
                          onClick={() => trackInteraction(product.id, "CLICK")}
                          style={{ transition: "transform 0.2s ease" }}
                          onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                          onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                        >
                          {badge && (
                            <span
                              className="absolute z-10"
                              style={{
                                top: "-6px", right: "-6px",
                                background: badge.bg, color: badge.color,
                                fontSize: "8px", fontWeight: 700,
                                padding: "2px 6px", borderRadius: "100px",
                                fontFamily: "'Poppins', sans-serif",
                                border: `0.5px solid ${badge.color}20`,
                              }}
                            >
                              {badge.label}
                            </span>
                          )}
                          <ProductCard product={{
                            id:       product.id,
                            name:     product.name,
                            priceUSD: product.priceUSD,
                            image:    product.image,
                          }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Sentinel infinite scroll + loader */}
          <div ref={observerRef} className="flex justify-center py-6">
            {isLoading && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-7 h-7">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "1.5px solid #ECECEC" }}
                  />
                  <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{ border: "1.5px solid #D4372B", borderTopColor: "transparent" }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                  Chargement...
                </span>
              </div>
            )}
            {!hasMore && products.length > 0 && !isLoading && (
              <p style={{ fontSize: "11px", color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                {products.length} suggestions
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}