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
  defaultShippingMode?: string
  trackingNumber?: string
}

const adminPath = "/admin/dashboard"

// Statuts de commande avec icônes et libellés
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

// Statuts de paiement
const PAYMENT_STATUSES = [
  { value: "PENDING", label: "En attente", color: "text-yellow-600" },
  { value: "PAID", label: "Payé", color: "text-green-600" },
  { value: "FAILED", label: "Échoué", color: "text-red-600" },
  { value: "REFUNDED", label: "Remboursé", color: "text-orange-600" },
]

// Modes de livraison
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
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    items: [],
    notes: "",
    defaultShippingMode: "bateau",
    shippingAddress: {
      name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "CI",
      phone: "",
    },
    billingAddress: {
      name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "CI",
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
          tax: order.tax || 0,
          shipping: order.shippingCost || 0,
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
          shippingAddress: order.shippingInfo ? {
            name: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
            address1: order.shippingInfo.address,
            address2: order.shippingInfo.quartier || "",
            city: order.shippingInfo.city,
            state: order.shippingInfo.city,
            postalCode: order.shippingInfo.postalCode || "",
            country: order.shippingInfo.country || "CI",
            phone: order.shippingInfo.phone,
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
      // Préparer les données pour l'API
      const updateData = {
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        subtotal: formData.subtotal,
        tax: formData.tax,
        shippingCost: formData.shipping,
        discount: formData.discount,
        total: formData.total,
        notes: formData.notes,
        defaultShippingMode: formData.defaultShippingMode,
        trackingNumber: formData.trackingNumber,
      }
      
      const response = await ordersApi.update(orderId, updateData)
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
          <Tabs defaultValue="items" className="space-y-6">
            <TabsList>
              <TabsTrigger value="items">Articles</TabsTrigger>
              <TabsTrigger value="status">Statut</TabsTrigger>
              <TabsTrigger value="shipping">Livraison</TabsTrigger>
              <TabsTrigger value="customer">Client</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Articles de la commande</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un article
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <Label>Produit</Label>
                        <Input
                          value={item.productTitle}
                          onChange={(e) => updateItem(index, 'productTitle', e.target.value)}
                          placeholder="Nom du produit"
                        />
                        {item.variantSummary && (
                          <p className="text-xs text-muted-foreground mt-1">{item.variantSummary}</p>
                        )}
                      </div>
                      <div className="w-24">
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Prix unitaire</Label>
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

                  {formData.items?.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun article dans cette commande
                    </p>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-medium">${formData.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <Label>Frais de livraison</Label>
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
                        <Label>Taxes</Label>
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
                        <Label>Réduction</Label>
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
                      <span className="text-lg">${formData.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                      value={formData.paymentMethod}
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
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input
                      value={formData.shippingAddress?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input
                      value={formData.shippingAddress?.address1 || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, address1: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Complément (Optionnel)</Label>
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
                      <Label>Ville</Label>
                      <Input
                        value={formData.shippingAddress?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: { ...formData.shippingAddress!, city: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Code postal</Label>
                      <Input
                        value={formData.shippingAddress?.postalCode || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: { ...formData.shippingAddress!, postalCode: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Pays</Label>
                    <Input
                      value={formData.shippingAddress?.country || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress!, country: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
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

            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
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
                    <Label>Téléphone</Label>
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