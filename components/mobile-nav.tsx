"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { apiFetch } from "@/lib/api"

// ════════════════════════════════════════════════════════════
// ICÔNES — mêmes dessins maison que le header (trait 1.6,
// jonctions arrondies) : fini lucide, une seule identité SVG.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; strokeWidth?: number; style?: React.CSSProperties }

const IconHome = ({ className, strokeWidth = 1.6, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M4.5 11.2 12 4.6l7.5 6.6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 9.8V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
  </svg>
)

// Sourcing — une boîte (produit/usine) sous une loupe, pour se distinguer
// de la simple recherche du header.
const IconSourcing = ({ className, strokeWidth = 1.6, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M3.8 8.6 10.5 5l6.7 3.6v6.3l-6.7 3.6-6.7-3.6V8.6Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M3.8 8.6 10.5 12l6.7-3.4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M10.5 12v6.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <circle cx="18" cy="17.2" r="3.1" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M20.3 19.5 22 21.2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
)

const IconFeed = ({ className, strokeWidth = 1.6, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3.5" y="4" width="17" height="16" rx="1.6" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M7 8.3h6M7 12h10M7 15.7h10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
)

const IconBell = ({ className, strokeWidth = 1.6, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M6.2 9.2a5.8 5.8 0 1 1 11.6 0c0 3.05.92 4.8 1.5 5.6a.75.75 0 0 1-.6 1.2H5.3a.75.75 0 0 1-.6-1.2c.58-.8 1.5-2.55 1.5-5.6Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M9.6 18.4a2.4 2.4 0 0 0 4.8 0" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
)

const IconUser = ({ className, strokeWidth = 1.6, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="8.2" r="3.3" stroke="currentColor" strokeWidth={strokeWidth} />
    <path d="M5.2 19.8c0-3.6 3-6.1 6.8-6.1s6.8 2.5 6.8 6.1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
)

const navItems = [
  { icon: IconHome,     label: "Accueil",        id: "home",          path: "/" },
  { icon: IconSourcing, label: "Sourcing",        id: "sourcing",      path: "/boutique-noel" },
  { icon: IconFeed,     label: "Fil d'actualité", id: "feed",          path: "/feed" },
  { icon: IconBell,     label: "Notifications",   id: "notifications", path: "/notifications" },
  { icon: IconUser,     label: "Compte",          id: "account",       path: "/account" },
]

export default function MobileNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user }  = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /* ── Préchargement en arrière-plan ────────────────────────────
     Les onglets de la barre sont précaché dès le montage : si la
     page n'est pas déjà en cache côté client, Next.js va la
     charger silencieusement pour que le tap soit instantané. */
  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.path)
    })
  }, [router])

  /* ── Notifications non lues ────────────────────────────────── */
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("adullam_token")
        const res   = await apiFetch("/api/notifications?unread=true&limit=1", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (data.success && data.data?.stats) {
          setUnreadCount(data.data.stats.unread || 0)
        } else if (data.data?.stats) {
          setUnreadCount(data.data.stats.unread || 0)
        } else if (data.stats) {
          setUnreadCount(data.stats.unread || 0)
        }
      } catch (error) {
        console.error("Erreur chargement notifs:", error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  /* ── Onglet actif ──────────────────────────────────────────── */
  const getActiveTab = () => {
    if (pathname === "/")               return "home"
    if (pathname === "/boutique-noel")  return "sourcing"
    if (pathname === "/feed")           return "feed"
    if (pathname === "/notifications")  return "notifications"
    if (pathname.startsWith("/account"))return "account"
    return "home"
  }

  const activeTab = getActiveTab()

  if (!mounted) {
    return (
      <div className="lg:hidden">
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="grid grid-cols-5" style={{ height: "56px" }} />
        </nav>
      </div>
    )
  }

  return (
    <div className="lg:hidden">
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          className="grid grid-cols-5"
          style={{ height: "56px" }}
        >
          {navItems.map((item) => {
            const Icon      = item.icon
            const isActive  = activeTab === item.id
            const showBadge = item.id === "notifications" && unreadCount > 0

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                onMouseEnter={() => router.prefetch(item.path)}
                className="relative flex flex-col items-center justify-center gap-[3px] transition-transform duration-150 active:scale-90 focus:outline-none"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Indicateur actif — pilule en haut */}
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-sm bg-accent transition-all duration-200"
                  style={{
                    width: isActive ? "24px" : "0px",
                    height: "2.5px",
                  }}
                />

                {/* Icône */}
                <div className="relative">
                  <Icon
                    className="w-5 h-5 transition-colors duration-150"
                    strokeWidth={isActive ? 2 : 1.6}
                    style={{ color: isActive ? "var(--accent)" : "var(--muted-foreground)" } as React.CSSProperties}
                  />

                  {/* Badge notifications */}
                  {showBadge && (
                    <span
                      className="absolute flex items-center justify-center tabular-nums"
                      style={{
                        top: "-5px",
                        right: "-6px",
                        minWidth: "16px",
                        height: "16px",
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        borderRadius: "100px",
                        padding: "0 4px",
                        border: "2px solid var(--background)",
                        lineHeight: 1,
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className="transition-colors duration-150"
                  style={{
                    fontSize: "9px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--accent)" : "var(--muted-foreground)",
                    letterSpacing: "0.01em",
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}