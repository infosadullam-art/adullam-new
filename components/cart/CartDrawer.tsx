// components/cart/CartDrawer.tsx

import { X, Minus, Plus, Ship, Sparkles, Zap, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useLocale } from "@/context/LocaleProvider"
import { useState } from "react"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const poppins = { fontFamily: "'Poppins', sans-serif" }

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
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "0.5px solid #ECECEC" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "#D4372B" }}
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.02em", ...poppins }}>
                Panier
              </span>
              <span style={{ fontSize: "12px", color: "#AAAAAA", marginLeft: "6px", ...poppins }}>
                {totalItems} article{totalItems > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none"
            style={{ background: "#F4F4F4" }}
          >
            <X className="w-4 h-4" style={{ color: "#0A0A0A" }} />
          </button>
        </div>

        {/* ── ARTICLES ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ background: "#FFF0F0" }}
              >
                <ShoppingCart className="w-7 h-7" style={{ color: "#D4372B" }} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0A0A0A", marginBottom: "4px", ...poppins }}>
                Votre panier est vide
              </p>
              <p style={{ fontSize: "12px", color: "#AAAAAA", marginBottom: "20px", ...poppins }}>
                Ajoutez des produits pour commencer
              </p>
              <button
                onClick={onClose}
                className="text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: "#D4372B", ...poppins }}
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
                  className="rounded-xl p-3 transition-opacity"
                  style={{
                    background: "#fff",
                    border: "0.5px solid #ECECEC",
                    opacity: isUpdating ? 0.5 : 1,
                  }}
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <div
                      className="flex-shrink-0 rounded-xl overflow-hidden"
                      style={{ width: "68px", height: "68px", background: "#FAFAFA", border: "0.5px solid #ECECEC" }}
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
                        <h3
                          className="truncate"
                          style={{ fontSize: "12px", fontWeight: 600, color: "#0A0A0A", ...poppins }}
                        >
                          {item.name || "Produit"}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.variantKey!)}
                          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg focus:outline-none transition-colors"
                          style={{ background: "#F4F4F4" }}
                        >
                          <X className="w-3 h-3" style={{ color: "#AAAAAA" }} />
                        </button>
                      </div>

                      {/* Variantes */}
                      {(item.color || item.eurSize) && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.color && (
                            <span
                              className="px-1.5 py-0.5 rounded-full"
                              style={{ fontSize: "9px", background: "#F4F4F4", color: "#555", ...poppins }}
                            >
                              {item.color}
                            </span>
                          )}
                          {item.eurSize && (
                            <span
                              className="px-1.5 py-0.5 rounded-full"
                              style={{ fontSize: "9px", background: "#F4F4F4", color: "#555", ...poppins }}
                            >
                              Pt. {item.eurSize}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Prix unitaire */}
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#D4372B", marginTop: "4px", ...poppins }}>
                        {formatPrice(item.price)}
                        <span style={{ fontSize: "10px", fontWeight: 400, color: "#AAAAAA", marginLeft: "4px" }}>
                          × {item.quantity}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Modes livraison */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <span style={{ fontSize: "9px", color: "#AAAAAA", ...poppins }}>Livraison :</span>
                    {shippingModes.map(({ id, icon: Icon, label, title }) => {
                      const active = currentMode === id
                      return (
                        <button
                          key={id}
                          onClick={() => handleShippingModeChange(item.variantKey!, id)}
                          title={title}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all focus:outline-none"
                          style={{
                            background: active ? "#D4372B" : "#F4F4F4",
                            color: active ? "#fff" : "#555",
                            ...poppins,
                          }}
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
                    <div
                      className="flex items-center rounded-xl overflow-hidden"
                      style={{ border: "0.5px solid #ECECEC" }}
                    >
                      <button
                        onClick={() => updateQuantity(item.variantKey!, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex items-center justify-center w-7 h-7 transition-colors focus:outline-none disabled:opacity-40"
                        style={{ background: "#F4F4F4" }}
                      >
                        <Minus className="w-3 h-3" style={{ color: "#0A0A0A" }} />
                      </button>
                      <span
                        className="w-8 text-center"
                        style={{ fontSize: "12px", fontWeight: 600, color: "#0A0A0A", ...poppins }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantKey!, item.quantity + 1)}
                        className="flex items-center justify-center w-7 h-7 transition-colors focus:outline-none"
                        style={{ background: "#F4F4F4" }}
                      >
                        <Plus className="w-3 h-3" style={{ color: "#0A0A0A" }} />
                      </button>
                    </div>

                    {/* Total ligne */}
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", ...poppins }}>
                      {formatPrice(itemTotalUSD)}
                    </span>
                  </div>

                  {/* Détail coûts */}
                  {(item.shippingCostUSD || item.portePorteCostUSD) ? (
                    <div
                      className="mt-2 rounded-lg px-2.5 py-2 space-y-1"
                      style={{ background: "#FAFAFA", border: "0.5px solid #F0F0F0" }}
                    >
                      <div className="flex justify-between">
                        <span style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>Sous-total</span>
                        <span style={{ fontSize: "10px", fontWeight: 500, color: "#0A0A0A", ...poppins }}>{formatPrice(productSubtotalUSD)}</span>
                      </div>
                      {item.shippingCostUSD ? (
                        <div className="flex justify-between">
                          <span style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>Livraison</span>
                          <span style={{ fontSize: "10px", fontWeight: 500, color: "#0A0A0A", ...poppins }}>{formatPrice(item.shippingCostUSD)}</span>
                        </div>
                      ) : null}
                      {item.portePorteCostUSD ? (
                        <div className="flex justify-between">
                          <span style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>Porte-à-porte</span>
                          <span style={{ fontSize: "10px", fontWeight: 500, color: "#0A0A0A", ...poppins }}>{formatPrice(item.portePorteCostUSD)}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {item.totalWeight ? (
                    <p
                      className="text-right mt-1"
                      style={{ fontSize: "9px", color: "#AAAAAA", ...poppins }}
                    >
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
          <div
            className="flex-shrink-0 px-5 pt-4 pb-5"
            style={{ borderTop: "0.5px solid #ECECEC", background: "#fff" }}
          >
            {/* Lignes coûts */}
            <div className="space-y-2 mb-3">
              {[
                { label: "Sous-total",    value: totalUSD },
                { label: "Livraison",     value: totalShippingUSD },
                { label: "Porte-à-porte", value: totalPortePorteUSD },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span style={{ fontSize: "12px", color: "#AAAAAA", ...poppins }}>{label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#0A0A0A", ...poppins }}>{formatPrice(value)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span style={{ fontSize: "11px", color: "#AAAAAA", ...poppins }}>Poids total</span>
                <span style={{ fontSize: "11px", color: "#AAAAAA", ...poppins }}>{totalWeight.toFixed(2)} kg</span>
              </div>
            </div>

            {/* Total */}
            <div
              className="flex justify-between py-3"
              style={{ borderTop: "0.5px solid #F0F0F0", marginBottom: "14px" }}
            >
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#0A0A0A", ...poppins }}>Total</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#D4372B", ...poppins }}>
                {formatPrice(grandTotalUSD)}
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => { onClose(); window.location.href = "/checkout" }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none"
              style={{ background: "#D4372B", ...poppins }}
            >
              Commander · {formatPrice(grandTotalUSD)}
            </button>

            <p className="text-center mt-2.5" style={{ fontSize: "10px", color: "#AAAAAA", ...poppins }}>
              Tous les prix en {getCurrencySymbol()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}