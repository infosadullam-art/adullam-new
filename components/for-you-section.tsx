"use client"

import { ProductCard } from "@/components/product-card"
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react"
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

// Même langage que product-card.tsx : étiquette pleine sombre par défaut,
// accent réservé aux signaux à caractère promotionnel.
const badgeConfig: Record<string, { label: string; tone: "dark" | "accent" }> = {
  session_graph: { label: "Pour vous",  tone: "dark" },
  session:       { label: "Pour vous",  tone: "dark" },
  als:           { label: "Recommandé", tone: "dark" },
  trend:         { label: "Tendance",   tone: "accent" },
  new:           { label: "Nouveau",    tone: "dark" },
  random:        { label: "Découverte", tone: "dark" },
  popular:       { label: "Populaire",  tone: "dark" },
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

function getOrCreateSessionId(): string | null {
  if (typeof window === "undefined") return null
  let stored = localStorage.getItem("adullam_session_id")
  if (!stored) {
    stored = crypto.randomUUID()
    localStorage.setItem("adullam_session_id", stored)
  }
  return stored
}

function readSavedState(sessionId: string | null): SavedState | null {
  if (!sessionId || typeof window === "undefined") return null
  try {
    const saved = sessionStorage.getItem(`${STORAGE_KEY}_${sessionId}`)
    if (!saved) return null
    const state: SavedState = JSON.parse(saved)
    const age = Date.now() - state.timestamp
    if (age > 30 * 60 * 1000) {
      sessionStorage.removeItem(`${STORAGE_KEY}_${sessionId}`)
      return null
    }
    return state
  } catch {
    return null
  }
}

export function ForYouSection() {
  const { formatPrice } = useCurrencyFormatter()
  const { fetchWithAuth } = useApi()

  const [sessionId] = useState<string | null>(() => getOrCreateSessionId())
  const [initialSavedState] = useState<SavedState | null>(() => readSavedState(sessionId))

  const [products, setProducts] = useState<Product[]>(initialSavedState?.products ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialSavedState?.hasMore ?? true)
  const [initialized, setInitialized] = useState(Boolean(initialSavedState && initialSavedState.products.length > 0))
  const [error, setError] = useState<string | null>(null)
  const [titleIndex, setTitleIndex] = useState(0)

  const observerRef        = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialFetchDone   = useRef(false)
  const isFetchingRef      = useRef(false)
  const pageRef            = useRef(initialSavedState?.page ?? 1)
  const productsRef        = useRef<Product[]>(initialSavedState?.products ?? [])
  const hasMoreRef         = useRef(initialSavedState?.hasMore ?? true)
  const viewedProducts     = useRef<Set<string>>(new Set())
  const trackQueueRef      = useRef<Set<string>>(new Set())
  const saveTimeoutRef     = useRef<NodeJS.Timeout>()
  const lastSavedScrollRef = useRef(0)
  const pendingScrollRestoreRef = useRef<number | null>(initialSavedState?.scrollPosition ?? null)

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
    } catch (e) {
      console.error("Erreur sauvegarde état:", e)
    }
  }, [sessionId])

  useLayoutEffect(() => {
    if (pendingScrollRestoreRef.current !== null && pendingScrollRestoreRef.current > 0) {
      window.scrollTo({ top: pendingScrollRestoreRef.current, behavior: "instant" })
      lastSavedScrollRef.current = pendingScrollRestoreRef.current
      pendingScrollRestoreRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        const currentScroll = window.scrollY
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
    if (!sessionId) return
    document.cookie = `sessionId=${sessionId}; path=/; max-age=86400; SameSite=Lax`
  }, [sessionId])

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
            // ✅ Informe le chatbot qu'une vue produit réelle vient d'avoir lieu,
            // pour alimenter son compteur de déclenchement proactif.
            window.dispatchEvent(new CustomEvent("adullam:product-viewed", { detail: { productId: id } }))
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
      if (!initialSavedState || initialSavedState.products.length === 0) {
        fetchForYou()
      }
    }
  }, [sessionId, fetchForYou, initialSavedState])

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

  const badgeFor = (product: Product) => (product.source ? badgeConfig[product.source] : null)

  if (!isLoading && products.length === 0 && !error) {
    return (
      <section className="w-full py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[13px] text-muted-foreground">
            Chargement des recommandations...
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-6 lg:py-10 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-[3px] h-[18px] rounded-sm bg-accent" />
            <h2 key={titleIndex} className="text-lg font-extrabold tracking-[-0.02em] text-foreground">
              {TITLES[titleIndex].main}{" "}
              <span className="text-accent">{TITLES[titleIndex].sub}</span>
            </h2>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-accent" />
            {products.length} articles · mise à jour en continu
          </p>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="text-center py-4 text-xs text-accent">
              Erreur de chargement — réessai au prochain scroll
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
            {products.map((product) => {
              const badge = badgeFor(product)
              return (
                <div
                  key={product.id}
                  className="relative cursor-pointer group transition-transform duration-200 hover:-translate-y-0.5"
                  data-product-id={product.id}
                  onClick={() => trackInteraction(product.id, "CLICK")}
                >
                  {badge && (
                    <span
                      className="absolute z-10 top-1.5 left-1.5 rounded-sm px-1.5 py-0.5 text-[9px] font-bold text-white"
                      style={{ background: badge.tone === "accent" ? "var(--accent)" : "color-mix(in oklab, var(--foreground) 82%, transparent)" }}
                    >
                      {badge.label}
                    </span>
                  )}

                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      priceUSD: product.priceUSD,
                      image: product.image,
                    }}
                    showTrust
                  />
                </div>
              )
            })}
          </div>

          <div ref={observerRef} className="flex justify-center py-4">
            {isLoading && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
                <span className="text-[10px] text-muted-foreground">
                  Chargement...
                </span>
              </div>
            )}
            {!hasMore && products.length > 0 && !isLoading && (
              <p className="text-[10px] text-muted-foreground">
                {products.length} suggestions
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}