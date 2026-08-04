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
import { ArrowLeft, Save, X, Plus, Trash2, Truck, Ship, Navigation, Send, Home, Package, Clock, CheckCircle } from "lucide-react"
import { ordersApi } from "@/lib/admin/api-client"
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
  variantSummary?: string
  shippingMode?: string
  trackingNumber?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  items: OrderItem[]
  customer?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  shippingInfo?: {
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
  notes?: string
  defaultShippingMode?: string
  trackingNumber?: string
}

const adminPath = "/admin/dashboard"

// Statuts de commande
const ORDER_STATUSES = [
  { value: "PENDING", label: "En attente", icon: Clock, color: "text-yellow-600" },
  { value: "CONFIRMED", label: "Confirmée", icon: CheckCircle, color: "text-green-600" },
  { value: "PROCESSING", label: "En préparation", icon: Package, color: "text-blue-600" },
  { value: "SHIPPED", label: "Expédiée (partie fournisseur)", icon: Truck, color: "text-indigo-600" },
  { value: "IN_TRANSIT", label: "En cours de livraison", icon: Navigation, color: "text-purple-600" },
  { value: "OUT_FOR_DELIVERY", label: "Livraison aujourd'hui", icon: Send, color: "text-orange-600" },
  { value: "DELIVERED", label: "Livrée", icon: Home, color: "text-green-600" },
  { value: "CANCELLED", label: "Annulée", icon: X, color: "text-red-600" },
  { value: "REFUNDED", label: "Remboursée", icon: X, color: "text-red-600" },
]

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "En attente", color: "text-yellow-600" },
  { value: "PAID", label: "Payé", color: "text-green-600" },
  { value: "FAILED", label: "Échoué", color: "text-red-600" },
  { value: "REFUNDED", label: "Remboursé", color: "text-orange-600" },
]

const SHIPPING_MODES = [
  { value: "bateau", label: "Maritime", icon: Ship, days: "35-50j" },
  { value: "avion", label: "Aérien", icon: Truck, days: "15-20j" },
  { value: "express", label: "Express", icon: Send, days: "7-10j" },
]

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
    shippingCost: 0,
    discount: 0,
    total: 0,
    items: [],
    notes: "",
    defaultShippingMode: "bateau",
    shippingInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "CI",
      postalCode: "",
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
      // ✅ Utiliser ordersApi.get avec l'ID en paramètre
      const response = await ordersApi.get(orderId)
      if (response.success && response.data) {
        const order = response.data
        setFormData({
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost || 0,
          discount: order.discount || 0,
          total: order.total,
          items: order.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productTitle: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
            total: item.totalPrice,
            variantSummary: item.variantSummary,
            shippingMode: item.shippingMode,
          })),
          notes: order.notes,
          defaultShippingMode: order.defaultShippingMode || "bateau",
          trackingNumber: order.trackingNumber,
          shippingInfo: order.shippingInfo ? {
            firstName: order.shippingInfo.firstName || "",
            lastName: order.shippingInfo.lastName || "",
            email: order.shippingInfo.email || "",
            phone: order.shippingInfo.phone || "",
            address: order.shippingInfo.address || "",
            city: order.shippingInfo.city || "",
            country: order.shippingInfo.country || "CI",
            postalCode: order.shippingInfo.postalCode || "",
            notes: order.shippingInfo.notes || "",
          } : undefined,
        })
      } else {
        toast.error("Impossible de charger la commande")
        router.push(`${adminPath}/orders`)
      }
    } catch (error) {
      console.error("Failed to load order:", error)
      toast.error("Impossible de charger la commande")
      router.push(`${adminPath}/orders`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // ✅ Utiliser updateStatus (la seule méthode disponible)
      const updateData = {
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        trackingNumber: formData.trackingNumber,
        notes: formData.notes,
        defaultShippingMode: formData.defaultShippingMode,
      }
      
      const response = await ordersApi.updateStatus(orderId, updateData)
      if (response.success) {
        toast.success("Commande mise à jour avec succès")
        router.push(`${adminPath}/orders/${orderId}`)
      } else {
        toast.error(response.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsSaving(false)
    }
  }

  const calculateTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = subtotal + (formData.shippingCost || 0) - (formData.discount || 0)
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
    
    if (field === 'quantity' || field === 'price') {
      items[index].total = items[index].quantity * items[index].price
    }
    
    calculateTotals(items)
  }

  const getStatusIcon = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    if (statusConfig) {
      const Icon = statusConfig.icon
      return <Icon className={`h-4 w-4 ${statusConfig.color} mr-2`} />
    }
    return null
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
        title="Modifier la commande"
        description={`Commande #${orderId.slice(-8)}`}
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
                Annuler
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="status" className="space-y-6">
            <TabsList>
              <TabsTrigger value="status">Statut</TabsTrigger>
              <TabsTrigger value="shipping">Livraison</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Statut de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Statut de la commande</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status.value)}
                              <span>{status.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Statut du paiement</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <span className={status.color}>{status.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Méthode de paiement</Label>
                    <Input
                      value={formData.paymentMethod || ''}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      placeholder="ex: MTN Money, Orange Money, Wave, Visa"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Mode de livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mode de transport</Label>
                    <Select
                      value={formData.defaultShippingMode}
                      onValueChange={(value) => setFormData({ ...formData, defaultShippingMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIPPING_MODES.map((mode) => {
                          const Icon = mode.icon
                          return (
                            <SelectItem key={mode.value} value={mode.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{mode.label}</span>
                                <span className="text-xs text-muted-foreground">({mode.days})</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Numéro de suivi</Label>
                    <Input
                      value={formData.trackingNumber || ''}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      placeholder="Numéro de suivi du colis"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Adresse de livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prénom</Label>
                      <Input
                        value={formData.shippingInfo?.firstName || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingInfo: { ...formData.shippingInfo!, firstName: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input
                        value={formData.shippingInfo?.lastName || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingInfo: { ...formData.shippingInfo!, lastName: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input
                      value={formData.shippingInfo?.address || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingInfo: { ...formData.shippingInfo!, address: e.target.value }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ville</Label>
                      <Input
                        value={formData.shippingInfo?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingInfo: { ...formData.shippingInfo!, city: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Code postal</Label>
                      <Input
                        value={formData.shippingInfo?.postalCode || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingInfo: { ...formData.shippingInfo!, postalCode: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Pays</Label>
                    <Input
                      value={formData.shippingInfo?.country || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingInfo: { ...formData.shippingInfo!, country: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={formData.shippingInfo?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingInfo: { ...formData.shippingInfo!, phone: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.shippingInfo?.email || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingInfo: { ...formData.shippingInfo!, email: e.target.value }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes sur la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ajoutez des notes sur cette commande..."
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