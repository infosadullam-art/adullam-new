"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/admin/auth-context"
import { apiFetch } from "@/lib/api"

// ════════════════════════════════════════════════════════════
// ICÔNES — même dessin maison que header / mobile-header
// (trait 1.6, jonctions arrondies, gabarit 24×24) — fini lucide
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; style?: React.CSSProperties }

const IconHome = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M4.5 11.2 12 4.6l7.5 6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 9.8V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const IconSearch = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="11" cy="11" r="6.75" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20.2 20.2l-3.85-3.85" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconNewspaper = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3.5" y="5.5" width="13.5" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M17 8.5h2.3A1.2 1.2 0 0 1 20.5 9.7v8.8a1.5 1.5 0 0 1-1.5 1.5H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 9h7M6.5 12h7M6.5 15h4.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const IconBell = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M6.2 9.2a5.8 5.8 0 1 1 11.6 0c0 3.05.92 4.8 1.5 5.6a.75.75 0 0 1-.6 1.2H5.3a.75.75 0 0 1-.6-1.2c.58-.8 1.5-2.55 1.5-5.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9.6 18.4a2.4 2.4 0 0 0 4.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconUser = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="8.2" r="3.3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5.2 19.8c0-3.6 3-6.1 6.8-6.1s6.8 2.5 6.8 6.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const navItems = [
  { icon: IconHome,      label: "Accueil",         id: "home",          path: "/" },
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
    if (pathname === "/")                 return "home"
    if (pathname === "/boutique-noel")    return "sourcing"
    if (pathname === "/feed")             return "feed"
    if (pathname === "/notifications")    return "notifications"
    if (pathname.startsWith("/account"))  return "account"
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
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Pilule active — glisse d'un onglet à l'autre (shared layout animation) */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{
                      position: "absolute",
                      inset: "5px 8px",
                      borderRadius: "13px",
                      background: "color-mix(in oklab, var(--accent) 10%, transparent)",
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Icône + badge */}
                <div className="relative" style={{ zIndex: 1 }}>
                  <motion.div
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  >
                    <Icon
                      style={{
                        display: "block",
                        width: "20px",
                        height: "20px",
                        color: isActive ? "var(--accent)" : "var(--muted-foreground)",
                        transition: "color 0.2s ease",
                      }}
                    />
                  </motion.div>

                  <AnimatePresence>
                    {showBadge && (
                      <motion.span
                        key={unreadCount}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
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
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    fontSize: "9px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--accent)" : "var(--muted-foreground)",
                    transition: "color 0.2s ease, font-weight 0.15s ease",
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