"use client"

import { createContext, useContext, useEffect, useState, useRef, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LoadingOverlay } from "./LoadingOverlay"

type LoadingContextValue = {
  show: () => void
  hide: () => void
}

const LoadingContext = createContext<LoadingContextValue>({
  show: () => {},
  hide: () => {},
})

export const useLoading = () => useContext(LoadingContext)

function RouteWatcher({ onRouteSettled }: { onRouteSettled: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    onRouteSettled()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  return null
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)

  const show = () => setActive(true)
  const hide = () => setActive(false)

  return (
    <LoadingContext.Provider value={{ show, hide }}>
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
 * Ignore : liens externes, ancres #, target="_blank", clics avec Ctrl/Cmd (ouverture
 * dans un nouvel onglet), et les liens qui pointent vers la page déjà active.
 */
function ClickListener({ show }: { show: () => void }) {
  const currentPath = useRef<string>("")

  useEffect(() => {
    currentPath.current = window.location.pathname
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement)?.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return
      if (anchor.target === "_blank") return
      if (href.startsWith("#")) return
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return

      let targetPath = href
      try {
        targetPath = new URL(href, window.location.origin).pathname
      } catch {
        /* href relatif simple, on garde tel quel */
      }
      if (targetPath === currentPath.current) return

      show()
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [show])

  return null
}