"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, LayoutGrid, Newspaper, Bell, User } from "lucide-react"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeButton, setActiveButton] = useState("home")

  // Met à jour le bouton actif à chaque changement de route
  useEffect(() => {
    if (pathname === "/") setActiveButton("home")
    else if (pathname.startsWith("/categories")) setActiveButton("categories")
    else if (pathname.startsWith("/news")) setActiveButton("news")
    else if (pathname.startsWith("/notifications")) setActiveButton("notifications")
    else if (pathname.startsWith("/account")) setActiveButton("account")
    else setActiveButton("home")
  }, [pathname])

  const handleClick = (button: string, path: string) => {
    setActiveButton(button) // ← mise à jour immédiate pour éviter double clic
    router.push(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around px-4 py-2">
        <button
          onClick={() => handleClick("home", "/")}
          className={`flex flex-col items-center gap-1 ${
            activeButton === "home" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Accueil</span>
        </button>

        <button
          onClick={() => handleClick("categories", "/categories")}
          className={`flex flex-col items-center gap-1 ${
            activeButton === "categories" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-xs">Catégories</span>
        </button>

        <button
          onClick={() => handleClick("news", "/news")}
          className={`flex flex-col items-center gap-1 ${
            activeButton === "news" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Newspaper className="w-6 h-6" />
          <span className="text-xs">Fil d'actualité</span>
        </button>

        <button
          onClick={() => handleClick("notifications", "/notifications")}
          className={`flex flex-col items-center gap-1 relative ${
            activeButton === "notifications" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Bell className="w-6 h-6" />
          <span className="text-xs">Notifications</span>
          <span className="absolute top-0 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold">
            1
          </span>
        </button>

        <button
          onClick={() => handleClick("account", "/account")}
          className={`flex flex-col items-center gap-1 ${
            activeButton === "account" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Compte</span>
        </button>
      </div>
    </nav>
  )
}
