"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, X } from "lucide-react"
import { productsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

const adminPath = "/admin/dashboard"

export default function EditProductPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    description: "",
    price: "",
    compareAtPrice: "",
    cost: "",
    stock: "",
    status: "DRAFT",
    featured: false,
    category: "",
  })

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
    try {
      const response = await productsApi.get(productId)
      if (response.success && response.data) {
        const product = response.data
        setFormData({
          title: product.title || "",
          sku: product.sku || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          compareAtPrice: product.compareAtPrice?.toString() || "",
          cost: product.cost?.toString() || "",
          stock: product.stock?.toString() || "0",
          status: product.status || "DRAFT",
          featured: product.featured || false,
          category: product.category?.id || "",
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await productsApi.update(productId, {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stock: parseInt(formData.stock),
      })

      if (response.success) {
        toast.success("Product updated successfully")
        router.push(`${adminPath}/products/${productId}`)
      } else {
        toast.error(response.error || "Failed to update product")
      }
    } catch (error) {
      console.error("Failed to update product:", error)
      toast.error("Failed to update product")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div>
      <AdminHeader
        title="Edit Product"
        description={formData.title}
        backButton={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${adminPath}/products/${productId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`${adminPath}/products/${productId}`}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Product</Label>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Compare at Price</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">SEO settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}