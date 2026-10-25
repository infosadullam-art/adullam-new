"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/admin/auth-context"
import { NAV_GROUPS, NAV_BOTTOM, isActive, type NavItem } from "./nav"

function Marque() {
  return (
    <div className="flex items-baseline gap-2">
      <span className="adm-display text-xl font-bold tracking-tight text-[#fbfbf9]">Adullam</span>
      <span className="h-2 w-2 translate-y-[-1px] rounded-[2px] bg-[var(--adm-rouge)]" aria-hidden />
    </div>
  )
}

function Lien({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const actif = isActive(pathname, item)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={actif ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2 text-[15px] transition-colors",
        actif ? "bg-white/10 font-semibold text-white" : "text-[#b9c0bb] hover:bg-white/5 hover:text-white",
      )}
    >
      {actif && <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r bg-[var(--adm-ambre)]" aria-hidden />}
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.name}</span>
    </Link>
  )
}

function Menu_({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-5" aria-label="Navigation principale">
      {NAV_GROUPS.map((groupe) => {
        const contientActif = groupe.items.some((i) => isActive(pathname, i))
        const liens = (
          <div className="space-y-0.5">
            {groupe.items.map((item) => (
              <Lien key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        )
        if (groupe.collapsed) {
          return (
            <details key={groupe.title} open={contientActif} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between px-3 pb-1 text-[13px] font-medium text-[#7d8782] [&::-webkit-details-marker]:hidden">
                {groupe.title}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              {liens}
            </details>
          )
        }
        return (
          <div key={groupe.title}>
            <p className="px-3 pb-1 text-[13px] font-medium text-[#7d8782]">{groupe.title}</p>
            {liens}
          </div>
        )
      })}
    </nav>
  )
}

function Compte({ compact }: { compact?: boolean }) {
  const { user, logout } = useAuth()
  const initiale = (user?.name || user?.email || "A").charAt(0).toUpperCase()
  return (
    <div className={cn("flex items-center gap-3", compact ? "" : "px-1")}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--adm-ambre)] text-sm font-bold text-[var(--adm-encre)]">
        {initiale}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{user?.name || "Administrateur"}</p>
        <p className="truncate text-xs text-[#8b948f]">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-md p-2 text-[#b9c0bb] hover:bg-white/10 hover:text-white"
        aria-label="Se déconnecter"
        title="Se déconnecter"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}

/* Barre latérale (ordinateur) */
export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden h-dvh w-64 shrink-0 flex-col bg-[var(--adm-encre)] pl-6 pr-3 lg:flex">
      <div className="py-6 pl-0">
        <Marque />
        <p className="mt-1 text-xs text-[#7d8782]">Poste de pilotage</p>
      </div>
      <div className="-mr-0 flex-1 overflow-y-auto pb-6 pr-0">
        <Menu_ pathname={pathname} />
      </div>
      <div className="adm-perf border-white/15 py-4 pr-0">
        <Compte />
      </div>
    </aside>
  )
}

/* Barre du bas + tiroir « Plus » (téléphone et tablette) */
export function AdminMobileNav() {
  const pathname = usePathname()
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => setOuvert(false), [pathname])
  useEffect(() => {
    if (!ouvert) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [ouvert])

  return (
    <div className="lg:hidden">
      {ouvert && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOuvert(false)}
            aria-label="Fermer le menu"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl bg-[var(--adm-encre)] px-5 pb-6 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <Marque />
              <button
                type="button"
                onClick={() => setOuvert(false)}
                className="rounded-md p-2 text-[#b9c0bb] hover:bg-white/10"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="pl-3">
              <Menu_ pathname={pathname} onNavigate={() => setOuvert(false)} />
            </div>
            <div className="adm-perf mt-5 border-white/15 pt-4">
              <Compte compact />
            </div>
          </div>
        </div>
      )}

      <nav
        className="adm-bottom-safe fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[var(--adm-encre)]"
        aria-label="Raccourcis"
      >
        <ul className="grid grid-cols-5">
          {NAV_BOTTOM.map((item) => {
            const actif = isActive(pathname, item)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px]",
                    actif ? "font-semibold text-white" : "text-[#9aa39e]",
                  )}
                >
                  {actif && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b bg-[var(--adm-ambre)]" aria-hidden />}
                  <Icon className="h-5 w-5" />
                  {item.name === "Demandes sourcing" ? "Sourcing" : item.name}
                </Link>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={() => setOuvert(true)}
              className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] text-[#9aa39e]"
              aria-haspopup="dialog"
            >
              <Menu className="h-5 w-5" />
              Plus
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
