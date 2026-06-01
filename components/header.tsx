"use client"

import { ShoppingCart, ChevronDown, Search, User, Menu, X, LogOut, LogIn, UserPlus, ChevronRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAuth } from "@/lib/admin/auth-context"
import Link from "next/link"

// Suggestions pour le carrousel de recherche (modifiable à volonté)
const searchSuggestions = [
  "chaussure", 
  "robe de soirée", 
  "écouteur", 
  "sac à main", 
  "montre connectée",
  "parfum", 
  "jean slim", 
  "casquette", 
  "lunettes de soleil",
  "basket running", 
  "veste en cuir",
  "téléphone",
  "montre",
  "collier",
  "ceinture"
]

export function Header() {
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // État pour le carrousel vertical
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // État pour le scroll du header
  const [isNavBarVisible, setIsNavBarVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const menuTimerRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()
  const pathname = usePathname()
  const { cart } = useCart()
  const { user, logout, isLoading } = useAuth()

  // ========== CARROUSEL VERTICAL POUR LA RECHERCHE ==========
  useEffect(() => {
    if (!searchFocused) return
    
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length)
        setIsAnimating(false)
      }, 300)
    }, 2500)
    
    return () => clearInterval(interval)
  }, [searchFocused])

  // ========== GESTION DU SCROLL POUR LA BARRE NOIRE ==========
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY
      const scrollThreshold = 30
      
      if (currentScrollY > scrollThreshold) {
        if (scrollingDown && isNavBarVisible) {
          setIsNavBarVisible(false) // Cache la barre noire en descendant
        } else if (!scrollingDown && !isNavBarVisible) {
          setIsNavBarVisible(true) // Réaffiche en remontant
        }
      } else if (currentScrollY <= 10 && !isNavBarVisible) {
        setIsNavBarVisible(true) // Réaffiche en haut de page
      }
      
      setLastScrollY(currentScrollY)
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, isNavBarVisible])

  const openCart = () => setIsCartOpen(true)
  const goToAccount  = () => router.push("/account")
  const goToLogin    = () => router.push("/account?mode=login")
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
    if (menuTimerRef.current) { clearTimeout(menuTimerRef.current); menuTimerRef.current = null }
    setShowMegaMenu(true)
  }
  const handleMouseLeave = () => {
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        
        {/* ── TOPBAR + NAV (ensemble qui se rétracte) ── */}
        <div 
          className="transition-all duration-500 ease-in-out"
          style={{ 
            transform: isNavBarVisible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: isNavBarVisible ? 1 : 0,
          }}
        >
          {/* TOPBAR */}
          <div className="hidden lg:flex items-center justify-between px-6 py-2" style={{ background: "#0A0A0A" }}>
            <div className="flex items-center gap-6">
              {isLoading ? (
                <div className="h-3 w-32 rounded animate-pulse" style={{ background: "#222" }} />
              ) : user ? (
                <button onClick={goToAccount} className="text-xs font-medium hover:opacity-70 transition-opacity duration-300" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                  Bonjour, {user.name || user.email?.split("@")[0]}
                </button>
              ) : (
                <>
                  <button onClick={goToLogin} className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-all duration-300 hover:scale-105" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                    <LogIn className="w-3.5 h-3.5" /> Connexion
                  </button>
                  <button onClick={goToRegister} className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-all duration-300 hover:scale-105" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                    <UserPlus className="w-3.5 h-3.5" /> Inscription
                  </button>
                </>
              )}
              <button onClick={goToAccount} className="text-xs hover:opacity-70 transition-opacity duration-300" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                Compte & commandes
              </button>
            </div>
            <span className="text-xs animate-pulse" style={{ color: "#555", fontFamily: "'Poppins', sans-serif" }}>
              Livraison vers l'Afrique · Paiement Mobile Money
            </span>
          </div>

          {/* MAIN HEADER */}
          <div className="bg-white" style={{ borderBottom: "0.5px solid #ECECEC" }}>
            <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">

              {/* Logo avec animation hover */}
              <button onClick={() => router.push("/")} className="flex-shrink-0 focus:outline-none group" aria-label="Accueil">
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", letterSpacing: "-0.04em", color: "#0A0A0A" }}>
                  adul<span style={{ color: "#D4372B" }}>.</span>lam
                </span>
              </button>

              {/* Catégories dropdown */}
              <div className="hidden lg:block relative flex-shrink-0">
                <button
                  ref={buttonRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[0.98] focus:outline-none"
                  style={{ background: "#F4F4F4", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                >
                  Catégories
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMegaMenu ? 'rotate-180' : ''}`} style={{ color: "#AAAAAA" }} />
                </button>

                {showMegaMenu && (
                  <div
                    ref={menuRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute top-full left-0 mt-2 bg-white z-50 animate-fadeIn"
                    style={{ width: "900px", borderRadius: "16px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", padding: "20px" }}
                  >
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      {categories.slice(0, 6).map((cat) => (
                        <button
                          key={cat.title}
                          onClick={() => { setActiveCategory(cat.items.length === 0 ? null : cat.title); if (!cat.items.length) { goToCategory(cat.title); setShowMegaMenu(false) } }}
                          className="py-2 px-2 rounded-lg text-xs font-medium text-center transition-all duration-300 hover:scale-105"
                          style={{
                            background: activeCategory === cat.title ? "#0A0A0A" : "#F4F4F4",
                            color: activeCategory === cat.title ? "#fff" : "#0A0A0A",
                            fontFamily: "'Poppins', sans-serif",
                          }}
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
                          className="py-2 px-2 rounded-lg text-xs font-medium text-center transition-all duration-300 hover:scale-105"
                          style={{
                            background: activeCategory === cat.title ? "#0A0A0A" : "#F4F4F4",
                            color: activeCategory === cat.title ? "#fff" : "#0A0A0A",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          {cat.title}
                        </button>
                      ))}
                    </div>

                    {activeCategory && (
                      <div style={{ borderTop: "0.5px solid #F0F0F0", paddingTop: "16px" }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: "#AAAAAA", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Poppins', sans-serif" }}>
                          {activeCategory}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {categories.find(c => c.title === activeCategory)?.items.slice(0, 8).map((item, i) => (
                            <button
                              key={i}
                              onClick={() => { goToCategory(item); setShowMegaMenu(false) }}
                              className="text-left text-xs py-1.5 px-2 rounded-lg transition-all duration-200 hover:translate-x-1 hover:bg-[#FFF0F0] hover:text-[#D4372B]"
                              style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                        {(categories.find(c => c.title === activeCategory)?.items.length ?? 0) > 8 && (
                          <button
                            onClick={() => { goToCategory(activeCategory); setShowMegaMenu(false) }}
                            className="flex items-center gap-1 mt-3 text-xs font-semibold transition-all duration-300 hover:gap-2"
                            style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
                          >
                            Voir tout <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div style={{ borderTop: "0.5px solid #F0F0F0", marginTop: "12px", paddingTop: "12px", textAlign: "center" }}>
                      <button onClick={() => { router.push("/categories"); setShowMegaMenu(false) }} className="text-xs font-semibold transition-all duration-300 hover:gap-2 flex items-center justify-center gap-1 mx-auto" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                        Voir toutes les catégories →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SEARCH AVEC CARROUSEL VERTICAL */}
              <div className="flex-1 hidden lg:block relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300 z-10"
                  style={{ color: searchFocused ? "#D4372B" : "#AAAAAA" }}
                />
                
                {/* Placeholder animé (carrousel vertical) */}
                {!searchQuery && !searchFocused && (
                  <div 
                    className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden"
                    style={{ height: "20px", width: "calc(100% - 100px)" }}
                  >
                    <div
                      className={`transition-all duration-300 ease-in-out ${isAnimating ? '-translate-y-6 opacity-0' : 'translate-y-0 opacity-100'}`}
                    >
                      <span className="text-sm" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                        {searchSuggestions[currentSuggestionIndex]}
                      </span>
                    </div>
                  </div>
                )}
                
                {searchFocused && !searchQuery && (
                  <div 
                    className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ height: "20px" }}
                  >
                    <span className="text-sm" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                      {searchSuggestions[currentSuggestionIndex]}
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
                  className="w-full pl-10 pr-14 py-2.5 text-sm focus:outline-none transition-all duration-300"
                  style={{
                    background: "#F4F4F4",
                    borderRadius: "10px",
                    border: searchFocused ? "1.5px solid #D4372B" : "1.5px solid transparent",
                    color: "#0A0A0A",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
                
                <button
                  onClick={handleSearch}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
                  style={{ background: "#D4372B" }}
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Actions desktop */}
              <div className="hidden lg:flex items-center gap-2">
                {/* User menu avec animations */}
                {isLoading ? (
                  <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: "#F4F4F4" }} />
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none"
                      style={{ background: "#F4F4F4" }}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300" style={{ background: "#D4372B" }}>
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                        {user.name || user.email?.split("@")[0]}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} style={{ color: "#AAAAAA" }} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 bg-white z-50 animate-fadeIn" style={{ width: "200px", borderRadius: "14px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", padding: "6px" }}>
                        {[
                          { label: "Mon compte", href: "/account" },
                          { label: "Mes commandes", href: "/orders" },
                          { label: "Favoris", href: "/favorites" },
                        ].map(({ label, href }) => (
                          <Link key={href} href={href} className="block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:translate-x-1 hover:bg-[#FAFAFA]" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                            {label}
                          </Link>
                        ))}
                        <div style={{ height: "0.5px", background: "#F0F0F0", margin: "4px 0" }} />
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:translate-x-1 hover:bg-[#FFF5F5]" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={goToLogin} className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-[#E8E8E8] focus:outline-none" style={{ background: "#F4F4F4" }}>
                    <User className="w-[18px] h-[18px]" style={{ color: "#0A0A0A" }} />
                  </button>
                )}

                {/* Panier avec animation pulse */}
                <button
                  onClick={openCart}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none group"
                  style={{ background: "#D4372B" }}
                >
                  <ShoppingCart className="w-[18px] h-[18px] text-white transition-transform duration-300 group-hover:rotate-12" />
                  <span className="text-sm font-semibold text-white hidden lg:inline" style={{ fontFamily: "'Poppins', sans-serif" }}>Panier</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white animate-pulse" style={{ background: "#0A0A0A" }}>
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Burger mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl ml-auto transition-all duration-300 hover:scale-105 focus:outline-none"
                style={{ background: "#F4F4F4" }}
              >
                {mobileMenuOpen
                  ? <X className="w-[18px] h-[18px]" style={{ color: "#0A0A0A" }} />
                  : <Menu className="w-[18px] h-[18px]" style={{ color: "#0A0A0A" }} />
                }
              </button>
            </div>
          </div>

          {/* ── NAV DESKTOP (BARRE NOIRE) ── */}
          <div className="hidden lg:block" style={{ background: "#0A0A0A" }}>
            <div className="max-w-7xl mx-auto px-6">
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className="py-3.5 px-3 text-sm font-medium transition-all duration-300 relative group"
                      style={{
                        color: isActive ? "#fff" : "#AAAAAA",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {item.label}
                      <span 
                        className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} 
                        style={{ background: "#D4372B" }}
                      />
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Espace pour compenser le header fixe */}
      <div className="h-[126px] lg:h-[142px]" />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Styles pour les animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  )
}