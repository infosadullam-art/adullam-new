"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"
import { Package, ChevronRight, ArrowLeft, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import Link from "next/link"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter" // ✅ AJOUTÉ

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  total: number
  currency: string
  items: any[]
}

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice } = useCurrencyFormatter() // ✅ AJOUTÉ
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/account?mode=login")
      return
    }
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data || [])
      } else {
        setError("Impossible de charger vos commandes")
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
      case "DELIVERED": return <CheckCircle className="w-5 h-5 text-green-600" />
      case "CANCELLED": return <XCircle className="w-5 h-5 text-red-600" />
      case "SHIPPED": return <Truck className="w-5 h-5 text-blue-600" />
      default: return <Clock className="w-5 h-5 text-yellow-600" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Mes commandes</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#C72C1C] text-white rounded-lg hover:bg-[#A21F18] transition-colors"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* En-tête de la commande */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold">Commande #{order.orderNumber}</p>
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
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      {/* ✅ CORRIGÉ : utilise formatPrice */}
                      <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Aperçu des articles */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                        {item.image ? (
                          <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <div className="flex items-center justify-center px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">+{order.items.length - 3} autres</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton voir détails */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                      className="flex items-center gap-1 text-[#C72C1C] hover:underline text-sm font-medium"
                    >
                      Voir les détails
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}