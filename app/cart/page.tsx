"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { ShoppingCart, X, Minus, Plus, ChevronRight, ChevronDown, Ship, Sparkles, Zap } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useLocale } from "@/context/LocaleProvider"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { toast } from "react-hot-toast"

// ============================================================
// FONCTION MOQ (copiée depuis CartContext)
// ============================================================
function getMinQuantity(price: number): number {
  if (price <= 3.26) return 10;
  if (price <= 8.16) return 6;
  if (price <= 16.32) return 4;
  if (price <= 48.98) return 3;
  return 2;
}

export default function CartPage() {
  const {
    cart, removeFromCart, updateQuantity, updateShippingMode,
    totalUSD, totalItems, totalShippingUSD, totalPortePorteUSD,
    grandTotalUSD, shippingMode: defaultShippingMode, setShippingMode: setDefaultShippingMode
  } = useCart()

  const { country, setCountry, currency } = useLocale()
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const [openCountry, setOpenCountry] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const africanCountries = [
    { code: "CI", name: "Côte d'Ivoire" }, { code: "BF", name: "Burkina Faso" },
    { code: "SN", name: "Sénégal" },       { code: "ML", name: "Mali" },
    { code: "BJ", name: "Bénin" },         { code: "TG", name: "Togo" },
    { code: "NE", name: "Niger" },         { code: "CM", name: "Cameroun" },
    { code: "CF", name: "Rép. Centrafricaine" }, { code: "GA", name: "Gabon" },
    { code: "CG", name: "Congo" },         { code: "CD", name: "RDC" },
    { code: "MA", name: "Maroc" },         { code: "TN", name: "Tunisie" },
    { code: "DZ", name: "Algérie" },       { code: "LY", name: "Libye" },
    { code: "EG", name: "Égypte" },        { code: "ZA", name: "Afrique du Sud" },
    { code: "KE", name: "Kenya" },         { code: "UG", name: "Ouganda" },
    { code: "TZ", name: "Tanzanie" },      { code: "RW", name: "Rwanda" },
    { code: "ET", name: "Éthiopie" },      { code: "AO", name: "Angola" },
    { code: "MZ", name: "Mozambique" },    { code: "ZW", name: "Zimbabwe" },
    { code: "ZM", name: "Zambie" },        { code: "BW", name: "Botswana" },
    { code: "NA", name: "Namibie" },
  ]

  useEffect(() => {
    apiFetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        const found = africanCountries.find(c => c.name === data.country_name)
        if (found) setCountry(found.code)
      })
      .catch(() => {})
  }, [])

  const shippingModes = [
    { id: "bateau",  icon: Ship,     label: "Mer",    title: "Maritime (35-50j)" },
    { id: "avion",   icon: Sparkles, label: "Air",    title: "Aérien (15-20j)" },
    { id: "express", icon: Zap,      label: "Express",title: "Express (7-10j)" },
  ] as const

  const handleShippingModeChange = async (variantKey: string, mode: "bateau" | "avion" | "express") => {
    setUpdatingId(variantKey)
    updateShippingMode(variantKey, mode)
    setTimeout(() => setUpdatingId(null), 300)
  }

  const totalWeight = cart.reduce((sum, item) => sum + (item.totalWeight || 0), 0)

  // ✅ Totaux MOQ agrégés par produit (id), toutes variantes confondues.
  // Utilisé pour le badge "⚠️ MOQ" à l'affichage : une ligne ne doit être
  // signalée en dessous du MOQ que si le TOTAL du produit (toutes couleurs/
  // tailles cumulées) est insuffisant, pas sa propre quantité isolée.
  const productMOQTotals = new Map<string, { total: number; minQty: number }>()
  cart.forEach((item) => {
    const minQty = item.minQuantity || getMinQuantity(item.price)
    if (!productMOQTotals.has(item.id)) {
      productMOQTotals.set(item.id, { total: 0, minQty })
    }
    productMOQTotals.get(item.id)!.total += item.quantity
  })
  const isProductBelowMOQ = (item: { id: string; price: number; minQuantity?: number }) => {
    const data = productMOQTotals.get(item.id)
    if (!data) return false
    return data.total < data.minQty
  }

  const truncateTitle = (title: string, max = 60) => {
    if (!title) return "Produit"
    return title.length <= max ? title : title.substring(0, max) + "..."
  }

  // ✅ VÉRIFICATION MOQ GLOBALE (par produit, toutes variantes confondues)
  const handleCheckout = () => {
    // ✅ Vérifier MOQ global par produit (toutes variantes confondues)
    const productTotals = new Map<string, { total: number; name: string; minQty: number }>();
    
    cart.forEach(item => {
      const minQty = item.minQuantity || getMinQuantity(item.price);
      if (!productTotals.has(item.id)) {
        productTotals.set(item.id, { total: 0, name: item.name || "Produit", minQty });
      }
      productTotals.get(item.id)!.total += item.quantity;
    });

    const invalidProducts = Array.from(productTotals.entries())
      .filter(([_, data]) => data.total < data.minQty)
      .map(([id, data]) => data.name);

    if (invalidProducts.length > 0) {
      toast.error(`Quantité minimum non atteinte pour : ${invalidProducts.join(", ")}`, {
        duration: 5000,
        position: "top-center",
      });
      return;
    }

    // ✅ Tout est bon, on va au checkout
    window.location.href = "/checkout";
  }

  // ── FONT STYLE ─────────────────────────────────────────────
  const poppins = { fontFamily: "'Poppins', sans-serif" }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="pb-20 lg:pb-10">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 lg:py-8">

          {/* Breadcrumb desktop */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs mb-6" style={{ color: "#AAAAAA" }}>
            <Link href="/" className="hover:text-[#D4372B] transition-colors" style={poppins}>Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#0A0A0A", fontWeight: 500, ...poppins }}>Panier</span>
          </div>

          {/* Titre */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: "#D4372B" }}>
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.02em", ...poppins }}>
              Panier
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#AAAAAA", marginLeft: "8px" }}>
                ({totalItems} article{totalItems > 1 ? "s" : ""})
              </span>
            </h1>
          </div>

          {/* Sélecteur pays mobile */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setOpenCountry(!openCountry)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors focus:outline-none"
              style={{ background: "#fff", border: "0.5px solid #ECECEC" }}
            >
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0A0A", ...poppins }}>Pays de livraison</span>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#D4372B", ...poppins }}>
                  {africanCountries.find(c => c.code === country)?.name}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openCountry ? "rotate-180" : ""}`} style={{ color: "#AAAAAA" }} />
              </div>
            </button>
            {openCountry && (
              <div className="mt-1 overflow-y-auto" style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #ECECEC", maxHeight: "220px", boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
                {africanCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCountry(c.code); setOpenCountry(false) }}
                    className="w-full text-left px-4 py-2.5 transition-colors"
                    style={{
                      fontSize: "13px",
                      color: country === c.code ? "#D4372B" : "#0A0A0A",
                      background: country === c.code ? "#FFF0F0" : "transparent",
                      fontWeight: country === c.code ? 600 : 400,
                      ...poppins,
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── PANIER REMPLI ──────────────────────────────────── */}
          {cart.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">

              {/* Articles */}
              <div className="lg:col-span-2 space-y-3">
                {cart.map((item) => {
                  const isUpdating = updatingId === item.variantKey
                  const currentMode = item.shippingMode || defaultShippingMode
                  const minQty = item.minQuantity || getMinQuantity(item.price)
                  const isBelowMOQ = isProductBelowMOQ(item)

                  return (
                    <div
                      key={item.variantKey}
                      className="rounded-xl p-4 transition-opacity"
                      style={{
                        background: "#fff",
                        border: isBelowMOQ ? "1px solid #D4372B" : "0.5px solid #ECECEC",
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: "76px", height: "76px", background: "#FAFAFA", border: "0.5px solid #ECECEC" }}>
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name || "Produit"}
                            width={76}
                            height={76}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>

                        {/* Détails */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="line-clamp-2" style={{ fontSize: "13px", fontWeight: 600, color: "#0A0A0A", lineHeight: 1.4, ...poppins }}>
                              {truncateTitle(item.name || "Produit", 60)}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.variantKey!)}
                              className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors focus:outline-none"
                              style={{ background: "#F4F4F4" }}
                            >
                              <X className="w-3.5 h-3.5" style={{ color: "#AAAAAA" }} />
                            </button>
                          </div>

                          {/* Variantes pills */}
                          {(item.color || item.eurSize) && (
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {item.color && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "#F4F4F4", color: "#555", ...poppins }}>
                                  {item.color}
                                </span>
                              )}
                              {item.eurSize && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "#F4F4F4", color: "#555", ...poppins }}>
                                  Pointure {item.eurSize}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Prix unitaire */}
                          <p className="mt-1.5" style={{ fontSize: "14px", fontWeight: 700, color: "#D4372B", ...poppins }}>
                            {formatPrice(item.price)}
                          </p>

                          {/* ⚠️ ALERTE MOQ (total produit, toutes variantes confondues) */}
                          {isBelowMOQ && (
                            <div className="mt-1.5 px-2 py-1 rounded-lg inline-flex items-center gap-1.5" style={{ background: "#FFF0F0", border: "0.5px solid #D4372B" }}>
                              <span style={{ fontSize: "9px", fontWeight: 700, color: "#D4372B", ...poppins }}>
                                ⚠️ MOQ: {minQty} min (total produit)
                              </span>
                            </div>
                          )}

                          {/* Modes livraison */}
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <span style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>Livraison :</span>
                            {shippingModes.map(({ id, icon: Icon, label, title }) => {
                              const active = currentMode === id
                              return (
                                <button
                                  key={id}
                                  onClick={() => handleShippingModeChange(item.variantKey!, id)}
                                  title={title}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-[10px] font-semibold focus:outline-none"
                                  style={{
                                    background: active ? "#D4372B" : "#F4F4F4",
                                    color: active ? "#fff" : "#555",
                                    ...poppins,
                                  }}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span className="hidden sm:inline">{label}</span>
                                </button>
                              )
                            })}
                          </div>

                          {/* Quantité + sous-total ligne */}
                          <div className="flex items-center justify-between mt-3">
                            {/* Stepper quantité */}
                            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: isBelowMOQ ? "1px solid #D4372B" : "0.5px solid #ECECEC" }}>
                              <button
                                onClick={() => updateQuantity(item.variantKey!, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="flex items-center justify-center w-8 h-8 transition-colors focus:outline-none disabled:opacity-40"
                                style={{ background: "#F4F4F4" }}
                              >
                                <Minus className="w-3.5 h-3.5" style={{ color: "#0A0A0A" }} />
                              </button>
                              <span className="w-10 text-center text-sm font-semibold" style={{ color: isBelowMOQ ? "#D4372B" : "#0A0A0A", ...poppins }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.variantKey!, item.quantity + 1)}
                                className="flex items-center justify-center w-8 h-8 transition-colors focus:outline-none"
                                style={{ background: "#F4F4F4" }}
                              >
                                <Plus className="w-3.5 h-3.5" style={{ color: "#0A0A0A" }} />
                              </button>
                            </div>

                            {/* Total ligne */}
                            <div className="text-right">
                              <p style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", ...poppins }}>
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              {item.shippingCostUSD ? (
                                <p style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>
                                  + {formatPrice(item.shippingCostUSD)} livraison
                                </p>
                              ) : null}
                              {item.portePorteCostUSD ? (
                                <p style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>
                                  + {formatPrice(item.portePorteCostUSD)} porte-à-porte
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── RÉSUMÉ ────────────────────────────────────── */}
              <div className="h-fit rounded-xl p-5 sticky top-20" style={{ background: "#fff", border: "0.5px solid #ECECEC" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: "16px", ...poppins }}>
                  Résumé
                </h2>

                {/* Pays desktop */}
                <div className="hidden lg:block mb-4">
                  <label style={{ fontSize: "11px", color: "#AAAAAA", ...poppins }}>Pays de livraison</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: "#F4F4F4", borderRadius: "10px", border: "none", color: "#0A0A0A", ...poppins }}
                  >
                    {africanCountries.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Lignes coûts */}
                <div className="space-y-2.5" style={{ borderTop: "0.5px solid #F0F0F0", paddingTop: "16px" }}>
                  {[
                    { label: "Sous-total",    value: totalUSD },
                    { label: "Livraison",     value: totalShippingUSD },
                    { label: "Porte-à-porte", value: totalPortePorteUSD },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span style={{ fontSize: "13px", color: "#AAAAAA", ...poppins }}>{label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0A0A", ...poppins }}>{formatPrice(value)}</span>
                    </div>
                  ))}

                  {totalWeight > 0 && (
                    <div className="flex justify-between">
                      <span style={{ fontSize: "11px", color: "#AAAAAA", ...poppins }}>Poids total</span>
                      <span style={{ fontSize: "11px", color: "#AAAAAA", ...poppins }}>{totalWeight.toFixed(2)} kg</span>
                    </div>
                  )}

                  {/* Total */}
                  <div
                    className="flex justify-between pt-3"
                    style={{ borderTop: "0.5px solid #F0F0F0", marginTop: "4px" }}
                  >
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#0A0A0A", ...poppins }}>Total</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#D4372B", ...poppins }}>
                      {formatPrice(grandTotalUSD)}
                    </span>
                  </div>

                  {/* Récap articles */}
                  <div className="rounded-xl p-3 mt-2" style={{ background: "#FAFAFA", border: "0.5px solid #ECECEC" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#0A0A0A", marginBottom: "8px", ...poppins }}>
                      Récapitulatif
                    </p>
                    {cart.map((item) => {
                      const minQty = item.minQuantity || getMinQuantity(item.price);
                      const isBelowMOQ = isProductBelowMOQ(item);
                      return (
                        <div key={item.variantKey} className="flex justify-between py-1">
                          <span className="truncate" style={{ fontSize: "10px", color: isBelowMOQ ? "#D4372B" : "#AAAAAA", maxWidth: "160px", ...poppins }}>
                            {truncateTitle(item.name || "Produit", 35)}
                            {item.color && ` - ${item.color}`}
                            {item.eurSize && ` (${item.eurSize})`}
                            <span style={{ color: isBelowMOQ ? "#D4372B" : "#AAAAAA", marginLeft: "3px" }}>x{item.quantity}</span>
                            {isBelowMOQ && (
                              <span style={{ color: "#D4372B", fontSize: "8px", marginLeft: "4px" }}>⚠️ MOQ</span>
                            )}
                          </span>
                          <span style={{ fontSize: "10px", fontWeight: 600, color: "#0A0A0A", ...poppins }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* CTA Commander avec vérification MOQ globale */}
                <button
                  onClick={handleCheckout}
                  className="block w-full mt-5 text-center py-3.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#D4372B", fontSize: "14px", ...poppins }}
                >
                  Commander · {formatPrice(grandTotalUSD)}
                </button>

                <p className="text-center mt-3" style={{ fontSize: "11px", color: "#AAAAAA", ...poppins }}>
                  Tous les prix en {getCurrencySymbol()}
                </p>
              </div>
            </div>

          ) : (
            // ── PANIER VIDE ──────────────────────────────────
            <div
              className="flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{ background: "#fff", border: "0.5px solid #ECECEC" }}
            >
              <div
                className="flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
                style={{ background: "#FFF0F0" }}
              >
                <ShoppingCart className="w-9 h-9" style={{ color: "#D4372B" }} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: "8px", ...poppins }}>
                Votre panier est vide
              </h2>
              <p style={{ fontSize: "13px", color: "#AAAAAA", marginBottom: "24px", ...poppins }}>
                Ajoutez des produits pour commencer vos achats
              </p>
              <Link
                href="/"
                className="px-8 py-3 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "#D4372B", ...poppins }}
              >
                Continuer mes achats
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  )
}