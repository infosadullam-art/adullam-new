// components/LanguageSelector.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Globe } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocale } from "@/context/LocaleProvider"
import { UI_LANGUAGES, type UiLanguage } from "@/lib/country-config"

// Nom de la langue dans sa propre langue ("Français", "English", "العربية", "Português"),
// dérivé d'Intl : ajouter une langue à UI_LANGUAGES l'ajoute ici automatiquement.
function nativeName(language: UiLanguage): string {
  try {
    const name = new Intl.DisplayNames([language], { type: "language" }).of(language) ?? language
    return name.charAt(0).toLocaleUpperCase(language) + name.slice(1)
  } catch {
    return language
  }
}

type LanguageSelectorProps = {
  // topbar : pastille segmentée FR | EN | AR | PT, jumelle du ThemeToggle "switch" (bande de marque)
  // icon   : bouton rond avec menu déroulant, jumeau du ThemeToggle "icon" (menus mobiles)
  variant?: "topbar" | "icon"
  size?: "sm" | "md" // variante icon : md = h-9 w-9 avec bordure, sm = h-8 w-8 sans bordure (header mobile)
  className?: string
}

export function LanguageSelector({ variant = "topbar", size = "md", className = "" }: LanguageSelectorProps) {
  const { language, setLanguage } = useLocale()
  const t = useTranslations("header")
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Menu déroulant (variante icon) : fermeture au clic / toucher à l'extérieur et avec Échap
  useEffect(() => {
    if (!open) return
    const onOutside = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    document.addEventListener("touchstart", onOutside)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onOutside)
      document.removeEventListener("touchstart", onOutside)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const choose = (next: UiLanguage) => {
    setOpen(false)
    if (next === language) return
    setLanguage(next)
    // Recharge pour que les données (API) et l'interface repartent dans la nouvelle langue.
    window.location.reload()
  }

  // ── Barre du haut : mêmes classes que ThemeToggle variant="switch" ──────────
  if (variant === "topbar") {
    return (
      <div
        role="radiogroup"
        aria-label={t("language")}
        className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5 ${className}`}
      >
        {UI_LANGUAGES.map((code) => {
          const active = code === language
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={nativeName(code)}
              title={nativeName(code)}
              onClick={() => choose(code)}
              className={`flex h-7 w-8 items-center justify-center rounded-full text-[11px] font-semibold uppercase transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {code}
            </button>
          )
        })}
      </div>
    )
  }

  // ── Menus : bouton rond (comme ThemeToggle variant="icon") + menu déroulant ──
  const triggerSize =
    size === "sm" ? "h-8 w-8 border-0 bg-transparent" : "h-9 w-9 border border-border"

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("language")}
        aria-haspopup="menu"
        aria-expanded={open}
        title={nativeName(language)}
        className={`relative inline-flex ${triggerSize} items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface focus:outline-none`}
      >
        <Globe className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("language")}
          className="anim-scale-in absolute end-0 mt-2 z-[9999] w-[176px] origin-top-right rtl:origin-top-left rounded-xl border border-border bg-popover p-1.5 elevate-lg"
        >
          {UI_LANGUAGES.map((code) => {
            const active = code === language
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => choose(code)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors duration-200 hover:bg-surface ${
                  active ? "font-semibold text-accent" : "text-foreground"
                }`}
              >
                <span dir="auto">{nativeName(code)}</span>
                {active ? (
                  <Check className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">{code}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector