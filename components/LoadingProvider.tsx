"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LoadingOverlay } from "./LoadingOverlay"

/**
 * Délai avant d'afficher l'overlay. Si la navigation se termine avant,
 * on n'affiche RIEN — évite le clignotement sur les pages préchargées.
 */
const SHOW_DELAY_MS = 150

/**
 * Durée minimale d'affichage une fois l'overlay visible.
 * Sans ça, l'animation d'entrée n'a pas le temps de se jouer.
 */
const MIN_VISIBLE_MS = 500

/** Filet de sécurité : au-delà, on masque quoi qu'il arrive. */
const MAX_VISIBLE_MS = 10000

type LoadingContextValue = {
  show: () => void
  hide: () => void
  active: boolean
}

const LoadingContext = createContext<LoadingContextValue>({
  show: () => {},
  hide: () => {},
  active: false,
})

export const useLoading = () => useContext(LoadingContext)

/* ────────────────────────────────────────────────────────────
   Surveille la fin de navigation (pathname + query)
   ──────────────────────────────────────────────────────────── */
function RouteWatcher({ onRouteSettled }: { onRouteSettled: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firstRun = useRef(true)

  useEffect(() => {
    // Au montage initial il n'y a aucune navigation en cours
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    onRouteSettled()
  }, [pathname, searchParams, onRouteSettled])

  return null
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)

  // Miroirs en ref : les timers lisent l'état sans recréer les callbacks
  const activeRef = useRef(false)
  const shownAtRef = useRef(0)
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setActiveSafe = useCallback((value: boolean) => {
    activeRef.current = value
    setActive(value)
  }, [])

  const clearTimers = useCallback(() => {
    if (delayTimer.current) clearTimeout(delayTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (maxTimer.current) clearTimeout(maxTimer.current)
    delayTimer.current = null
    hideTimer.current = null
    maxTimer.current = null
  }, [])

  const show = useCallback(() => {
    clearTimers()

    delayTimer.current = setTimeout(() => {
      shownAtRef.current = Date.now()
      setActiveSafe(true)
    }, SHOW_DELAY_MS)

    // Filet de sécurité : jamais bloqué
    maxTimer.current = setTimeout(() => {
      clearTimers()
      setActiveSafe(false)
    }, MAX_VISIBLE_MS)
  }, [clearTimers, setActiveSafe])

  const hide = useCallback(() => {
    // Navigation terminée avant le délai : on annule, rien ne s'est affiché
    if (delayTimer.current) {
      clearTimeout(delayTimer.current)
      delayTimer.current = null
    }

    if (!activeRef.current) {
      clearTimers()
      return
    }

    const elapsed = Date.now() - shownAtRef.current
    const reste = Math.max(0, MIN_VISIBLE_MS - elapsed)

    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      clearTimers()
      setActiveSafe(false)
    }, reste)
  }, [clearTimers, setActiveSafe])

  // Nettoyage au démontage
  useEffect(() => clearTimers, [clearTimers])

  // Verrouille le scroll pendant l'affichage
  useEffect(() => {
    if (!active) return
    const precedent = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = precedent
    }
  }, [active])

  // Retour navigateur / onglet restauré : on ne laisse jamais l'overlay collé
  useEffect(() => {
    const onPageShow = () => {
      clearTimers()
      setActiveSafe(false)
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [clearTimers, setActiveSafe])

  return (
    <LoadingContext.Provider value={{ show, hide, active }}>
      <ClickListener show={show} />
      {children}
      <Suspense fallback={null}>
        <RouteWatcher onRouteSettled={hide} />
      </Suspense>
      <LoadingOverlay active={active} />
    </LoadingContext.Provider>
  )
}

/**
 * Écoute TOUS les clics sur des liens internes (<a href="/...">) et déclenche
 * le loader automatiquement — pas besoin de modifier chaque <Link> du site.
 * Ignore : liens externes, ancres #, target="_blank", download, clics avec
 * Ctrl/Cmd/Shift/Alt, et les liens qui pointent vers l'URL déjà active.
 */
function ClickListener({ show }: { show: () => void }) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // ⚠️ NE PAS filtrer sur e.defaultPrevented : next/link appelle déjà
      // preventDefault() lui-même dans son propre onClick sur le <a> pour
      // faire une navigation côté client. Ça n'empêche pas l'événement de
      // remonter jusqu'ici (preventDefault ≠ stopPropagation) — mais si on
      // rejette les clics déjà "preventDefault", le loader ne se déclenche
      // JAMAIS pour un clic sur un <Link>, soit ~100% de la nav interne.
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement | null)?.closest("a")
      if (!anchor) return
      if (anchor.hasAttribute("data-no-loader")) return

      const href = anchor.getAttribute("href")
      if (!href) return
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return
      if (anchor.getAttribute("rel")?.includes("external")) return
      if (href.startsWith("#")) return
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return

      let cible: URL
      try {
        cible = new URL(href, window.location.href)
      } catch {
        return
      }

      // Lien externe
      if (cible.origin !== window.location.origin) return

      // Même URL (chemin + query) : aucune navigation, donc aucun loader
      const actuel = window.location.pathname + window.location.search
      if (cible.pathname + cible.search === actuel) return

      show()
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [show])

  return null
}