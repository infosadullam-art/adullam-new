"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sourcingApi, type SourcingRequest } from "@/lib/admin/api-client"
import { 
  ArrowLeft,
  Package, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  DollarSign,
  Clock,
  Eye,
  FileText,
  Download,
  MessageCircle,
  CheckCircle,
  Send,
  Plus,
  X
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

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
  const variants: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_REVIEW: "bg-blue-100 text-blue-800",
    QUOTED: "bg-purple-100 text-purple-800",
    RESPONDED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
    ARCHIVED: "bg-neutral-100 text-neutral-600"
  }
  return variants[status] || "bg-gray-100 text-gray-800"
}

const getDocumentUrl = (url: string): string => {
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }
  return url;
}

export default function SourcingDetailPage({ params }: PageProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [request, setRequest] = useState<SourcingRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string | null>(null)

  // ✅ État pour la réponse
  const [responseText, setResponseText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params
        setId(resolvedParams.id)
      } catch (error) {
        console.error("Erreur résolution params:", error)
        setError("Erreur lors du chargement de l'ID")
        setIsLoading(false)
      }
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && id) {
      if (!user) {
        router.replace("/admin/login")
        return
      }
      if (user.role !== "ADMIN") {
        router.replace("/admin/login")
        return
      }
      loadRequest()
    }
  }, [authLoading, user, id])

  const loadRequest = async () => {
    if (!id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log(`🔍 Chargement de la demande: ${id}`)
      const response = await sourcingApi.getById(id)
      
      if (response.success && response.data) {
        setRequest(response.data)
        // Pré-remplir la réponse si elle existe
        if (response.data.response) {
          setResponseText(response.data.response)
        }
        if (response.data.adminNotes) {
          setNoteText(response.data.adminNotes)
        }
      } else {
        const errorMsg = response.error || "Demande non trouvée"
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error("❌ Erreur chargement:", error)
      const errorMsg = error instanceof Error ? error.message : "Erreur de chargement"
      setError(errorMsg)
      toast.error("Impossible de charger la demande")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!request) return
    try {
      const response = await sourcingApi.update(request.id, { status: newStatus as any })
      if (response.success) {
        toast.success("Statut mis à jour")
        loadRequest()
      } else {
        toast.error(response.error || "Erreur mise à jour")
      }
    } catch (error) {
      toast.error("Erreur mise à jour")
    }
  }

  // ✅ Envoyer une réponse
  const handleSendResponse = async () => {
    if (!request || !responseText.trim()) {
      toast.error("Veuillez écrire un message")
      return
    }

    setIsSending(true)
    try {
      const response = await sourcingApi.update(request.id, {
        response: responseText,
        status: "RESPONDED",
        respondedAt: new Date().toISOString()
      })

      if (response.success) {
        toast.success("Réponse envoyée au client")
        setShowResponseDialog(false)
        loadRequest()
      } else {
        toast.error(response.error || "Erreur lors de l'envoi")
      }
    } catch (error) {
      console.error("Erreur envoi réponse:", error)
      toast.error("Erreur lors de l'envoi")
    } finally {
      setIsSending(false)
    }
  }

  // ✅ Ajouter une note privée
  const handleSaveNote = async () => {
    if (!request) return

    setIsSavingNote(true)
    try {
      const response = await sourcingApi.update(request.id, {
        adminNotes: noteText
      })

      if (response.success) {
        toast.success("Note sauvegardée")
        setShowNoteDialog(false)
        loadRequest()
      } else {
        toast.error(response.error || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      console.error("Erreur sauvegarde note:", error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSavingNote(false)
    }
  }

  // ✅ Marquer comme vu
  const handleMarkAsViewed = async () => {
    if (!request) return
    try {
      const response = await sourcingApi.update(request.id, {
        markAsViewed: true
      })
      if (response.success) {
        toast.success("Demande marquée comme vue")
        loadRequest()
      }
    } catch (error) {
      toast.error("Erreur")
    }
  }

  if (authLoading || (isLoading && !error)) {
    return (
      <div>
        <AdminHeader 
          title="Détails de la demande"
          description="Chargement..."
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          }
        />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div>
        <AdminHeader 
          title="Erreur"
          description="Impossible de charger la demande"
          actions={
            <Button variant="outline" onClick={() => router.push("/admin/dashboard/sourcing")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          }
        />
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription>
              {error || "La demande demandée n'existe pas ou a été supprimée."}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <Link href="/admin/dashboard/sourcing">
                Voir toutes les demandes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader 
        title={`Demande #${request.id.slice(0,8)}`}
        description={`Créée le ${formatDate(request.createdAt)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/dashboard/sourcing">
                Toutes les demandes
              </Link>
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Status Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Statut actuel :</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}>
                  {request.status}
                </span>
                {!request.viewedAt && request.status === "PENDING" && (
                  <Badge variant="destructive" className="ml-2">Nouveau</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Select
                  value={request.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="IN_REVIEW">En cours</SelectItem>
                    <SelectItem value="QUOTED">Devis envoyé</SelectItem>
                    <SelectItem value="RESPONDED">Répondu</SelectItem>
                    <SelectItem value="CLOSED">Clôturé</SelectItem>
                    <SelectItem value="ARCHIVED">Archivé</SelectItem>
                  </SelectContent>
                </Select>
                {!request.viewedAt && (
                  <Button variant="outline" size="sm" onClick={handleMarkAsViewed}>
                    <Eye className="mr-2 h-4 w-4" />
                    Marquer comme vu
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations Client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{request.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${request.email}`} className="text-primary hover:underline font-medium">
                  {request.email}
                </a>
              </div>
              {request.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <a href={`tel:${request.phone}`} className="text-primary hover:underline font-medium">
                    {request.phone}
                  </a>
                </div>
              )}
              {request.company && (
                <div>
                  <p className="text-sm text-muted-foreground">Société</p>
                  <p className="font-medium">{request.company}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Détails du produit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produit recherché
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nom du produit</p>
              <p className="font-medium text-lg">{request.productName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type de produit</p>
              <p className="font-medium">{request.productType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{request.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Quantité</p>
                <p className="font-medium">{request.quantity} {request.quantityUnit}</p>
              </div>
              {request.budgetMin && request.budgetMax && (
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">
                    {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
                  </p>
                </div>
              )}
              {request.deadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Date limite</p>
                  <p className="font-medium">{format(new Date(request.deadline), "dd MMM yyyy")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents joints */}
        {request.documents && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents joints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {JSON.parse(request.documents).map((doc: any, i: number) => {
                  const fileUrl = getDocumentUrl(doc.url);
                  
                  return (
                    <a
                      key={i}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(doc.size / 1024)} Ko
                          </p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Eye className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="text-sm">
                    {request.viewedAt ? (
                      <>Demande consultée le {formatDate(request.viewedAt)}</>
                    ) : (
                      <>Demande non consultée</>
                    )}
                  </p>
                </div>
              </div>
              {request.respondedAt && (
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm">
                      Réponse envoyée le {formatDate(request.respondedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ✅ ACTIONS RAPIDES */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowResponseDialog(true)}>
                <Send className="mr-2 h-4 w-4" />
                Répondre au client
              </Button>
              <Button variant="outline" onClick={() => setShowNoteDialog(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Notes privées
              </Button>
              {request.status !== "CLOSED" && (
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    if (confirm("Marquer cette demande comme clôturée ?")) {
                      await handleStatusChange("CLOSED")
                    }
                  }}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Clôturer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Réponse existante */}
        {request.response && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Réponse envoyée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {request.response}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Envoyée le {formatDate(request.respondedAt || request.createdAt)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes privées existantes */}
        {request.adminNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes privées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg text-muted-foreground">
                {request.adminNotes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ✅ Dialogue pour envoyer une réponse */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Répondre au client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Demande de :</p>
              <p className="font-semibold">{request?.fullName}</p>
              <p className="text-sm text-muted-foreground">{request?.productName}</p>
            </div>
            <Textarea
              placeholder="Écrivez votre réponse ici (devis, délais, informations...) *"
              className="min-h-[150px]"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSendResponse} 
                disabled={isSending || !responseText.trim()}
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer la réponse
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Dialogue pour les notes privées */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notes privées (admin uniquement)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Ajoutez des notes internes sur cette demande..."
              className="min-h-[120px]"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveNote} disabled={isSavingNote}>
                {isSavingNote ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}