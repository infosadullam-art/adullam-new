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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { sourcingApi, type SourcingRequest, type SourcingStats } from "@/lib/admin/api-client"
import { 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Search, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  FileText,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Building2,
  Filter,
  Trash2  // ✅ AJOUTÉ ICI
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

function formatDate(date: string) {
  return format(new Date(date), "dd MMM yyyy HH:mm", { locale: fr })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "warning"> = {
    PENDING: "warning",
    IN_REVIEW: "secondary",
    QUOTED: "default",
    RESPONDED: "success",
    CLOSED: "outline",
    ARCHIVED: "outline",
  }

  const labels: Record<string, string> = {
    PENDING: "En attente",
    IN_REVIEW: "En cours",
    QUOTED: "Devis envoyé",
    RESPONDED: "Répondu",
    CLOSED: "Clôturé",
    ARCHIVED: "Archivé",
  }

  const icons: Record<string, any> = {
    PENDING: Clock,
    IN_REVIEW: Eye,
    QUOTED: FileText,
    RESPONDED: CheckCircle,
    CLOSED: CheckCircle,
  }

  const Icon = icons[status]
  
  return (
    <Badge variant={variants[status] || "outline"} className="flex items-center gap-1 w-fit">
      {Icon && <Icon className="w-3 h-3" />}
      {labels[status] || status}
    </Badge>
  )
}

export default function SourcingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [requests, setRequests] = useState<SourcingRequest[]>([])
  const [stats, setStats] = useState<SourcingStats | null>(null)
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<SourcingRequest | null>(null)
  const [responseText, setResponseText] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)

  const limit = 20

  // 🔹 Vérifie l'auth avant de charger
  useEffect(() => {
    const init = async () => {
      if (!authLoading) {
        if (!user) {
          toast.error("Session expirée. Veuillez vous reconnecter.")
          router.replace("/admin/login")
          return
        }

        if (user.role !== "ADMIN") {
          toast.error("Accès non autorisé")
          router.replace("/admin/login")
          return
        }

        await Promise.all([loadStats(), loadRequests()])
      }
    }

    init()
  }, [authLoading, user])

  // 🔹 Recharge quand les filtres changent
  useEffect(() => {
    if (user && !authLoading) {
      loadRequests()
    }
  }, [page, statusFilter, search])

  // 🔹 Charge les statistiques
  const loadStats = async () => {
    try {
      const response = await sourcingApi.getStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  // 🔹 Charge les demandes
  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number | boolean | undefined> = { 
        page, 
        limit 
      }
      
      if (statusFilter !== "all") params.status = statusFilter
      if (search) params.search = search

      const response = await sourcingApi.list(params)

      if (response.status === 401 || response.error === "Unauthorized") {
        setRequests([])
        setMeta(null)
        toast.error("Session expirée. Veuillez vous reconnecter.")
        router.replace("/admin/login")
        return
      }

      if (response.success) {
        setRequests(response.data as SourcingRequest[])
        setMeta(response.meta as any)
      } else {
        setRequests([])
        setMeta(null)
        toast.error(response.error || "Erreur chargement")
      }
    } catch (error) {
      console.error("Failed to load requests:", error)
      setRequests([])
      setMeta(null)
      toast.error("Erreur chargement")
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Traite une demande (ouvre le dialogue)
  const handleProcessRequest = (request: SourcingRequest) => {
    setSelectedRequest(request)
    setResponseText(request.response || "")
    setAdminNotes(request.adminNotes || "")
    setShowResponseDialog(true)
  }

  // 🔹 Envoie la réponse
  const handleSubmitResponse = async () => {
    if (!selectedRequest) return
    setIsUpdating(true)

    try {
      const response = await sourcingApi.update(selectedRequest.id, {
        status: "RESPONDED",
        response: responseText,
        adminNotes: adminNotes,
        respondedAt: new Date().toISOString()
      })

      if (response.success) {
        toast.success("Réponse envoyée avec succès")
        setShowResponseDialog(false)
        setSelectedRequest(null)
        loadRequests()
        loadStats()
      } else {
        toast.error(response.error || "Erreur envoi")
      }
    } catch (error) {
      toast.error("Erreur envoi")
    } finally {
      setIsUpdating(false)
    }
  }

  // 🔹 Change le statut rapidement
  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await sourcingApi.update(id, { status: newStatus as any })
      if (response.success) {
        toast.success("Statut mis à jour")
        loadRequests()
        loadStats()
      }
    } catch (error) {
      toast.error("Erreur mise à jour")
    }
  }

  // 🔹 Supprime une demande
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) return
    try {
      await sourcingApi.delete(id)
      toast.success("Demande supprimée")
      loadRequests()
      loadStats()
    } catch (error) {
      toast.error("Erreur suppression")
    }
  }

  // Colonnes du tableau
  const columns = [
    {
      key: "product",
      header: "Produit",
      cell: (request: SourcingRequest) => (
        <div className="flex items-center gap-3 p-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium line-clamp-1">{request.productName}</p>
            <p className="text-sm text-muted-foreground">{request.productType}</p>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      cell: (request: SourcingRequest) => (
        <div className="p-2">
          <p className="font-medium">{request.fullName}</p>
          <p className="text-sm text-muted-foreground">{request.email}</p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantité",
      cell: (request: SourcingRequest) => (
        <div className="p-2 font-medium">
          {request.quantity} {request.quantityUnit}
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      cell: (request: SourcingRequest) => (
        <div className="p-2">
          {request.budgetMin && request.budgetMax ? (
            <>
              <p className="font-medium">{formatCurrency(request.budgetMin)}</p>
              <p className="text-sm text-muted-foreground">- {formatCurrency(request.budgetMax)}</p>
            </>
          ) : (
            <span className="text-muted-foreground">Non spécifié</span>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (request: SourcingRequest) => (
        <div className="p-2 text-sm">
          {formatDate(request.createdAt)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (request: SourcingRequest) => (
        <div className="p-2">
          {getStatusBadge(request.status)}
          {!request.viewedAt && request.status === "PENDING" && (
            <Badge variant="destructive" className="ml-2 text-xs">Nouveau</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[100px]",
      cell: (request: SourcingRequest) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleProcessRequest(request)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Traiter
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/sourcing/${request.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Détails
              </Link>
            </DropdownMenuItem>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center px-2 py-1.5 text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Changer statut
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right">
                <DropdownMenuItem onClick={() => handleQuickStatusChange(request.id, "PENDING")}>
                  En attente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickStatusChange(request.id, "IN_REVIEW")}>
                  En cours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickStatusChange(request.id, "QUOTED")}>
                  Devis envoyé
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickStatusChange(request.id, "RESPONDED")}>
                  Répondu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickStatusChange(request.id, "CLOSED")}>
                  Clôturé
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenuItem 
              onClick={() => handleDelete(request.id)} 
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Demandes de sourcing"
        description="Gérez les demandes de produits des utilisateurs"
        actions={
          <Button variant="outline" onClick={loadRequests}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      <div className="p-6">
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> En attente
                </p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> En cours
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.inReview}</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <p className="text-sm text-purple-600">Devis</p>
                <p className="text-2xl font-bold text-purple-600">{stats.quoted}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <p className="text-sm text-green-600">Répondu</p>
                <p className="text-2xl font-bold text-green-600">{stats.responded}</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Clôturé</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-primary">Ce mois</p>
                <p className="text-2xl font-bold text-primary">{stats.thisMonth}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par produit, client, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="IN_REVIEW">En cours</SelectItem>
                <SelectItem value="QUOTED">Devis envoyé</SelectItem>
                <SelectItem value="RESPONDED">Répondu</SelectItem>
                <SelectItem value="CLOSED">Clôturé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tableau */}
        <DataTable
          columns={columns}
          data={requests}
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
          emptyMessage="Aucune demande de sourcing"
        />
      </div>

      {/* Dialogue de traitement */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Traiter la demande</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Détails client */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">{selectedRequest.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedRequest.email}`} className="text-primary hover:underline">
                      {selectedRequest.email}
                    </a>
                  </div>
                  {selectedRequest.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <a href={`tel:${selectedRequest.phone}`} className="text-primary hover:underline">
                        {selectedRequest.phone}
                      </a>
                    </div>
                  )}
                  {selectedRequest.company && (
                    <div>
                      <p className="text-sm text-muted-foreground">Société</p>
                      <p>{selectedRequest.company}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Détails produit */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produit recherché
                </h4>
                <div>
                  <p className="text-sm text-muted-foreground">Produit</p>
                  <p className="font-medium">{selectedRequest.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantité</p>
                    <p className="font-medium">{selectedRequest.quantity} {selectedRequest.quantityUnit}</p>
                  </div>
                  {selectedRequest.budgetMin && (
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">
                        {formatCurrency(selectedRequest.budgetMin)} - {selectedRequest.budgetMax ? formatCurrency(selectedRequest.budgetMax) : "?"}
                      </p>
                    </div>
                  )}
                  {selectedRequest.deadline && (
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{format(new Date(selectedRequest.deadline), "dd MMM yyyy")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedRequest.documents && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Documents joints</h4>
                  <div className="space-y-2">
                    {JSON.parse(selectedRequest.documents).map((doc: any, i: number) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        {doc.fileName}
                        <Download className="h-3 w-3 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Réponse */}
              <div className="space-y-3">
                <Label htmlFor="response">Votre réponse</Label>
                <Textarea
                  id="response"
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Écrivez votre réponse ici (devis, informations, etc.)..."
                />
              </div>

              {/* Notes admin */}
              <div className="space-y-3">
                <Label htmlFor="notes">Notes privées (admin uniquement)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes internes..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitResponse} 
              disabled={isUpdating || !responseText.trim()}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Envoyer la réponse
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}