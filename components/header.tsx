"use client"

import { ShoppingCart, ChevronDown, Search, User, Menu, X, LogOut, LogIn, UserPlus, ChevronRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAuth } from "@/lib/admin/auth-context"
import Link from "next/link"

const searchSuggestions = [
  "chaussure", "robe de soirée", "écouteur", "sac à main", 
  "montre", "parfum", "jean", "casquette"
]

export function Header() {
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Scroll : tout le header se réduit en hauteur
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  const menuTimerRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()
  const pathname = usePathname()
  const { cart } = useCart()
  const { user, logout, isLoading } = useAuth()

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

  // Scroll : toggle mode compact
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY
      
      if (scrollingDown && currentScrollY > 80) {
        setIsHeaderCompact(true)  // Mode compact : barre noire cachée, barre blanche réduite
      } else if (!scrollingDown && currentScrollY < lastScrollY) {
        setIsHeaderCompact(false) // Mode normal
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
      <header className="fixed top-0 left-0 right-0 z-50">
        
        {/* TOUT LE HEADER (topbar + barre blanche + barre noire) se contracte */}
        <div 
          className="transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] bg-white"
          style={{ 
            maxHeight: isHeaderCompact ? "56px" : "200px",
          }}
        >
          {/* TOPBAR */}
          <div className="hidden lg:flex items-center justify-between px-6 py-2" style={{ background: "#0A0A0A" }}>
            <div className="flex items-center gap-6">
              {isLoading ? (
                <div className="h-3 w-32 rounded animate-pulse" style={{ background: "#222" }} />
              ) : user ? (
                <button onClick={goToAccount} className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                  Bonjour, {user.name || user.email?.split("@")[0]}
                </button>
              ) : (
                <>
                  <button onClick={goToLogin} className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                    <LogIn className="w-3.5 h-3.5" /> Connexion
                  </button>
                  <button onClick={goToRegister} className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                    <UserPlus className="w-3.5 h-3.5" /> Inscription
                  </button>
                </>
              )}
              <button onClick={goToAccount} className="text-xs hover:opacity-70 transition-opacity" style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}>
                Compte & commandes
              </button>
            </div>
            <span className="text-xs" style={{ color: "#555", fontFamily: "'Poppins', sans-serif" }}>
              Livraison vers l'Afrique · Paiement Mobile Money
            </span>
          </div>

          {/* BARRE BLANCHE PRINCIPALE - rétrécit en hauteur */}
          <div 
            className="bg-white transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden"
            style={{ 
              borderBottom: "0.5px solid #ECECEC",
              paddingTop: isHeaderCompact ? "8px" : "14px",
              paddingBottom: isHeaderCompact ? "8px" : "14px",
            }}
          >
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
              <button onClick={() => router.push("/")} className="flex-shrink-0 focus:outline-none">
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: isHeaderCompact ? "18px" : "22px", letterSpacing: "-0.04em", color: "#0A0A0A", transition: "font-size 0.5s ease" }}>
                  adul<span style={{ color: "#D4372B" }}>.</span>lam
                </span>
              </button>

              {/* Catégories dropdown */}
              <div className="hidden lg:block relative flex-shrink-0">
                <button
                  ref={buttonRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors focus:outline-none"
                  style={{ background: "#F4F4F4", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                >
                  Catégories
                  <ChevronDown className="w-4 h-4" style={{ color: "#AAAAAA" }} />
                </button>

                {showMegaMenu && (
                  <div
                    ref={menuRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute top-full left-0 mt-2 bg-white z-50"
                    style={{ width: "900px", borderRadius: "16px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", padding: "20px" }}
                  >
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      {categories.slice(0, 6).map((cat) => (
                        <button
                          key={cat.title}
                          onClick={() => { setActiveCategory(cat.items.length === 0 ? null : cat.title); if (!cat.items.length) { goToCategory(cat.title); setShowMegaMenu(false) } }}
                          className="py-2 px-2 rounded-lg text-xs font-medium text-center transition-colors"
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
                          className="py-2 px-2 rounded-lg text-xs font-medium text-center transition-colors"
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
                              className="text-left text-xs py-1.5 px-2 rounded-lg transition-colors hover:bg-[#FFF0F0] hover:text-[#D4372B]"
                              style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                        {(categories.find(c => c.title === activeCategory)?.items.length ?? 0) > 8 && (
                          <button
                            onClick={() => { goToCategory(activeCategory); setShowMegaMenu(false) }}
                            className="flex items-center gap-1 mt-3 text-xs font-semibold"
                            style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}
                          >
                            Voir tout <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div style={{ borderTop: "0.5px solid #F0F0F0", marginTop: "12px", paddingTop: "12px", textAlign: "center" }}>
                      <button onClick={() => { router.push("/categories"); setShowMegaMenu(false) }} className="text-xs font-semibold" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                        Voir toutes les catégories →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search avec carrousel */}
              <div className="flex-1 hidden lg:block relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors z-10"
                  style={{ color: searchFocused ? "#D4372B" : "#AAAAAA" }}
                />
                
                {!searchFocused && !searchQuery && (
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden" style={{ height: "20px", width: "180px" }}>
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
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-14 py-2 text-sm focus:outline-none transition-all"
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none"
                  style={{ background: "#D4372B" }}
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Actions desktop */}
              <div className="hidden lg:flex items-center gap-2">
                {isLoading ? (
                  <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: "#F4F4F4" }} />
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors focus:outline-none"
                      style={{ background: "#F4F4F4" }}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ background: "#D4372B" }}>
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                        {user.name || user.email?.split("@")[0]}
                      </span>
                      <ChevronDown className="w-4 h-4" style={{ color: "#AAAAAA" }} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 bg-white z-50" style={{ width: "200px", borderRadius: "14px", border: "0.5px solid #ECECEC", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", padding: "6px" }}>
                        {[
                          { label: "Mon compte", href: "/account" },
                          { label: "Mes commandes", href: "/orders" },
                          { label: "Favoris", href: "/favorites" },
                        ].map(({ label, href }) => (
                          <Link key={href} href={href} className="block px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[#FAFAFA]" style={{ color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}>
                            {label}
                          </Link>
                        ))}
                        <div style={{ height: "0.5px", background: "#F0F0F0", margin: "4px 0" }} />
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[#FFF5F5]" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={goToLogin} className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors focus:outline-none" style={{ background: "#F4F4F4" }}>
                    <User className="w-[18px] h-[18px]" style={{ color: "#0A0A0A" }} />
                  </button>
                )}

                <button
                  onClick={openCart}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors focus:outline-none"
                  style={{ background: "#D4372B" }}
                >
                  <ShoppingCart className="w-[18px] h-[18px] text-white" />
                  <span className="text-sm font-semibold text-white hidden lg:inline" style={{ fontFamily: "'Poppins', sans-serif" }}>Panier</span>
                  {cart.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white" style={{ background: "#0A0A0A" }}>
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl ml-auto focus:outline-none"
                style={{ background: "#F4F4F4" }}
              >
                {mobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {/* BARRE NOIRE - se contracte complètement */}
          <div 
            className="hidden lg:block transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden"
            style={{ 
              background: "#0A0A0A",
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
                      className="py-3.5 px-3 text-sm font-medium transition-colors relative"
                      style={{
                        color: isActive ? "#fff" : "#AAAAAA",
                        fontFamily: "'Poppins', sans-serif",
                      }}
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
        </div>
      </header>

      {/* Espace compensatoire qui change selon le mode */}
      <div className={`transition-all duration-500 ${isHeaderCompact ? 'h-[56px]' : 'h-[130px]'}`} />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[1000] overflow-y-auto bg-white" style={{ top: isHeaderCompact ? '56px' : 'auto' }}>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-6" style={{ borderBottom: "0.5px solid #F0F0F0", paddingBottom: "16px" }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", letterSpacing: "-0.04em", color: "#0A0A0A" }}>
                adul<span style={{ color: "#D4372B" }}>.</span>lam
              </span>
            </div>

            {isLoading ? (
              <div className="h-4 rounded animate-pulse mb-4" style={{ background: "#F4F4F4", width: "40%" }} />
            ) : user ? (
              <div className="mb-4 p-3 rounded-xl" style={{ background: "#FAFAFA", border: "0.5px solid #ECECEC" }}>
                <p className="text-xs mb-0.5" style={{ color: "#AAAAAA" }}>Connecté</p>
                <p className="text-sm font-semibold truncate" style={{ color: "#0A0A0A" }}>{user.name || user.email}</p>
              </div>
            ) : (
              <div className="flex gap-2 mb-6">
                <button onClick={() => { goToLogin(); setMobileMenuOpen(false) }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#0A0A0A", color: "#fff" }}>
                  <LogIn className="w-4 h-4" /> Connexion
                </button>
                <button onClick={() => { goToRegister(); setMobileMenuOpen(false) }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ border: "1.5px solid #ECECEC", color: "#0A0A0A" }}>
                  <UserPlus className="w-4 h-4" /> S'inscrire
                </button>
              </div>
            )}

            <div className="flex flex-col mb-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { router.push(item.path); setMobileMenuOpen(false) }}
                  className="flex items-center justify-between py-3.5 text-sm font-medium text-left"
                  style={{ borderBottom: "0.5px solid #F8F8F8", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                >
                  {item.label}
                  <ChevronRight className="w-4 h-4" style={{ color: "#ECECEC" }} />
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold mb-3" style={{ color: "#AAAAAA", letterSpacing: "0.08em", textTransform: "uppercase" }}>Catégories</p>
            {categories.map((cat) => (
              <div key={cat.title}>
                <button
                  onClick={() => {
                    if (!cat.items.length) { goToCategory(cat.title); setMobileMenuOpen(false) }
                    else setActiveCategory(activeCategory === cat.title ? null : cat.title)
                  }}
                  className="flex items-center justify-between w-full py-3 text-sm font-medium"
                  style={{ borderBottom: "0.5px solid #F8F8F8", color: "#0A0A0A", fontFamily: "'Poppins', sans-serif" }}
                >
                  {cat.title}
                  {cat.items.length > 0 && (
                    <ChevronDown className="w-4 h-4 transition-transform" style={{ color: "#AAAAAA", transform: activeCategory === cat.title ? "rotate(180deg)" : "rotate(0)" }} />
                  )}
                </button>
                {activeCategory === cat.title && cat.items.length > 0 && (
                  <div className="pl-4 py-2 flex flex-col gap-1">
                    {cat.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { goToCategory(item); setMobileMenuOpen(false) }}
                        className="text-left py-1.5 text-sm"
                        style={{ color: "#AAAAAA", fontFamily: "'Poppins', sans-serif" }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {user && (
              <button onClick={handleLogout} className="flex items-center gap-2 mt-4 text-sm font-medium" style={{ color: "#D4372B", fontFamily: "'Poppins', sans-serif" }}>
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}