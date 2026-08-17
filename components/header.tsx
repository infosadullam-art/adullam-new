"use client"

import { ShoppingCart, ChevronDown, Search, User, Menu, X, LogOut, LogIn, UserPlus, ChevronRight, Bell } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAuth } from "@/lib/admin/auth-context"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiFetch } from "@/lib/api"

const searchSuggestions = [
  "chaussure", "robe de soirée", "écouteur", "sac à main",
  "montre", "parfum", "jean", "casquette"
]

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(130)

  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const [isHeaderCompact, setIsHeaderCompact] = useState(false)

  const menuTimerRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()
  const pathname = usePathname()
  const { cart } = useCart()
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mesurer la hauteur réelle du header
  useEffect(() => {
    if (mounted) {
      const header = document.querySelector('header')
      if (header) {
        setHeaderHeight(header.offsetHeight)
      }
    }
  }, [mounted])

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

  // Notifications non lues
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("adullam_token")
        const res = await apiFetch("/api/notifications?unread=true&limit=1", {
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

  // Scroll avec hysteresis
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          if (currentScrollY > 100 && !isHeaderCompact) {
            setIsHeaderCompact(true)
          } else if (currentScrollY < 30 && isHeaderCompact) {
            setIsHeaderCompact(false)
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHeaderCompact])

  // Souris survole le header → barre noire réapparaît
  useEffect(() => {
    const handleMouseEnter = () => {
      if (isHeaderCompact) {
        setIsHeaderCompact(false)
      }
    }

    const header = document.querySelector('header')
    if (header) {
      header.addEventListener('mouseenter', handleMouseEnter)
    }

    return () => {
      if (header) {
        header.removeEventListener('mouseenter', handleMouseEnter)
      }
    }
  }, [isHeaderCompact])

  const openCart = () => setIsCartOpen(true)
  const goToAccount = () => router.push("/account")
  const goToLogin = () => router.push("/account?mode=login")
  const goToRegister = () => router.push("/account?mode=register")

  const generateSlug = (name: string): string =>
    name.toLowerCase().replace(/&/g, "et").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const goToCategory = (category: string) => {
    router.push(`/categorie/${generateSlug(category)}`)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    router.push("/")
  }

  const handleMouseEnterMega = () => {
    if (menuTimerRef.current) { clearTimeout(menuTimerRef.current); menuTimerRef.current = null }
    setShowMegaMenu(true)
  }
  const handleMouseLeaveMega = () => {
    menuTimerRef.current = setTimeout(() => { setShowMegaMenu(false); setActiveCategory(null) }, 300)
  }

  useEffect(() => () => { if (menuTimerRef.current) clearTimeout(menuTimerRef.current) }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowMegaMenu(false); setActiveCategory(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  if (!mounted) {
    return <div style={{ height: "130px" }} className="hidden lg:block" />
  }

  const navItems = [
    { label: "Deals du jour", path: "/deals-du-jour" },
    { label: "Sourcing", path: "/boutique-noel" },
    { label: "Offres Spéciales", path: "/offres-speciales" },
    { label: "For You", path: "/for-you" },
    { label: "Meilleures ventes", path: "/meilleures-ventes" },
    { label: "Nouveautés", path: "/nouveautes" },
  ]

  const categories = [
    { title: "Homme", items: ["T-Shirts Homme", "Chemises Homme", "Pantalons Homme", "Jeans Homme", "Shorts Homme", "Manteaux Homme", "Sweats Homme", "Costumes Homme", "Maillots de bain Homme", "Pyjamas Homme", "Sous-vêtements Homme", "Chaussettes Homme"] },
    { title: "Femme", items: ["Robes", "Tops Femme", "T-Shirts Femme", "Pantalons Femme", "Jeans Femme", "Jupes", "Manteaux Femme", "Sweats Femme", "Combinaisons", "Maillots de bain Femme", "Pyjamas Femme", "Sous-vêtements Femme", "Collants & Chaussettes"] },
    { title: "Enfant", items: ["Bébé Fille", "Bébé Garçon", "Fille 2-12 ans", "Garçon 2-12 ans", "Bébé mixte", "Vêtements Fille", "Vêtements Garçon", "Chaussures Enfant"] },
    { title: "Chaussures", items: ["Baskets Homme", "Baskets Femme", "Baskets Enfant", "Chaussures Habillées Homme", "Chaussures Habillées Femme", "Bottes", "Sandales", "Chaussures de Sport", "Mules & Sabots"] },
    { title: "Accessoires", items: ["Sacs & Maroquinerie", "Montres", "Bijoux", "Ceintures", "Chapeaux & Casquettes", "Lunettes", "Gants", "Écharpes & Foulards", "Parapluies", "Portefeuilles"] },
    { title: "Sport", items: ["Vêtements de Sport Homme", "Vêtements de Sport Femme", "Vêtements de Sport Enfant", "Chaussures de Sport", "Accessoires de Sport", "Sports d'équipe", "Sports de raquette", "Sports d'hiver"] },
    { title: "Maison", items: ["Maison & Décoration", "Literie", "Cuisine", "Salle de bain", "Meubles", "Électroménager", "Linge de maison", "Décoration"] },
    { title: "Beauté", items: ["Parfums", "Maquillage", "Soins Visage", "Soins Corps", "Soins Cheveux", "Hygiène"] },
    { title: "Électronique", items: ["Téléphones", "Ordinateurs", "Tablettes", "TV & Vidéo", "Audio", "Photo & Caméra", "Gaming", "Accessoires Électronique"] },
    { title: "Loisirs", items: ["Livres", "Jeux & Jouets", "Jeux de société", "Instruments de musique"] },
    { title: "Alimentation", items: ["Épicerie", "Boissons", "Confiserie", "Produits régionaux"] },
    { title: "Animaux", items: ["Chien", "Chat", "Poissons", "Oiseaux", "Accessoires Animaux"] },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">

        {/* TOPBAR — bandeau éditorial sombre (brand constant) */}
        <div className="hidden lg:flex items-center justify-between gap-6 bg-brand px-6 py-2">
          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="h-3 w-32 rounded-sm animate-pulse bg-white/15" />
            ) : user ? (
              <button onClick={goToAccount} className="text-xs font-medium text-white/70 transition-opacity hover:text-white">
                Bonjour, {user.name || user.email?.split("@")[0]}
              </button>
            ) : (
              <>
                <button onClick={goToLogin} className="flex items-center gap-1.5 text-xs text-white/70 transition-opacity hover:text-white">
                  <LogIn className="w-3.5 h-3.5" /> Connexion
                </button>
                <button onClick={goToRegister} className="flex items-center gap-1.5 text-xs font-medium text-white/70 transition-opacity hover:text-white">
                  <UserPlus className="w-3.5 h-3.5" /> Inscription
                </button>
              </>
            )}
            <button onClick={goToAccount} className="text-xs text-white/70 transition-opacity hover:text-white">
              Compte &amp; commandes
            </button>
          </div>
          <div className="flex items-center gap-5">
            <span className="overline text-white/55">
              Direct usine · Livraison Afrique · Mobile Money
            </span>
            <ThemeToggle variant="switch" />
          </div>
        </div>

        {/* BARRE PRINCIPALE */}
        <div className="border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">

          {/* LIGNE LOGO / RECHERCHE / ACTIONS */}
          <div
            className="transition-all duration-300 ease-out"
            style={{
              paddingTop: isHeaderCompact ? "8px" : "14px",
              paddingBottom: isHeaderCompact ? "8px" : "14px",
            }}
          >
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
              {/* Logo - garde Poppins (.font-logo) */}
              <button onClick={() => router.push("/")} className="flex-shrink-0 focus:outline-none">
                <span
                  className="font-logo text-foreground transition-all duration-300"
                  style={{ fontSize: isHeaderCompact ? "18px" : "22px" }}
                >
                  adul<span className="text-accent">.</span>lam
                </span>
              </button>

              {/* Catégories dropdown */}
              <div className="hidden lg:block relative flex-shrink-0">
                <button
                  ref={buttonRef}
                  onMouseEnter={handleMouseEnterMega}
                  onMouseLeave={handleMouseLeaveMega}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border-strong focus:outline-none"
                >
                  Catégories
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {showMegaMenu && (
                  <div
                    ref={menuRef}
                    onMouseEnter={handleMouseEnterMega}
                    onMouseLeave={handleMouseLeaveMega}
                    className="anim-fade-up absolute top-full left-0 mt-2 z-[9999] w-[900px] rounded-xl border border-border bg-popover p-5 elevate-lg"
                  >
                    <p className="overline mb-3 text-muted-foreground">Toutes les catégories</p>
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      {categories.slice(0, 6).map((cat) => (
                        <button
                          key={cat.title}
                          onClick={() => { setActiveCategory(cat.items.length === 0 ? null : cat.title); if (!cat.items.length) { goToCategory(cat.title); setShowMegaMenu(false) } }}
                          className={`rounded-md px-2 py-2 text-xs font-medium text-center transition-colors ${
                            activeCategory === cat.title
                              ? "bg-foreground text-background"
                              : "bg-surface text-foreground hover:bg-surface-sunken"
                          }`}
                        >
                          {cat.title}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {categories.slice(6, 12).map((cat) => (
                        <button
                          key={cat.title}
                          onClick={() => { setActiveCategory(cat.items.length === 0 ? null : cat.title); if (!cat.items.length) { goToCategory(cat.title); setShowMegaMenu(false) } }}
                          className={`rounded-md px-2 py-2 text-xs font-medium text-center transition-colors ${
                            activeCategory === cat.title
                              ? "bg-foreground text-background"
                              : "bg-surface text-foreground hover:bg-surface-sunken"
                          }`}
                        >
                          {cat.title}
                        </button>
                      ))}
                    </div>

                    {activeCategory && (
                      <div className="border-t border-border pt-4">
                        <p className="overline mb-3 text-accent">
                          {activeCategory}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {categories.find(c => c.title === activeCategory)?.items.slice(0, 8).map((item, i) => (
                            <button
                              key={i}
                              onClick={() => { goToCategory(item); setShowMegaMenu(false) }}
                              className="link-underline rounded-md px-2 py-1.5 text-left text-xs text-ink-2 transition-colors hover:text-accent"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                        {(categories.find(c => c.title === activeCategory)?.items.length ?? 0) > 8 && (
                          <button
                            onClick={() => { goToCategory(activeCategory); setShowMegaMenu(false) }}
                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent"
                          >
                            Voir tout <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-3 border-t border-border pt-3 text-center">
                      <button onClick={() => { router.push("/categories"); setShowMegaMenu(false) }} className="text-xs font-semibold text-accent link-underline">
                        Voir toutes les catégories →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="flex-1 hidden lg:block relative">
                <Search
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors z-10 ${
                    searchFocused ? "text-accent" : "text-muted-foreground"
                  }`}
                />

                {!searchFocused && !searchQuery && (
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden" style={{ height: "20px", width: "220px" }}>
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
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className={`w-full rounded-md bg-surface py-2.5 pl-10 pr-14 text-sm text-foreground transition-all focus:outline-none border ${
                    searchFocused ? "border-accent ring-2 ring-accent/15" : "border-border"
                  }`}
                />

                <button
                  onClick={handleSearch}
                  aria-label="Rechercher"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md bg-accent transition-colors hover:bg-accent-hover focus:outline-none"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Actions */}
              <div className="hidden lg:flex items-center gap-2">
                {isLoading ? (
                  <div className="h-9 w-9 animate-pulse rounded-md bg-surface" />
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 transition-colors hover:border-border-strong focus:outline-none"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.name || user.email?.split("@")[0]}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {userMenuOpen && (
                      <div className="anim-fade-up absolute right-0 mt-2 z-[9999] w-[200px] rounded-xl border border-border bg-popover p-1.5 elevate-lg">
                        {[
                          { label: "Mon compte", href: "/account" },
                          { label: "Mes commandes", href: "/orders" },
                          { label: "Favoris", href: "/favorites" },
                        ].map(({ label, href }) => (
                          <Link key={href} href={href} className="block rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface">
                            {label}
                          </Link>
                        ))}
                        <div className="my-1 h-px bg-border" />
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent-light">
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={goToLogin} aria-label="Mon compte" className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-border-strong focus:outline-none">
                    <User className="w-[18px] h-[18px]" />
                  </button>
                )}

                {/* 🔔 NOTIFICATIONS */}
                <button
                  onClick={() => router.push("/notifications")}
                  className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-border-strong focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center tabular-nums"
                      style={{
                        minWidth: "18px",
                        height: "18px",
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        borderRadius: "100px",
                        padding: "0 5px",
                        border: "2px solid var(--background)",
                        lineHeight: 1,
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panier */}
                <button
                  onClick={openCart}
                  className="relative flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-white transition-colors hover:bg-accent-hover focus:outline-none"
                >
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  <span className="hidden text-sm font-semibold lg:inline">Panier</span>
                  {cart.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white tabular-nums">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                className="lg:hidden ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {/* BARRE NOIRE — navigation éditoriale */}
          <div
            className="hidden lg:block overflow-hidden bg-brand transition-all duration-300 ease-out"
            style={{
              maxHeight: isHeaderCompact ? "0px" : "60px",
              opacity: isHeaderCompact ? 0 : 1,
            }}
          >
            <div className="max-w-7xl mx-auto px-6">
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`relative px-3 py-3.5 text-sm font-medium transition-colors ${
                        isActive ? "text-white" : "text-white/55 hover:text-white"
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-t-sm bg-accent" />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Espace compensatoire - ajusté dynamiquement à la hauteur réelle du header */}
      <div 
        className={`hidden lg:block transition-all duration-300`}
        style={{ 
          height: isHeaderCompact ? '56px' : `${headerHeight}px`
        }} 
      />
      <div className="block lg:hidden h-[56px]" />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] overflow-y-auto bg-background" style={{ top: "56px" }}>
          <div className="px-5 py-4">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <span className="font-logo text-foreground" style={{ fontSize: "20px" }}>
                adul<span className="text-accent">.</span>lam
              </span>
              <div className="flex items-center gap-2">
                <ThemeToggle variant="icon" />
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground focus:outline-none">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="mb-4 h-4 w-2/5 animate-pulse rounded-sm bg-surface" />
            ) : user ? (
              <div className="mb-4 rounded-lg border border-border bg-surface p-3">
                <p className="overline mb-1 text-muted-foreground">Connecté</p>
                <p className="truncate text-sm font-semibold text-foreground">{user.name || user.email}</p>
              </div>
            ) : (
              <div className="mb-6 flex gap-2">
                <button onClick={() => { goToLogin(); setMobileMenuOpen(false) }} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white">
                  <LogIn className="w-4 h-4" /> Connexion
                </button>
                <button onClick={() => { goToRegister(); setMobileMenuOpen(false) }} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold text-foreground">
                  <UserPlus className="w-4 h-4" /> S&apos;inscrire
                </button>
              </div>
            )}

            <div className="mb-4 flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { router.push(item.path); setMobileMenuOpen(false) }}
                  className="flex items-center justify-between border-b border-border py-3.5 text-left text-sm font-medium text-foreground"
                >
                  {item.label}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            <p className="overline mb-3 text-muted-foreground">Catégories</p>
            {categories.map((cat) => (
              <div key={cat.title}>
                <button
                  onClick={() => {
                    if (!cat.items.length) { goToCategory(cat.title); setMobileMenuOpen(false) }
                    else setActiveCategory(activeCategory === cat.title ? null : cat.title)
                  }}
                  className="flex w-full items-center justify-between border-b border-border py-3 text-sm font-medium text-foreground"
                >
                  {cat.title}
                  {cat.items.length > 0 && (
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${activeCategory === cat.title ? "rotate-180" : ""}`} />
                  )}
                </button>
                {activeCategory === cat.title && cat.items.length > 0 && (
                  <div className="flex flex-col gap-1 py-2 pl-4">
                    {cat.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { goToCategory(item); setMobileMenuOpen(false) }}
                        className="py-1.5 text-left text-sm text-ink-3 hover:text-accent"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {user && (
              <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}