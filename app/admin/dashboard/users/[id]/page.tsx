"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Mail,
  Phone,
  Calendar,
  Shield,
  ShoppingBag,
  Star,
  MapPin,
  CreditCard,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw
} from "lucide-react"
import { usersApi, ordersApi, reviewsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

interface User {
  id: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SELLER' | 'USER'
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
  address?: {
    street?: string
    city?: string
    country?: string
    postalCode?: string
  }
  _count?: {
    orders: number
    reviews: number
    wishlist: number
  }
  stats?: {
    totalSpent: number
    averageOrderValue: number
    mostOrderedCategory?: string
    favoriteProducts?: Array<{ id: string; name: string; count: number }>
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

interface Review {
  id: string
  rating: number
  comment?: string
  product: {
    id: string
    title: string
    image?: string
  }
  createdAt: string
}

const adminPath = "/admin/dashboard"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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

function getRoleBadge(role: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    SUPER_ADMIN: "destructive",
    ADMIN: "default",
    SELLER: "secondary",
    USER: "outline",
  }
  return <Badge variant={variants[role] || "outline"}>{role}</Badge>
}

function getStatusBadge(isActive: boolean) {
  return (
    <Badge variant={isActive ? "default" : "destructive"} className="flex items-center gap-1">
      {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

export default function UserDetailPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/admin/login")
      return
    }
    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "SUPER_ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadUser()
  }, [authLoading, currentUser, userId])

  useEffect(() => {
    if (user && activeTab === "orders") {
      loadOrders()
    }
    if (user && activeTab === "reviews") {
      loadReviews()
    }
  }, [user, activeTab])

  const loadUser = async () => {
    setIsLoading(true)
    try {
      const response = await usersApi.get(userId)
      if (response.success) {
        setUser(response.data as User)
      } else {
        toast.error("User not found")
        router.push(`${adminPath}/users`)
      }
    } catch (error) {
      console.error("Failed to load user:", error)
      toast.error("Failed to load user")
      router.push(`${adminPath}/users`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const response = await ordersApi.list({ userId, limit: 10 })
      if (response.success) {
        setOrders(response.data as Order[])
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const loadReviews = async () => {
    setIsLoadingReviews(true)
    try {
      const response = await reviewsApi.list({ userId, limit: 10 })
      if (response.success) {
        setReviews(response.data as Review[])
      }
    } catch (error) {
      console.error("Failed to load reviews:", error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const handleToggleActive = async () => {
    if (!user) return
    try {
      const response = await usersApi.update(userId, { isActive: !user.isActive })
      if (response.success) {
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
        loadUser()
      } else {
        toast.error(response.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("Failed to update user")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await usersApi.delete(userId)
      if (response.success) {
        toast.success("User deleted successfully")
        router.push(`${adminPath}/users`)
      } else {
        toast.error(response.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error("Failed to delete user")
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
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN"
  const canEdit = isSuperAdmin || currentUser?.id === userId

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`${adminPath}/users`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{user.name || "User"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`${adminPath}/users/${userId}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
            {isSuperAdmin && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleActive}
                >
                  {user.isActive ? (
                    <Ban className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary/10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{user.name || "No name"}</h2>
                      <p className="text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${user.email}`} className="hover:text-primary hover:underline">
                          {user.email}
                        </a>
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${user.phone}`} className="hover:text-primary hover:underline">
                            {user.phone}
                          </a>
                          {user.phoneVerified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {user.lastLogin && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Last login: {formatDate(user.lastLogin)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            {user.address && (
              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      {user.address.street && <p>{user.address.street}</p>}
                      <p>
                        {user.address.city && `${user.address.city}, `}
                        {user.address.country}
                        {user.address.postalCode && ` ${user.address.postalCode}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Orders</p>
                          <p className="text-2xl font-bold">{user._count?.orders || 0}</p>
                        </div>
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="text-2xl font-bold">{formatCurrency(user.stats?.totalSpent || 0)}</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Reviews</p>
                          <p className="text-2xl font-bold">{user._count?.reviews || 0}</p>
                        </div>
                        <Star className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.lastLogin && (
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <p className="text-sm">Last login: {formatDate(user.lastLogin)}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <p className="text-sm">Account created: {formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Link
                            key={order.id}
                            href={`${adminPath}/orders/${order.id}`}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{order.status}</Badge>
                              <span className="font-medium">{formatCurrency(order.total)}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No orders found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReviews ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <Link
                            key={review.id}
                            href={`${adminPath}/products/${review.product.id}`}
                            className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                              {review.product.image ? (
                                <img 
                                  src={review.product.image} 
                                  alt={review.product.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{review.product.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-4 w-4",
                                        i < review.rating 
                                          ? "text-yellow-400 fill-yellow-400" 
                                          : "text-muted-foreground"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span>• {formatDate(review.createdAt)}</span>
                              </div>
                              {review.comment && (
                                <p className="text-sm mt-2">{review.comment}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No reviews found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(user.isActive)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  {getRoleBadge(user.role)}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <Badge variant={user.emailVerified ? "default" : "outline"}>
                    {user.emailVerified ? "Yes" : "No"}
                  </Badge>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone Verified</span>
                    <Badge variant={user.phoneVerified ? "default" : "outline"}>
                      {user.phoneVerified ? "Yes" : "No"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Average Order Value</span>
                    <span className="font-medium">{formatCurrency(user.stats?.averageOrderValue || 0)}</span>
                  </div>
                </div>
                {user.stats?.mostOrderedCategory && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Top Category</span>
                      <span className="font-medium">{user.stats.mostOrderedCategory}</span>
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wishlist Items</span>
                  <span className="font-medium">{user._count?.wishlist || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`${adminPath}/orders?userId=${user.id}`}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    View All Orders
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`${adminPath}/reviews?userId=${user.id}`}>
                    <Star className="mr-2 h-4 w-4" />
                    View All Reviews
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${user.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              {user._count && user._count.orders > 0 && (
                <p className="mt-2 text-destructive">
                  Warning: This user has {user._count.orders} orders. Deleting will affect order history.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}