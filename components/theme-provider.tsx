"use client"

/*
  ════════════════════════════════════════════════════════════════
  AJOUT REFONTE — Provider de thème (clair / sombre).
  ----------------------------------------------------------------
  Dark par défaut sur desktop, Light par défaut sur mobile.
  ════════════════════════════════════════════════════════════════
*/

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"
type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "adullam-theme"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
}

function getDefaultTheme(): Theme {
  if (typeof window === "undefined") return "dark" // SSR fallback
  const isMobile = window.innerWidth < 1024 // lg breakpoint
  return isMobile ? "light" : "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getDefaultTheme())
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => getDefaultTheme())
  const [isMounted, setIsMounted] = useState(false)

  // Initialisation après montage (pour éviter les problèmes d'hydratation)
  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const defaultTheme = getDefaultTheme()
    const initialTheme = stored === "light" || stored === "dark" ? stored : defaultTheme
    
    setThemeState(initialTheme)
    setResolvedTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  // Écouter le redimensionnement pour changer le thème par défaut
  useEffect(() => {
    if (!isMounted) return
    
    const handleResize = () => {
      // Ne change le thème que si l'utilisateur n'a pas fait de choix explicite
      const hasUserPreference = localStorage.getItem(STORAGE_KEY) !== null
      if (hasUserPreference) return
      
      const defaultTheme = getDefaultTheme()
      if (theme !== defaultTheme) {
        setThemeState(defaultTheme)
        setResolvedTheme(defaultTheme)
        applyTheme(defaultTheme)
      }
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMounted, theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    setResolvedTheme(next)
    applyTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: "dark" as Theme,
      resolvedTheme: "dark" as ResolvedTheme,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  }
  return ctx
}

/*
  Script anti-flash (FOUC) : applique la classe `.dark` AVANT le
  rendu React. À insérer dans <head> via le layout (voir layout.tsx).
*/
export const themeNoFlashScript = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    var isMobile = window.innerWidth < 1024;
    var defaultTheme = isMobile ? 'light' : 'dark';
    var d;
    if (t === 'dark' || t === 'light') {
      d = t === 'dark';
    } else {
      d = defaultTheme === 'dark';
    }
    var r = document.documentElement;
    if (d) { r.classList.add('dark'); r.style.colorScheme = 'dark'; }
    else { r.classList.remove('dark'); r.style.colorScheme = 'light'; }
  } catch(e) {}
})();
`