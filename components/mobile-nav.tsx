"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { apiFetch } from "@/lib/api"

// ════════════════════════════════════════════════════════════
// ICÔNES — mêmes dessins maison que le header / deal-countdown
// (trait 1.6-1.8, jonctions arrondies) : une seule identité SVG.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; style?: React.CSSProperties }

const IconHome = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10v9.2c0 .4.3.8.8.8H10v-5.4c0-.5.4-1 1-1h2c.6 0 1 .5 1 1V20h3.2c.4 0 .8-.4.8-.8V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconSearch = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M19.5 19.5 15.6 15.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const IconNewspaper = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3.5" y="5" width="13" height="14" rx="1.3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M16.5 8.5H19a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.3 8.3h4M6.3 11.2h7M6.3 14.1h7M6.3 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const IconBell = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M6 10.3c0-3.6 2.4-6.1 6-6.1s6 2.5 6 6.1c0 4 1.3 5.3 1.8 5.9.3.3.1.9-.4.9H4.6c-.5 0-.7-.6-.4-.9.5-.6 1.8-1.9 1.8-5.9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9.8 19.8a2.3 2.3 0 0 0 4.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconUser = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="8.2" r="3.7" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4.8 19.5c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const navItems = [
  { icon: IconHome,      label: "Accueil",        id: "home",          path: "/" },
  { icon: IconSearch,    label: "Sourcing",        id: "sourcing",      path: "/boutique-noel" },
  { icon: IconNewspaper, label: "Fil d'actualité", id: "feed",          path: "/feed" },
  { icon: IconBell,      label: "Notifications",   id: "notifications", path: "/notifications" },
  { icon: IconUser,      label: "Compte",          id: "account",       path: "/account" },
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
                className="relative flex flex-col items-center justify-center gap-[3px] focus:outline-none"
                style={{
                  transition: "transform 80ms ease",
                }}
                onPointerDown={e => (e.currentTarget.style.transform = "scale(0.88)")}
                onPointerUp={e   => (e.currentTarget.style.transform = "scale(1)")}
                onPointerLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Indicateur actif — pilule en haut */}
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: isActive ? "24px" : "0px",
                    height: "2.5px",
                    borderRadius: "0 0 3px 3px",
                    background: "var(--accent)",
                    transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />

                {/* Icône */}
                <div className="relative">
                  <Icon
                    style={{
                      width: "20px",
                      height: "20px",
                      color: isActive ? "var(--accent)" : "var(--muted-foreground)",
                      transition: "color 0.15s ease",
                    }}
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
                  style={{
                    fontSize: "9px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--accent)" : "var(--muted-foreground)",
                    transition: "color 0.15s ease, font-weight 0.15s ease",
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