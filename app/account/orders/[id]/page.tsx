"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/admin/auth-context"
import { ordersApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// ════════════════════════════════════════════════════════════
// ICÔNES — même trait que le reste du site (stroke 1.6, jonctions
// arrondies, viewBox 0 0 24 24). Fichier autonome : on redessine
// localement les icônes déjà utilisées ailleurs pour ne dépendre
// d'aucun import partagé.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; style?: React.CSSProperties }

function ArrowLeft({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckCircle({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.7 12.3l2.1 2.1 4.3-4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XCircle({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Package({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M3.6 8.4L12 4l8.4 4.4v7.2L12 20l-8.4-4.4V8.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.6 8.4L12 12.6l8.4-4.2M12 12.6V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Truck({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M3 7.5h10.5v8H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13.5 10.2h3.3l3.2 3v2.3h-6.5v-5.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7.2" cy="17.3" r="1.7" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.8" cy="17.3" r="1.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function Ship({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4 14.5h16l-1.8 4.2a2 2 0 0 1-1.85 1.3H7.65a2 2 0 0 1-1.85-1.3L4 14.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 14.5V9.2h10v5.3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9.2V4.5M9.5 6.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Home({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4.5 11.2 12 4.6l7.5 6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.8V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function MapPin({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 21.5s-7-6.3-7-11.7a7 7 0 1 1 14 0c0 5.4-7 11.7-7 11.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function HelpCircle({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.6 9.4a2.4 2.4 0 0 1 4.65.8c0 1.6-2.05 1.8-2.05 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.15" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ShoppingBag({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M7 8h10l1 12.5a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 20.5L7 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Copy({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 15V6.3a1.8 1.8 0 0 1 1.8-1.8H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════
// STATUTS — labels/couleurs alignés sur app/account/page.tsx
// ════════════════════════════════════════════════════════════
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Paiement en attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  IN_TRANSIT: "En transit",
  OUT_FOR_DELIVERY: "En cours de livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  IN_TRANSIT: "bg-sky-50 text-sky-700",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-700",
}

// Étapes affichées dans la timeline de suivi — reflète l'enum OrderStatus
// de prisma/schema.prisma. PENDING précède l'étape "Confirmée" (paiement pas
// encore validé) ; CANCELLED et REFUNDED sont traités à part, en bannière,
// plutôt que comme des étapes de la timeline.
const TRACKING_STEPS = [
  { key: "CONFIRMED", label: "Commande confirmée", desc: "Votre paiement est validé et la commande est enregistrée", icon: CheckCircle },
  { key: "PROCESSING", label: "En préparation", desc: "Votre colis est préparé dans notre entrepôt", icon: Package },
  { key: "SHIPPED", label: "Expédiée", desc: "Votre colis a quitté l'entrepôt fournisseur", icon: Truck },
  { key: "IN_TRANSIT", label: "En transit", desc: "Votre colis est en acheminement international", icon: Ship },
  { key: "OUT_FOR_DELIVERY", label: "En cours de livraison", desc: "Votre colis est en tournée de livraison locale", icon: MapPin },
  { key: "DELIVERED", label: "Livrée", desc: "Votre colis est arrivé à destination", icon: Home },
]

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function OrderTrackingPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = (params?.id as string) || ""
  const { user, isLoading: authLoading } = useAuth()
  const { formatPrice } = useCurrencyFormatter()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Déclenche l'animation de la timeline après le premier rendu
  // (sinon React peint directement l'état final, sans transition CSS à jouer)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/account?mode=login")
      return
    }
    if (!orderId) return
    fetchOrder()
  }, [user, authLoading, orderId])

  const fetchOrder = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await ordersApi.get(orderId)
      if (response?.success && response.data) {
        setOrder(response.data)
      } else {
        setError("Commande introuvable")
      }
    } catch (err) {
      console.error("Erreur chargement commande:", err)
      setError("Impossible de charger cette commande")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyTracking = () => {
    if (!order?.trackingNumber) return
    navigator.clipboard.writeText(order.trackingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isCancelled = order?.status === "CANCELLED"
  const isRefunded = order?.status === "REFUNDED"
  const isPending = order?.status === "PENDING"
  const showTracker = !isCancelled && !isRefunded
  const currentStepIndex = order ? TRACKING_STEPS.findIndex((s) => s.key === order.status) : -1
  const items = order?.items || []
  const shippingInfo = order?.shippingInfo || {}

  // ============================================================
  // ÉTATS DE CHARGEMENT / ERREUR
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--accent)" }}></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--surface)" }}>
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--border-strong)" }} />
          <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>{error || "Commande introuvable"}</p>
          <button
            onClick={() => router.push("/account")}
            className="px-4 py-1.5 text-white text-sm rounded-md transition-transform duration-150 active:scale-95"
            style={{ background: "var(--accent)" }}
          >
            Retour à mes commandes
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // PAGE
  // ============================================================
  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <header className="sticky top-0 z-10" style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/account")}
            className="p-1.5 -ml-1.5 rounded-md transition-transform duration-150 active:scale-90"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--foreground)" }} />
          </button>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Suivi de commande</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              #{order.orderNumber} · {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {isCancelled && (
          <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EF44441A" }}>
              <XCircle className="w-5 h-5" style={{ color: "#EF4444" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Commande annulée</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {order.cancellationReason || "Cette commande a été annulée. Un paiement déjà effectué est remboursé automatiquement."}
              </p>
              {order.cancelledAt && (
                <p className="text-[10px] mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                  Le {new Date(order.cancelledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        )}

        {isRefunded && (
          <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#64748B1A" }}>
              <CheckCircle className="w-5 h-5" style={{ color: "#64748B" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Commande remboursée</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Le montant de cette commande a été remboursé.
              </p>
            </div>
          </div>
        )}

        {showTracker && (
          <div className="rounded-lg border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Statut de la livraison</h2>

            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-700"}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
              {order.estimatedDelivery && (
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Livraison estimée : {new Date(order.estimatedDelivery).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </span>
              )}
            </div>

            {isPending && (
              <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                Le suivi démarre dès que le paiement est confirmé.
              </p>
            )}

            {order.trackingNumber && (
              <button
                onClick={handleCopyTracking}
                className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors"
                style={{ background: "var(--surface)" }}
              >
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  N° de suivi : <span className="font-mono" style={{ color: "var(--foreground)" }}>{order.trackingNumber}</span>
                </span>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
                  {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copié" : "Copier"}
                </span>
              </button>
            )}

            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center text-xs font-medium py-2 rounded-md transition-colors"
                style={{ background: "var(--surface)", color: "var(--accent)" }}
              >
                Suivi en temps réel chez le transporteur
              </a>
            )}

            {/* ── Timeline animée ── */}
            <div className="mt-6">
              {TRACKING_STEPS.map((step, i) => {
                const reached = currentStepIndex >= i
                const isCurrent = currentStepIndex === i
                const lineFilled = currentStepIndex > i
                const isLast = i === TRACKING_STEPS.length - 1
                const StepIcon = step.icon
                const stepDate = step.key === "DELIVERED" && order.deliveredAt
                  ? new Date(order.deliveredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  : null

                return (
                  <div key={step.key} className="relative flex gap-3 pb-7 last:pb-0">
                    {!isLast && (
                      <div
                        className="absolute left-[15px] top-8 w-[2px]"
                        style={{ height: "calc(100% - 1.5rem)", background: "var(--border)" }}
                      >
                        <div
                          className="w-full transition-all ease-out"
                          style={{
                            height: mounted && lineFilled ? "100%" : "0%",
                            background: "var(--accent)",
                            transitionDuration: "600ms",
                            transitionDelay: `${i * 150}ms`,
                          }}
                        />
                      </div>
                    )}

                    <div className="relative shrink-0">
                      {isCurrent && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{ background: "var(--accent)", opacity: 0.3 }}
                        />
                      )}
                      <div
                        className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all ease-out"
                        style={{
                          background: reached ? "var(--accent)" : "var(--card)",
                          border: reached ? "none" : "1.5px solid var(--border-strong)",
                          transitionDuration: "450ms",
                          transitionDelay: `${i * 150}ms`,
                          transform: mounted ? "scale(1)" : "scale(0.55)",
                          opacity: mounted ? 1 : 0,
                        }}
                      >
                        <StepIcon className="w-4 h-4" style={{ color: reached ? "white" : "var(--muted-foreground)" }} />
                      </div>
                    </div>

                    <div className="pt-1">
                      <p className="text-sm font-medium" style={{ color: reached ? "var(--foreground)" : "var(--muted-foreground)" }}>
                        {step.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {isCurrent ? step.desc : reached ? "Terminé" : ""}
                      </p>
                      {stepDate && (
                        <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>{stepDate}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="rounded-lg border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Articles ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item: any, idx: number) => (
                <div key={item.id || idx} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-md overflow-hidden flex items-center justify-center shrink-0" style={{ background: "var(--surface)" }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.productName || "Produit"} width={56} height={56} className="object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" style={{ color: "var(--border-strong)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{item.productName || "Produit"}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Qté {item.quantity || 1}{item.variantSummary ? ` · ${item.variantSummary}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold shrink-0" style={{ color: "var(--foreground)" }}>{formatPrice(item.totalPrice || 0)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Total</span>
              <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{formatPrice(order.total || 0)}</span>
            </div>
          </div>
        )}

        {shippingInfo.address && (
          <div className="rounded-lg border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Adresse de livraison</h2>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
              <div className="text-sm" style={{ color: "var(--foreground)" }}>
                <p className="font-medium">{[shippingInfo.firstName, shippingInfo.lastName].filter(Boolean).join(" ")}</p>
                <p style={{ color: "var(--muted-foreground)" }}>{shippingInfo.address}</p>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {shippingInfo.postalCode ? `${shippingInfo.postalCode} ` : ""}{shippingInfo.city}
                  {shippingInfo.country ? `, ${shippingInfo.country}` : ""}
                </p>
                {shippingInfo.phone && (
                  <p style={{ color: "var(--muted-foreground)" }}>{shippingInfo.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {order.paymentMethod && (
          <div className="rounded-lg border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Paiement</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "var(--muted-foreground)" }}>Méthode</span>
                <span className="font-medium capitalize" style={{ color: "var(--foreground)" }}>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "var(--muted-foreground)" }}>Statut</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    order.paymentStatus === "PAID" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus === "PAID" ? "Payé" : "Paiement en attente"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border p-5 flex items-center justify-between gap-3 flex-wrap" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Besoin d'aide avec cette commande ?</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Remboursée automatiquement en cas de non-livraison</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/account")}
            className="px-3 py-1.5 rounded-md text-xs shrink-0 transition-transform duration-150 active:scale-95"
            style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            Contacter
          </button>
        </div>
      </main>
    </div>
  )
}