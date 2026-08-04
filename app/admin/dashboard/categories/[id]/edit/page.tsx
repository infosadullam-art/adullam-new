"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { categoriesApi } from "@/lib/admin/api-client"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  image?: string
  parent?: {
    id: string
    name: string
  }
}

const adminPath = "/admin/dashboard"

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/&/g, 'et')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function EditCategoryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "none",
    image: ""
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
    loadData()
  }, [authLoading, user, categoryId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // ✅ Utilisation de categoriesApi au lieu de fetch direct
      const response = await categoriesApi.list()
      
      if (!response.success || !response.data) {
        toast.error("Erreur lors du chargement des catégories")
        router.push(`${adminPath}/categories`)
        return
      }
      
      const allCats = response.data as Category[]
      const categoryData = allCats.find(c => c.id === categoryId)
      
      if (!categoryData) {
        toast.error("Catégorie non trouvée")
        router.push(`${adminPath}/categories`)
        return
      }
      
      setCategory(categoryData)
      
      const cleanSlug = generateSlug(categoryData.slug || categoryData.name)
      
      setFormData({
        name: categoryData.name || "",
        slug: cleanSlug,
        description: categoryData.description || "",
        parentId: categoryData.parentId || "none",
        image: categoryData.image || ""
      })
      
      // Fonction pour récupérer tous les IDs des enfants
      const getChildIds = (parentId: string, cats: Category[]): string[] => {
        const childIds: string[] = []
        const directChildren = cats.filter(c => c.parentId === parentId)
        directChildren.forEach(child => {
          childIds.push(child.id)
          childIds.push(...getChildIds(child.id, cats))
        })
        return childIds
      }
      
      const idsToExclude = [categoryId, ...getChildIds(categoryId, allCats)]
      const availableParents = allCats.filter(c => !idsToExclude.includes(c.id))
      setAllCategories(availableParents)
      
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === "name" && value) {
      const newSlug = generateSlug(value)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error("Le nom est requis")
      return
    }
    
    setIsSaving(true)
    
    try {
      const finalSlug = generateSlug(formData.slug || formData.name)
      
      const updateData = {
        name: formData.name,
        slug: finalSlug,
        description: formData.description || undefined,
        parentId: formData.parentId !== "none" ? formData.parentId : undefined,
        image: formData.image || undefined
      }
      
      // ✅ Utilisation de categoriesApi.update
      const response = await categoriesApi.update(categoryId, updateData)
      
      if (response.success) {
        toast.success("Catégorie mise à jour avec succès")
        router.push(`${adminPath}/categories/${categoryId}`)
        router.refresh()
      } else {
        toast.error(response.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("❌ Erreur:", error)
      toast.error("Erreur réseau - Vérifie la console")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader title="Modifier la catégorie" />
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!category) return null

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        title={`Modifier: ${category.name}`}
        description="Modifiez les informations de la catégorie"
      />

      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informations de la catégorie</CardTitle>
              <CardDescription>
                Modifiez les détails de la catégorie ci-dessous
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="ex: Maison & Décoration"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Le nom peut contenir des accents et des caractères spéciaux
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug 
                  <span className="text-xs text-muted-foreground ml-2">
                    (pour l'URL - sans accents, & devient "et")
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    placeholder="ex: maison-et-decoration"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const newSlug = generateSlug(formData.name)
                      setFormData(prev => ({ ...prev, slug: newSlug }))
                    }}
                  >
                    Générer
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL finale: /categorie/{formData.slug || "slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Description de la catégorie..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Catégorie parente</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => handleChange("parentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune (catégorie racine)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de l'image</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border w-32 h-32">
                    <img 
                      src={formData.image} 
                      alt={formData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/200?text=Image+invalide"
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link href={`${adminPath}/categories/${categoryId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Annuler
                </Link>
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}