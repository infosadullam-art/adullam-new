"use client"

/*
  ════════════════════════════════════════════════════════════════
  AJOUT REFONTE — Provider de thème (clair / sombre / système).
  ----------------------------------------------------------------
  Ceci est un AJOUT non-fonctionnel pour piloter la classe `.dark`
  déjà présente dans globals.css. Il ne touche à aucune logique
  métier existante (panier, locale, auth, API…). Sans dépendance
  externe (pas de next-themes) pour rester autonome.
  ════════════════════════════════════════════════════════════════
*/

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "adullam-theme"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")

  // Initialisation depuis localStorage / système au montage
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system"
    setThemeState(stored)
    const resolved = stored === "system" ? getSystemTheme() : stored
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  // Suivre les changements système quand on est en mode "system"
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const resolved = getSystemTheme()
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    const resolved = next === "system" ? getSystemTheme() : next
    setResolvedTheme(resolved)
    applyTheme(resolved)
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
    // Repli sûr si le hook est utilisé hors provider (ne casse pas le rendu)
    return {
      theme: "system" as Theme,
      resolvedTheme: "light" as ResolvedTheme,
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
    var t = localStorage.getItem('${STORAGE_KEY}') || 'system';
    var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var r = document.documentElement;
    if (d) { r.classList.add('dark'); r.style.colorScheme = 'dark'; }
    else { r.classList.remove('dark'); r.style.colorScheme = 'light'; }
  } catch(e) {}
})();
`
