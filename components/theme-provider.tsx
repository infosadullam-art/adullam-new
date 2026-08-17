"use client"

/*
  ════════════════════════════════════════════════════════════════
  AJOUT REFONTE — Provider de thème (clair / sombre).
  ----------------------------------------------------------------
  Suppression du mode "system" (Auto). Dark par défaut.
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 🔥 Dark par défaut
  const [theme, setThemeState] = useState<Theme>("dark")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark")

  // Initialisation depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    // Si stored est null ou invalide, on garde "dark"
    const initialTheme = stored === "light" || stored === "dark" ? stored : "dark"
    setThemeState(initialTheme)
    setResolvedTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

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
    // Repli sûr si le hook est utilisé hors provider
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
    var t = localStorage.getItem('${STORAGE_KEY}') || 'dark';
    var d = t === 'dark';
    var r = document.documentElement;
    if (d) { r.classList.add('dark'); r.style.colorScheme = 'dark'; }
    else { r.classList.remove('dark'); r.style.colorScheme = 'light'; }
  } catch(e) {}
})();
`