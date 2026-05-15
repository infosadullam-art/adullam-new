"use client"

import { useState, useEffect } from "react"
import { 
  Home, ShoppingCart, HelpCircle, User, LogOut, 
  Mail, Phone, MapPin, Package, Heart, ChevronRight, 
  Shield, CheckCircle, Clock, Lock, Key, Smartphone, Plus
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/admin/auth-context"
import { useRouter } from "next/navigation"
import { ordersApi, addressesApi, wishlistApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function AccountPage() {
  const router = useRouter()
  const { user, logout, isLoading: authLoading } = useAuth()
  const { formatPrice } = useCurrencyFormatter()

  // États principaux
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // États pour les données utilisateur
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState({
    orders: false,
    wishlist: false,
    addresses: false
  })
  const [success, setSuccess] = useState("")

  // ============================================================
  // REDIRECTION VERS LOGIN SI NON CONNECTÉ
  // ============================================================
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // ============================================================
  // CHARGEMENT DES DONNÉES UTILISATEUR
  // ============================================================
  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    // Commandes avec ordersApi
    setLoading(prev => ({ ...prev, orders: true }))
    try {
      const response = await ordersApi.list()
      if (response.success) {
        setOrders(response.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement commandes:", error)
    } finally {
      setLoading(prev => ({ ...prev, orders: false }))
    }

    // Wishlist avec wishlistApi
    setLoading(prev => ({ ...prev, wishlist: true }))
    try {
      const response = await wishlistApi.list()
      if (response.success) {
        setWishlist(response.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement wishlist:", error)
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }))
    }

    // Adresses avec addressesApi
    setLoading(prev => ({ ...prev, addresses: true }))
    try {
      const response = await addressesApi.list()
      if (response.success) {
        setAddresses(response.addresses || [])
      }
    } catch (error) {
      console.error("Erreur chargement adresses:", error)
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }))
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // ============================================================
  // GESTION DES ADRESSES
  // ============================================================
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return
    
    try {
      const response = await addressesApi.delete(id)
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse supprimée avec succès")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur suppression adresse:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const response = await addressesApi.update(id, { isDefault: true })
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse par défaut mise à jour")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error("Erreur mise à jour adresse:", error)
    }
  }

  // ============================================================
  // GESTION DE LA WISHLIST
  // ============================================================
  const handleRemoveFromWishlist = async (id: string) => {
    if (!confirm("Voulez-vous retirer ce produit de votre liste de souhaits ?")) return
    
    try {
      const response = await wishlistApi.remove(id)
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Produit retiré de la wishlist")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur suppression wishlist:", error)
      alert("Erreur lors de la suppression")
    }
  }

  // ============================================================
  // UTILS
  // ============================================================
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
      "PENDING": "bg-yellow-100 text-yellow-800",
      "CONFIRMED": "bg-blue-100 text-blue-800",
      "PROCESSING": "bg-purple-100 text-purple-800",
      "SHIPPED": "bg-indigo-100 text-indigo-800",
      "DELIVERED": "bg-green-100 text-green-800",
      "CANCELLED": "bg-red-100 text-red-800"
    }
    return colorMap[status] || "bg-gray-100 text-gray-800"
  }

  // Affichage du chargement
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // ============================================================
  // DASHBOARD UTILISATEUR (après connexion)
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">Compte vérifié</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Dernière connexion: {new Date().toLocaleDateString()}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 group"
                title="Déconnexion sécurisée"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
              {[
                { id: "dashboard", label: "Dashboard", icon: Home },
                { id: "orders", label: "Commandes", icon: ShoppingCart, count: orders.length },
                { id: "wishlist", label: "Favoris", icon: Heart, count: wishlist.length },
                { id: "addresses", label: "Adresses", icon: MapPin, count: addresses.length },
                { id: "security", label: "Sécurité", icon: Shield },
                { id: "help", label: "Aide", icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      activeTab === item.id
                        ? "bg-gray-900 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-500 mt-1">Bienvenue dans votre espace personnel sécurisé</p>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Compte sécurisé</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Commandes", value: orders.length, icon: ShoppingCart, color: "blue" },
                { label: "Favoris", value: wishlist.length, icon: Heart, color: "red" },
                { label: "Adresses", value: addresses.length, icon: MapPin, color: "green" },
                { label: "Livrées", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package, color: "purple" }
              ].map((stat, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {orders.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Dernières commandes</h2>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">Commande #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-3">Recommandations de sécurité</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mot de passe fort</p>
                    <p className="text-xs text-gray-500">Compte sécurisé</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">2FA disponible</p>
                    <p className="text-xs text-gray-500">Activez la double authentification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email vérifié</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes commandes</h2>
            {loading.orders ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Commande #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                        Voir les détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune commande pour le moment</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
                >
                  Découvrir nos produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ma liste de souhaits</h2>
            {loading.wishlist ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map((item) => {
                  const productId = item.product?.id || item.productId
                  const productName = item.product?.name || item.productName || "Produit"
                  const productImage = item.product?.images?.[0]
                  const productPrice = item.product?.price || item.price || 0
                  
                  return (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative">
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </button>
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productImage ? (
                          <Image 
                            src={productImage} 
                            alt={productName} 
                            width={200} 
                            height={200} 
                            className="object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <h3 
                        className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-gray-700"
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productName}
                      </h3>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(productPrice)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Votre wishlist est vide</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
                >
                  Explorer les produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Mes adresses</h2>
              <button 
                onClick={() => router.push("/account/addresses")}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une adresse
              </button>
            </div>
            {loading.addresses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Par défaut
                      </span>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{address.firstName} {address.lastName}</p>
                        <p className="text-sm text-gray-500 mt-1">{address.address}</p>
                        <p className="text-sm text-gray-500">{address.city}, {address.country}</p>
                        <p className="text-sm text-gray-500">{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => router.push(`/account/addresses?edit=${address.id}`)}
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Modifier
                      </button>
                      {!address.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          Définir par défaut
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAddress(address.id)} 
                        className="text-sm text-red-500 hover:text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune adresse enregistrée</p>
                <button 
                  onClick={() => router.push("/account/addresses")}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
                >
                  Ajouter une adresse
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de sécurité</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Mot de passe</h3>
                      <p className="text-sm text-gray-500">Modifiez votre mot de passe</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    Modifier
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Authentification à 2 facteurs</h3>
                      <p className="text-sm text-gray-500">Protection supplémentaire</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                    Activer
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Protégez votre compte avec une vérification en deux étapes
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Sessions actives</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Appareil actuel</p>
                        <p className="text-xs text-gray-500">Session en cours</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600">Actif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Centre d'aide</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de la demande
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20">
                    <option>Problème de commande</option>
                    <option>Problème de livraison</option>
                    <option>Question sur un produit</option>
                    <option>Problème de compte</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    placeholder="Décrivez votre problème en détail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Envoyer la demande
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Questions fréquentes</h3>
                <div className="space-y-2">
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
                    • Comment suivre ma commande ?
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
                    • Délais de livraison moyens
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
                    • Politique de retour
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 hover:underline block">
                    • Comment modifier mon adresse ?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}