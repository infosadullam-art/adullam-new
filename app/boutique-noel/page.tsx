"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Plus, 
  Send,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  FileText,
  RefreshCw,
  Phone,
  MessageCircle,
  Upload,
  Loader2,
  LogIn,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { sourcingApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

// Imports pour les composants UI
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Types
type SourcingStatus = "BROUILLON" | "EN_COURS" | "DEVIS_RECUS" | "COMMANDE" | "ANNULE"
type Priority = "BASSE" | "MOYENNE" | "HAUTE" | "URGENTE"

interface SourcingNeed {
  id: string
  reference: string
  title: string
  productType: string
  description: string
  quantity: number
  quantityUnit: string
  budgetMin?: number
  budgetMax?: number
  deadline: string
  status: SourcingStatus
  priority: Priority
  responsesCount: number
  documents?: { fileName: string; url: string; size: number }[]
  createdAt: string
  fullName: string
  email: string
  phone: string | null
  company?: string | null
}

export default function SourcingPage() {
  console.log("🚀🚀🚀 [SOURCING PAGE] COMPOSANT CHARGÉ - VERSION DEBUG FINALE 🚀🚀🚀")
  
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Hook de devise dynamique
  const { formatPrice, getCurrencySymbol, convertToUSD } = useCurrencyFormatter()

  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"besoins">("besoins")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  
  // États pour les données
  const [needs, setNeeds] = useState<SourcingNeed[]>([])
  
  // États de chargement
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  
  // États pour les formulaires - Version locale pour la saisie
  const [budgetMinLocal, setBudgetMinLocal] = useState("")
  const [budgetMaxLocal, setBudgetMaxLocal] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    productType: "",
    description: "",
    quantity: "",
    quantityUnit: "pièces",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    priority: "MOYENNE",
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: ""
  })
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Stats - Initialisation avec valeurs par défaut
  const [stats, setStats] = useState({
    besoinsEnCours: 0,
    devisAEtudier: 0,
    commandesEnCours: 0,
    stockAReappro: 0
  })

  // ✅ SOLUTION SIMPLE : Calculer les stats directement depuis needs
  const updateStatsFromNeeds = () => {
    console.log("🔄 [updateStatsFromNeeds] needs.length =", needs.length)
    
    if (needs.length === 0) {
      console.log("⚠️ Pas de besoins, stats à 0")
      setStats({
        besoinsEnCours: 0,
        devisAEtudier: 0,
        commandesEnCours: 0,
        stockAReappro: 0
      })
      return
    }
    
    // Afficher tous les statuts des besoins
    console.log("📊 Statuts des besoins:")
    needs.forEach((need, i) => {
      console.log(`  ${i+1}. ${need.title} -> status: "${need.status}"`)
    })
    
    // Compter tous les besoins comme "en cours" (solution simple)
    const total = needs.length
    console.log(`📊 Total des besoins: ${total}`)
    
    setStats({
      besoinsEnCours: total,
      devisAEtudier: 0,
      commandesEnCours: 0,
      stockAReappro: 0
    })
    
    console.log(`✅ Stats mises à jour: besoinsEnCours = ${total}`)
  }

  // ✅ Recalculer les stats quand needs change
  useEffect(() => {
    console.log("🔄 [useEffect] needs a changé, recalcul des stats")
    updateStatsFromNeeds()
  }, [needs])

  // Gestionnaire spécifique pour les budgets avec conversion
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === "budgetMinLocal") {
      setBudgetMinLocal(value)
      const numericValue = parseFloat(value) || 0
      const usdValue = convertToUSD(numericValue)
      setFormData(prev => ({ ...prev, budgetMin: usdValue.toString() }))
    } else if (name === "budgetMaxLocal") {
      setBudgetMaxLocal(value)
      const numericValue = parseFloat(value) || 0
      const usdValue = convertToUSD(numericValue)
      setFormData(prev => ({ ...prev, budgetMax: usdValue.toString() }))
    }
  }

  // Vérifier l'authentification avant toute action nécessitant un compte
  const requireAuth = (action: () => void) => {
    if (!user) {
      setPendingAction(() => action)
      setShowAuthModal(true)
    } else {
      action()
    }
  }

  // Action pour ouvrir le formulaire avec vérification d'auth
  const handleOpenForm = () => {
    requireAuth(() => setShowForm(true))
  }

  // Surveiller les changements d'authentification pour fermer la modale
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false)
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    }
  }, [user, showAuthModal, pendingAction])

  // Mettre à jour formData quand user change
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }))
    }
  }, [user])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Charger les données initiales (uniquement si connecté)
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        console.log("🔍 [SourcingPage] User connecté, chargement des besoins")
        loadNeeds()
      } else {
        console.log("🔍 [SourcingPage] User non connecté")
        setIsLoadingNeeds(false)
      }
    }
  }, [user, authLoading])

  // Recharger quand les filtres changent (uniquement si connecté)
  useEffect(() => {
    if (user && activeTab === "besoins") {
      console.log("🔍 [SourcingPage] Rechargement dû aux filtres")
      loadNeeds()
    }
  }, [activeTab, statusFilter, priorityFilter, debouncedSearch, user])

  // Charger les besoins avec sourcingApi
  const loadNeeds = async () => {
    console.log("=".repeat(60))
    console.log("🔍 [loadNeeds] DÉBUT DU CHARGEMENT")
    console.log("🔍 [loadNeeds] Filtres actifs:", { statusFilter, priorityFilter, debouncedSearch })
    
    setIsLoadingNeeds(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (debouncedSearch) params.search = debouncedSearch

      console.log("🔍 [loadNeeds] Params envoyés:", params)

      const response = await sourcingApi.list(params)
      
      console.log("🔍 [loadNeeds] Response reçue")
      console.log("🔍 [loadNeeds] Response.success:", response.success)
      console.log("🔍 [loadNeeds] Response.data length:", response.data?.length)

      if (response.success && Array.isArray(response.data)) {
        console.log(`✅ [loadNeeds] ${response.data.length} besoins chargés`)
        
        if (response.data.length > 0) {
          console.log("📦 [loadNeeds] Premier besoin:", {
            id: response.data[0].id,
            title: response.data[0].title,
            status: response.data[0].status,
            priority: response.data[0].priority
          })
        }
        
        setNeeds(response.data)
      } else {
        console.log("❌ [loadNeeds] Erreur ou format invalide:", response.error)
        toast.error(response.error || "Erreur chargement")
      }
    } catch (error) {
      console.error("❌ [loadNeeds] Exception:", error)
      toast.error("Erreur chargement")
    } finally {
      setIsLoadingNeeds(false)
      console.log("🔍 [loadNeeds] FIN DU CHARGEMENT - needs.length =", needs.length)
      console.log("=".repeat(60))
    }
  }

  // Gestionnaire formulaire (pour les autres champs)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSubmitError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024)
      const invalidFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024)
      
      if (invalidFiles.length > 0) {
        toast.error(`${invalidFiles.length} fichier(s) dépassent 10 Mo`)
      }
      
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setSubmitError("Le titre du besoin est requis")
      return false
    }
    if (!formData.productType.trim()) {
      setSubmitError("Le type de produit est requis")
      return false
    }
    if (!formData.description.trim()) {
      setSubmitError("La description est requise")
      return false
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setSubmitError("La quantité doit être supérieure à 0")
      return false
    }
    if (!formData.fullName.trim()) {
      setSubmitError("Le nom complet est requis")
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setSubmitError("Email valide requis")
      return false
    }
    return true
  }

  // Fonction principale de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setSubmitError(null)
    setUploadProgress(0)

    try {
      let response;

      if (files.length > 0) {
        const form = new FormData()
        
        Object.entries(formData).forEach(([key, value]) => {
          if (value) form.append(key, value)
        })
        
        files.forEach(file => {
          form.append("documents", file)
        })

        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90))
        }, 200)

        response = await sourcingApi.createWithFiles(form)
        
        clearInterval(progressInterval)
        setUploadProgress(100)
      } else {
        const dataToSend = {
          title: formData.title,
          productType: formData.productType,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          quantityUnit: formData.quantityUnit,
          budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
          deadline: formData.deadline,
          priority: formData.priority,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null
        }

        response = await sourcingApi.create(dataToSend)
      }

      if (response.success) {
        toast.success("Besoin créé avec succès")
        setShowForm(false)
        resetForm()
        loadNeeds()
      } else {
        setSubmitError(response.error || "Erreur lors de la création")
        toast.error(response.error || "Erreur création")
      }

    } catch (error: any) {
      console.error("❌ Erreur:", error)
      const errorMessage = error?.message || "Erreur de connexion au serveur"
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  // Fonction reset
  const resetForm = () => {
    setFormData({
      title: "",
      productType: "",
      description: "",
      quantity: "",
      quantityUnit: "pièces",
      budgetMin: "",
      budgetMax: "",
      deadline: "",
      priority: "MOYENNE",
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: ""
    })
    setBudgetMinLocal("")
    setBudgetMaxLocal("")
    setFiles([])
    setSubmitError(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce besoin ?")) return

    try {
      const response = await sourcingApi.delete(id)

      if (response.success) {
        toast.success("Besoin supprimé")
        loadNeeds()
      } else {
        toast.error(response.error || "Erreur suppression")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur suppression")
    }
  }

  const getStatusBadge = (status: SourcingStatus) => {
    const styles: Record<string, string> = {
      BROUILLON: "bg-neutral-100 text-neutral-600",
      EN_COURS: "bg-blue-100 text-blue-600",
      DEVIS_RECUS: "bg-green-100 text-green-600",
      COMMANDE: "bg-purple-100 text-purple-600",
      ANNULE: "bg-red-100 text-red-600",
      PENDING: "bg-yellow-100 text-yellow-600",
      QUOTED: "bg-green-100 text-green-600"
    }
    return styles[status] || "bg-gray-100 text-gray-600"
  }

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      BASSE: "bg-neutral-100 text-neutral-600",
      MOYENNE: "bg-yellow-100 text-yellow-600",
      HAUTE: "bg-orange-100 text-orange-600",
      URGENTE: "bg-red-100 text-red-600"
    }
    return styles[priority]
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-brand to-brand/80 text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12">
            <Package className="w-12 h-12 mb-4" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Gestion des approvisionnements
            </h1>
            <p className="text-xl mb-8 max-w-2xl">
              Gérez vos besoins d'achat, suivez les devis fournisseurs et commandez pour réapprovisionner votre stock.
            </p>
            
            <button
              onClick={handleOpenForm}
              className="bg-white text-brand px-6 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouveau besoin d'approvisionnement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {user ? (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 -mt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Besoins en cours</h3>
                  <Clock className="w-5 h-5 text-brand" />
                </div>
                <p className="text-2xl font-bold">{stats.besoinsEnCours}</p>
                <p className="text-xs text-muted-foreground mt-1">en attente de traitement</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Devis à étudier</h3>
                  <Eye className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">{stats.devisAEtudier}</p>
                <p className="text-xs text-muted-foreground mt-1">à traiter</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Commandes en cours</h3>
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{stats.commandesEnCours}</p>
                <p className="text-xs text-muted-foreground mt-1">en transit</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Stock à réappro</h3>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold">{stats.stockAReappro}</p>
                <p className="text-xs text-muted-foreground mt-1">produits sous seuil</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 -mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 text-center border-2 border-dashed border-brand/30">
              <Package className="w-16 h-16 text-brand/50 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Connectez-vous pour gérer vos approvisionnements</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Créez un compte ou connectez-vous pour soumettre vos besoins d'achat et suivre vos commandes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href={`/account?mode=login&redirect=${encodeURIComponent('/sourcing')}`}>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href={`/account?mode=register&redirect=${encodeURIComponent('/sourcing')}`}>
                    <UserPlus className="w-4 h-4" />
                    Créer un compte
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs et contenu */}
        {user && (
          <>
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-8">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab("besoins")}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "besoins"
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Besoins d'achat
                </button>
              </div>

              {/* Liste des besoins */}
              {activeTab === "besoins" && (
                <div className="mt-6">
                  {/* Filtres */}
                  <div className="bg-white p-4 rounded-lg border mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        Filtres:
                      </div>
                      <select 
                        className="px-3 py-1.5 border rounded-lg text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">Tous les statuts</option>
                        <option value="PENDING">En attente</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="DEVIS_RECUS">Devis reçus</option>
                        <option value="COMMANDE">Commandé</option>
                      </select>
                      <select 
                        className="px-3 py-1.5 border rounded-lg text-sm"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                      >
                        <option value="">Toutes les priorités</option>
                        <option value="URGENTE">Urgente</option>
                        <option value="HAUTE">Haute</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="BASSE">Basse</option>
                      </select>
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Rechercher un besoin..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-sm"
                        />
                      </div>
                      <button 
                        onClick={loadNeeds}
                        className="p-2 hover:bg-neutral-100 rounded-lg"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Liste */}
                  {isLoadingNeeds ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                    </div>
                  ) : needs.length === 0 ? (
                    <div className="bg-white rounded-lg border p-12 text-center">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun besoin</h3>
                      <p className="text-muted-foreground mb-4">
                        Commencez par créer votre premier besoin d'approvisionnement
                      </p>
                      <button
                        onClick={handleOpenForm}
                        className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Nouveau besoin
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {needs.map((need) => (
                        <div key={need.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-mono text-muted-foreground">{need.reference}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(need.status)}`}>
                                  {need.status === "PENDING" ? "En attente" : need.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(need.priority)}`}>
                                  {need.priority}
                                </span>
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-2">{need.title}</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Package className="w-4 h-4" />
                                  <span>{need.quantity} {need.quantityUnit}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>Deadline: {need.deadline ? format(new Date(need.deadline), "dd MMM yyyy", { locale: fr }) : "Non définie"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <DollarSign className="w-4 h-4" />
                                  <span>
                                    {need.budgetMin ? formatPrice(need.budgetMin) : ""} - {need.budgetMax ? formatPrice(need.budgetMax) : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{need.responsesCount} devis reçus</span>
                                </div>
                              </div>

                              {/* Infos client */}
                              <div className="mt-4 flex flex-wrap gap-4 text-sm border-t pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span className="font-medium">Client:</span> {need.fullName}
                                </div>
                                <a href={`mailto:${need.email}`} className="flex items-center gap-1 text-brand hover:underline">
                                  <span>{need.email}</span>
                                </a>
                                {need.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <a href={`tel:${need.phone}`} className="text-brand hover:underline">
                                      {need.phone}
                                    </a>
                                    <a href={`https://wa.me/${need.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                                      <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </a>
                                  </div>
                                )}
                                {need.company && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>Société: {need.company}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(need.id)}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-red-600"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Formulaire de nouveau besoin */}
            {showForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Nouveau besoin d'approvisionnement</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Décrivez ce que vous devez acheter pour votre stock
                      </p>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-neutral-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {submitError}
                      </div>
                    )}

                    {isSubmitting && uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Envoi en cours...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-brand h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Titre du besoin *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="ex: T-shirts premium coton bio"
                          required
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Type de produit *</label>
                        <input
                          type="text"
                          name="productType"
                          value={formData.productType}
                          onChange={handleInputChange}
                          placeholder="ex: Textile"
                          required
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description détaillée *</label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Spécifications techniques, matériaux, finitions, etc."
                        required
                        disabled={isSubmitting}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Quantité *</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder="1000"
                          required
                          min="1"
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Unité *</label>
                        <select
                          name="quantityUnit"
                          value={formData.quantityUnit}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg disabled:opacity-50"
                        >
                          <option>pièces</option>
                          <option>kg</option>
                          <option>mètres</option>
                          <option>litres</option>
                        </select>
                      </div>
                    </div>

                    {/* BUDGETS AVEC DEVISE LOCALE */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Budget min ({getCurrencySymbol()})
                        </label>
                        <input
                          type="number"
                          name="budgetMinLocal"
                          value={budgetMinLocal}
                          onChange={handleBudgetChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Saisissez en {getCurrencySymbol()} (converti en USD)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Budget max ({getCurrencySymbol()})
                        </label>
                        <input
                          type="number"
                          name="budgetMaxLocal"
                          value={budgetMaxLocal}
                          onChange={handleBudgetChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date limite de besoin *</label>
                        <input
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Priorité *</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full p-3 border rounded-lg disabled:opacity-50"
                        >
                          <option value="BASSE">Basse</option>
                          <option value="MOYENNE">Moyenne</option>
                          <option value="HAUTE">Haute</option>
                          <option value="URGENTE">Urgente</option>
                        </select>
                      </div>
                    </div>

                    {/* SECTION CLIENT */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Vos coordonnées
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nom complet *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Téléphone / WhatsApp</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+225 07 00 00 00"
                            disabled={isSubmitting}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Société (optionnel)</label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Nom de votre entreprise"
                            disabled={isSubmitting}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload de fichiers */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Documents (cahier des charges, photos, etc.) - max 10 Mo par fichier
                      </label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          id="file-upload"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          disabled={isSubmitting}
                        />
                        
                        {files.length > 0 ? (
                          <div className="space-y-2">
                            {files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-neutral-50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(file.size / 1024).toFixed(0)} Ko)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  disabled={isSubmitting}
                                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <label
                              htmlFor="file-upload"
                              className="inline-block mt-2 text-sm text-brand hover:underline cursor-pointer disabled:opacity-50"
                            >
                              <Upload className="w-4 h-4 inline mr-1" />
                              Ajouter d'autres fichiers
                            </label>
                          </div>
                        ) : (
                          <label htmlFor="file-upload" className="cursor-pointer block">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Cliquez pour uploader ou glissez vos fichiers
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, images (max 10 Mo)
                            </p>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={isSubmitting}
                        className="px-6 py-2 border rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {uploadProgress > 0 ? `Envoi... ${uploadProgress}%` : "Création..."}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Créer le besoin
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal d'authentification */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Connexion requise</DialogTitle>
            </DialogHeader>
            <div className="text-center py-6">
              <Package className="w-16 h-16 text-brand/50 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Vous devez être connecté</p>
              <p className="text-sm text-muted-foreground mb-6">
                Pour créer un besoin d'approvisionnement, veuillez vous connecter ou créer un compte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gap-2" onClick={() => setShowAuthModal(false)}>
                  <Link href={`/account?mode=login&redirect=${encodeURIComponent('/sourcing')}`}>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2" onClick={() => setShowAuthModal(false)}>
                  <Link href={`/account?mode=register&redirect=${encodeURIComponent('/sourcing')}`}>
                    <UserPlus className="w-4 h-4" />
                    Créer un compte
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}