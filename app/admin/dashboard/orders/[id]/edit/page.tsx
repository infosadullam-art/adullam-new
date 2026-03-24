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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react"
import { ordersApi, productsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface OrderItem {
  id?: string
  productId: string
  productTitle: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  items: OrderItem[]
  customer?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  shippingAddress?: {
    name: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  billingAddress?: {
    name: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  notes?: string
}

const adminPath = "/admin/dashboard"

export default function EditOrderPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Order>>({
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: "",
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    items: [],
    notes: "",
    shippingAddress: {
      name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      phone: "",
    },
    billingAddress: {
      name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
    },
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
    loadOrder()
  }, [authLoading, user, orderId])

  const loadOrder = async () => {
    try {
      const response = await ordersApi.get(orderId)
      if (response.success && response.data) {
        const order = response.data
        setFormData({
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          discount: order.discount || 0,
          total: order.total,
          items: order.items.map((item: any) => ({
            id: item.id,
            productId: item.product.id,
            productTitle: item.product.title,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          notes: order.notes,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await ordersApi.update(orderId, formData)
      if (response.success) {
        toast.success("Order updated successfully")
        router.push(`${adminPath}/orders/${orderId}`)
      } else {
        toast.error(response.error || "Failed to update order")
      }
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Failed to update order")
    } finally {
      setIsSaving(false)
    }
  }

  const calculateTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = subtotal + (formData.tax || 0) + (formData.shipping || 0) - (formData.discount || 0)
    setFormData({
      ...formData,
      items,
      subtotal,
      total,
    })
  }

  const addItem = () => {
    const newItem: OrderItem = {
      productId: "",
      productTitle: "",
      quantity: 1,
      price: 0,
      total: 0,
    }
    const items = [...(formData.items || []), newItem]
    calculateTotals(items)
  }

  const removeItem = (index: number) => {
    const items = formData.items?.filter((_, i) => i !== index) || []
    calculateTotals(items)
  }

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const items = [...(formData.items || [])]
    items[index] = { ...items[index], [field]: value }
    
    // Recalculate item total
    if (field === 'quantity' || field === 'price') {
      items[index].total = items[index].quantity * items[index].price
    }
    
    calculateTotals(items)
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
        title="Edit Order"
        description={`Order #${orderId}`}
        backButton={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${adminPath}/orders/${orderId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`${adminPath}/orders/${orderId}`}>
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
          <Tabs defaultValue="items" className="space-y-6">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <Label>Product</Label>
                        <Input
                          value={item.productTitle}
                          onChange={(e) => updateItem(index, 'productTitle', e.target.value)}
                          placeholder="Product name"
                        />
                      </div>
                      <div className="w-24">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Total</Label>
                        <Input
                          type="number"
                          value={item.total}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium">${formData.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <Label>Shipping</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.shipping}
                          onChange={(e) => setFormData({
                            ...formData,
                            shipping: parseFloat(e.target.value) || 0,
                            total: (formData.subtotal || 0) + (parseFloat(e.target.value) || 0) + (formData.tax || 0) - (formData.discount || 0)
                          })}
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Tax</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.tax}
                          onChange={(e) => setFormData({
                            ...formData,
                            tax: parseFloat(e.target.value) || 0,
                            total: (formData.subtotal || 0) + (formData.shipping || 0) + (parseFloat(e.target.value) || 0) - (formData.discount || 0)
                          })}
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Discount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.discount}
                          onChange={(e) => setFormData({
                            ...formData,
                            discount: parseFloat(e.target.value) || 0,
                            total: (formData.subtotal || 0) + (formData.shipping || 0) + (formData.tax || 0) - (parseFloat(e.target.value) || 0)
                          })}
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${formData.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Order Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Input
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      placeholder="e.g., Credit Card, PayPal"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={formData.shippingAddress?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.customer?.email || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        customer: { ...formData.customer!, email: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.shippingAddress?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, phone: e.target.value }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.shippingAddress?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Line 1</Label>
                    <Input
                      value={formData.shippingAddress?.address1 || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, address1: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Line 2 (Optional)</Label>
                    <Input
                      value={formData.shippingAddress?.address2 || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, address2: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={formData.shippingAddress?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: { ...formData.shippingAddress!, city: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={formData.shippingAddress?.state || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: { ...formData.shippingAddress!, state: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Postal Code</Label>
                      <Input
                        value={formData.shippingAddress?.postalCode || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: { ...formData.shippingAddress!, postalCode: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={formData.shippingAddress?.country || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: { ...formData.shippingAddress!, country: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="sameAsShipping"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            billingAddress: { ...formData.shippingAddress! }
                          })
                        }
                      }}
                    />
                    <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.billingAddress?.name || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress!, name: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address Line 1</Label>
                      <Input
                        value={formData.billingAddress?.address1 || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress!, address1: e.target.value }
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={formData.billingAddress?.city || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            billingAddress: { ...formData.billingAddress!, city: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={formData.billingAddress?.postalCode || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            billingAddress: { ...formData.billingAddress!, postalCode: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about this order..."
                    rows={6}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}