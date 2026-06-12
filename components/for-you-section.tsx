"use client"

import { ProductCard } from "@/components/product-card"
import { useEffect, useRef, useState, useCallback } from "react"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useApi } from "@/hooks/useApi"

const amazonFont = "Amazon Ember, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

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
}

const TITLES = [
  { main: "Suggestions",     sub: "personnalisées pour vous" },
  { main: "Inspirations",    sub: "rien que pour vous" },
  { main: "Découvertes",     sub: "sélection du moment" },
  { main: "Recommandations", sub: "basées sur vos goûts" },
  { main: "Sélections",      sub: "pour votre style" },
]

const STORAGE_KEY = "foryou_state"

interface SavedState {
  products: Product[]
  page: number
  hasMore: boolean
  scrollPosition: number
  timestamp: number
}

export function ForYouSection() {
  const { formatPrice } = useCurrencyFormatter()
  const { fetchWithAuth } = useApi()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titleIndex, setTitleIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const observerRef        = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialFetchDone   = useRef(false)
  const isFetchingRef      = useRef(false)
  const pageRef            = useRef(1)
  const productsRef        = useRef<Product[]>([])
  const hasMoreRef         = useRef(true)
  const viewedProducts     = useRef<Set<string>>(new Set())
  const trackQueueRef      = useRef<Set<string>>(new Set())
  const saveTimeoutRef     = useRef<NodeJS.Timeout>()
  const lastSavedScrollRef = useRef(0)

  const saveState = useCallback(() => {
    if (!sessionId) return
    if (productsRef.current.length === 0) return
    
    const scrollY = window.scrollY
    if (scrollY < 0) return
    
    const state: SavedState = {
      products: productsRef.current,
      page: pageRef.current,
      hasMore: hasMoreRef.current,
      scrollPosition: scrollY,
      timestamp: Date.now()
    }
    
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_${sessionId}`, JSON.stringify(state))
      lastSavedScrollRef.current = scrollY
      console.log(`💾 Position sauvegardée: ${scrollY}px, page ${pageRef.current}`)
    } catch (e) {
      console.error("Erreur sauvegarde état:", e)
    }
  }, [sessionId])

  const restoreState = useCallback((): SavedState | null => {
    if (!sessionId) return null
    
    try {
      const saved = sessionStorage.getItem(`${STORAGE_KEY}_${sessionId}`)
      if (!saved) return null
      
      const state: SavedState = JSON.parse(saved)
      const age = Date.now() - state.timestamp
      
      if (age > 30 * 60 * 1000) {
        console.log(`⏰ État expiré (${Math.round(age / 60000)} min)`)
        sessionStorage.removeItem(`${STORAGE_KEY}_${sessionId}`)
        return null
      }
      
      console.log(`📥 État restauré: page ${state.page}, ${state.products.length} produits, scroll ${state.scrollPosition}px`)
      return state
    } catch (e) {
      console.error("Erreur restauration état:", e)
      return null
    }
  }, [sessionId])

  // Restauration du scroll après chargement
  useEffect(() => {
    if (initialized && products.length > 0) {
      const saved = restoreState()
      if (saved?.scrollPosition && saved.scrollPosition > 0) {
        window.scrollTo({ top: saved.scrollPosition, behavior: "instant" })
        console.log(`📍 Scroll restauré à ${saved.scrollPosition}px`)
      }
    }
  }, [initialized, products.length, restoreState])

  // Sauvegarde avec debounce (seulement après que l'utilisateur a fini de scroller)
  useEffect(() => {
    const handleScroll = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        const currentScroll = window.scrollY
        // Ne sauvegarder que si la position a changé de plus de 100px
        if (Math.abs(currentScroll - lastSavedScrollRef.current) > 100) {
          saveState()
        }
      }, 500)
    }
    
    const handleBeforeUnload = () => {
      saveState()
    }
    
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("beforeunload", handleBeforeUnload)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [saveState])

  useEffect(() => {
    const i = setInterval(() => setTitleIndex(p => (p + 1) % TITLES.length), 5000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    let stored = localStorage.getItem("adullam_session_id")
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem("adullam_session_id", stored)
    }
    setSessionId(stored)
    document.cookie = `sessionId=${stored}; path=/; max-age=86400; SameSite=Lax`
  }, [])

  const trackInteraction = useCallback(async (
    productId: string,
    type: "VIEW" | "CLICK"
  ) => {
    if (!sessionId) return
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
      // Silencieux
    }
  }, [sessionId, fetchWithAuth])

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
      const seenIds = productsRef.current.map(p => p.id).join(",")
      let url = `/api/graph/recommendations/for-you?page=${pageRef.current}&limit=24&sessionId=${sessionId}`
      if (seenIds) url += `&seenIds=${seenIds}`

      const res = await fetchWithAuth(url, { signal: abortControllerRef.current.signal })

      const text = await res.text()
      if (!text || text.trim() === "") {
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      if (res.status === 401) {
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
        hasMoreRef.current = false
        setHasMore(false)
        return
      }

      const existingIds = new Set(productsRef.current.map(p => p.id))
      const newProducts: Product[] = json.data
        .filter((p: any) => !existingIds.has(p.id))
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

      productsRef.current = [...productsRef.current, ...newProducts]
      setProducts([...productsRef.current])
      
      saveState()

      const more = json.meta?.hasMore ?? false
      hasMoreRef.current = more
      setHasMore(more)
      if (more) pageRef.current += 1

    } catch (err: any) {
      if (err?.name === "AbortError") return
      console.error("[ForYou] Erreur fetch:", err.message)
      setError(err.message)
      hasMoreRef.current = false
      setHasMore(false)
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
      setInitialized(true)
    }
  }, [sessionId, fetchWithAuth, saveState])

  useEffect(() => {
    if (!initialFetchDone.current && sessionId) {
      initialFetchDone.current = true
      
      const savedState = restoreState()
      if (savedState && savedState.products.length > 0) {
        console.log(`🔄 Restauration de ${savedState.products.length} produits sauvegardés`)
        productsRef.current = savedState.products
        setProducts(savedState.products)
        pageRef.current = savedState.page
        hasMoreRef.current = savedState.hasMore
        setHasMore(savedState.hasMore)
        setInitialized(true)
      } else {
        fetchForYou()
      }
    }
  }, [sessionId, fetchForYou, restoreState])

  useEffect(() => {
    if (!initialized) return

    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && !isFetchingRef.current && hasMoreRef.current) {
        fetchForYou()
      }
    }, { threshold: 0, rootMargin: "400px" })

    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [initialized, fetchForYou])

  const rows: Product[][] = []
  for (let i = 0; i < products.length; i += 6) {
    rows.push(products.slice(i, i + 6))
  }

  if (!isLoading && products.length === 0 && !error) {
    return (
      <section className="w-full py-8" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p style={{ color: "#AAAAAA", fontSize: "13px", fontFamily: amazonFont }}>
            Chargement des recommandations...
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-6 lg:py-10" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ display: "inline-block", width: "3px", height: "18px", background: "#D4372B", borderRadius: "2px" }} />
            <h2
              key={titleIndex}
              style={{
                fontSize: "18px", fontWeight: 800, color: "#0A0A0A",
                fontFamily: amazonFont, letterSpacing: "-0.02em",
              }}
            >
              {TITLES[titleIndex].main}{" "}
              <span style={{ color: "#D4372B" }}>{TITLES[titleIndex].sub}</span>
            </h2>
          </div>
          <p className="flex items-center gap-1.5" style={{ fontSize: "11px", color: "#AAAAAA", fontFamily: amazonFont }}>
            <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#D4372B" }} />
            {products.length} articles · mise à jour en continu
          </p>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="text-center py-4" style={{ color: "#D4372B", fontSize: "12px", fontFamily: amazonFont }}>
              Erreur de chargement — réessai au prochain scroll
            </div>
          )}

          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[0, 1, 2].map((blockIndex) => (
                <div
                  key={blockIndex}
                  className="p-2"
                  style={{ background: "#fff", border: "0.5px solid #ECECEC", borderRadius: "6px" }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {row.slice(blockIndex * 2, blockIndex * 2 + 2).map((product) => {
                      const badge = product.source ? badgeConfig[product.source] : null
                      return (
                        <div
                          key={product.id}
                          className="relative cursor-pointer group"
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
                                top: "-4px", right: "-4px",
                                background: badge.bg, color: badge.color,
                                fontSize: "7px", fontWeight: 700,
                                padding: "2px 5px", borderRadius: "20px",
                                fontFamily: amazonFont,
                                border: `0.5px solid ${badge.color}20`,
                              }}
                            >
                              {badge.label}
                            </span>
                          )}
                          <div className="[&_.p-2]:!p-1 [&_.mb-1]:!mb-0 [&_.mt-2]:!mt-0.5">
                            <ProductCard product={{
                              id: product.id,
                              name: product.name,
                              priceUSD: product.priceUSD,
                              image: product.image,
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div ref={observerRef} className="flex justify-center py-4">
            {isLoading && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full" style={{ border: "1.5px solid #ECECEC" }} />
                  <div className="absolute inset-0 rounded-full animate-spin" style={{ border: "1.5px solid #D4372B", borderTopColor: "transparent" }} />
                </div>
                <span style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: amazonFont }}>
                  Chargement...
                </span>
              </div>
            )}
            {!hasMore && products.length > 0 && !isLoading && (
              <p style={{ fontSize: "10px", color: "#AAAAAA", fontFamily: amazonFont }}>
                {products.length} suggestions
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}