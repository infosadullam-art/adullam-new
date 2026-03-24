"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { productsApi } from "@/lib/admin/api-client"
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Search, Star } from "lucide-react" // ← AJOUTÉ: Star
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"

interface Product {
  id: string
  sku: string
  title: string
  slug: string
  price: number
  stock: number
  status: string
  featured: boolean
  images: string[]
  category?: { name: string }
  createdAt: string
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
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

export default function ProductsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // 🔹 Vérifie l'auth avant de charger les produits
  useEffect(() => {
    const init = async () => {
      if (!authLoading) {
        if (!user) {
          toast.error("Session expired. Please login again.")
          router.replace("/admin/login")
          return
        }

        if (user.role !== "ADMIN") {
          toast.error("Access denied")
          router.replace("/admin/login")
          return
        }

        await loadProducts()
      }
    }

    init()
  }, [authLoading, user, page, statusFilter])

  // 🔹 Charge les produits depuis l'API
  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number | boolean | undefined> = { page, limit: 20 }
      if (statusFilter !== "all") params.status = statusFilter
      if (search) params.search = search

      const response = await productsApi.list(params)

      if (response.status === 401 || response.error === "Unauthorized") {
        setProducts([])
        setMeta(null)
        toast.error("Session expired. Please login again.")
        router.replace("/admin/login")
        return
      }

      if (response.success) {
        setProducts(response.data as Product[])
        setMeta(response.meta as Meta)
      } else {
        setProducts([])
        setMeta(null)
        toast.error(response.error || "Failed to load products")
      }
    } catch (error) {
      console.error("Failed to load products:", error)
      setProducts([])
      setMeta(null)
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await productsApi.delete(id)
      toast.success("Product deleted")
      loadProducts()
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  const columns = [
    {
      key: "product",
      header: "Product",
      cell: (product: Product) => (
        <Link href={`${adminPath}/products/${product.id}`} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors group">
          <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {product.images[0] ? (
              <img src={product.images[0] || "/placeholder.svg"} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
            )}
          </div>
          <div>
            <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.title}</p>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
        </Link>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (product: Product) => (
        <Link 
          href={`${adminPath}/products?category=${product.category?.name || ''}`} 
          className={`text-sm hover:text-primary hover:underline block p-2 rounded-lg transition-colors ${product.category?.name ? '' : 'pointer-events-none text-muted-foreground'}`}
        >
          {product.category?.name || "-"}
        </Link>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (product: Product) => (
        <Link 
          href={`${adminPath}/products/${product.id}`} 
          className="font-medium hover:text-primary hover:underline block p-2 rounded-lg transition-colors"
        >
          {formatCurrency(product.price)}
        </Link>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (product: Product) => (
        <Link 
          href={`${adminPath}/products/${product.id}/inventory`} 
          className={`block p-2 rounded-lg transition-colors hover:underline ${
            product.stock === 0 ? "text-destructive hover:text-destructive" : "hover:text-primary"
          }`}
        >
          {product.stock}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (product: Product) => (
        <Link 
          href={`${adminPath}/products?status=${product.status}`} 
          className="block p-2 rounded-lg transition-colors hover:bg-muted/50"
        >
          {getStatusBadge(product.status)}
        </Link>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      cell: (product: Product) => (
        <Link 
          href={`${adminPath}/products/${product.id}/edit#featured`} 
          className="block p-2 rounded-lg transition-colors hover:bg-muted/50"
        >
          <Badge variant={product.featured ? "default" : "outline"}>{product.featured ? "Yes" : "No"}</Badge>
        </Link>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (product: Product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/products/${product.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/products/${product.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <div className="flex gap-2">
            {/* ✅ NOUVEAU BOUTON : Gérer la sélection du moment */}
            <Button variant="outline" asChild>
              <Link href={`${adminPath}/deals/featured`}>
                <Star className="mr-2 h-4 w-4" />
                Sélection du moment
              </Link>
            </Button>
            
            {/* ✅ BOUTON EXISTANT : Ajouter un produit */}
            <Button asChild>
              <Link href={`${adminPath}/products/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          pagination={
            meta
              ? {
                  page: meta.page,
                  totalPages: meta.totalPages,
                  onPageChange: setPage,
                }
              : undefined
          }
          emptyMessage="No products found"
        />
      </div>
    </div>
  )
}