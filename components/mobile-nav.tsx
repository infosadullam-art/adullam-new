"use client"

import { Home, Search, Newspaper, Bell, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"

const navItems = [
  { icon: Home, label: "Accueil", id: "home", path: "/" },
  { icon: Search, label: "Sourcing", id: "sourcing", path: "/boutique-noel" },
  { icon: Newspaper, label: "Fil d'actualité", id: "feed", path: "/feed" },
  { icon: Bell, label: "Notifications", id: "notifications", path: "/notifications" },
  { icon: User, label: "Compte", id: "account", path: "/account" },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  // Récupérer le nombre de notifications non lues
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('adullam_token')
        const res = await fetch('/api/notifications?unread=true&limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const getActiveTab = () => {
    if (pathname === "/") return "home"
    if (pathname === "/boutique-noel") return "sourcing"
    if (pathname === "/feed") return "feed"
    if (pathname === "/notifications") return "notifications"
    if (pathname === "/account") return "account"
    if (pathname.startsWith("/account")) return "account"
    return "home"
  }

  const activeTab = getActiveTab()

  return (
    <div className="lg:hidden">
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 h-14">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const showBadge = item.id === "notifications" && unreadCount > 0

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center gap-0.5 relative active:scale-90 transition-transform duration-75"
              >
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-75 ${
                      isActive ? "text-[#C72C1C]" : "text-black"
                    }`} 
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold shadow-sm px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-[10px] font-medium transition-colors duration-75 ${
                    isActive ? "text-[#C72C1C]" : "text-black"
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#C72C1C] rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}