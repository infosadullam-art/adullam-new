"use client"

import { ShoppingCart, User, Menu, Search, X, Home, Grid3x3, Heart, HelpCircle, Tv, Package, Shirt, LogIn, UserPlus, LogOut, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"

const categoryItems = [
  { label: "Électronique", icon: Tv, slug: "electronique" },
  { label: "Mode", icon: Shirt, slug: "mode" },
  { label: "Maison", icon: Package, slug: "maison" },
  { label: "Beauté", icon: Heart, slug: "beaute" },
  { label: "Jouets", icon: Grid3x3, slug: "jouets" },
  { label: "Sports", icon: Home, slug: "sports" },
  { label: "Alimentation", icon: Package, slug: "alimentation" },
]

export function MobileHeader() {
  const [showMenu, setShowMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartClicked, setCartClicked] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

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
    setTimeout(() => setCartClicked(false), 500)
  }

  const handleLogout = async () => {
    await logout()
    setShowMenu(false)
    router.push("/")
  }

  const goToAccount  = () => { router.push("/account"); setShowMenu(false) }
  const goToLogin    = () => { router.push("/account?mode=login"); setShowMenu(false) }
  const goToRegister = () => { router.push("/account?mode=register"); setShowMenu(false) }
  const goToOrders   = () => { router.push("/account"); setShowMenu(false) }
  const goToFavorites= () => { router.push("/account"); setShowMenu(false) }
  const goToHelp     = () => { router.push("/account"); setShowMenu(false) }

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-50" style={{ borderBottom: "0.5px solid #ECECEC" }}>
        <div className="px-4 pt-3 pb-2.5 flex flex-col gap-2.5">

          {/* Row 1 : Logo + actions */}
          <div className="flex items-center justify-between">

            {/* Logo */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-0 focus:outline-none"
              aria-label="Accueil Adullam"
            >
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "20px",
                letterSpacing: "-0.04em",
                color: "#0A0A0A",
                lineHeight: 1,
              }}>
                adul
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "20px",
                letterSpacing: "-0.04em",
                color: "#D4372B",
                lineHeight: 1,
              }}>
                .
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "20px",
                letterSpacing: "-0.04em",
                color: "#0A0A0A",
                lineHeight: 1,
              }}>
                lam
              </span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1.5">

              {/* Compte */}
              <button
                onClick={goToAccount}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors focus:outline-none"
                style={{ background: "#F4F4F4" }}
                aria-label="Mon compte"
              >
                <User className="w-[18px] h-[18px]" style={{ color: "#0A0A0A" }} />
                {user && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                    style={{ background: "#22C55E" }}
                  />
                )}
              </button>

              {/* Panier */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none"
                style={{ background: "#D4372B" }}
                aria-label="Panier"
              >
                <ShoppingCart className="w-[18px] h-[18px] text-white" />
                {cartClicked && (
                  <span
                    className="absolute inset-0 rounded-xl animate-ping"
                    style={{ background: "#D4372B", opacity: 0.4 }}
                  />
                )}
              </button>

              {/* Burger */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors focus:outline-none"
                style={{ background: "#F4F4F4" }}
                aria-label={showMenu ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {showMenu
                  ? <X className="w-[18px] h-[18px]" style={{ color: "#0A0A0A" }} />
                  : <Menu className="w-[18px] h-[18px]" style={{ color: "#0A0A0A" }} />
                }
              </button>
            </div>
          </div>

          {/* Row 2 : Recherche */}
          <form onSubmit={handleSearch} className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
              style={{ color: searchFocused ? "#D4372B" : "#AAAAAA" }}
            />
            <input
              type="text"
              placeholder="Robes, sneakers, électronique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-4 py-2.5 text-sm focus:outline-none transition-all"
              style={{
                background: "#F4F4F4",
                borderRadius: "10px",
                border: searchFocused ? "1.5px solid #D4372B" : "1.5px solid transparent",
                color: "#0A0A0A",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
              }}
            />
          </form>

        </div>
      </header>

      {/* ── OVERLAY ─────────────────────────────────────────────── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* ── DRAWER ──────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 h-full z-50 overflow-y-auto"
        style={{
          width: "280px",
          background: "#fff",
          transform: showMenu ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRight: "0.5px solid #ECECEC",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "0.5px solid #F0F0F0" }}
        >
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: "18px",
            letterSpacing: "-0.04em",
            color: "#0A0A0A",
          }}>
            adul<span style={{ color: "#D4372B" }}>.</span>lam
          </span>
          <button
            onClick={() => setShowMenu(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg focus:outline-none"
            style={{ background: "#F4F4F4" }}
          >
            <X className="w-4 h-4" style={{ color: "#0A0A0A" }} />
          </button>
        </div>

        <div className="flex flex-col pb-10">

          {/* Bloc utilisateur */}
          {isLoading ? (
            <div className="px-5 py-4">
              <div className="h-4 rounded-md animate-pulse" style={{ background: "#F0F0F0", width: "60%" }} />
            </div>
          ) : user ? (
            <div className="px-5 py-4" style={{ borderBottom: "0.5px solid #F0F0F0" }}>
              <p className="text-xs mb-0.5" style={{ color: "#AAAAAA", fontWeight: 500 }}>Connecté en tant que</p>
              <p className="text-sm font-semibold truncate" style={{ color: "#0A0A0A" }}>
                {user.name || user.email}
              </p>
            </div>
          ) : (
            <div className="px-5 py-4 flex gap-2" style={{ borderBottom: "0.5px solid #F0F0F0" }}>
              <button
                onClick={goToLogin}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#0A0A0A", color: "#fff" }}
              >
                <LogIn className="w-4 h-4" />
                Connexion
              </button>
              <button
                onClick={goToRegister}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: "1.5px solid #ECECEC", color: "#0A0A0A" }}
              >
                <UserPlus className="w-4 h-4" />
                S'inscrire
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-col mt-1">
            {[
              ...(user ? [{ label: "Mon compte", icon: User, action: goToAccount }] : []),
              { label: "Vos commandes", icon: Package, action: goToOrders },
              { label: "Favoris",        icon: Heart,   action: goToFavorites },
              { label: "Besoin d'aide",  icon: HelpCircle, action: goToHelp },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="group flex items-center justify-between px-5 py-3.5 text-sm font-medium text-left transition-colors hover:bg-[#FAFAFA]"
                style={{ color: "#0A0A0A" }}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4" style={{ color: "#AAAAAA" }} />
                  {label}
                </span>
                <ChevronRight className="w-4 h-4" style={{ color: "#ECECEC" }} />
              </button>
            ))}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-[#FFF5F5]"
                style={{ color: "#D4372B" }}
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            )}
          </nav>

          {/* Divider */}
          <div className="mx-5 my-3" style={{ height: "0.5px", background: "#F0F0F0" }} />

          {/* Catégories */}
          <div className="px-5">
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#AAAAAA", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Catégories
            </p>
            <div className="flex flex-col">
              {categoryItems.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.label}
                    onClick={() => { router.push(`/categorie/${cat.slug}`); setShowMenu(false) }}
                    className="group flex items-center justify-between py-3 text-sm font-medium text-left transition-colors hover:text-[#D4372B]"
                    style={{ borderBottom: "0.5px solid #F8F8F8", color: "#0A0A0A" }}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" style={{ color: "#AAAAAA" }} />
                      {cat.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: "#ECECEC" }} />
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
