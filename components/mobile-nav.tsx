"use client"

import { Home, Grid3x3, Newspaper, Bell, User } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const navItems = [
  { icon: Home, label: "Accueil", id: "home", path: "/" },
  { icon: Grid3x3, label: "Catégories", id: "categories", path: "/categories" },
  { icon: Newspaper, label: "Fil d'actualité", id: "feed", path: "/feed" },
  { icon: Bell, label: "Notifications", id: "notifications", path: "/notifications", badge: 1 },
  { icon: User, label: "Compte", id: "account", path: "/account" },
]

export default function MobileNav() {
  const [activeTab, setActiveTab] = useState("home")
  const router = useRouter()

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
                onClick={() => {
                  setActiveTab(item.id)
                  router.push(item.path)
                }}
                className="flex flex-col items-center justify-center gap-0.5 relative"
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-black" : "text-gray-900"
                  }`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[8px] flex items-center justify-center font-bold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-medium transition-colors duration-200 ${
                  isActive ? "text-black" : "text-gray-700"
                }`}>
                  {item.label}
                </span>

                {/* Indicateur actif - point noir */}
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}