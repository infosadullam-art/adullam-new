"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"
import { 
  Package, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  MapPin,
  CreditCard,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter" // ✅ AJOUTÉ

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice } = useCurrencyFormatter() // ✅ AJOUTÉ
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/account?mode=login")
      return
    }
    if (params.id) {
      fetchOrder()
    }
  }, [user, params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data.data)
      } else {
        setError("Commande introuvable")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "DELIVERED": return <CheckCircle className="w-6 h-6 text-green-600" />
      case "CANCELLED": return <XCircle className="w-6 h-6 text-red-600" />
      case "SHIPPED": return <Truck className="w-6 h-6 text-blue-600" />
      default: return <Clock className="w-6 h-6 text-yellow-600" />
    }
  }

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      "PENDING": "En attente",
      "CONFIRMED": "Confirmée",
      "PROCESSING": "En cours",
      "SHIPPED": "Expédiée",
      "DELIVERED": "Livrée",
      "CANCELLED": "Annulée"
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      "PENDING": "bg-yellow-100 text-yellow-700",
      "CONFIRMED": "bg-blue-100 text-blue-700",
      "PROCESSING": "bg-purple-100 text-purple-700",
      "SHIPPED": "bg-indigo-100 text-indigo-700",
      "DELIVERED": "bg-green-100 text-green-700",
      "CANCELLED": "bg-red-100 text-red-700"
    }
    return colorMap[status] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72C1C]"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Commande introuvable</h2>
          <p className="text-gray-600 mb-6">{error || "Cette commande n'existe pas"}</p>
          <button
            onClick={() => router.push("/account/orders")}
            className="px-6 py-3 bg-[#C72C1C] text-white rounded-lg hover:bg-[#A21F18]"
          >
            Retour à mes commandes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Commande #{order.orderNumber}</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Statut */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(order.status)}
            <div>
              <h2 className="text-lg font-semibold">Statut de la commande</h2>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Infos livraison et paiement */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Adresse de livraison */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C72C1C]" />
              Adresse de livraison
            </h3>
            <div className="space-y-1 text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
              </p>
              <p>{order.shippingInfo?.address}</p>
              <p>{order.shippingInfo?.city}</p>
              <p>{order.shippingInfo?.phone}</p>
              <p>{order.shippingInfo?.email}</p>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#C72C1C]" />
              Paiement
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Méthode</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.paymentStatus === "PAID" 
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.paymentStatus === "PAID" ? "Payé" : "En attente"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">Articles commandés</h3>
          <div className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  {item.variantSummary && (
                    <p className="text-sm text-gray-500">{item.variantSummary}</p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Quantité: {item.quantity}</span>
                    {/* ✅ CORRIGÉ : Prix unitaire converti */}
                    <span className="font-semibold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Récapitulatif des prix */}
          <div className="mt-6 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                {/* ✅ CORRIGÉ */}
                <span>{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                {/* ✅ CORRIGÉ */}
                <span>{formatPrice(order.shippingCost || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Porte-à-porte</span>
                {/* ✅ CORRIGÉ */}
                <span>{formatPrice(order.portePorteTotal || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                {/* ✅ CORRIGÉ */}
                <span className="text-[#C72C1C]">{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton retour */}
        <div className="mt-6 text-center">
          <Link
            href="/account/orders"
            className="inline-block px-6 py-3 text-[#C72C1C] hover:underline"
          >
            ← Retour à mes commandes
          </Link>
        </div>
      </div>
    </div>
  )
}