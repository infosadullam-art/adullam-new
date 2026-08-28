"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

// ════════════════════════════════════════════════════════════
// ICÔNES — mêmes dessins maison que le header desktop, pour une
// identité visuelle unique sur tout le site (fini lucide par défaut)
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

const IconPackage = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3.6 8.4L12 4l8.4 4.4v7.2L12 20l-8.4-4.4V8.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M3.6 8.4L12 12.6l8.4-4.2M12 12.6V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const IconHeart = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 20s-7.5-4.6-9.6-9.4C1.1 7 3 4 6.3 4c2 0 3.4 1.1 5.7 4 2.3-2.9 3.7-4 5.7-4 3.3 0 5.2 3 3.9 6.6C19.5 15.4 12 20 12 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const IconHelp = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9.6 9.4a2.4 2.4 0 0 1 4.65.8c0 1.6-2.05 1.8-2.05 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.15" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

// — Icônes catégories : une identité distincte pour chacune
const IconElectronics = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3.5" y="5" width="17" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9 20h6M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconHanger = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4.5a1.6 1.6 0 1 1 1.35 2.5L12 8.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 8.2l8 5.4c1 .68.5 2.2-.7 2.2H4.7c-1.2 0-1.7-1.52-.7-2.2l8-5.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconHome = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4.5 11.2 12 4.6l7.5 6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 9.8V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const IconSparkle = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3.5c.5 3.2 1.3 4 4.5 4.5-3.2.5-4 1.3-4.5 4.5-.5-3.2-1.3-4-4.5-4.5 3.2-.5 4-1.3 4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M18 14c.3 1.7.7 2.1 2.4 2.4-1.7.3-2.1.7-2.4 2.4-.3-1.7-.7-2.1-2.4-2.4 1.7-.3 2.1-.7 2.4-2.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

const IconPuzzle = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 4.5h3.2a1.4 1.4 0 0 1 1.35 1.85 1.4 1.4 0 0 0 1.85 1.75c.9-.35 1.9.32 1.9 1.28V12.5h1.7a1.9 1.9 0 0 1 0 3.8h-1.7v3.2H4.5v-3.2h1.7a1.9 1.9 0 0 0 0-3.8H4.5V9.4c0-.96 1-1.63 1.9-1.28a1.4 1.4 0 0 0 1.85-1.75A1.4 1.4 0 0 1 9 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const IconBall = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
  </svg>
)

const IconBasket = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4.5 10h15l-1.4 8.4a1.6 1.6 0 0 1-1.58 1.35H7.48A1.6 1.6 0 0 1 5.9 18.4L4.5 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8.5 10 9.7 4.5M15.5 10 14.3 4.5M3.2 10h17.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const searchSuggestions = [
  "chaussure", "robe de soirée", "écouteur", "sac à main",
  "montre", "parfum", "jean", "casquette", "téléphone", "basket"
]

const categoryItems = [
  { label: "Électronique", icon: IconElectronics, slug: "electronique" },
  { label: "Mode", icon: IconHanger, slug: "mode" },
  { label: "Maison", icon: IconHome, slug: "maison" },
  { label: "Beauté", icon: IconSparkle, slug: "beaute" },
  { label: "Jouets", icon: IconPuzzle, slug: "jouets" },
  { label: "Sports", icon: IconBall, slug: "sports" },
  { label: "Alimentation", icon: IconBasket, slug: "alimentation" },
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
            <div className="rounded-full bg-surface" style={{ width: "36px", height: "36px" }} />
            <div className="rounded-full bg-accent" style={{ width: "36px", height: "36px" }} />
            <div className="rounded-full bg-surface" style={{ width: "36px", height: "36px" }} />
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
              className="font-logo transition-transform duration-200 active:scale-95 focus:outline-none"
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
            <div className="flex items-center gap-1">

              {/* Bascule de thème — fantôme, sans bordure */}
              <ThemeToggle variant="icon" className="h-9 w-9 rounded-full border-0 bg-transparent hover:bg-surface transition-colors duration-200" />

              {/* Compte */}
              <button
                onClick={goToAccount}
                aria-label="Mon compte"
                className="relative flex items-center justify-center rounded-full text-foreground transition-all duration-200 hover:bg-surface active:scale-90 focus:outline-none"
                style={{
                  width:  scrolled ? "34px" : "36px",
                  height: scrolled ? "34px" : "36px",
                  transition: "width 0.25s ease, height 0.25s ease, transform 0.15s ease, background 0.2s ease",
                }}
              >
                <IconUser className="w-[18px] h-[18px]" />
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
                aria-label="Panier"
                className="relative flex items-center justify-center rounded-full bg-accent text-white transition-all duration-200 hover:bg-accent-hover active:scale-90 focus:outline-none overflow-hidden"
                style={{
                  width:  scrolled ? "34px" : "36px",
                  height: scrolled ? "34px" : "36px",
                  transition: "width 0.25s ease, height 0.25s ease, transform 0.15s ease, background 0.2s ease",
                }}
              >
                <IconBag className="w-[17px] h-[17px]" />
                {cartClicked && (
                  <span
                    className="absolute inset-0 animate-ping rounded-full"
                    style={{ background: "var(--accent)", opacity: 0.5 }}
                  />
                )}
              </button>

              {/* Burger */}
              <button
                onClick={() => setShowMenu(p => !p)}
                aria-label={showMenu ? "Fermer le menu" : "Ouvrir le menu"}
                className="flex items-center justify-center rounded-full text-foreground transition-all duration-200 active:scale-90 focus:outline-none"
                style={{
                  background: showMenu ? "var(--surface-sunken)" : "transparent",
                  width:  scrolled ? "34px" : "36px",
                  height: scrolled ? "34px" : "36px",
                  transition: "width 0.25s ease, height 0.25s ease, background 0.2s ease, transform 0.15s ease",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    transform: showMenu ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  {showMenu
                    ? <IconClose className="w-[18px] h-[18px]" />
                    : <IconMenu className="w-[18px] h-[18px]" />
                  }
                </span>
              </button>
            </div>
          </div>

          {/* Row 2 : Barre de recherche AVEC CARROUSEL VERTICAL */}
          <form onSubmit={handleSearch} className="relative">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10 transition-colors duration-200"
              style={{ color: searchFocused ? "var(--accent)" : "var(--muted-foreground)" }}
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
                borderRadius: "10px",
                border: searchFocused
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid transparent",
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
          <div className="flex items-center gap-1">
            <ThemeToggle variant="icon" className="h-8 w-8 rounded-full border-0 bg-transparent hover:bg-surface transition-colors duration-200" />
            <button
              onClick={closeMenu}
              aria-label="Fermer"
              className="flex items-center justify-center w-8 h-8 rounded-full text-foreground transition-all duration-200 hover:bg-surface active:scale-90 focus:outline-none"
            >
              <IconClose className="w-4 h-4" />
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold bg-brand text-white transition-transform duration-200 active:scale-95"
              >
                <IconLogIn className="w-4 h-4" />
                Connexion
              </button>
              <button
                onClick={goToRegister}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold bg-surface text-foreground transition-colors duration-200 hover:bg-surface-sunken active:scale-95"
              >
                <IconUserPlus className="w-4 h-4" />
                S&apos;inscrire
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-col mt-1">
            {[
              ...(user ? [{ label: "Mon compte", icon: IconUser, action: goToAccount }] : []),
              { label: "Vos commandes", icon: IconPackage, action: goToOrders    },
              { label: "Favoris",       icon: IconHeart,   action: goToFavorites },
              { label: "Besoin d'aide", icon: IconHelp,    action: goToHelp      },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-left text-foreground transition-colors duration-200 hover:bg-surface active:bg-surface-sunken"
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] text-muted-foreground" />
                  {label}
                </span>
                <IconChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-accent transition-colors duration-200 hover:bg-accent-light"
              >
                <IconLogOut className="w-[18px] h-[18px]" />
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
                    className="flex items-center justify-between py-2.5 text-sm font-medium text-left text-foreground border-b border-border transition-colors duration-200 hover:text-accent"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-[18px] h-[18px] text-muted-foreground" />
                      {cat.label}
                    </span>
                    <IconChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
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