"use client"

import { ShoppingCart, ChevronDown, Search, User, Menu, X, LogOut, LogIn, UserPlus, ChevronRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAuth } from "@/lib/admin/auth-context"
import Link from "next/link"

// Suggestions pour le carrousel
const searchSuggestions = [
  "chaussure", 
  "robe de soirée", 
  "écouteur", 
  "sac à main", 
  "montre",
  "parfum"
]

export function Header() {
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // Carrousel
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  
  // Scroll : seule la barre noire se cache
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const menuTimerRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()
  const pathname = usePathname()
  const { cart } = useCart()
  const { user, logout, isLoading } = useAuth()

  // Carrousel : change la suggestion toutes les 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Scroll : cache/montre seulement la barre noire du bas
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsBottomNavVisible(false) // Descend → cache
      } else if (currentScrollY < lastScrollY) {
        setIsBottomNavVisible(true) // Monte → montre
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

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

  const handleMouseEnter = () => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    setShowMegaMenu(true)
  }
  const handleMouseLeave = () => {
    menuTimerRef.current = setTimeout(() => { 
      setShowMegaMenu(false)
      setActiveCategory(null)
    }, 300)
  }

  useEffect(() => {
    return () => { if (menuTimerRef.current) clearTimeout(menuTimerRef.current) }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowMegaMenu(false)
        setActiveCategory(null)
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

  const navItems = [
    { label: "Deals du jour", path: "/deals-du-jour" },
    { label: "Sourcing", path: "/boutique-noel" },
    { label: "Offres Spéciales", path: "/offres-speciales" },
    { label: "For You", path: "/for-you" },
    { label: "Meilleures ventes", path: "/meilleures-ventes" },
    { label: "Nouveautés", path: "/nouveautes" },
  ]

  const categories = [
    { title: "Homme", items: ["T-Shirts Homme", "Chemises Homme", "Pantalons Homme", "Jeans Homme"] },
    { title: "Femme", items: ["Robes", "Tops Femme", "T-Shirts Femme", "Pantalons Femme", "Jeans Femme", "Jupes"] },
    { title: "Enfant", items: ["Bébé Fille", "Bébé Garçon", "Fille 2-12 ans", "Garçon 2-12 ans"] },
    { title: "Chaussures", items: ["Baskets Homme", "Baskets Femme", "Baskets Enfant", "Chaussures Habillées"] },
    { title: "Accessoires", items: ["Sacs & Maroquinerie", "Montres", "Bijoux", "Ceintures"] },
    { title: "Sport", items: ["Vêtements de Sport Homme", "Vêtements de Sport Femme", "Chaussures de Sport"] },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        
        {/* TOPBAR (fixe, ne disparaît pas) */}
        <div className="hidden lg:flex items-center justify-between px-6 py-2" style={{ background: "#0A0A0A" }}>
          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="h-3 w-32 rounded animate-pulse" style={{ background: "#222" }} />
            ) : user ? (
              <button onClick={goToAccount} className="text-xs font-medium hover:opacity-70 transition" style={{ color: "#AAAAAA" }}>
                Bonjour, {user.name || user.email?.split("@")[0]}
              </button>
            ) : (
              <>
                <button onClick={goToLogin} className="flex items-center gap-1.5 text-xs hover:opacity-70 transition" style={{ color: "#AAAAAA" }}>
                  <LogIn className="w-3.5 h-3.5" /> Connexion
                </button>
                <button onClick={goToRegister} className="flex items-center gap-1.5 text-xs hover:opacity-70 transition" style={{ color: "#AAAAAA" }}>
                  <UserPlus className="w-3.5 h-3.5" /> Inscription
                </button>
              </>
            )}
            <button onClick={goToAccount} className="text-xs hover:opacity-70 transition" style={{ color: "#AAAAAA" }}>
              Compte & commandes
            </button>
          </div>
          <span className="text-xs" style={{ color: "#555" }}>
            Livraison vers l'Afrique · Paiement Mobile Money
          </span>
        </div>

        {/* MAIN HEADER (fixe, ne disparaît pas) */}
        <div className="bg-white" style={{ borderBottom: "0.5px solid #ECECEC" }}>
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">

            {/* Logo */}
            <button onClick={() => router.push("/")} className="flex-shrink-0 focus:outline-none">
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", letterSpacing: "-0.04em", color: "#0A0A0A" }}>
                adul<span style={{ color: "#D4372B" }}>.</span>lam
              </span>
            </button>

            {/* Catégories */}
            <div className="hidden lg:block relative flex-shrink-0">
              <button
                ref={buttonRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none"
                style={{ background: "#F4F4F4", color: "#0A0A0A" }}
              >
                Catégories
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMegaMenu ? 'rotate-180' : ''}`} style={{ color: "#AAAAAA" }} />
              </button>

              {showMegaMenu && (
                <div
                  ref={menuRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute top-full left-0 mt-2 bg-white z-50"
                  style={{ width: "800px", borderRadius: "16px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", padding: "20px" }}
                >
                  <div className="grid grid-cols-6 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.title}
                        onClick={() => {
                          if (!cat.items.length) goToCategory(cat.title)
                          setActiveCategory(activeCategory === cat.title ? null : cat.title)
                        }}
                        className="py-2 px-2 rounded-lg text-xs font-medium text-center transition-all"
                        style={{
                          background: activeCategory === cat.title ? "#0A0A0A" : "#F4F4F4",
                          color: activeCategory === cat.title ? "#fff" : "#0A0A0A",
                        }}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>

                  {activeCategory && (
                    <div className="mt-4 pt-4" style={{ borderTop: "0.5px solid #F0F0F0" }}>
                      <p className="text-xs font-semibold mb-3" style={{ color: "#AAAAAA" }}>{activeCategory}</p>
                      <div className="grid grid-cols-4 gap-1">
                        {categories.find(c => c.title === activeCategory)?.items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => { goToCategory(item); setShowMegaMenu(false) }}
                            className="text-left text-xs py-1.5 px-2 rounded-lg transition-all hover:bg-[#FFF0F0] hover:text-[#D4372B]"
                            style={{ color: "#0A0A0A" }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search avec carrousel */}
            <div className="flex-1 hidden lg:block relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors z-10"
                style={{ color: searchFocused ? "#D4372B" : "#AAAAAA" }}
              />
              
              {/* Carrousel - s'affiche seulement quand pas focus et pas de texte */}
              {!searchFocused && !searchQuery && (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span 
                    key={suggestionIndex}
                    className="text-sm animate-fade-in"
                    style={{ color: "#AAAAAA" }}
                  >
                    {searchSuggestions[suggestionIndex]}
                  </span>
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
                className="w-full pl-10 pr-14 py-2.5 text-sm focus:outline-none transition-all"
                style={{
                  background: "#F4F4F4",
                  borderRadius: "10px",
                  border: searchFocused ? "1.5px solid #D4372B" : "1.5px solid transparent",
                  color: "#0A0A0A",
                }}
              />
              
              <button
                onClick={handleSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: "#D4372B" }}
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isLoading ? (
                <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: "#F4F4F4" }} />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                    style={{ background: "#F4F4F4" }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ background: "#D4372B" }}>
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{user.name || user.email?.split("@")[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 bg-white z-50" style={{ width: "200px", borderRadius: "14px", border: "0.5px solid #ECECEC", padding: "6px" }}>
                      <Link href="/account" className="block px-3 py-2.5 rounded-lg text-sm hover:bg-[#FAFAFA]">Mon compte</Link>
                      <Link href="/orders" className="block px-3 py-2.5 rounded-lg text-sm hover:bg-[#FAFAFA]">Mes commandes</Link>
                      <div className="h-px bg-[#F0F0F0] my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[#D4372B] hover:bg-[#FFF5F5]">Déconnexion</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={goToLogin} className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105" style={{ background: "#F4F4F4" }}>
                  <User className="w-[18px] h-[18px]" />
                </button>
              )}

              <button
                onClick={openCart}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: "#D4372B" }}
              >
                <ShoppingCart className="w-[18px] h-[18px] text-white" />
                <span className="text-sm font-semibold text-white hidden lg:inline">Panier</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white" style={{ background: "#0A0A0A" }}>
                    {cart.length}
                  </span>
                )}
              </button>
            </div>

            {/* Burger mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl ml-auto"
              style={{ background: "#F4F4F4" }}
            >
              {mobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* ── NAV BARRE NOIRE (SEULE CETTE PARTIE SE CACHE AU SCROLL) ── */}
        <div 
          className="hidden lg:block transition-all duration-500 ease-in-out overflow-hidden"
          style={{ 
            background: "#0A0A0A",
            transform: isBottomNavVisible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: isBottomNavVisible ? 1 : 0,
            maxHeight: isBottomNavVisible ? '100px' : '0px',
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
                    className="py-3.5 px-3 text-sm font-medium transition-all relative group"
                    style={{ color: isActive ? "#fff" : "#AAAAAA" }}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full" style={{ background: "#D4372B" }} />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Espace pour compenser le header fixe */}
      <div className="h-[110px] lg:h-[150px]" />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Animation CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}