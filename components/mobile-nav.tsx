"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { apiFetch } from "@/lib/api"

// ════════════════════════════════════════════════════════════
// ICÔNES — dessins maison (trait 1.7, jonctions arrondies),
// chacune bascule contour → rempli quand l'onglet est actif
// (façon Instagram/TikTok), piloté par `active`.
// ════════════════════════════════════════════════════════════
type IconProps = { active?: boolean; className?: string; style?: React.CSSProperties }

const IconHome = ({ active, className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style}>
    <path
      d="M4 11.5 12 4l8 7.5"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M6 10v9.2c0 .4.3.8.8.8H10v-5.4c0-.5.4-1 1-1h2c.6 0 1 .5 1 1V20h3.2c.4 0 .8-.4.8-.8V10"
      fill="currentColor" fillOpacity={active ? 0.16 : 0}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "fill-opacity 0.25s ease" }}
    />
  </svg>
)

const IconSearch = ({ active, className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style}>
    <circle
      cx="10.8" cy="10.8" r="6.3"
      fill="currentColor" fillOpacity={active ? 0.16 : 0}
      stroke="currentColor" strokeWidth="1.8"
      style={{ transition: "fill-opacity 0.25s ease" }}
    />
    <path d="M19.5 19.5 15.6 15.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconNewspaper = ({ active, className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style}>
    <rect
      x="3.5" y="5" width="13" height="14" rx="1.3"
      fill="currentColor" fillOpacity={active ? 0.14 : 0}
      stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
      style={{ transition: "fill-opacity 0.25s ease" }}
    />
    <path d="M16.5 8.5H19a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M6.3 8.3h4M6.3 11.2h7M6.3 14.1h7M6.3 17h4"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
      opacity={active ? 0.55 : 1}
      style={{ transition: "opacity 0.25s ease" }}
    />
  </svg>
)

const IconBell = ({ active, className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style}>
    <path
      d="M6 10.3c0-3.6 2.4-6.1 6-6.1s6 2.5 6 6.1c0 4 1.3 5.3 1.8 5.9.3.3.1.9-.4.9H4.6c-.5 0-.7-.6-.4-.9.5-.6 1.8-1.9 1.8-5.9Z"
      fill="currentColor" fillOpacity={active ? 0.16 : 0}
      stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
      style={{ transition: "fill-opacity 0.25s ease" }}
    />
    <path d="M9.8 19.8a2.3 2.3 0 0 0 4.4 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const IconUser = ({ active, className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style}>
    <circle
      cx="12" cy="8.2" r="3.7"
      fill="currentColor" fillOpacity={active ? 0.16 : 0}
      stroke="currentColor" strokeWidth="1.8"
      style={{ transition: "fill-opacity 0.25s ease" }}
    />
    <path d="M4.8 19.5c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="grid grid-cols-5" style={{ height: "56px" }}>
          {navItems.map((item) => {
            const Icon      = item.icon
            const isActive  = activeTab === item.id
            const showBadge = item.id === "notifications" && unreadCount > 0

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="relative flex flex-col items-center justify-center gap-[3px] focus:outline-none"
                style={{ transition: "transform 80ms ease" }}
                onPointerDown={e => (e.currentTarget.style.transform = "scale(0.88)")}
                onPointerUp={e   => (e.currentTarget.style.transform = "scale(1)")}
                onPointerLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Indicateur actif — pilule en haut, apparition en fondu + scale */}
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: "24px",
                    height: "2.5px",
                    borderRadius: "0 0 3px 3px",
                    background: "var(--accent)",
                    opacity: isActive ? 1 : 0,
                    transform: `translateX(-50%) scaleX(${isActive ? 1 : 0.3})`,
                    transformOrigin: "center",
                    transition: "opacity 0.25s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />

                {/* Icône — rebond léger à l'activation */}
                <div
                  key={`${item.id}-${isActive}`}
                  className={isActive ? "mnav-icon-pop relative" : "relative"}
                >
                  <Icon
                    active={isActive}
                    className="block"
                    style={{
                      width: "20px",
                      height: "20px",
                      color: isActive ? "var(--accent)" : "var(--muted-foreground)",
                      transition: "color 0.2s ease",
                    } as React.CSSProperties}
                  />

                  {/* Badge notifications — apparition en pop */}
                  {showBadge && (
                    <span
                      className="mnav-badge-pop absolute flex items-center justify-center tabular-nums"
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
                    transition: "color 0.2s ease, font-weight 0.2s ease",
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

      <style jsx global>{`
        @keyframes mnavIconPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.22); }
          70%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        .mnav-icon-pop {
          animation: mnavIconPop 0.38s cubic-bezier(0.34,1.56,0.64,1);
        }

        @keyframes mnavBadgePop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .mnav-badge-pop {
          animation: mnavBadgePop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
      `}</style>
    </div>
  )
}