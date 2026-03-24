"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { categoriesApi, productsApi } from "@/lib/admin/api-client"
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Search, FolderTree, Calendar } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  parent?: {
    id: string
    name: string
  }
  image?: string
  createdAt: string
  updatedAt: string
  productCount?: number // Sera ajouté après calcul
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

export default function CategoriesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  // 🔹 Vérifie l'auth
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/admin/login")
        return
      }
      if (user.role !== "ADMIN") {
        router.replace("/admin/login")
        return
      }
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [page, search, user])

  // Charger le nombre de produits pour chaque catégorie
  const loadProductCounts = async (categories: Category[]) => {
    const counts: Record<string, number> = {}
    
    for (const category of categories) {
      try {
        const response = await productsApi.list({ 
          categoryId: category.id,
          limit: 1 // On veut juste le count, pas les produits
        })
        if (response.success && response.meta) {
          counts[category.id] = response.meta.total
        }
      } catch (error) {
        console.error(`Failed to load product count for category ${category.id}:`, error)
        counts[category.id] = 0
      }
    }
    
    setProductCounts(counts)
  }

  async function loadCategories() {
    setIsLoading(true)
    try {
      const params: Record<string, string | number | undefined> = { 
        page, 
        limit: 20 
      }
      if (search) params.search = search

      const response = await categoriesApi.list(params)
      if (response.success) {
        const categoriesData = response.data as Category[]
        setCategories(categoriesData)
        setMeta(response.meta as Meta)
        
        // Charger les compteurs de produits
        await loadProductCounts(categoriesData)
      } else {
        toast.error(response.error || "Failed to load categories")
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      const response = await categoriesApi.delete(id)
      if (response.success) {
        toast.success("Category deleted successfully")
        loadCategories()
      } else {
        toast.error(response.error || "Failed to delete category")
      }
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  const columns = [
    {
      key: "name",
      header: "Category",
      cell: (category: Category) => (
        <Link 
          href={`${adminPath}/categories/${category.id}`}
          className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
            {category.image ? (
              <img 
                src={category.image} 
                alt={category.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FolderTree className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium group-hover:text-primary transition-colors">
              {category.name}
            </p>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {category.description}
              </p>
            )}
          </div>
        </Link>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      cell: (category: Category) => (
        <Link 
          href={`${adminPath}/categories/${category.id}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {category.slug}
          </code>
        </Link>
      ),
    },
    {
      key: "parent",
      header: "Parent Category",
      cell: (category: Category) => (
        category.parent ? (
          <Link 
            href={`${adminPath}/categories/${category.parent.id}`}
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors hover:text-primary"
          >
            <div className="flex items-center gap-1">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <span>{category.parent.name}</span>
            </div>
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground block p-2">—</span>
        )
      ),
    },
    {
      key: "products",
      header: "Products",
      cell: (category: Category) => {
        const count = productCounts[category.id] || 0
        return (
          <Link 
            href={`${adminPath}/products?category=${category.id}`}
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Badge variant={count > 0 ? "default" : "secondary"}>
              {count} product{count !== 1 ? 's' : ''}
            </Badge>
          </Link>
        )
      },
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (category: Category) => (
        <Link 
          href={`${adminPath}/categories/${category.id}`}
          className="flex items-center gap-1 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(category.createdAt)}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (category: Category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/categories/${category.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/categories/${category.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(category.id)} 
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Auth check
  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div>
      <AdminHeader
        title="Categories"
        description="Organize your products with categories"
        actions={
          <Button asChild>
            <Link href={`${adminPath}/categories/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadCategories()}
              className="pl-9"
            />
          </div>
          
          {meta && (
            <Badge variant="outline" className="ml-2">
              Total: {meta.total} categories
            </Badge>
          )}
        </div>

        <DataTable
          columns={columns}
          data={categories}
          isLoading={isLoading}
          pagination={
            meta ? { 
              page: meta.page, 
              totalPages: meta.totalPages, 
              onPageChange: setPage 
            } : undefined
          }
          emptyMessage="No categories found"
        />
      </div>
    </div>
  )
}