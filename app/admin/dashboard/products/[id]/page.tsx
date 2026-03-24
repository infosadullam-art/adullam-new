"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  Package,
  Tag,
  DollarSign,
  Layers,
  Clock,
  RefreshCw,
  Eye,
  Copy,
  Archive,
  AlertCircle
} from "lucide-react"
import { productsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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

interface Product {
  id: string
  sku: string
  title: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  cost?: number
  stock: number
  status: string
  featured: boolean
  images: Array<{ url: string; position: number }>
  category?: { id: string; name: string }
  tags?: string[]
  weight?: number
  height?: number
  width?: number
  depth?: number
  createdAt: string
  updatedAt: string
}

const adminPath = "/admin/dashboard"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
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

export default function ProductDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadProduct()
  }, [authLoading, user, productId])

  const loadProduct = async () => {
    setIsLoading(true)
    try {
      const response = await productsApi.get(productId)
      if (response.success) {
        setProduct(response.data as Product)
        if (response.data.images?.length > 0) {
          setSelectedImage(response.data.images[0].url)
        }
      } else {
        toast.error("Failed to load product")
        router.push(`${adminPath}/products`)
      }
    } catch (error) {
      console.error("Failed to load product:", error)
      toast.error("Failed to load product")
      router.push(`${adminPath}/products`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await productsApi.delete(productId)
      toast.success("Product deleted successfully")
      router.push(`${adminPath}/products`)
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  const handleDuplicate = async () => {
    try {
      const response = await productsApi.duplicate(productId)
      if (response.success) {
        toast.success("Product duplicated successfully")
        router.push(`${adminPath}/products/${response.data.id}/edit`)
      }
    } catch (error) {
      toast.error("Failed to duplicate product")
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="flex h-16 items-center gap-4 px-6">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`${adminPath}/products`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{product.title}</h1>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`${adminPath}/products/${productId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
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
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt={product.title} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", selectedImage);
                        e.currentTarget.src = "https://via.placeholder.com/400?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images?.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image.url)}
                        className={`aspect-square rounded-lg border overflow-hidden transition-all ${
                          selectedImage === image.url 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : 'hover:ring-2 hover:ring-muted-foreground hover:ring-offset-2'
                        }`}
                      >
                        <img 
                          src={image.url} 
                          alt={`${product.title} ${index + 1}`} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/100?text=Error";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Details Tabs */}
            <Card>
              <Tabs defaultValue="description">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  <TabsContent value="description" className="mt-0">
                    <div className="prose max-w-none dark:prose-invert">
                      {product.description ? (
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No description provided.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-0">
                    <dl className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">SKU</dt>
                        <dd className="font-medium">{product.sku}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Slug</dt>
                        <dd className="font-medium">{product.slug}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Category</dt>
                        <dd className="font-medium">{product.category?.name || "-"}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Tags</dt>
                        <dd className="font-medium">
                          {product.tags?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {product.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          ) : "-"}
                        </dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Created</dt>
                        <dd className="font-medium">
                          {new Date(product.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Last Updated</dt>
                        <dd className="font-medium">
                          {new Date(product.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </dd>
                      </div>
                    </dl>
                  </TabsContent>
                  
                  <TabsContent value="shipping" className="mt-0">
                    <dl className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Weight (kg)</dt>
                        <dd className="font-medium">{product.weight ? `${product.weight} kg` : "-"}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Dimensions</dt>
                        <dd className="font-medium">
                          {product.height || product.width || product.depth ? (
                            `${product.height || '-'} × ${product.width || '-'} × ${product.depth || '-'} cm`
                          ) : "-"}
                        </dd>
                      </div>
                    </dl>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(product.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Featured</span>
                  <Badge variant={product.featured ? "default" : "outline"}>
                    {product.featured ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                </div>
                {product.compareAtPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Compare at</span>
                    <span className="text-sm line-through text-muted-foreground">
                      {formatCurrency(product.compareAtPrice)}
                    </span>
                  </div>
                )}
                {product.cost && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cost</span>
                      <span className="text-sm font-medium">{formatCurrency(product.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Margin</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {(((product.price - product.cost) / product.price) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Inventory Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock</span>
                  <span className={`text-lg font-semibold ${
                    product.stock === 0 ? 'text-destructive' : 
                    product.stock < 10 ? 'text-yellow-600' : ''
                  }`}>
                    {product.stock} units
                  </span>
                </div>
                {product.stock < 10 && product.stock > 0 && (
                  <p className="text-xs text-yellow-600 mt-2">
                    ⚠️ Low stock
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-xs text-destructive mt-2">
                    ⚠️ Out of stock
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href={`${adminPath}/products/${productId}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Product
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href={`/products/${product.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    View on Store
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href={`${adminPath}/products/${productId}/archive`}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              &quot;{product.title}&quot; and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}