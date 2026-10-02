// components/LanguageSelector.tsx
"use client"

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

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLocale()

  return (
    <select
      aria-label="Language"
      value={language}
      onChange={(event) => {
        const next = event.target.value as UiLanguage
        if (next === language) return
        setLanguage(next)
        // Recharge pour que les données (API) et l'interface repartent dans la nouvelle langue.
        window.location.reload()
      }}
      className={`h-8 rounded-md border bg-background px-2 text-sm text-foreground ${className}`}
    >
      {UI_LANGUAGES.map((code) => (
        <option key={code} value={code}>
          {nativeName(code)}
        </option>
      ))}
    </select>
  )
}

export default LanguageSelector
