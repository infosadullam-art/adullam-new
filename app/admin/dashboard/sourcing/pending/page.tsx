"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { sourcingApi, type SourcingRequest } from "@/lib/admin/api-client"
import { Eye, Package, User, Clock, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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
  const labels: Record<string, string> = {
    PENDING: "En attente",
    IN_REVIEW: "En cours",
    QUOTED: "Devis envoyé",
    RESPONDED: "Répondu",
    CLOSED: "Clôturé",
    ARCHIVED: "Archivé",
  }

  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
    QUOTED: "bg-purple-100 text-purple-800 border-purple-200",
    RESPONDED: "bg-green-100 text-green-800 border-green-200",
    CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
    ARCHIVED: "bg-gray-50 text-gray-500 border-gray-200",
  }

  return (
    <Badge variant="outline" className={colors[status] || "bg-gray-100"}>
      {labels[status] || status}
    </Badge>
  )
}

export default function SourcingPendingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<SourcingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadRequests()
  }, [authLoading, user, page])

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const response = await sourcingApi.list({
        page,
        limit: 20,
        status: "PENDING"
      })

      if (response.success) {
        setRequests(response.data as SourcingRequest[])
        setMeta(response.meta as any)
      } else {
        toast.error(response.error || "Erreur chargement")
      }
    } catch (error) {
      console.error("Failed to load pending requests:", error)
      toast.error("Erreur chargement")
    } finally {
      setIsLoading(false)
    }
  }

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
      className: "w-[50px]",
      cell: (request: SourcingRequest) => (
        <Link href={`${adminPath}/sourcing/${request.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Traitement des demandes"
        description="Demandes en attente de traitement"
        actions={
          <Button variant="outline" onClick={loadRequests}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-4 flex items-center gap-4">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1">
            <Clock className="mr-1 h-3 w-3" />
            {meta?.total || 0} demandes en attente
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard/sourcing">
              Voir toutes les demandes
            </Link>
          </Button>
        </div>

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
          emptyMessage="Aucune demande en attente de traitement"
          onRowClick={(request: SourcingRequest) => {
            window.location.href = `${adminPath}/sourcing/${request.id}`
          }}
        />
      </div>
    </div>
  )
}