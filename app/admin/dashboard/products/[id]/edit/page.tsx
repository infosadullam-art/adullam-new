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
import { 
  ArrowLeft, 
  Save, 
  X, 
  Weight, 
  Ruler, 
  Plus, 
  Trash2,
  Package,
  Settings,
  Tag
} from "lucide-react"
import { productsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

const adminPath = "/admin/dashboard"

interface Variant {
  id?: string
  sku: string
  name: string
  price: number
  compareAtPrice?: number
  stock: number
  weight: number
  attributes: Record<string, string>
  image?: string
  sortOrder: number
}

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
    weight: "",
    height: "",
    width: "",
    depth: "",
  })
  const [variants, setVariants] = useState<Variant[]>([])
  const [variantTypes, setVariantTypes] = useState<string[]>(["Couleur", "Taille", "Matériau"])

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
          weight: product.weight?.toString() || "",
          height: product.height?.toString() || "",
          width: product.width?.toString() || "",
          depth: product.depth?.toString() || "",
        })
        
        // Charger les variantes
        if (product.variants) {
          setVariants(product.variants)
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
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
        depth: formData.depth ? parseFloat(formData.depth) : undefined,
        variants: variants,
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

  // Gestion des variantes
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        name: "",
        price: 0,
        stock: 0,
        weight: 0,
        attributes: {},
        sortOrder: variants.length,
      }
    ])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }

  const updateVariantAttribute = (index: number, key: string, value: string) => {
    const updatedVariants = [...variants]
    if (!updatedVariants[index].attributes) {
      updatedVariants[index].attributes = {}
    }
    updatedVariants[index].attributes[key] = value
    setVariants(updatedVariants)
  }

  const addVariantAttribute = (index: number) => {
    const key = prompt("Nom de l'attribut (ex: Couleur, Taille):")
    if (key) {
      const value = prompt(`Valeur pour ${key}:`)
      if (value) {
        updateVariantAttribute(index, key, value)
      }
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
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
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

            <TabsContent value="variants">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
                  <Button type="button" onClick={addVariant} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </CardHeader>
                <CardContent>
                  {variants.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No variants yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click "Add Variant" to create product variations
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variants.map((variant, index) => (
                        <Card key={index} className="border-muted">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Variant Name</Label>
                                    <Input
                                      value={variant.name}
                                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                      placeholder="e.g., Red / Large"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>SKU</Label>
                                    <Input
                                      value={variant.sku}
                                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                      placeholder="Variant SKU"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>Price</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={variant.price}
                                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input
                                      type="number"
                                      value={variant.stock}
                                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Weight (kg)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={variant.weight}
                                      onChange={(e) => updateVariant(index, 'weight', parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>

                                {/* Attributs de la variante */}
                                <div className="space-y-2">
                                  <Label>Attributes</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(variant.attributes || {}).map(([key, value]) => (
                                      <Badge key={key} variant="secondary" className="flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        {key}: {value}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newAttributes = { ...variant.attributes }
                                            delete newAttributes[key]
                                            updateVariant(index, 'attributes', newAttributes)
                                          }}
                                          className="ml-1 text-muted-foreground hover:text-destructive"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addVariantAttribute(index)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Attribute
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive ml-4"
                                onClick={() => removeVariant(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping & Dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      <Weight className="inline h-4 w-4 mr-1" />
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      <Ruler className="inline h-4 w-4 mr-1" />
                      Dimensions (cm)
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={formData.width}
                          onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="depth" className="text-xs text-muted-foreground">Depth</Label>
                        <Input
                          id="depth"
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={formData.depth}
                          onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {formData.height && formData.width && formData.depth && (
                    <div className="p-4 bg-muted/30 rounded-lg space-y-1">
                      <p className="text-sm font-medium">Calculated</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="font-medium ml-2">
                            {((parseFloat(formData.height) * parseFloat(formData.width) * parseFloat(formData.depth)) / 1000000).toFixed(3)} m³
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volumetric weight:</span>
                          <span className="font-medium ml-2">
                            {((parseFloat(formData.height) * parseFloat(formData.width) * parseFloat(formData.depth)) / 6000).toFixed(2)} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
          </Tabs>
        </form>
      </div>
    </div>
  )
}