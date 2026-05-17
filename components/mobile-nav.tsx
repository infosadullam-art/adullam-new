"use client"

import { Home, Search, Newspaper, Bell, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"

const navItems = [
  { icon: Home,      label: "Accueil",        id: "home",          path: "/" },
  { icon: Search,    label: "Sourcing",        id: "sourcing",      path: "/boutique-noel" },
  { icon: Newspaper, label: "Fil d'actualité", id: "feed",          path: "/feed" },
  { icon: Bell,      label: "Notifications",   id: "notifications", path: "/notifications" },
  { icon: User,      label: "Compte",          id: "account",       path: "/account" },
]

export default function MobileNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user }  = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  /* ── Notifications non lues ────────────────────────────────── */
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("adullam_token")
        const res   = await fetch("/api/notifications?unread=true&limit=1", {
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

  return (
    <div className="lg:hidden">
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "#fff",
          borderTop: "0.5px solid #ECECEC",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
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
                    background: "#D4372B",
                    transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />

                {/* Icône */}
                <div className="relative">
                  <Icon
                    style={{
                      width: "20px",
                      height: "20px",
                      color: isActive ? "#D4372B" : "#AAAAAA",
                      transition: "color 0.15s ease",
                      strokeWidth: isActive ? 2.2 : 1.8,
                    }}
                  />

                  {/* Badge notifications */}
                  {showBadge && (
                    <span
                      className="absolute flex items-center justify-center"
                      style={{
                        top: "-5px",
                        right: "-6px",
                        minWidth: "16px",
                        height: "16px",
                        background: "#D4372B",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        fontFamily: "'Poppins', sans-serif",
                        borderRadius: "100px",
                        padding: "0 4px",
                        border: "2px solid #fff",
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
                    fontFamily: "'Poppins', sans-serif",
                    color: isActive ? "#D4372B" : "#AAAAAA",
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
