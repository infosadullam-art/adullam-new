"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { wishlistApi } from "@/lib/admin/api-client"
import { Heart, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    slug: string
    stock: number
  }
  createdAt: string
}

export default function WishlistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { formatPrice } = useCurrencyFormatter()
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/account?mode=login")
      return
    }
    fetchWishlist()
  }, [user])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await wishlistApi.list()
      
      if (response.success) {
        setWishlist(response.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Voulez-vous retirer ce produit de votre liste de souhaits ?")) return
    
    setRemovingId(id)
    try {
      const response = await wishlistApi.remove(id)
      
      if (response.success) {
        setWishlist(wishlist.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error("Erreur suppression:", error)
    } finally {
      setRemovingId(null)
    }
  }

  const handleAddToCart = async (productId: string) => {
    // À implémenter avec votre API panier
    console.log("Ajouter au panier:", productId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4F3C]"></div>
      </div>
    )
  }

  // Couleurs de la marque
  const brandColor = "#2B4F3C"
  const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)"
  const brandLight = "#E8F3E8"

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
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6" style={{ color: brandColor }} />
              <h1 className="text-2xl font-bold text-gray-900">Ma liste de souhaits</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Liste de souhaits vide</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore ajouté de produits à votre liste de souhaits.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 text-white rounded-lg transition-colors hover:shadow-lg"
              style={{ background: brandGradient }}
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image du produit - ✅ CORRIGÉ : /products/ au lieu de /product/ */}
                  <Link href={`/products/${item.product.id}`}>
                    <div className="relative h-48 bg-gray-100">
                      {item.product.images && item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Informations produit */}
                  <div className="p-4">
                    {/* ✅ CORRIGÉ : /products/ au lieu de /product/ */}
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 transition-colors line-clamp-2 hover:opacity-80" style={{ color: brandColor }}>
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold" style={{ color: brandColor }}>
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.stock > 0 ? (
                        <span className="text-xs px-2 py-1 rounded" style={{ background: brandLight, color: brandColor }}>
                          En stock
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Rupture
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product.id)}
                        disabled={item.product.stock === 0}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          item.product.stock > 0
                            ? "text-white hover:shadow-lg"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        style={item.product.stock > 0 ? { background: brandGradient } : {}}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Ajouter au panier
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        {removingId === item.id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-600" />
                        )}
                      </button>
                    </div>

                    {/* Date d'ajout */}
                    <p className="text-xs text-gray-400 mt-3">
                      Ajouté le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}