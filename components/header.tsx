"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAuth } from "@/lib/admin/auth-context"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiFetch } from "@/lib/api"

// ════════════════════════════════════════════════════════════
// ICÔNES — dessinées maison (fini le look "lucide par défaut")
// Trait 1.6, jonctions arrondies, gabarit 24×24 cohérent partout.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string }

const IconSearch = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="6.75" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20.2 20.2l-3.85-3.85" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconBag = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7.2 8.2h9.6l.9 11.3a1.6 1.6 0 0 1-1.6 1.7H7.9a1.6 1.6 0 0 1-1.6-1.7l.9-11.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 8.2V6.6a3 3 0 0 1 6 0v1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconBell = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6.2 9.2a5.8 5.8 0 1 1 11.6 0c0 3.05.92 4.8 1.5 5.6a.75.75 0 0 1-.6 1.2H5.3a.75.75 0 0 1-.6-1.2c.58-.8 1.5-2.55 1.5-5.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9.6 18.4a2.4 2.4 0 0 0 4.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconUser = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8.2" r="3.3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5.2 19.8c0-3.6 3-6.1 6.8-6.1s6.8 2.5 6.8 6.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconMenu = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 7.5h16M4 12h16M4 16.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconClose = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconChevronDown = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9.5l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconChevronRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconLogIn = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12.5 4.5h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.8 8.3l3.7 3.7-3.7 3.7M13.3 12H3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconUserPlus = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9.3" cy="8.2" r="3.1" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.8 19.6c0-3.3 2.7-5.6 5.9-5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M18.2 8.4v4.6M15.9 10.7h4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconLogOut = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11.5 4.5h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.2 8.3l3.7 3.7-3.7 3.7M17.7 12H7.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const searchSuggestions = [
  "chaussure", "robe de soirée", "écouteur", "sac à main",
  "montre", "parfum", "jean", "casquette"
]

// Bouton icône "fantôme" premium : pas de contour, un halo au survol.
function IconButton({
  children,
  onClick,
  ariaLabel,
  badge,
}: {
  children: React.ReactNode
  onClick?: () => void
  ariaLabel: string
  badge?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all duration-200 hover:bg-surface hover:scale-105 active:scale-95 focus:outline-none"
    >
      {children}
      {badge}
    </button>
  )
}

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

  // ============================================================
  // MOUNT
  // ============================================================
  useEffect(() => {
    setMounted(true)
  }, [])

  // ============================================================
  // CARROUSEL RECHERCHE
  // ============================================================
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

  // ============================================================
  // NOTIFICATIONS - SYSTÈME AMÉLIORÉ
  // ============================================================
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return

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
  }, [user])

  useEffect(() => {
    if (!user) return

    // Chargement initial
    fetchUnreadCount()

    // Intervalle toutes les 15 secondes
    const interval = setInterval(fetchUnreadCount, 15000)

    // Écouter l'événement de rafraîchissement
    const handleNotificationUpdate = () => {
      fetchUnreadCount()
    }

    // Rafraîchir quand l'onglet devient visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount()
      }
    }

    window.addEventListener('notifications-updated', handleNotificationUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('notifications-updated', handleNotificationUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, fetchUnreadCount])

  // ============================================================
  // SCROLL
  // ============================================================
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

  // Hover header → barre noire réapparaît
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

  // ============================================================
  // MEGA MENU
  // ============================================================
  useEffect(() => {
    return () => {
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMegaMenu(false)
        setActiveCategory(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ============================================================
  // MOBILE MENU - LOCK SCROLL
  // ============================================================
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // ============================================================
  // HANDLERS
  // ============================================================
  const openCart = () => setIsCartOpen(true)
  const goToAccount = () => router.push("/account")
  const goToLogin = () => router.push("/account?mode=login")
  const goToRegister = () => router.push("/account?mode=register")

  const generateSlug = (name: string): string =>
    name
      .toLowerCase()
      .replace(/&/g, "et")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

  const goToCategory = (category: string) => {
    router.push(`/categorie/${generateSlug(category)}`)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    router.push("/")
  }

  const handleMouseEnterMega = () => {
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current)
      menuTimerRef.current = null
    }
    setShowMegaMenu(true)
  }

  const handleMouseLeaveMega = () => {
    menuTimerRef.current = setTimeout(() => {
      setShowMegaMenu(false)
      setActiveCategory(null)
    }, 300)
  }

  // ============================================================
  // RENDER
  // ============================================================
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
        {/* TOPBAR — ligne "Direct usine · Livraison Afrique · Mobile Money" retirée */}
        <div className="hidden lg:flex items-center justify-between gap-6 bg-brand px-6 py-2">
          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="h-3 w-32 rounded-sm animate-pulse bg-white/15" />
            ) : user ? (
              <button onClick={goToAccount} className="link-underline text-xs font-medium text-white/70 transition-colors duration-200 hover:text-white">
                Bonjour, {user.name || user.email?.split("@")[0]}
              </button>
            ) : (
              <>
                <button onClick={goToLogin} className="link-underline flex items-center gap-1.5 text-xs text-white/70 transition-colors duration-200 hover:text-white">
                  <IconLogIn className="w-3.5 h-3.5" /> Connexion
                </button>
                <button onClick={goToRegister} className="link-underline flex items-center gap-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:text-white">
                  <IconUserPlus className="w-3.5 h-3.5" /> Inscription
                </button>
              </>
            )}
            <button onClick={goToAccount} className="link-underline text-xs text-white/70 transition-colors duration-200 hover:text-white">
              Compte &amp; commandes
            </button>
          </div>
          <ThemeToggle variant="switch" />
        </div>

        {/* BARRE PRINCIPALE */}
        <div className="border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
          <div
            className="transition-all duration-300 ease-out"
            style={{
              paddingTop: isHeaderCompact ? "8px" : "14px",
              paddingBottom: isHeaderCompact ? "8px" : "14px",
            }}
          >
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
              {/* Logo */}
              <button onClick={() => router.push("/")} className="flex-shrink-0 transition-transform duration-200 hover:scale-[1.03] focus:outline-none">
                <span
                  className="font-logo text-foreground transition-all duration-300"
                  style={{ fontSize: isHeaderCompact ? "18px" : "22px" }}
                >
                  adul<span className="text-accent">.</span>lam
                </span>
              </button>

              {/* Catégories */}
              <div className="hidden lg:block relative flex-shrink-0">
                <button
                  ref={buttonRef}
                  onMouseEnter={handleMouseEnterMega}
                  onMouseLeave={handleMouseLeaveMega}
                  className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-200 hover:bg-surface-sunken hover:shadow-sm focus:outline-none"
                >
                  Catégories
                  <IconChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${showMegaMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showMegaMenu && (
                  <div
                    ref={menuRef}
                    onMouseEnter={handleMouseEnterMega}
                    onMouseLeave={handleMouseLeaveMega}
                    className="anim-scale-in absolute top-full left-0 mt-2 z-[9999] w-[900px] rounded-xl border border-border bg-popover p-5 elevate-lg"
                    style={{ transformOrigin: "top left" }}
                  >
                    <p className="overline mb-3 text-muted-foreground">Toutes les catégories</p>
                    <div className="stagger grid grid-cols-6 gap-2 mb-2">
                      {categories.slice(0, 6).map((cat) => (
                        <button
                          key={cat.title}
                          onClick={() => {
                            setActiveCategory(cat.items.length === 0 ? null : cat.title)
                            if (!cat.items.length) {
                              goToCategory(cat.title)
                              setShowMegaMenu(false)
                            }
                          }}
                          className={`rounded-lg px-2 py-2 text-xs font-medium text-center transition-all duration-200 ${
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
                          onClick={() => {
                            setActiveCategory(cat.items.length === 0 ? null : cat.title)
                            if (!cat.items.length) {
                              goToCategory(cat.title)
                              setShowMegaMenu(false)
                            }
                          }}
                          className={`rounded-lg px-2 py-2 text-xs font-medium text-center transition-all duration-200 ${
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
                      <div className="anim-fade-up border-t border-border pt-4">
                        <p className="overline mb-3 text-accent">{activeCategory}</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {categories
                            .find((c) => c.title === activeCategory)
                            ?.items.slice(0, 8)
                            .map((item, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  goToCategory(item)
                                  setShowMegaMenu(false)
                                }}
                                className="link-underline rounded-lg px-2 py-1.5 text-left text-xs text-ink-2 transition-colors duration-200 hover:text-accent"
                              >
                                {item}
                              </button>
                            ))}
                        </div>
                        {(categories.find((c) => c.title === activeCategory)?.items.length ?? 0) > 8 && (
                          <button
                            onClick={() => {
                              goToCategory(activeCategory)
                              setShowMegaMenu(false)
                            }}
                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent"
                          >
                            Voir tout <IconChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-3 border-t border-border pt-3 text-center">
                      <button
                        onClick={() => {
                          router.push("/categories")
                          setShowMegaMenu(false)
                        }}
                        className="text-xs font-semibold text-accent link-underline"
                      >
                        Voir toutes les catégories →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="flex-1 hidden lg:block relative">
                <IconSearch
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 z-10 ${
                    searchFocused ? "text-accent" : "text-muted-foreground"
                  }`}
                />

                {!searchFocused && !searchQuery && (
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden" style={{ height: "20px", width: "220px" }}>
                    <div
                      className="transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                      style={{
                        transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={`w-full rounded-lg bg-surface py-2.5 pl-10 pr-14 text-sm text-foreground transition-all duration-200 focus:outline-none border ${
                    searchFocused ? "border-accent ring-2 ring-accent/15 bg-background" : "border-transparent"
                  }`}
                />

                <button
                  onClick={handleSearch}
                  aria-label="Rechercher"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-accent transition-all duration-200 hover:bg-accent-hover hover:scale-105 active:scale-95 focus:outline-none"
                >
                  <IconSearch className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Actions */}
              <div className="hidden lg:flex items-center gap-1">
                {isLoading ? (
                  <div className="h-10 w-10 animate-pulse rounded-full bg-surface" />
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 transition-all duration-200 hover:bg-surface focus:outline-none"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
                        <IconUser className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.name || user.email?.split("@")[0]}
                      </span>
                      <IconChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {userMenuOpen && (
                      <div
                        className="anim-scale-in absolute right-0 mt-2 z-[9999] w-[200px] rounded-xl border border-border bg-popover p-1.5 elevate-lg"
                        style={{ transformOrigin: "top right" }}
                      >
                        {[
                          { label: "Mon compte", href: "/account" },
                          { label: "Mes commandes", href: "/orders" },
                          { label: "Favoris", href: "/favorites" },
                        ].map(({ label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            className="block rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors duration-200 hover:bg-surface"
                          >
                            {label}
                          </Link>
                        ))}
                        <div className="my-1 h-px bg-border" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-accent transition-colors duration-200 hover:bg-accent-light"
                        >
                          <IconLogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <IconButton onClick={goToLogin} ariaLabel="Mon compte">
                    <IconUser className="w-[19px] h-[19px]" />
                  </IconButton>
                )}

                {/* Panier */}
                <button
                  onClick={openCart}
                  className="relative flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-white transition-all duration-200 hover:bg-accent-hover hover:scale-105 active:scale-95 focus:outline-none"
                >
                  <IconBag className="w-[18px] h-[18px]" />
                  <span className="hidden text-sm font-semibold lg:inline">Panier</span>
                  {cart.length > 0 && (
                    <span className="anim-scale-in flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-accent tabular-nums">
                      {cart.length}
                    </span>
                  )}
                </button>

                {/* 🔔 NOTIFICATIONS */}
                <IconButton onClick={() => router.push("/notifications")} ariaLabel="Notifications">
                  <IconBell className="w-[19px] h-[19px]" />
                  {unreadCount > 0 && (
                    <span
                      className="anim-scale-in absolute top-1 right-1 flex items-center justify-center tabular-nums"
                      style={{
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
                    </span>
                  )}
                </IconButton>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                className="lg:hidden ml-auto flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all duration-200 hover:bg-surface active:scale-95 focus:outline-none"
              >
                {mobileMenuOpen ? <IconClose className="w-[19px] h-[19px]" /> : <IconMenu className="w-[19px] h-[19px]" />}
              </button>
            </div>
          </div>

          {/* BARRE NOIRE */}
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
                      className={`relative px-3 py-3.5 text-sm font-medium transition-colors duration-200 ${
                        isActive ? "text-white" : "link-underline text-white/55 hover:text-white"
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-t-sm bg-accent transition-all duration-300" />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Espace compensatoire */}
      <div className={`hidden lg:block transition-all duration-300 ${isHeaderCompact ? "h-[56px]" : "h-[148px]"}`} />
      <div className="block lg:hidden h-[56px]" />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="anim-fade-in lg:hidden fixed inset-0 z-[9999] overflow-y-auto bg-background" style={{ top: "56px" }}>
          <div className="anim-fade-up px-5 py-4">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <span className="font-logo text-foreground" style={{ fontSize: "20px" }}>
                adul<span className="text-accent">.</span>lam
              </span>
              <div className="flex items-center gap-1">
                <ThemeToggle variant="icon" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fermer"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all duration-200 hover:bg-surface active:scale-95 focus:outline-none"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="mb-4 h-4 w-2/5 animate-pulse rounded-sm bg-surface" />
            ) : user ? (
              <div className="mb-4 rounded-xl bg-surface p-3">
                <p className="overline mb-1 text-muted-foreground">Connecté</p>
                <p className="truncate text-sm font-semibold text-foreground">{user.name || user.email}</p>
              </div>
            ) : (
              <div className="mb-6 flex gap-2">
                <button
                  onClick={() => {
                    goToLogin()
                    setMobileMenuOpen(false)
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-transform duration-200 active:scale-95"
                >
                  <IconLogIn className="w-4 h-4" /> Connexion
                </button>
                <button
                  onClick={() => {
                    goToRegister()
                    setMobileMenuOpen(false)
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface py-2.5 text-sm font-semibold text-foreground transition-transform duration-200 active:scale-95"
                >
                  <IconUserPlus className="w-4 h-4" /> S&apos;inscrire
                </button>
              </div>
            )}

            <div className="stagger mb-4 flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path)
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-between border-b border-border py-3.5 text-left text-sm font-medium text-foreground"
                >
                  {item.label}
                  <IconChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            <p className="overline mb-3 text-muted-foreground">Catégories</p>
            {categories.map((cat) => (
              <div key={cat.title}>
                <button
                  onClick={() => {
                    if (!cat.items.length) {
                      goToCategory(cat.title)
                      setMobileMenuOpen(false)
                    } else {
                      setActiveCategory(activeCategory === cat.title ? null : cat.title)
                    }
                  }}
                  className="flex w-full items-center justify-between border-b border-border py-3 text-sm font-medium text-foreground"
                >
                  {cat.title}
                  {cat.items.length > 0 && (
                    <IconChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                        activeCategory === cat.title ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                {activeCategory === cat.title && cat.items.length > 0 && (
                  <div className="anim-fade-up flex flex-col gap-1 py-2 pl-4">
                    {cat.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          goToCategory(item)
                          setMobileMenuOpen(false)
                        }}
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
                <IconLogOut className="w-4 h-4" /> Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}