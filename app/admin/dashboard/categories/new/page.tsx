"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { ArrowLeft, Save, X } from "lucide-react"
import { categoriesApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  id: string
  name: string
}

const adminPath = "/admin/dashboard"

export default function NewCategoryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const parentId = searchParams.get('parent')

  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: parentId || "", // Peut être vide
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
    loadCategories()
  }, [authLoading, user])

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await categoriesApi.list({ limit: 100 })
      if (response.success) {
        setCategories(response.data as Category[])
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Ne pas envoyer parentId si c'est vide
      const dataToSend = {
        ...formData,
        parentId: formData.parentId || undefined // Convertir "" en undefined
      }
      
      const response = await categoriesApi.create(dataToSend)
      if (response.success && response.data) {
        toast.success("Category created successfully")
        router.push(`${adminPath}/categories/${response.data.id}`)
      } else {
        toast.error(response.error || "Failed to create category")
      }
    } catch (error) {
      console.error("Failed to create category:", error)
      toast.error("Failed to create category")
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
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
        title="New Category"
        description="Create a new product category"
        backButton={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${adminPath}/categories`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`${adminPath}/categories`}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Creating..." : "Create Category"}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Electronics, Clothing, Books"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., electronics, clothing, books"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name. Auto-generated from name.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the category"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category (Optional)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Utiliser une valeur spéciale pour "none" au lieu de chaîne vide */}
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories
                      .filter(c => c.id !== parentId)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Make this a subcategory of an existing category.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}