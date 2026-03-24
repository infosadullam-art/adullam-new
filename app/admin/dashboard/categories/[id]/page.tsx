"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  FolderTree,
  Package,
  Eye,
  Calendar,
  AlertCircle
} from "lucide-react"
import { categoriesApi, productsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  parent?: {
    id: string
    name: string
    slug: string
  }
  children?: Array<{
    id: string
    name: string
    slug: string
  }>
  image?: string
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  title: string
  sku: string
  price: number
  status: string
  images: string[]
  categoryId?: string
  category?: {
    id: string
    name: string
  }
}

const adminPath = "/admin/dashboard"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    DRAFT: "secondary",
    OUT_OF_STOCK: "destructive",
    ARCHIVED: "outline",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

export default function CategoryDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadCategory()
  }, [authLoading, user, categoryId])

  // ✅ VERSION CORRIGÉE : Charge TOUTES les catégories et trouve celle avec le bon ID
  const loadCategory = async () => {
    setIsLoading(true)
    try {
      // Récupérer TOUTES les catégories (pas une seule)
      const response = await categoriesApi.list()
      console.log("📦 Toutes les catégories:", response)
      
      if (response.success && response.data) {
        // 🔍 Chercher celle qui a le bon ID
        const categoryData = (response.data as Category[]).find(c => c.id === categoryId)
        
        if (categoryData) {
          console.log("✅ Catégorie trouvée:", categoryData.name)
          setCategory(categoryData)
          await loadProducts(categoryId)
        } else {
          console.error("❌ Catégorie non trouvée avec ID:", categoryId)
          toast.error("Category not found")
          router.push(`${adminPath}/categories`)
        }
      } else {
        toast.error("Failed to load categories")
        router.push(`${adminPath}/categories`)
      }
    } catch (error) {
      console.error("Failed to load category:", error)
      toast.error("Failed to load category")
      router.push(`${adminPath}/categories`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async (catId: string) => {
    try {
      console.log("🔍 Recherche produits pour catégorie ID:", catId)
      
      // Charger les produits avec le bon paramètre
      const response = await productsApi.list({ 
        categoryId: catId,
        limit: 100 
      })
      
      console.log("📦 Réponse produits avec filtre:", response)
      
      if (response.success && response.data) {
        const filteredProducts = response.data as Product[]
        console.log(`✅ ${filteredProducts.length} produits trouvés pour catégorie ${catId}`)
        setProducts(filteredProducts)
      } else {
        console.log("❌ Aucun produit trouvé avec le filtre")
        setProducts([])
      }
    } catch (error) {
      console.error("Failed to load products:", error)
      setProducts([])
    }
  }

  const handleDelete = async () => {
    try {
      const response = await categoriesApi.delete(categoryId)
      if (response.success) {
        toast.success("Category deleted successfully")
        router.push(`${adminPath}/categories`)
      } else {
        toast.error(response.error || "Failed to delete category")
      }
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="flex h-16 items-center gap-4 px-6">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`${adminPath}/categories`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{category.name}</h1>
              <p className="text-sm text-muted-foreground">Slug: {category.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`${adminPath}/categories/${categoryId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Category Info & Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.description ? (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{category.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description provided.</p>
                )}

                {category.image && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Image</h3>
                    <div className="h-48 w-48 rounded-lg border bg-muted overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/200?text=No+Image"
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products in this Category */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products in this Category</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`${adminPath}/products?category=${category.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View All ({products.length})
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.slice(0, 10).map((product) => (
                      <Link
                        key={product.id}
                        href={`${adminPath}/products/${product.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium hover:text-primary">{product.title}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                          {getStatusBadge(product.status)}
                        </div>
                      </Link>
                    ))}
                    
                    {products.length > 10 && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href={`${adminPath}/products?category=${category.id}`}>
                          View {products.length - 10} more products...
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No products in this category</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href={`${adminPath}/products/new?category=${category.id}`}>
                        Add Product
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subcategories */}
            {category.children && category.children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Subcategories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`${adminPath}/categories/${child.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium hover:text-primary">{child.name}</span>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Products</span>
                  <Badge variant={products.length > 0 ? "default" : "secondary"}>
                    {products.length}
                  </Badge>
                </div>
                {category.children && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subcategories</span>
                    <Badge variant="secondary">{category.children.length}</Badge>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-sm">{formatDate(category.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="text-sm">{formatDate(category.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Parent Category */}
            {category.parent && (
              <Card>
                <CardHeader>
                  <CardTitle>Parent Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`${adminPath}/categories/${category.parent.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <FolderTree className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium group-hover:text-primary">{category.parent.name}</p>
                      <p className="text-xs text-muted-foreground">{category.parent.slug}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`${adminPath}/products?category=${category.id}`}>
                    <Package className="mr-2 h-4 w-4" />
                    View All Products
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`${adminPath}/products/new?category=${category.id}`}>
                    <Package className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`${adminPath}/categories/new?parent=${category.id}`}>
                    <FolderTree className="mr-2 h-4 w-4" />
                    Add Subcategory
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{category.name}"? This action cannot be undone.
              {products.length > 0 && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">Warning: This category contains {products.length} products.</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    These products will need to be reassigned to another category.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}