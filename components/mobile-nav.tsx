"use client"

import { Home, Search, Newspaper, Bell, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

const navItems = [
  { icon: Home, label: "Accueil", id: "home", path: "/" },
  { icon: Search, label: "Sourcing", id: "sourcing", path: "/boutique-noel" },
  { icon: Newspaper, label: "Fil d'actualité", id: "feed", path: "/feed" },
  { icon: Bell, label: "Notifications", id: "notifications", path: "/notifications", badge: 1 },
  { icon: User, label: "Compte", id: "account", path: "/account" },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

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

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center gap-0.5 relative active:scale-90 transition-transform duration-75"
              >
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-75 ${
                      isActive ? "text-[#C72C1C]" : "text-gray-500"
                    }`} 
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[8px] flex items-center justify-center font-bold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-[10px] font-medium transition-colors duration-75 ${
                    isActive ? "text-[#C72C1C]" : "text-gray-500"
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