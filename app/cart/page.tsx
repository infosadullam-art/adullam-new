"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { useCart } from "@/context/CartContext"
import { useLocale } from "@/context/LocaleProvider"
import { getAfricanCountries, getCountryName } from "@/lib/country-config"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-hot-toast"

// ════════════════════════════════════════════════════════════
// ICÔNES — mêmes dessins maison que le reste du site (trait 1.6,
// jonctions arrondies), noms identiques aux imports lucide d'origine.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; style?: React.CSSProperties }

function ShoppingCart({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M7.2 8.2h9.6l.9 11.3a1.6 1.6 0 0 1-1.6 1.7H7.9a1.6 1.6 0 0 1-1.6-1.7l.9-11.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8.2V6.6a3 3 0 0 1 6 0v1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function X({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Minus({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function Plus({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRight({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDown({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M6 9.5l6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Ship({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4 14.5l1.4 4.4c.2.7.9 1.1 1.6 1.1h10c.7 0 1.4-.4 1.6-1.1l1.4-4.4H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 14.5V6.8h6.7l3.3 3.4v4.3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 6.8V4.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Sparkles({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 3.5c.5 3.2 1.3 4 4.5 4.5-3.2.5-4 1.3-4.5 4.5-.5-3.2-1.3-4-4.5-4.5 3.2-.5 4-1.3 4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M18.3 14.5c.3 1.5.6 1.9 2.1 2.2-1.5.3-1.8.7-2.1 2.2-.3-1.5-.6-1.9-2.1-2.2 1.5-.3 1.8-.7 2.1-2.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function Zap({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12.8 3.5 6 13.2h4.6L10.6 20.5 18 10.3h-4.7L12.8 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Shield({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 3.6 19 6.4v5.3c0 4.4-3 7.4-7 8.7-4-1.3-7-4.3-7-8.7V6.4L12 3.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Truck({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M3.5 7h9.5v9H3.5V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 10h3.6L20 13.2V16h-7v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function Check({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Lock({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

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
  const t = useTranslations("cart")
  const {
    cart, removeFromCart, updateQuantity, updateShippingMode,
    totalUSD, totalItems, totalShippingUSD, totalPortePorteUSD,
    grandTotalUSD, shippingMode: defaultShippingMode, setShippingMode: setDefaultShippingMode
  } = useCart()

  const { country, setCountry, currency, language } = useLocale()
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const [openCountry, setOpenCountry] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Pays de livraison : tous les pays africains de lib/country-config.ts (source unique).
  // Noms des pays dans la langue de l'interface.
  // La détection du pays est faite côté serveur (proxy.ts) : plus d'appel à ipapi.co ici.
  const africanCountries = getAfricanCountries(language)
  // Si le pays courant n'est pas dans la liste (ex. visiteur US), on l'ajoute pour que le
  // sélecteur reflète l'état réel au lieu d'afficher un nom vide ou le premier pays.
  const countryOptions = africanCountries.some((c) => c.code === country)
    ? africanCountries
    : [{ code: country, name: getCountryName(country, language) }, ...africanCountries]

  const shippingModes = [
    { id: "bateau",  icon: Ship,     label: t("shipSeaShort"),  title: t("shipSeaTitle", { range: "35-50" }) },
    { id: "avion",   icon: Sparkles, label: t("shipAirShort"),  title: t("shipAirTitle", { range: "15-20" }) },
    { id: "express", icon: Zap,      label: t("shipExpress"),   title: t("shipExpressTitle", { range: "7-10" }) },
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
    if (!title) return t("productFallback")
    return title.length <= max ? title : title.substring(0, max) + "..."
  }

  // ✅ VÉRIFICATION MOQ GLOBALE (par produit, toutes variantes confondues)
  const handleCheckout = () => {
    // ✅ Vérifier MOQ global par produit (toutes variantes confondues)
    const productTotals = new Map<string, { total: number; name: string; minQty: number }>();
    
    cart.forEach(item => {
      const minQty = item.minQuantity || getMinQuantity(item.price);
      if (!productTotals.has(item.id)) {
        productTotals.set(item.id, { total: 0, name: item.name || t("productFallback"), minQty });
      }
      productTotals.get(item.id)!.total += item.quantity;
    });

    const invalidProducts = Array.from(productTotals.entries())
      .filter(([_, data]) => data.total < data.minQty)
      .map(([id, data]) => data.name);

    if (invalidProducts.length > 0) {
      toast.error(t("minQtyNotMet", { products: invalidProducts.join(", ") }), {
        duration: 5000,
        position: "top-center",
      });
      return;
    }

    // ✅ Tout est bon, on va au checkout
    window.location.href = "/checkout";
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="pb-20 lg:pb-10">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 lg:py-8">

          {/* Breadcrumb desktop */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs mb-6 text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">{t("home")}</Link>
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            <span className="font-medium text-foreground">{t("cart")}</span>
          </div>

          {/* Titre */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-[-0.02em] text-foreground">
              {t("cart")}
              <span className="text-sm font-medium text-muted-foreground ms-2">
                ({t("itemsCount", { count: totalItems })})
              </span>
            </h1>
          </div>

          {/* Sélecteur pays mobile */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setOpenCountry(!openCountry)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-background shadow-xs transition-colors focus:outline-none"
            >
              <span className="text-sm font-medium text-foreground">{t("deliveryCountry")}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-accent">
                  {countryOptions.find(c => c.code === country)?.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openCountry ? "rotate-180" : ""}`} />
              </div>
            </button>
            {openCountry && (
              <div className="mt-1 overflow-y-auto rounded-lg bg-popover shadow-lg" style={{ maxHeight: "220px" }}>
                {countryOptions.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCountry(c.code); setOpenCountry(false) }}
                    className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${
                      country === c.code ? "bg-accent-light font-semibold text-accent" : "text-foreground hover:bg-muted"
                    }`}
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
                      className="rounded-lg p-4 bg-background transition-opacity shadow-xs"
                      style={{
                        boxShadow: isBelowMOQ ? "var(--shadow-accent)" : undefined,
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="flex-shrink-0 rounded-lg overflow-hidden bg-surface" style={{ width: "76px", height: "76px" }}>
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name || t("productFallback")}
                            width={76}
                            height={76}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>

                        {/* Détails */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                              {truncateTitle(item.name || t("productFallback"), 60)}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.variantKey!)}
                              className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-muted transition-colors hover:bg-surface-sunken focus:outline-none"
                            >
                              <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>

                          {/* Variantes pills */}
                          {(item.color || item.eurSize) && (
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {item.color && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                                  {item.color}
                                </span>
                              )}
                              {item.eurSize && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                                  {t("shoeSize", { size: item.eurSize })}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Prix unitaire */}
                          <p className="mt-1.5 text-sm font-bold text-accent">
                            {formatPrice(item.price)}
                          </p>

                          {/* ⚠️ ALERTE MOQ (total produit, toutes variantes confondues) */}
                          {isBelowMOQ && (
                            <div className="mt-1.5 px-2 py-1 rounded-md inline-flex items-center gap-1.5 bg-accent-light">
                              <span className="text-[9px] font-bold text-accent">
                                {t("moqBadge", { min: minQty })}
                              </span>
                            </div>
                          )}

                          {/* Modes livraison */}
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <span className="text-[10px] text-muted-foreground">{t("shippingLabel")}</span>
                            {shippingModes.map(({ id, icon: Icon, label, title }) => {
                              const active = currentMode === id
                              return (
                                <button
                                  key={id}
                                  onClick={() => handleShippingModeChange(item.variantKey!, id)}
                                  title={title}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all text-[10px] font-semibold focus:outline-none ${
                                    active ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-surface-sunken"
                                  }`}
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
                            <div
                              className="flex items-center rounded-lg overflow-hidden shadow-xs"
                              style={{ boxShadow: isBelowMOQ ? "var(--shadow-accent)" : undefined }}
                            >
                              <button
                                onClick={() => updateQuantity(item.variantKey!, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="flex items-center justify-center w-8 h-8 bg-muted transition-colors hover:bg-surface-sunken focus:outline-none disabled:opacity-40"
                              >
                                <Minus className="w-3.5 h-3.5 text-foreground" />
                              </button>
                              <span className={`w-10 text-center text-sm font-semibold ${isBelowMOQ ? "text-accent" : "text-foreground"}`}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.variantKey!, item.quantity + 1)}
                                className="flex items-center justify-center w-8 h-8 bg-muted transition-colors hover:bg-surface-sunken focus:outline-none"
                              >
                                <Plus className="w-3.5 h-3.5 text-foreground" />
                              </button>
                            </div>

                            {/* Total ligne */}
                            <div className="text-end">
                              <p className="text-sm font-bold text-foreground">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              {item.shippingCostUSD ? (
                                <p className="text-[10px] text-muted-foreground">
                                  {t("plusShipping", { price: formatPrice(item.shippingCostUSD) })}
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
              <div className="h-fit rounded-lg p-5 sticky top-20 bg-background shadow-xs">
                <h2 className="text-base font-extrabold tracking-[-0.02em] text-foreground mb-4">
                  {t("summary")}
                </h2>

                {/* Pays desktop */}
                <div className="hidden lg:block mb-4">
                  <label className="text-[11px] text-muted-foreground">{t("deliveryCountry")}</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg bg-muted text-foreground focus:outline-none"
                  >
                    {countryOptions.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Lignes coûts */}
                <div className="space-y-2.5 pt-4 border-t border-border">
                  {[
                    { label: t("subtotal"),    value: totalUSD },
                    { label: t("shipping"),     value: totalShippingUSD },
                    { label: t("doorToDoor"), value: totalPortePorteUSD },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[13px] text-muted-foreground">{label}</span>
                      <span className="text-[13px] font-medium text-foreground">{formatPrice(value)}</span>
                    </div>
                  ))}

                  {totalWeight > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[11px] text-muted-foreground">{t("totalWeight")}</span>
                      <span className="text-[11px] text-muted-foreground">{totalWeight.toFixed(2)} kg</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between pt-3 mt-1 border-t border-border">
                    <span className="text-[15px] font-extrabold text-foreground">{t("total")}</span>
                    <span className="text-base font-extrabold text-accent">
                      {formatPrice(grandTotalUSD)}
                    </span>
                  </div>

                  {/* Récap articles */}
                  <div className="rounded-lg p-3 mt-2 bg-surface">
                    <p className="text-[11px] font-bold text-foreground mb-2">
                      {t("recap")}
                    </p>
                    {cart.map((item) => {
                      const minQty = item.minQuantity || getMinQuantity(item.price);
                      const isBelowMOQ = isProductBelowMOQ(item);
                      return (
                        <div key={item.variantKey} className="flex justify-between py-1">
                          <span className={`truncate text-[10px] ${isBelowMOQ ? "text-accent" : "text-muted-foreground"}`} style={{ maxWidth: "160px" }}>
                            {truncateTitle(item.name || t("productFallback"), 35)}
                            {item.color && ` - ${item.color}`}
                            {item.eurSize && ` (${item.eurSize})`}
                            <span className="ms-1">x{item.quantity}</span>
                            {isBelowMOQ && (
                              <span className="ms-1 text-[8px] font-bold text-accent">MOQ</span>
                            )}
                          </span>
                          <span className="text-[10px] font-semibold text-foreground">
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
                  className="block w-full mt-5 text-center py-3.5 rounded-lg font-bold text-sm text-white bg-accent transition-all hover:bg-accent-hover active:scale-[0.98]"
                >
                  {t("checkout", { price: formatPrice(grandTotalUSD) })}
                </button>

                {/* Réassurance — mêmes engagements que la fiche produit et le checkout */}
                <div className="rounded-lg p-3 bg-muted shadow-xs space-y-2 mt-3">
                  {[
                    { icon: Check, text: t("trustDirect") },
                    { icon: Check, text: t("trustAllIncluded") },
                    { icon: Shield, text: t("trustRefund") },
                    { icon: Lock, text: t("trustPayment") },
                  ].map(({ icon: BulletIcon, text }) => (
                    <div key={text} className="flex items-start gap-2">
                      <BulletIcon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      <span className="text-xs text-foreground">{text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center mt-3 text-[11px] text-muted-foreground">
                  {t("allPricesIn", { currency: getCurrencySymbol() })}
                </p>
              </div>
            </div>

          ) : (
            // ── PANIER VIDE ──────────────────────────────────
            <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-background shadow-xs">
              <div className="flex items-center justify-center w-20 h-20 rounded-xl mb-5 bg-accent-light">
                <ShoppingCart className="w-9 h-9 text-accent" />
              </div>
              <h2 className="text-lg font-extrabold tracking-[-0.02em] text-foreground mb-2">
                {t("emptyTitle")}
              </h2>
              <p className="text-[13px] text-muted-foreground mb-6">
                {t("emptyText")}
              </p>
              <Link
                href="/"
                className="px-8 py-3 text-sm font-bold text-white rounded-lg bg-accent transition-colors hover:bg-accent-hover"
              >
                {t("continueShopping")}
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