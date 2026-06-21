"use client"

import { ShoppingCart, User, Menu, Search, X, Home, Grid3x3, Heart, HelpCircle, Tv, Package, Shirt, LogIn, UserPlus, LogOut, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"
// AJOUT REFONTE — bascule de thème (présentation uniquement)
import { ThemeToggle } from "@/components/theme-toggle"

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
    setMounted(true)
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

  if (!mounted) {
    return (
      <header className="bg-background sticky top-0 z-50 border-b border-border" style={{ height: "64px" }}>
        <div className="px-4 flex items-center justify-between" style={{ paddingTop: "12px", paddingBottom: "10px" }}>
          <span className="font-logo text-foreground" style={{ fontSize: "20px" }}>
            adul<span className="text-accent">.</span>lam
          </span>
          <div className="flex items-center gap-1.5">
            <div className="rounded-md bg-surface" style={{ width: "36px", height: "36px" }} />
            <div className="rounded-md bg-accent" style={{ width: "36px", height: "36px" }} />
            <div className="rounded-md bg-surface" style={{ width: "36px", height: "36px" }} />
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="bg-background sticky top-0 z-50 border-b border-border"
        style={{
          boxShadow: scrolled ? "var(--shadow-md)" : "none",
          transition: "box-shadow 0.3s ease",
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
              className="font-logo focus:outline-none active:opacity-70"
              style={{ transition: "transform 0.25s ease" }}
              aria-label="Accueil Adullam"
            >
              <span
                className="text-foreground"
                style={{ fontSize: scrolled ? "17px" : "20px", transition: "font-size 0.25s ease", display: "inline" }}
              >
                adul
              </span>
              <span
                className="text-accent"
                style={{ fontSize: scrolled ? "17px" : "20px", transition: "font-size 0.25s ease", display: "inline" }}
              >
                .
              </span>
              <span
                className="text-foreground"
                style={{ fontSize: scrolled ? "17px" : "20px", transition: "font-size 0.25s ease", display: "inline" }}
              >
                lam
              </span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1.5">

              {/* AJOUT REFONTE — bascule de thème compacte */}
              <ThemeToggle variant="icon" className="h-9 w-9 rounded-md border-border" />

              {/* Compte */}
              <button
                onClick={goToAccount}
                className="relative flex items-center justify-center rounded-md bg-surface focus:outline-none"
                style={{
                  width:  scrolled ? "34px" : "36px",
                  height: scrolled ? "34px" : "36px",
                  transition: "width 0.25s ease, height 0.25s ease, transform 0.1s ease",
                }}
                onPointerDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                onPointerUp={e   => e.currentTarget.style.transform = "scale(1)"}
                onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
                aria-label="Mon compte"
              >
                <User className="w-[17px] h-[17px] text-foreground" />
                {user && (
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-background"
                    style={{ background: "#22C55E" }}
                  />
                )}
              </button>

              {/* Panier */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center justify-center rounded-md bg-accent focus:outline-none overflow-hidden"
                style={{
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
                    className="absolute inset-0 animate-ping rounded-md"
                    style={{ background: "var(--accent)", opacity: 0.5 }}
                  />
                )}
              </button>

              {/* Burger */}
              <button
                onClick={() => setShowMenu(p => !p)}
                className="flex items-center justify-center rounded-md focus:outline-none"
                style={{
                  background: showMenu ? "var(--surface-sunken)" : "var(--surface)",
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
                    ? <X className="w-[17px] h-[17px] text-foreground" />
                    : <Menu className="w-[17px] h-[17px] text-foreground" />
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
                color: searchFocused ? "var(--accent)" : "var(--muted-foreground)",
                transition: "color 0.2s ease",
              }}
            />

            {/* Carrousel vertical - s'affiche seulement quand pas focus et pas de texte */}
            {!searchFocused && !searchQuery && (
              <div className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden" style={{ height: "20px", width: "220px" }}>
                <div
                  className="transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                    transform: isAnimating ? 'translateY(-100%)' : 'translateY(0)',
                    opacity: isAnimating ? 0 : 1,
                  }}
                >
                  <span className="text-sm text-muted-foreground">
                    Rechercher «&nbsp;{searchSuggestions[suggestionIndex]}&nbsp;»
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
              className="w-full pl-9 pr-4 text-sm text-foreground focus:outline-none"
              style={{
                background: "var(--surface)",
                borderRadius: "8px",
                border: searchFocused
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid var(--border)",
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
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(3px)",
          opacity: showMenu ? 1 : 0,
          pointerEvents: showMenu ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
        onClick={closeMenu}
      />

      {/* ── DRAWER ──────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 h-full z-50 overflow-y-auto bg-background border-r border-border"
        style={{
          width: "285px",
          transform: showMenu ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: showMenu ? "var(--shadow-lg)" : "none",
        }}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-logo text-foreground" style={{ fontSize: "18px" }}>
            adul<span className="text-accent">.</span>lam
          </span>
          <div className="flex items-center gap-2">
            {/* AJOUT REFONTE — bascule de thème (drawer) */}
            <ThemeToggle variant="icon" className="h-8 w-8" />
            <button
              onClick={closeMenu}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-surface focus:outline-none"
              onPointerDown={e => e.currentTarget.style.transform = "scale(0.9)"}
              onPointerUp={e   => e.currentTarget.style.transform = "scale(1)"}
              onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <X className="w-4 h-4 text-foreground" style={{ transition: "transform 0.1s ease" }} />
            </button>
          </div>
        </div>

        <div className="flex flex-col pb-10">

          {/* Bloc utilisateur */}
          {isLoading ? (
            <div className="px-5 py-4">
              <div className="h-4 rounded-md animate-pulse bg-surface" style={{ width: "60%" }} />
            </div>
          ) : user ? (
            <div className="px-5 py-4 border-b border-border">
              <p className="overline mb-1 text-muted-foreground">Connecté en tant que</p>
              <p className="text-sm font-semibold truncate text-foreground">
                {user.name || user.email}
              </p>
            </div>
          ) : (
            <div className="px-5 py-4 flex gap-2 border-b border-border">
              <button
                onClick={goToLogin}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-semibold bg-brand text-white"
                style={{ transition: "opacity 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.opacity = "0.8"}
                onPointerUp={e   => e.currentTarget.style.opacity = "1"}
                onPointerLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <LogIn className="w-4 h-4" />
                Connexion
              </button>
              <button
                onClick={goToRegister}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-semibold border border-border bg-background text-foreground"
                style={{ transition: "background 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.background = "var(--surface)"}
                onPointerUp={e   => e.currentTarget.style.background = "var(--background)"}
                onPointerLeave={e => e.currentTarget.style.background = "var(--background)"}
              >
                <UserPlus className="w-4 h-4" />
                S&apos;inscrire
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
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-left text-foreground"
                style={{ transition: "background 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.background = "var(--surface)"}
                onPointerUp={e   => e.currentTarget.style.background = "transparent"}
                onPointerLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-accent"
                style={{ transition: "background 0.15s ease" }}
                onPointerDown={e => e.currentTarget.style.background = "var(--accent-light)"}
                onPointerUp={e   => e.currentTarget.style.background = "transparent"}
                onPointerLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            )}
          </nav>

          {/* Divider */}
          <div className="mx-5 my-2 h-px bg-border" />

          {/* Catégories */}
          <div className="px-5">
            <p className="overline mb-1.5 text-muted-foreground">
              Catégories
            </p>
            <div className="flex flex-col">
              {categoryItems.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.label}
                    onClick={() => { setShowMenu(false); router.push(`/categorie/${cat.slug}`) }}
                    className="flex items-center justify-between py-2.5 text-sm font-medium text-left text-foreground border-b border-border"
                    style={{ transition: "color 0.15s ease" }}
                    onPointerDown={e => e.currentTarget.style.color = "var(--accent)"}
                    onPointerUp={e   => e.currentTarget.style.color = "var(--foreground)"}
                    onPointerLeave={e => e.currentTarget.style.color = "var(--foreground)"}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {cat.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
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
