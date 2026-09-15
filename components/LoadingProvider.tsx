"use client"

import { createContext, useContext, useEffect, useState, Suspense } from "react"
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
  // usePathname + useSearchParams doivent être sous un <Suspense> en App Router
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
      {children}
      <Suspense fallback={null}>
        <RouteWatcher onRouteSettled={hide} />
      </Suspense>
      <LoadingOverlay active={active} />
    </LoadingContext.Provider>
  )
}
