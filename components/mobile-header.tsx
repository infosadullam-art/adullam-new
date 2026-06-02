"use client"

import { ShoppingCart, User, Menu, Search, X, Home, Grid3x3, Heart, HelpCircle, Tv, Package, Shirt, LogIn, UserPlus, LogOut, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"

const searchSuggestions = [
  "chaussure", "robe de soirée", "écouteur", "sac à main", 
  "montre", "parfum", "jean", "casquette", "téléphone", "basket"
]

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
  const [showMenu, setShowMenu]         = useState(false)
  const [searchQuery, setSearchQuery]   = useState("")
  const [cartClicked, setCartClicked]   = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const [mounted, setMounted]           = useState(false)
  
  // Carrousel recherche
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const lastScrollY                     = useRef(0)

  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  // Fade-in au montage
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Carrousel vertical pour la recherche
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length)
        setIsAnimating(false)
      }, 200)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Compression au scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      lastScrollY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock scroll body quand menu ouvert
  useEffect(() => {
    document.body.style.overflow = showMenu ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [showMenu])

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }, [searchQuery, router])

  const handleCartClick = useCallback(() => {
    setCartClicked(true)
    router.push("/cart")
    setTimeout(() => setCartClicked(false), 600)
  }, [router])

  const closeMenu = useCallback(() => setShowMenu(false), [])

  const handleLogout = useCallback(async () => {
    await logout()
    closeMenu()
    router.push("/")
  }, [logout, closeMenu, router])

  const navigateTo = useCallback((path: string) => {
    closeMenu()
    router.push(path)
  }, [closeMenu, router])

  const goToAccount  = useCallback(() => navigateTo("/account"), [navigateTo])
  const goToLogin    = useCallback(() => navigateTo("/account?mode=login"), [navigateTo])
  const goToRegister = useCallback(() => navigateTo("/account?mode=register"), [navigateTo])
  const goToOrders   = useCallback(() => navigateTo("/account"), [navigateTo])
  const goToFavorites = useCallback(() => navigateTo("/account"), [navigateTo])
  const goToHelp     = useCallback(() => navigateTo("/account"), [navigateTo])

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="bg-white sticky top-0 z-50"
        style={{
          borderBottom: "0.5px solid #ECECEC",
          boxShadow: scrolled
            ? "0 2px 16px rgba(0,0,0,0.06)"
            : "none",
          transition: "box-shadow 0.3s ease",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-4px)",
        }}
      >
        <div
          className="px-4 flex flex-col"
          style={{
            paddingTop:    scrolled ? "8px"  : "12px",
            paddingBottom: scrolled ? "8px"  : "10px",
            gap:           scrolled ? "6px"  : "10px",
            transition: "padding 0.25s ease, gap 0.25s ease",
          }}
        >
          {/* Row 1 : Logo + actions */}
          <div className="flex items-center justify-between">

            {/* Logo — se réduit légèrement au scroll */}
            <button
              onClick={() => router.push("/")}
              className="focus:outline-none active:opacity-70"
              style={{ transition: "transform 0.25s ease" }}
              aria-label="Accueil Adullam"
            >
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: scrolled ? "17px" : "20px",
                letterSpacing: "-0.04em",
                color: "#0A0A0A",
                transition: "font-size 0.25s ease",
                display: "inline",
              }}>
                adul
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: scrolled ? "17px" : "20px",
                letterSpacing: "-0.04em",
                color: "#D4372B",
                transition: "font-size 0.25s ease",
                display: "inline",
              }}>
                .
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: scrolled ? "17px" : "20px",
                letterSpacing: "-0.04em",
                color: "#0A0A0A",
                transition: "font-size 0.25s ease",
                display: "inline",
              }}>
                lam
              </span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1.5">

              {/* Compte */}
              <button
                onClick={goToAccount}
                className="relative flex items-center justify-center rounded-xl focus:outline-none"
                style={{
                  background: "#F4F4F4",
                  width:  scrolled ? "34px" : "36px",
                  height: scrolled ? "34px" : "36px",
                  transition: "width 0.25s ease, height 0.25s ease, transform 0.1s ease",
                }}
                onPointerDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                onPointerUp={e   => e.currentTarget.style.transform = "scale(1)"}
                onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
                aria-label="Mon compte"
              >
                <User className="w-[17px] h-[17px]" style={{ color: "#0A0A0A" }} />
                {user && (
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white"
                    style={{ background: "#22C55E" }}
                  />
                )}
              </button>

              {/* Panier */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center justify-center rounded-xl focus:outline-none overflow-hidden"
                style={{
                  background: "#D4372B",
                  width:  scrolled ? "34px" : "36px",
                  height: scrolled ? "34px" : "36px",
                  transition: "width 0.25s ease, height 0.25s ease, transform 0.1s ease",
                }}
                onPointerDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                onPointerUp={e   => e.currentTarget.style.transform = "scale(1)"}
                onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
                aria-label="Panier"
              >
                <ShoppingCart className="w-[17px] h-[17px] text-white" />
                {cartClicked && (
                  <span
                    className="absolute inset-0 animate-ping rounded-xl"
                    style={{ background: "#D4372B", opacity: 0.5 }}
                  />
                )}
              </button>

              {/* Burger */}
              <button
                onClick={() => setShowMenu(p => !p)}
                className="flex items-center justify-center rounded-xl focus:outline-none"
                style={{
                  background: showMenu ? "#ECECEC" : "#F4F4F4",
                  width:  scrolled ? "34px" : "36px",
                  height: scrolled ? "34px" : "36px",
                  transition: "width 0.25s ease, height 0.25s ease, background 0.2s ease, transform 0.1s ease",
                }}
                onPointerDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                onPointerUp={e   => e.currentTarget.style.transform = "scale(1)"}
                onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
                aria-label={showMenu ? "Fermer le menu" : "Ouvrir le menu"}
              >
                <span
                  style={{
                    display: "inline-flex",
                    transform: showMenu ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  {showMenu
                    ? <X className="w-[17px] h-[17px]" style={{ color: "#0A0A0A" }} />
                    : <Menu className="w-[17px] h-[17px]" style={{ color: "#0A0A0A" }} />
                  }
                </span>
              </button>
            </div>
          </div>

          {/* Row 2 : Barre de recherche AVEC CARROUSEL VERTICAL */}
          <form onSubmit={handleSearch} className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
              style={{
                color: searchFocused ? "#D4372B" : "#AAAAAA",
                transition: "color 0.2s ease",
              }}
            />
            
            {/* Carrousel vertical - s'affiche seulement quand pas focus et pas de texte */}
            {!searchFocused && !searchQuery && (
              <div className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden" style={{ height: "20px", width: "180px" }}>
                <div
                  className="transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                    transform: isAnimating ? 'translateY(-100%)' : 'translateY(0)',
                    opacity: isAnimating ? 0 : 1,
                  }}
                >
                  <span className="text-sm" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                    {searchSuggestions[suggestionIndex]}
                  </span>
                </div>
              </div>
            )}
            
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-4 text-sm focus:outline-none"
              style={{
                background: "#F4F4F4",
                borderRadius: "10px",
                border: searchFocused
                  ? "1.5px solid #D4372B"
                  : "1.5px solid transparent",
                color: "#0A0A0A",
                fontFamily: "'Poppins', sans-serif",
                paddingTop:    scrolled ? "8px"  : "10px",
                paddingBottom: scrolled ? "8px"  : "10px",
                transition: "border 0.2s ease, padding 0.25s ease",
              }}
            />
          </form>
        </div>
      </header>

      {/* ── OVERLAY ─────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(3px)",
          opacity: showMenu ? 1 : 0,
          pointerEvents: showMenu ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
        onClick={closeMenu}
      />

      {/* ── DRAWER ──────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 h-full z-50 overflow-y-auto"
        style={{
          width: "285px",
          background: "#fff",
          transform: showMenu ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRight: "0.5px solid #ECECEC",
          boxShadow: showMenu
            ? "4px 0 32px rgba(0,0,0,0.12)"
            : "none",
        }}
      >
        {/* Header drawer */}
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
            onClick={closeMenu}
            className="flex items-center justify-center w-8 h-8 rounded-lg focus:outline-none"
            style={{ background: "#F4F4F4" }}
            onPointerDown={e => e.currentTarget.style.transform = "scale(0.9)"}
            onPointerUp={e   => e.currentTarget.style.transform = "scale(1)"}
            onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <X className="w-4 h-4" style={{ color: "#0A0A0A", transition: "transform 0.1s ease" }} />
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
                style={{ background: "#0A0A0A", color: "#fff", transition: "opacity 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.opacity = "0.8"}
                onPointerUp={e   => e.currentTarget.style.opacity = "1"}
                onPointerLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <LogIn className="w-4 h-4" />
                Connexion
              </button>
              <button
                onClick={goToRegister}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: "1.5px solid #ECECEC", color: "#0A0A0A", background: "#fff", transition: "background 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.background = "#F4F4F4"}
                onPointerUp={e   => e.currentTarget.style.background = "#fff"}
                onPointerLeave={e => e.currentTarget.style.background = "#fff"}
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
              { label: "Vos commandes", icon: Package,    action: goToOrders    },
              { label: "Favoris",       icon: Heart,      action: goToFavorites },
              { label: "Besoin d'aide", icon: HelpCircle, action: goToHelp      },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-left"
                style={{ color: "#0A0A0A", transition: "background 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.background = "#F8F8F8"}
                onPointerUp={e   => e.currentTarget.style.background = "transparent"}
                onPointerLeave={e => e.currentTarget.style.background = "transparent"}
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
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium"
                style={{ color: "#D4372B", transition: "background 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.background = "#FFF5F5"}
                onPointerUp={e   => e.currentTarget.style.background = "transparent"}
                onPointerLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            )}
          </nav>

          {/* Divider */}
          <div className="mx-5 my-2" style={{ height: "0.5px", background: "#F0F0F0" }} />

          {/* Catégories */}
          <div className="px-5">
            <p
              className="text-xs font-semibold mb-1.5"
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
                    onClick={() => { setShowMenu(false); router.push(`/categorie/${cat.slug}`) }}
                    className="flex items-center justify-between py-2.5 text-sm font-medium text-left"
                    style={{ borderBottom: "0.5px solid #F8F8F8", color: "#0A0A0A", transition: "color 0.15s ease" }}
                    onPointerDown={e => e.currentTarget.style.color = "#D4372B"}
                    onPointerUp={e   => e.currentTarget.style.color = "#0A0A0A"}
                    onPointerLeave={e => e.currentTarget.style.color = "#0A0A0A"}
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