"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,  // ✅ AJOUTÉ ICI
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersApi } from "@/lib/admin/api-client"
import { MoreHorizontal, Eye, Ban, CheckCircle, Search, Mail, Calendar, ShoppingBag, Star } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: string
  isActive: boolean
  createdAt: string
  _count?: {
    orders: number
    reviews: number
  }
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

function getRoleBadge(role: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    SUPER_ADMIN: "destructive",
    ADMIN: "default",
    SELLER: "secondary",
    USER: "outline",
  }
  return <Badge variant={variants[role] || "outline"}>{role}</Badge>
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    loadUsers()
  }, [page, roleFilter, search])

  async function loadUsers() {
    setIsLoading(true)
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        limit: 20,
      }
      if (roleFilter && roleFilter !== "all") {
        params.role = roleFilter
      }
      if (search) {
        params.search = search
      }

      const response = await usersApi.list(params)
      if (response.success) {
        setUsers(response.data as User[])
        setMeta(response.meta as Meta)
      } else {
        toast.error(response.error || "Failed to load users")
      }
    } catch (error) {
      console.error("Failed to load users:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const response = await usersApi.update(id, { isActive })
      if (response.success) {
        toast.success(isActive ? "User activated" : "User deactivated")
        loadUsers()
      } else {
        toast.error(response.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("Failed to update user")
    }
  }

  const columns = [
    {
      key: "user",
      header: "User",
      cell: (user: User) => (
        <Link 
          href={`${adminPath}/users/${user.id}`}
          className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
        >
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium group-hover:text-primary">{user.name || "No name"}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{user.email}</span>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (user: User) => (
        <Link 
          href={`${adminPath}/users?role=${user.role}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {getRoleBadge(user.role)}
        </Link>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      cell: (user: User) => (
        <Link 
          href={`${adminPath}/orders?userId=${user.id}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-1">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user._count?.orders || 0}</span>
          </div>
        </Link>
      ),
    },
    {
      key: "reviews",
      header: "Reviews",
      cell: (user: User) => (
        <Link 
          href={`${adminPath}/reviews?userId=${user.id}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user._count?.reviews || 0}</span>
          </div>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (user: User) => (
        <Link 
          href={`${adminPath}/users?status=${user.isActive ? 'active' : 'inactive'}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Badge variant={user.isActive ? "default" : "destructive"}>
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </Link>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      cell: (user: User) => (
        <Link 
          href={`${adminPath}/users/${user.id}`}
          className="flex items-center gap-1 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(user.createdAt)}</span>
        </Link>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/users/${user.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/users/${user.id}/edit`}>
                <Eye className="mr-2 h-4 w-4" />
                Edit User
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />  {/* ✅ MAINTENANT ÇA MARCHE */}
            {user.isActive ? (
              <DropdownMenuItem onClick={() => handleToggleActive(user.id, false)} className="text-destructive">
                <Ban className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleToggleActive(user.id, true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUsers()}
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="SELLER">Seller</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {meta && (
          <Badge variant="outline" className="ml-auto">
            Total: {meta.total} users
          </Badge>
        )}
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pagination={
          meta
            ? {
                page: meta.page,
                totalPages: meta.totalPages,
                total: meta.total,
                onPageChange: setPage,
              }
            : undefined
        }
        emptyMessage="No users found"
      />
    </div>
  )
}