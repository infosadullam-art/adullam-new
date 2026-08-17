"use client"

/*
  ════════════════════════════════════════════════════════════════
  AJOUT REFONTE — Bouton de bascule de thème.
  Variante "icon" (compact, pour les barres) et "switch" (segmenté,
  clair / sombre). Purement présentationnel.
  ════════════════════════════════════════════════════════════════
*/

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle({
  variant = "icon",
  className = "",
}: {
  variant?: "icon" | "switch"
  className?: string
}) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

  if (variant === "switch") {
    const options: { value: "light" | "dark"; icon: typeof Sun; label: string }[] = [
      { value: "light", icon: Sun, label: "Clair" },
      { value: "dark", icon: Moon, label: "Sombre" },
    ]
    return (
      <div
        role="radiogroup"
        aria-label="Thème"
        className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5 ${className}`}
      >
        {options.map(({ value, icon: Icon, label }) => {
          const active = theme === value
          return (
            <button
              key={value}
              role="radio"
              aria-checked={active}
              aria-label={label}
              title={label}
              onClick={() => setTheme(value)}
              className={`flex h-7 w-8 items-center justify-center rounded-full transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={resolvedTheme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
      title={resolvedTheme === "dark" ? "Mode clair" : "Mode sombre"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface ${className}`}
    >
      <Sun
        className={`h-[18px] w-[18px] transition-all duration-300 ${
          resolvedTheme === "dark" ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
        strokeWidth={2}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          resolvedTheme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
        strokeWidth={2}
      />
    </button>
  )
}