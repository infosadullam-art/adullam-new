"use client";

import { Header } from "@/components/header";
import { MobileHeader } from "@/components/mobile-header";
import MobileNav from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { 
  ShoppingCart, 
  X, 
  Minus, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Ship,
  Sparkles,
  Zap,
  Package,
  Truck
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleProvider";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    updateShippingMode,
    totalUSD, 
    totalItems,
    totalShippingUSD,
    totalPortePorteUSD,
    grandTotalUSD,
    shippingMode: defaultShippingMode,
    setShippingMode: setDefaultShippingMode
  } = useCart();

  const { country, setCountry, currency } = useLocale();
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter();
  
  const [openCountry, setOpenCountry] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Liste des pays africains pour la sélection
  const africanCountries = [
    { code: "CI", name: "Côte d'Ivoire" },
    { code: "BF", name: "Burkina Faso" },
    { code: "SN", name: "Sénégal" },
    { code: "ML", name: "Mali" },
    { code: "BJ", name: "Bénin" },
    { code: "TG", name: "Togo" },
    { code: "NE", name: "Niger" },
    { code: "CM", name: "Cameroun" },
    { code: "CF", name: "République Centrafricaine" },
    { code: "GA", name: "Gabon" },
    { code: "CG", name: "Congo" },
    { code: "CD", name: "RDC" },
    { code: "MA", name: "Maroc" },
    { code: "TN", name: "Tunisie" },
    { code: "DZ", name: "Algérie" },
    { code: "LY", name: "Libye" },
    { code: "EG", name: "Égypte" },
    { code: "ZA", name: "Afrique du Sud" },
    { code: "KE", name: "Kenya" },
    { code: "UG", name: "Ouganda" },
    { code: "TZ", name: "Tanzanie" },
    { code: "RW", name: "Rwanda" },
    { code: "ET", name: "Éthiopie" },
    { code: "AO", name: "Angola" },
    { code: "MZ", name: "Mozambique" },
    { code: "ZW", name: "Zimbabwe" },
    { code: "ZM", name: "Zambie" },
    { code: "BW", name: "Botswana" },
    { code: "NA", name: "Namibie" },
  ];

  // Détection automatique du pays via IP
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        const found = africanCountries.find(c => c.name === data.country_name);
        if (found) {
          setCountry(found.code);
        }
      })
      .catch(() => {});
  }, []);

  // Icônes pour les modes de livraison
  const shippingIcons = {
    bateau: Ship,
    avion: Sparkles,
    express: Zap
  };

  const shippingLabels = {
    bateau: 'Maritime (35-50j)',
    avion: 'Aérien (15-20j)',
    express: 'Express (7-10j)'
  };

  // Fonction pour changer le mode de livraison d'un article
  const handleShippingModeChange = async (variantKey: string, mode: 'bateau' | 'avion' | 'express') => {
    setUpdatingId(variantKey);
    updateShippingMode(variantKey, mode);
    setTimeout(() => setUpdatingId(null), 300);
  };

  // Poids total
  const totalWeight = cart.reduce((sum, item) => sum + (item.totalWeight || 0), 0);

  // Fonction pour tronquer le titre du produit
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (!title) return "Produit";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
          {/* Fil d'Ariane */}
          <div className="hidden lg:flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-muted-foreground hover:text-brand">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Panier</span>
          </div>

          {/* Titre */}
          <h1 className="text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7" />
            Panier ({totalItems} article{totalItems > 1 ? 's' : ''})
          </h1>

          {/* Sélecteur de pays */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setOpenCountry(!openCountry)}
              className="w-full flex items-center justify-between p-3 bg-white rounded-lg border"
            >
              <span className="font-medium">Pays de livraison</span>
              <div className="flex items-center gap-2">
                <span className="text-brand">{africanCountries.find(c => c.code === country)?.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openCountry ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {openCountry && (
              <div className="mt-1 bg-white rounded-lg border max-h-60 overflow-y-auto">
                {africanCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c.code);
                      setOpenCountry(false);
                    }}
                    className={`w-full text-left p-3 hover:bg-neutral-light transition-colors ${
                      country === c.code ? 'bg-brand/10 text-brand font-medium' : ''
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* PRODUITS */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const Icon = shippingIcons[item.shippingMode || defaultShippingMode];
                  const isUpdating = updatingId === item.variantKey;
                  
                  return (
                    <div 
                      key={item.variantKey} 
                      className={`
                        bg-white rounded-lg p-4 flex gap-4 transition-opacity
                        ${isUpdating ? 'opacity-50' : 'opacity-100'}
                      `}
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-neutral-light rounded-lg overflow-hidden flex-shrink-0 border">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name || "Produit"}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      {/* Détails */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            {/* ✅ Titre du produit réduit à 60 caractères max */}
                            <h3 className="font-semibold text-sm lg:text-base line-clamp-2">
                              {truncateTitle(item.name || "Produit", 60)}
                            </h3>
                            
                            {/* VARIANTES */}
                            {(item.color || item.eurSize) && (
                              <div className="mt-1 space-x-2">
                                {item.color && (
                                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                    {item.color}
                                  </span>
                                )}
                                {item.eurSize && (
                                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                    Pointure {item.eurSize}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.variantKey!)}
                            className="text-muted-foreground hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Prix unitaire */}
                        <p className="text-brand font-bold mt-2">
                          {formatPrice(item.price)}
                        </p>

                        {/* MODE DE LIVRAISON pour cet article */}
                        <div className="mt-3 flex items-center gap-1">
                          <span className="text-xs text-gray-500 mr-2">Livraison:</span>
                          <button
                            onClick={() => handleShippingModeChange(item.variantKey!, 'bateau')}
                            className={`
                              p-1.5 rounded transition-all text-xs flex items-center gap-1
                              ${item.shippingMode === 'bateau' 
                                ? 'bg-brand text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }
                            `}
                            title="Maritime"
                          >
                            <Ship className="w-3 h-3" />
                            <span className="hidden sm:inline">Mer</span>
                          </button>
                          <button
                            onClick={() => handleShippingModeChange(item.variantKey!, 'avion')}
                            className={`
                              p-1.5 rounded transition-all text-xs flex items-center gap-1
                              ${item.shippingMode === 'avion' 
                                ? 'bg-brand text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }
                            `}
                            title="Aérien"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span className="hidden sm:inline">Air</span>
                          </button>
                          <button
                            onClick={() => handleShippingModeChange(item.variantKey!, 'express')}
                            className={`
                              p-1.5 rounded transition-all text-xs flex items-center gap-1
                              ${item.shippingMode === 'express' 
                                ? 'bg-brand text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }
                            `}
                            title="Express"
                          >
                            <Zap className="w-3 h-3" />
                            <span className="hidden sm:inline">Express</span>
                          </button>
                        </div>

                        {/* Quantité et total ligne */}
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.variantKey!, item.quantity - 1)}
                              className="p-2 hover:bg-neutral-light transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantKey!, item.quantity + 1)}
                              className="p-2 hover:bg-neutral-light transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="font-bold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            {item.shippingCostUSD ? (
                              <p className="text-xs text-gray-400">
                                + {formatPrice(item.shippingCostUSD)} livraison
                              </p>
                            ) : null}
                            {item.portePorteCostUSD ? (
                              <p className="text-xs text-gray-400">
                                + {formatPrice(item.portePorteCostUSD)} porte-à-porte
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RÉSUMÉ */}
              <div className="bg-white rounded-lg p-6 h-fit">
                <h2 className="text-xl font-bold mb-4">Résumé</h2>

                {/* Pays (Desktop) */}
                <div className="hidden lg:block mb-4">
                  <label className="text-sm text-gray-500">Pays de livraison</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    {africanCountries.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Détails des frais */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{formatPrice(totalUSD)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">{formatPrice(totalShippingUSD)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Porte-à-porte</span>
                    <span className="font-medium">{formatPrice(totalPortePorteUSD)}</span>
                  </div>

                  {/* Détail du poids */}
                  {totalWeight > 0 && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Poids total</span>
                      <span>{totalWeight.toFixed(2)} kg</span>
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand">{formatPrice(grandTotalUSD)}</span>
                  </div>

                  {/* Récapitulatif des articles */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium mb-2">Récapitulatif des articles :</p>
                    {cart.map((item) => (
                      <div key={item.variantKey} className="flex justify-between text-xs py-1">
                        <span className="text-gray-600 truncate max-w-[200px]">
                          {truncateTitle(item.name || "Produit", 40)} 
                          {item.color && ` - ${item.color}`}
                          {item.eurSize && ` (${item.eurSize})`}
                          <span className="text-gray-400 ml-1">x{item.quantity}</span>
                        </span>
                        <span className="font-medium ml-2">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block mt-6 text-center bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
                >
                  Passer la commande ({formatPrice(grandTotalUSD)})
                </Link>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Tous les prix sont en {getCurrencySymbol()}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <ShoppingCart className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6">
                Ajoutez des produits pour commencer vos achats
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
              >
                Continuer mes achats
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}