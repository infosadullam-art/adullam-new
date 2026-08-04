"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ordersApi } from "@/lib/admin/api-client"
import { MoreHorizontal, Eye, Truck, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderItem {
  product: { title: string; images: string[] }
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  currency: string
  items: OrderItem[]
  createdAt: string
  couponCode?: string | null
  couponDiscount?: number
}

interface Meta {
  page: number
  totalPages: number
  total: number
}

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

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadOrders()
  }, [authLoading, user, page, statusFilter])

  async function loadOrders() {
    setIsLoading(true)
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        limit: 20,
      }
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter
      }

      const response = await ordersApi.list(params)
      if (response.success) {
        setOrders(response.data as Order[])
        setMeta(response.meta as Meta)
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const response = await ordersApi.updateStatus(id, { status })
      if (response.success) {
        toast.success(`Order marked as ${status}`)
        loadOrders()
      } else {
        toast.error(response.error || "Failed to update order")
      }
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div>
        <AdminHeader title="Orders" description="Manage customer orders" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-[180px]" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const columns = [
    {
      key: "order",
      header: "Order",
      cell: (order: Order) => (
        <Link href={`${adminPath}/orders/${order.id}`} className="block hover:opacity-80">
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
        </Link>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (order: Order) => (
        <Link href={`${adminPath}/orders/${order.id}`} className="block hover:opacity-80">
          <div className="flex items-center gap-1">
            <span className="text-sm">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>
        </Link>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (order: Order) => (
        <Link href={`${adminPath}/orders/${order.id}`} className="block hover:opacity-80">
          <span className="font-medium">
            {formatCurrency(order.total)}
          </span>
        </Link>
      ),
    },
    {
      key: "coupon",
      header: "Coupon",
      cell: (order: Order) => (
        <div className="text-sm">
          {order.couponCode ? (
            <div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🎫 {order.couponCode}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                -{formatCurrency(order.couponDiscount || 0)}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (order: Order) => (
        <Link href={`${adminPath}/orders?status=${order.status}`} className="block hover:opacity-80">
          {getStatusBadge(order.status)}
        </Link>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      cell: (order: Order) => (
        <Link href={`${adminPath}/orders?paymentStatus=${order.paymentStatus}`} className="block hover:opacity-80">
          {getPaymentBadge(order.paymentStatus)}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (order: Order) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {order.status === "CONFIRMED" && (
              <DropdownMenuItem onClick={() => updateStatus(order.id, "PROCESSING")}>
                <Truck className="mr-2 h-4 w-4" />
                Mark Processing
              </DropdownMenuItem>
            )}
            {order.status === "PROCESSING" && (
              <DropdownMenuItem onClick={() => updateStatus(order.id, "SHIPPED")}>
                <Truck className="mr-2 h-4 w-4" />
                Mark Shipped
              </DropdownMenuItem>
            )}
            {order.status === "SHIPPED" && (
              <DropdownMenuItem onClick={() => updateStatus(order.id, "DELIVERED")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Delivered
              </DropdownMenuItem>
            )}
            {!["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status) && (
              <DropdownMenuItem onClick={() => updateStatus(order.id, "CANCELLED")} className="text-destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader title="Orders" description="Manage customer orders" />

      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          {meta && (
            <Badge variant="outline" className="ml-2">
              Total: {meta.total} orders
            </Badge>
          )}
        </div>

        <DataTable
          columns={columns}
          data={orders}
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
          emptyMessage="No orders found"
        />
      </div>
    </div>
  )
}