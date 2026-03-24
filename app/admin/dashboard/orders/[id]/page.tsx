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
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  CreditCard,
  Printer,
  AlertCircle,
  Tag,
  Weight,
  Ship
} from "lucide-react"
import { ordersApi } from "@/lib/admin/api-client"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  weight: number
  totalWeight: number
  shippingMode: string
  shippingCost: number
  portePorteCost: number
  image?: string
  attributes: Record<string, any>
  variantSummary: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingCost: number
  portePorteTotal: number
  discount: number
  total: number
  currency: string
  items: OrderItem[]
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    postalCode: string
    notes?: string
  }
  user?: {
    id: string
    email: string
    name: string
    phone: string
  }
  defaultShippingMode: string
  trackingNumber?: string
  trackingUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const adminPath = "/admin/dashboard"

// Formatage en USD (dollars)
function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "$0.00"
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Date not available"
  try {
    return new Date(dateString).toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  } catch {
    return "Invalid date"
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DELIVERED: "default",
    SHIPPED: "default",
    PROCESSING: "secondary",
    CONFIRMED: "secondary",
    PENDING: "outline",
    CANCELLED: "destructive",
    REFUNDED: "destructive",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

function getPaymentBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PAID: "default",
    PENDING: "outline",
    FAILED: "destructive",
    REFUNDED: "secondary",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

function getShippingModeLabel(mode: string) {
  const modes: Record<string, string> = {
    bateau: "Boat",
    avion: "Plane",
    standard: "Standard",
    express: "Express"
  }
  return modes[mode] || mode
}

export default function OrderDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadOrder()
  }, [authLoading, user, orderId])

  const loadOrder = async () => {
    setIsLoading(true)
    try {
      const response = await ordersApi.get(orderId)
      if (response.success && response.data) {
        setOrder(response.data as Order)
      } else {
        toast.error("Failed to load order")
        router.push(`${adminPath}/orders`)
      }
    } catch (error) {
      console.error("Failed to load order:", error)
      toast.error("Failed to load order")
      router.push(`${adminPath}/orders`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await ordersApi.updateStatus(orderId, { status: newStatus })
      if (response.success) {
        toast.success(`Order marked as ${newStatus}`)
        loadOrder()
      } else {
        toast.error(response.error || "Failed to update order")
      }
    } catch (error) {
      toast.error("Failed to update order")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await ordersApi.delete(orderId)
      toast.success("Order deleted successfully")
      router.push(`${adminPath}/orders`)
    } catch (error) {
      toast.error("Failed to delete order")
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
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-[400px]">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href={`${adminPath}/orders`}>Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const customerName = order.user?.name || `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`${adminPath}/orders`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Order {order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isUpdating}>
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusUpdate('CONFIRMED')}>
                  Confirm
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('PROCESSING')}>
                  Process
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('SHIPPED')}>
                  Ship
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('DELIVERED')}>
                  Deliver
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusUpdate('CANCELLED')} className="text-destructive">
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" asChild>
              <Link href={`${adminPath}/orders/${orderId}/edit`}>
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
        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Order Status</span>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Payment</span>
                </div>
                {getPaymentBadge(order.paymentStatus)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Items</span>
                </div>
                <span className="font-bold">
                  {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Shipping Mode</span>
                </div>
                <Badge variant="outline">
                  {getShippingModeLabel(order.defaultShippingMode)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Ordered */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Products Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            {order.items && order.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Shipping Mode</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total Weight</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.productName} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link 
                              href={`${adminPath}/products/${item.productId}`}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {item.productName}
                            </Link>
                            {item.variantSummary && (
                              <p className="text-xs text-muted-foreground">{item.variantSummary}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getShippingModeLabel(item.shippingMode)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.quantity}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.totalWeight} kg
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No items in this order</p>
            )}
          </CardContent>
        </Card>

        {/* Order Summary and Customer Info */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span>{formatCurrency(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Door-to-Door</span>
                  <span>{formatCurrency(order.portePorteTotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{customerName}</span>
                  </div>
                  {order.user && (
                    <Link 
                      href={`${adminPath}/users/${order.user.id}`}
                      className="text-sm text-primary hover:underline ml-6"
                    >
                      View profile
                    </Link>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${order.shippingInfo.email}`} className="hover:text-primary hover:underline">
                      {order.shippingInfo.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${order.shippingInfo.phone}`} className="hover:text-primary hover:underline">
                      {order.shippingInfo.phone}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </p>
                <p>{order.shippingInfo.address}</p>
                <p>
                  {order.shippingInfo.city}, {order.shippingInfo.country}
                </p>
                {order.shippingInfo.postalCode && (
                  <p>Postal code: {order.shippingInfo.postalCode}</p>
                )}
                {order.shippingInfo.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Notes: {order.shippingInfo.notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {getPaymentBadge(order.paymentStatus)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking */}
        {order.trackingNumber && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking Number</span>
                  {order.trackingUrl ? (
                    <a 
                      href={order.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {order.trackingNumber}
                    </a>
                  ) : (
                    <span>{order.trackingNumber}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span>{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {order.orderNumber}? This action cannot be undone.
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