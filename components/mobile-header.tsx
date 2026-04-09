"use client"

import { ShoppingCart, User, Menu, Search, X, Home, Grid3x3, Heart, HelpCircle, Tv, Package, Shirt, LogIn, UserPlus, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"

const categoryItems = [
  { label: "Électronique", icon: Tv },
  { label: "Mode", icon: Shirt },
  { label: "Maison", icon: Package },
  { label: "Beauté", icon: Heart },
  { label: "Jouets", icon: Grid3x3 },
  { label: "Sports", icon: Home },
  { label: "Alimentation", icon: Package },
]

export function MobileHeader() {
  const [showMenu, setShowMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartClicked, setCartClicked] = useState(false)
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  // Empêcher le scroll de l'arrière-plan quand le menu est ouvert
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showMenu])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCartClick = () => {
    setCartClicked(true)
    router.push("/cart")
    setTimeout(() => {
      setCartClicked(false)
    }, 500)
  }

  const handleLogout = async () => {
    await logout()
    setShowMenu(false)
    router.push("/")
  }

  const goToAccount = () => {
    router.push("/account")
    setShowMenu(false)
  }

  const goToLogin = () => {
    router.push("/account?mode=login")
    setShowMenu(false)
  }

  const goToRegister = () => {
    router.push("/account?mode=register")
    setShowMenu(false)
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="px-4 py-3 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy">ADULLLAM</span>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <button 
              className="text-brand hover:text-brand/80 transition-colors" 
              onClick={goToAccount}
            >
              {user ? (
                <div className="relative">
                  <User className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              ) : (
                <User className="w-6 h-6" />
              )}
            </button>
            
            <button 
              className="relative text-brand hover:text-brand/80 transition-colors" 
              onClick={handleCartClick}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartClicked && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
              )}
            </button>

            <button className="text-brand hover:text-brand/80 transition-colors" onClick={() => setShowMenu(!showMenu)}>
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form className="relative" onSubmit={handleSearch}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher en Côte d'Ivoire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-neutral-light text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </form>
      </div>

      {/* Menu latéral - CORRIGÉ */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto ${
          showMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header du menu - SANS LE BOUTON X */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy">ADULLLAM</span>
          </div>
          {/* ❌ BOUTON X SUPPRIMÉ */}
        </div>

        {/* Menu Items */}
        <div className="flex flex-col mt-4 pb-20">
          {isLoading ? (
            <div className="px-4 py-3">
              <div className="h-5 bg-gray-200 animate-pulse rounded w-32"></div>
            </div>
          ) : user ? (
            <>
              <div className="px-4 py-2 bg-brand/5 mx-4 rounded-lg mb-2">
                <p className="text-sm font-medium">Bonjour,</p>
                <p className="text-base font-semibold truncate">{user.name || user.email}</p>
              </div>
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light transition-colors"
                onClick={goToAccount}
              >
                <User className="w-5 h-5" />
                <span>Mon compte</span>
              </button>
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light transition-colors text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light transition-colors"
                onClick={goToLogin}
              >
                <LogIn className="w-5 h-5" />
                <span>Connexion</span>
              </button>
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light transition-colors"
                onClick={goToRegister}
              >
                <UserPlus className="w-5 h-5" />
                <span>Inscription</span>
              </button>
            </>
          )}

          <button
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light transition-colors"
            onClick={() => {
              router.push("/orders")
              setShowMenu(false)
            }}
          >
            <Package className="w-5 h-5" />
            <span>Vos commandes</span>
          </button>

          <button
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light transition-colors"
            onClick={() => {
              router.push("/favorites")
              setShowMenu(false)
            }}
          >
            <Heart className="w-5 h-5" />
            <span>Favoris</span>
          </button>

          <button
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light transition-colors"
            onClick={() => {
              router.push("/help")
              setShowMenu(false)
            }}
          >
            <HelpCircle className="w-5 h-5" />
            <span>Besoins d'aide</span>
          </button>

          <div className="mt-4 px-4">
            <h3 className="text-sm font-semibold mb-2">Catégories</h3>
            <div className="flex flex-col gap-2">
              {categoryItems.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.label}
                    className="flex items-center gap-3 text-left px-2 py-2 rounded hover:bg-neutral-light transition-colors"
                    onClick={() => {
                      router.push(`/category/${cat.label.toLowerCase()}`)
                      setShowMenu(false)
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}