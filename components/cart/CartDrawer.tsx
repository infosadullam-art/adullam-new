// components/cart/CartDrawer.tsx

import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useLocale } from "@/context/LocaleProvider"
import { useState, useEffect } from "react"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// ════════════════════════════════════════════════════════════
// ICÔNES — mêmes dessins maison que le reste du site (trait 1.6,
// jonctions arrondies), noms identiques aux imports lucide d'origine.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; style?: React.CSSProperties }

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

function ShoppingCart({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M7.2 8.2h9.6l.9 11.3a1.6 1.6 0 0 1-1.6 1.7H7.9a1.6 1.6 0 0 1-1.6-1.7l.9-11.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8.2V6.6a3 3 0 0 1 6 0v1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const shippingModes = [
  { id: "bateau",  icon: Ship,     label: "Mer",    title: "Maritime (35-50j)" },
  { id: "avion",   icon: Sparkles, label: "Air",    title: "Aérien (15-20j)" },
  { id: "express", icon: Zap,      label: "Express",title: "Express (7-10j)" },
] as const

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cart, removeFromCart, updateQuantity, updateShippingMode,
    totalUSD, totalItems, totalShippingUSD, totalPortePorteUSD,
    grandTotalUSD, shippingMode: defaultShippingMode,
  } = useCart()

  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ✅ Empêche la page derrière de défiler quand le panier est ouvert —
  // avant ça, on avait deux barres de scroll actives en même temps
  // (celle du drawer et celle de la page principale).
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleShippingModeChange = async (variantKey: string, mode: "bateau" | "avion" | "express") => {
    setUpdatingId(variantKey)
    updateShippingMode(variantKey, mode)
    setTimeout(() => setUpdatingId(null), 300)
  }

  const totalWeight = cart.reduce((sum, item) => sum + (item.totalWeight || 0), 0)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 h-full flex flex-col"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--card)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-foreground" style={{ fontSize: "15px", letterSpacing: "-0.02em" }}>
                Panier
              </span>
              <span className="text-muted-foreground" style={{ fontSize: "12px", marginLeft: "6px" }}>
                {totalItems} article{totalItems > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-surface-sunken transition-colors focus:outline-none"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* ── ARTICLES ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-accent-light">
                <ShoppingCart className="w-7 h-7 text-accent" />
              </div>
              <p className="font-semibold text-foreground" style={{ fontSize: "14px", marginBottom: "4px" }}>
                Votre panier est vide
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "12px", marginBottom: "20px" }}>
                Ajoutez des produits pour commencer
              </p>
              <button
                onClick={onClose}
                className="text-sm font-semibold text-accent transition-opacity hover:opacity-70"
              >
                Continuer mes achats →
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const isUpdating = updatingId === item.variantKey
              const productSubtotalUSD = item.price * item.quantity
              const itemTotalUSD = productSubtotalUSD + (item.shippingCostUSD || 0) + (item.portePorteCostUSD || 0)
              const currentMode = item.shippingMode || defaultShippingMode

              return (
                <div
                  key={item.variantKey}
                  className="rounded-xl p-3 shadow-xs transition-opacity"
                  style={{
                    background: "var(--card)",
                    opacity: isUpdating ? 0.5 : 1,
                  }}
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <div
                      className="flex-shrink-0 rounded-xl overflow-hidden bg-surface"
                      style={{ width: "68px", height: "68px" }}
                    >
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name || "Produit"}
                        width={68}
                        height={68}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="truncate font-semibold text-foreground" style={{ fontSize: "12px" }}>
                          {item.name || "Produit"}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.variantKey!)}
                          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-muted hover:bg-surface-sunken focus:outline-none transition-colors"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>

                      {/* Variantes */}
                      {(item.color || item.eurSize) && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.color && (
                            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground" style={{ fontSize: "9px" }}>
                              {item.color}
                            </span>
                          )}
                          {item.eurSize && (
                            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground" style={{ fontSize: "9px" }}>
                              Pt. {item.eurSize}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Prix unitaire */}
                      <p className="font-bold text-accent" style={{ fontSize: "13px", marginTop: "4px" }}>
                        {formatPrice(item.price)}
                        <span className="text-muted-foreground font-normal" style={{ fontSize: "10px", marginLeft: "4px" }}>
                          × {item.quantity}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Modes livraison */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="text-muted-foreground" style={{ fontSize: "9px" }}>Livraison :</span>
                    {shippingModes.map(({ id, icon: Icon, label, title }) => {
                      const active = currentMode === id
                      return (
                        <button
                          key={id}
                          onClick={() => handleShippingModeChange(item.variantKey!, id)}
                          title={title}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all focus:outline-none ${
                            active ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-surface-sunken"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Quantité + sous-total */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="flex items-center rounded-xl overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.variantKey!, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex items-center justify-center w-7 h-7 bg-muted hover:bg-surface-sunken transition-colors focus:outline-none disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3 text-foreground" />
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground" style={{ fontSize: "12px" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantKey!, item.quantity + 1)}
                        className="flex items-center justify-center w-7 h-7 bg-muted hover:bg-surface-sunken transition-colors focus:outline-none"
                      >
                        <Plus className="w-3 h-3 text-foreground" />
                      </button>
                    </div>

                    {/* Total ligne */}
                    <span className="font-bold text-foreground" style={{ fontSize: "13px" }}>
                      {formatPrice(itemTotalUSD)}
                    </span>
                  </div>

                  {/* Détail coûts */}
                  {(item.shippingCostUSD || item.portePorteCostUSD) ? (
                    <div className="mt-2 rounded-lg px-2.5 py-2 space-y-1 bg-surface">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Sous-total</span>
                        <span className="font-medium text-foreground" style={{ fontSize: "10px" }}>{formatPrice(productSubtotalUSD)}</span>
                      </div>
                      {item.shippingCostUSD ? (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Livraison</span>
                          <span className="font-medium text-foreground" style={{ fontSize: "10px" }}>{formatPrice(item.shippingCostUSD)}</span>
                        </div>
                      ) : null}
                      {item.portePorteCostUSD ? (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Porte-à-porte</span>
                          <span className="font-medium text-foreground" style={{ fontSize: "10px" }}>{formatPrice(item.portePorteCostUSD)}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {item.totalWeight ? (
                    <p className="text-right mt-1 text-muted-foreground" style={{ fontSize: "9px" }}>
                      {item.totalWeight.toFixed(2)} kg
                    </p>
                  ) : null}
                </div>
              )
            })
          )}
        </div>

        {/* ── FOOTER RÉSUMÉ ───────────────────────────────────── */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 px-5 pt-4 pb-5 border-t border-border" style={{ background: "var(--card)" }}>
            {/* Lignes coûts */}
            <div className="space-y-2 mb-3">
              {[
                { label: "Sous-total",    value: totalUSD },
                { label: "Livraison",     value: totalShippingUSD },
                { label: "Porte-à-porte", value: totalPortePorteUSD },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{label}</span>
                  <span className="font-medium text-foreground" style={{ fontSize: "12px" }}>{formatPrice(value)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Poids total</span>
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{totalWeight.toFixed(2)} kg</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between py-3 border-t border-border" style={{ marginBottom: "14px" }}>
              <span className="font-extrabold text-foreground" style={{ fontSize: "15px" }}>Total</span>
              <span className="font-extrabold text-accent" style={{ fontSize: "16px" }}>
                {formatPrice(grandTotalUSD)}
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => { onClose(); window.location.href = "/checkout" }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-accent transition-opacity hover:opacity-90 focus:outline-none"
            >
              Commander · {formatPrice(grandTotalUSD)}
            </button>

            <p className="text-center mt-2.5 text-muted-foreground" style={{ fontSize: "10px" }}>
              Tous les prix en {getCurrencySymbol()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}