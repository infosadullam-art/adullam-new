"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Star, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import Image from "next/image"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  featured: boolean
  purchaseCount?: number
  viewCount?: number
}

const adminPath = "/admin/dashboard"

// Fonction pour formater les prix en USD
const formatUSD = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price)
}

export default function FeaturedProductsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    
    loadData()
  }, [authLoading, user])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger tous les produits pour la recherche (limité à 100)
      const allRes = await fetch('/api/products?limit=100')
      const allData = await allRes.json()
      
      if (allData.success) {
        // Gérer le format de réponse paginé
        const productsList = allData.data?.data || allData.data || []
        setAllProducts(productsList)
        console.log(`📦 ${productsList.length} produits chargés pour la recherche`)
      }

      // ✅ CHARGER SEULEMENT 10 PRODUITS FEATURED
      const featuredRes = await fetch('/api/products?featured=true&limit=10')
      const featuredData = await featuredRes.json()
      
      if (featuredData.success) {
        const featuredList = featuredData.data?.data || featuredData.data || []
        setProducts(featuredList)
        console.log(`⭐ ${featuredList.length} produits featured chargés`)
      } else {
        console.warn("⚠️ Aucun produit featured trouvé")
      }
    } catch (error) {
      console.error("❌ Erreur:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (productId: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentValue })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(currentValue ? "Retiré de la sélection" : "Ajouté à la sélection")
        loadData() // Recharger les données
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("❌ Erreur:", error)
      toast.error("Erreur réseau")
    }
  }

  const addToFeatured = (product: Product) => {
    toggleFeatured(product.id, false)
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(products)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setProducts(items)

    // Optionnel : sauvegarder l'ordre
    // await fetch('/api/deals/featured/reorder', {
    //   method: 'POST',
    //   body: JSON.stringify({ order: items.map(p => p.id) })
    // })
  }

  // Filtrer les produits non featured pour la recherche
  const availableProducts = allProducts
    .filter(p => !p.featured) // Exclure ceux déjà featured
    .filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.includes(searchTerm)
    )
    .slice(0, 10) // Limiter à 10 résultats de recherche

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader title="Sélection du moment" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title="Sélection du moment"
        description="Gérez les produits mis en avant sur la page d'accueil"
      />

      <div className="p-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${adminPath}/products`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux produits
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne gauche - Produits sélectionnés (max 10) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Produits en vedette ({products.length}/10)</CardTitle>
                {products.length >= 10 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Maximum de 10 produits atteint
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun produit sélectionné</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Utilisez le panneau de droite pour ajouter des produits
                    </p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="featured">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {products.map((product, index) => (
                            <Draggable key={product.id} draggableId={product.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="cursor-move text-muted-foreground hover:text-foreground">
                                      ⋮⋮
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                      <Image
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.title}
                                        width={48}
                                        height={48}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium line-clamp-1">{product.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatUSD(product.price)}
                                      </p>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={true}
                                    onCheckedChange={() => toggleFeatured(product.id, true)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Ajout de produits */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter des produits</CardTitle>
                {products.length >= 10 && (
                  <p className="text-sm text-amber-600">
                    Maximum atteint
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={products.length >= 10}
                />

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {products.length >= 10 ? (
                    <p className="text-sm text-amber-600 text-center py-4">
                      Vous avez atteint le maximum de 10 produits
                    </p>
                  ) : availableProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {searchTerm ? "Aucun résultat" : "Tous les produits sont déjà en vedette"}
                    </p>
                  ) : (
                    availableProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => addToFeatured(product)}
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <Image
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.title}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatUSD(product.price)}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" className="shrink-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}