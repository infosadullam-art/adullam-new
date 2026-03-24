"use client"

import { ShoppingCart, ChevronDown, Search, User, Menu, X, LogOut, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAuth } from "@/lib/admin/auth-context"
import Link from "next/link"

export function Header() {
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // Refs pour gérer le délai de fermeture
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  const { cart } = useCart()
  const { user, logout, isLoading } = useAuth()

  const openCart = () => setIsCartOpen(true)
  
  const goToAccount = () => router.push("/account")
  const goToLogin = () => router.push("/account?mode=login")
  const goToRegister = () => router.push("/account?mode=register")
  
  // ✅ FONCTION CORRIGÉE pour générer un slug valide (identique au backend)
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      // Remplacer & par "et"
      .replace(/&/g, 'et')
      // Enlever les accents
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      // Remplacer tout ce qui n'est pas alphanumérique par des tirets
      .replace(/[^a-z0-9]+/g, '-')
      // Enlever les tirets au début et à la fin
      .replace(/^-|-$/g, '')
  }

  // ✅ VERSION CORRIGÉE qui utilise generateSlug
  const goToCategory = (category: string) => {
    const slug = generateSlug(category)
    console.log(`🔍 Navigation vers: /categorie/${slug} (depuis: ${category})`)
    router.push(`/categorie/${slug}`)
  }
  
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    router.push("/")
  }

  // Gestionnaire pour ouvrir le menu avec délai
  const handleMouseEnter = () => {
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current)
      menuTimerRef.current = null
    }
    setShowMegaMenu(true)
  }

  // Gestionnaire pour fermer le menu avec délai
  const handleMouseLeave = () => {
    menuTimerRef.current = setTimeout(() => {
      setShowMegaMenu(false)
      setActiveCategory(null)
    }, 300)
  }

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current)
      }
    }
  }, [])

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMegaMenu(false)
        setActiveCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Définir les boutons de navigation desktop
  const navItems = [
    { label: "Deals du jour", path: "/deals-du-jour" },
    { label: "Sourcing", path: "/boutique-noel" },
    { label: "Offres Spéciales", path: "/offres-speciales" },
    { label: "For You", path: "/for-you" },
    { label: "Meilleures ventes", path: "/meilleures-ventes" },
    { label: "Nouveautés", path: "/nouveautes" },
  ]

  // ✅ LES 12 CATÉGORIES PARENTS AVEC LEURS SOUS-CATÉGORIES
  const categories = [
    { 
      title: "Homme", 
      items: [
        "T-Shirts Homme", "Chemises Homme", "Pantalons Homme", "Jeans Homme", 
        "Shorts Homme", "Manteaux Homme", "Sweats Homme", "Costumes Homme",
        "Maillots de bain Homme", "Pyjamas Homme", "Sous-vêtements Homme", "Chaussettes Homme"
      ] 
    },
    { 
      title: "Femme", 
      items: [
        "Robes", "Tops Femme", "T-Shirts Femme", "Pantalons Femme", 
        "Jeans Femme", "Jupes", "Manteaux Femme", "Sweats Femme",
        "Combinaisons", "Maillots de bain Femme", "Pyjamas Femme", 
        "Sous-vêtements Femme", "Collants & Chaussettes"
      ] 
    },
    { 
      title: "Enfant", 
      items: [
        "Bébé Fille", "Bébé Garçon", "Fille 2-12 ans", "Garçon 2-12 ans",
        "Bébé mixte", "Vêtements Fille", "Vêtements Garçon", "Chaussures Enfant"
      ] 
    },
    { 
      title: "Chaussures", 
      items: [
        "Baskets Homme", "Baskets Femme", "Baskets Enfant", "Chaussures Habillées Homme",
        "Chaussures Habillées Femme", "Bottes", "Sandales", "Chaussures de Sport",
        "Mules & Sabots"
      ] 
    },
    { 
      title: "Accessoires", 
      items: [
        "Sacs & Maroquinerie", "Montres", "Bijoux", "Ceintures",
        "Chapeaux & Casquettes", "Lunettes", "Gants", "Écharpes & Foulards",
        "Parapluies", "Portefeuilles"
      ] 
    },
    { 
      title: "Sport", 
      items: [
        "Vêtements de Sport Homme", "Vêtements de Sport Femme", "Vêtements de Sport Enfant",
        "Chaussures de Sport", "Accessoires de Sport", "Sports d'équipe",
        "Sports de raquette", "Sports d'hiver"
      ] 
    },
    { 
      title: "Maison", 
      items: [
        "Maison & Décoration", "Literie", "Cuisine", "Salle de bain",
        "Meubles", "Électroménager", "Linge de maison", "Décoration"
      ] 
    },
    { 
      title: "Beauté", 
      items: [
        "Parfums", "Maquillage", "Soins Visage", "Soins Corps",
        "Soins Cheveux", "Hygiène"
      ] 
    },
    { 
      title: "Électronique", 
      items: [
        "Téléphones", "Ordinateurs", "Tablettes", "TV & Vidéo",
        "Audio", "Photo & Caméra", "Gaming", "Accessoires Électronique"
      ] 
    },
    { 
      title: "Loisirs", 
      items: [
        "Livres", "Jeux & Jouets", "Jeux de société", "Instruments de musique"
      ] 
    },
    { 
      title: "Alimentation", 
      items: [
        "Épicerie", "Boissons", "Confiserie", "Produits régionaux"
      ] 
    },
    { 
      title: "Animaux", 
      items: [
        "Chien", "Chat", "Poissons", "Oiseaux", "Accessoires Animaux"
      ] 
    }
  ]

  return (
    <>
      <header className="relative z-50 pointer-events-auto">
        {/* Top Bar Desktop */}
        <div className="bg-[#0B1F3F] text-white text-sm hidden lg:flex justify-between items-center px-6 py-2.5 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="h-4 bg-gray-600 animate-pulse rounded w-32"></div>
            ) : user ? (
              <button onClick={goToAccount} className="hover:underline cursor-pointer font-medium">
                Bonjour, {user.name || user.email?.split('@')[0]}
              </button>
            ) : (
              <>
                <button onClick={goToLogin} className="hover:underline cursor-pointer flex items-center gap-1">
                  <LogIn className="w-4 h-4" />
                  Connexion
                </button>
                <button onClick={goToRegister} className="hover:underline cursor-pointer font-medium flex items-center gap-1">
                  <UserPlus className="w-4 h-4" />
                  Inscription
                </button>
              </>
            )}
            <button onClick={goToAccount} className="hover:underline cursor-pointer font-medium">
              Compte & commandes
            </button>
          </div>
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/france-flag.png" alt="France" width={20} height={14} className="rounded-sm" />
            <span className="font-medium">FR</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between lg:justify-start gap-3">

            {/* Logo */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer z-50 pointer-events-auto"
            >
              <div className="w-11 h-11 bg-[#C72C1C] rounded flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#0B1F3F]">adullam</span>
            </button>

            {/* Desktop Categories */}
            <div className="hidden lg:block relative flex-shrink-0">
              <Button
                ref={buttonRef}
                variant="outline"
                className="bg-[#F5F5F5] text-[#0B1F3F] border border-gray-300 hover:bg-gray-200 font-normal text-sm h-[44px] px-4 rounded flex items-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Voir toutes les catégories
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>

              {showMegaMenu && (
                <div
                  ref={menuRef}
                  className="absolute top-full left-0 mt-2 w-[1000px] bg-white rounded-lg shadow-2xl p-6 z-50 border border-gray-200 pointer-events-auto"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Première ligne - 6 catégories */}
                  <div className="grid grid-cols-6 gap-3 mb-4">
                    {categories.slice(0, 6).map((cat, idx) => (
                      <div key={idx} className="text-center">
                        <button
                          onClick={() => {
                            setActiveCategory(cat.title)
                            if (cat.items.length === 0) {
                              goToCategory(cat.title)
                              setShowMegaMenu(false)
                            }
                          }}
                          className={`font-medium text-xs w-full px-1 py-2 rounded transition-colors ${
                            activeCategory === cat.title 
                              ? "bg-[#C72C1C] text-white" 
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="truncate">{cat.title}</div>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Deuxième ligne - 6 catégories */}
                  <div className="grid grid-cols-6 gap-3 mb-5">
                    {categories.slice(6, 12).map((cat, idx) => (
                      <div key={idx} className="text-center">
                        <button
                          onClick={() => {
                            setActiveCategory(cat.title)
                            if (cat.items.length === 0) {
                              goToCategory(cat.title)
                              setShowMegaMenu(false)
                            }
                          }}
                          className={`font-medium text-xs w-full px-1 py-2 rounded transition-colors ${
                            activeCategory === cat.title 
                              ? "bg-[#C72C1C] text-white" 
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="truncate">{cat.title}</div>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sous-catégories de la catégorie active */}
                  {activeCategory && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span>{activeCategory}</span>
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          ({categories.find(c => c.title === activeCategory)?.items.length || 0} sous-catégories)
                        </span>
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {categories
                          .find(c => c.title === activeCategory)
                          ?.items.slice(0, 8)
                          .map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                goToCategory(item)
                                setShowMegaMenu(false)
                              }}
                              className="text-left text-xs text-gray-600 hover:text-[#C72C1C] py-1 px-2 hover:bg-gray-50 rounded truncate"
                            >
                              {item}
                            </button>
                          ))}
                      </div>
                      {categories.find(c => c.title === activeCategory)?.items.length > 8 && (
                        <button
                          onClick={() => {
                            goToCategory(activeCategory)
                            setShowMegaMenu(false)
                          }}
                          className="mt-3 text-xs text-[#C72C1C] hover:underline font-medium flex items-center gap-1"
                        >
                          Voir toutes les sous-catégories
                          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Lien vers toutes les catégories */}
                  <div className="mt-5 pt-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => {
                        router.push("/categories")
                        setShowMegaMenu(false)
                      }}
                      className="text-xs text-[#C72C1C] hover:underline font-medium"
                    >
                      Voir toutes les catégories →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative z-50 pointer-events-auto">
              <input
                type="text"
                placeholder="Recherche Adullam..."
                className="w-full pl-4 pr-4 py-2.5 rounded-l border border-r-0 border-gray-300 bg-white text-[#0B1F3F] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C72C1C] focus:border-[#C72C1C]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-7 bg-[#E67E22] hover:bg-[#D35400] rounded-r transition-colors flex items-center justify-center absolute top-0 right-0 h-full"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 z-50 pointer-events-auto">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-[#C72C1C] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden lg:inline text-sm font-medium text-[#0B1F3F]">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#0B1F3F]" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border z-50">
                      <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon compte</Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mes commandes</Link>
                      <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Favoris</Link>
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={goToLogin} className="hover:opacity-70 transition-opacity">
                  <User className="w-6 h-6 text-[#0B1F3F]" />
                </button>
              )}

              <div className="flex items-center gap-2">
                <button onClick={openCart} className="relative hover:opacity-70 transition-opacity">
                  <ShoppingCart className="w-7 h-7 text-[#0B1F3F]" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#C72C1C] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button onClick={openCart} className="text-base font-semibold text-[#0B1F3F] cursor-pointer hover:underline hidden lg:inline">
                  Panier
                </button>
              </div>

              <button className="lg:hidden ml-2 z-50 pointer-events-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Fullscreen */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-[#0B1F3F] text-white z-[1000] overflow-y-auto px-6 py-6 pointer-events-auto">
            <div className="flex flex-col gap-3 relative z-[1001]">
              {isLoading ? (
                <div className="h-6 bg-gray-600 animate-pulse rounded w-32"></div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#C72C1C] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Bonjour, {user.name || user.email?.split('@')[0]}</span>
                  </div>
                  <button onClick={goToAccount} className="text-left hover:underline pl-10">Mon compte</button>
                  <button onClick={handleLogout} className="text-left hover:underline text-red-300 pl-10">Déconnexion</button>
                </>
              ) : (
                <>
                  <button onClick={goToLogin} className="text-left hover:underline font-medium">Connexion</button>
                  <button onClick={goToRegister} className="text-left hover:underline">Inscription</button>
                </>
              )}
              <button onClick={goToAccount} className="text-left hover:underline font-medium">Compte & commandes</button>

              <div className="flex items-center gap-2 mt-2">
                <button onClick={openCart} className="relative hover:opacity-70 transition-opacity">
                  <ShoppingCart className="w-7 h-7 text-white" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#C72C1C] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button onClick={openCart} className="text-base font-semibold hover:underline">Panier</button>
              </div>

              {/* Catégories en mobile */}
              <div className="mt-4">
                <p className="font-bold text-lg mb-2">Catégories</p>
                {categories.map((cat, idx) => (
                  <div key={idx} className="mb-3">
                    <button
                      onClick={() => {
                        if (cat.items.length === 0) {
                          goToCategory(cat.title)
                          setMobileMenuOpen(false)
                        } else {
                          setActiveCategory(activeCategory === cat.title ? null : cat.title)
                        }
                      }}
                      className="font-semibold text-left w-full py-1 flex justify-between items-center"
                    >
                      {cat.title}
                      {cat.items.length > 0 && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === cat.title ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    
                    {activeCategory === cat.title && cat.items.length > 0 && (
                      <div className="pl-4 mt-1 space-y-1">
                        {cat.items.map((item, i) => (
                          <button
                            key={i}
                            className="text-sm text-gray-300 hover:text-white block py-1"
                            onClick={() => {
                              goToCategory(item)
                              setMobileMenuOpen(false)
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Desktop */}
        <div className="bg-[#0B1F3F] hidden lg:block">
          <div className="max-w-[1440px] mx-auto px-6">
            <nav className="flex items-center gap-8 text-sm font-medium text-white">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(item.path)}
                  className={`py-3.5 border-b-[3px] transition-colors ${
                    pathname === item.path ? "border-[#E67E22] text-white" : "border-transparent hover:text-[#E67E22]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}