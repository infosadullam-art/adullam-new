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
  UserPlus,
  ChevronDown,
  ChevronUp,
  Grid3x3,
  Home,
  Newspaper,
  Bell,
  User
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
  const [expandedNeedId, setExpandedNeedId] = useState<string | null>(null)
  
  // États pour les données
  const [needs, setNeeds] = useState<SourcingNeed[]>([])
  
  // États de chargement
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  
  // États pour les formulaires
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
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Stats
  const [stats, setStats] = useState({
    besoinsEnCours: 0,
    devisAEtudier: 0,
    commandesEnCours: 0,
    stockAReappro: 0
  })

  const updateStatsFromNeeds = () => {
    if (needs.length === 0) {
      setStats({
        besoinsEnCours: 0,
        devisAEtudier: 0,
        commandesEnCours: 0,
        stockAReappro: 0
      })
      return
    }
    
    const total = needs.length
    setStats({
      besoinsEnCours: total,
      devisAEtudier: 0,
      commandesEnCours: 0,
      stockAReappro: 0
    })
  }

  useEffect(() => {
    updateStatsFromNeeds()
  }, [needs])

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

  const requireAuth = (action: () => void) => {
    if (!user) {
      setPendingAction(() => action)
      setShowAuthModal(true)
    } else {
      action()
    }
  }

  const handleOpenForm = () => {
    requireAuth(() => setShowForm(true))
  }

  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false)
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    }
  }, [user, showAuthModal, pendingAction])

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadNeeds()
      } else {
        setIsLoadingNeeds(false)
      }
    }
  }, [user, authLoading])

  useEffect(() => {
    if (user && activeTab === "besoins") {
      loadNeeds()
    }
  }, [activeTab, statusFilter, priorityFilter, debouncedSearch, user])

  const loadNeeds = async () => {
    setIsLoadingNeeds(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (debouncedSearch) params.search = debouncedSearch

      const response = await sourcingApi.list(params)

      if (response.success && Array.isArray(response.data)) {
        setNeeds(response.data)
      } else {
        toast.error(response.error || "Erreur chargement")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur chargement")
    } finally {
      setIsLoadingNeeds(false)
    }
  }

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
      BROUILLON: "bg-gray-100 text-gray-600",
      EN_COURS: "bg-blue-100 text-blue-600",
      DEVIS_RECUS: "bg-green-100 text-green-600",
      COMMANDE: "bg-purple-100 text-purple-600",
      ANNULE: "bg-red-100 text-red-600",
      PENDING: "bg-yellow-100 text-yellow-600",
      QUOTED: "bg-green-100 text-green-600"
    }
    const labels: Record<string, string> = {
      BROUILLON: "Brouillon",
      EN_COURS: "En cours",
      DEVIS_RECUS: "Devis reçus",
      COMMANDE: "Commandé",
      ANNULE: "Annulé",
      PENDING: "En attente",
      QUOTED: "Devis reçu"
    }
    return { style: styles[status] || "bg-gray-100 text-gray-600", label: labels[status] || status }
  }

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      BASSE: "bg-gray-100 text-gray-600",
      MOYENNE: "bg-yellow-100 text-yellow-700",
      HAUTE: "bg-orange-100 text-orange-700",
      URGENTE: "bg-red-100 text-red-700"
    }
    return styles[priority]
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72C1C]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        {/* Hero Section - Responsive */}
        <div className="bg-gradient-to-r from-[#C72C1C] to-[#E84C3C] text-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
            <Package className="w-10 h-10 lg:w-12 lg:h-12 mb-3 lg:mb-4" />
            <h1 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4">
              Gestion des approvisionnements
            </h1>
            <p className="text-sm lg:text-base mb-6 lg:mb-8 max-w-2xl">
              Gérez vos besoins d'achat, suivez les devis fournisseurs et commandez pour réapprovisionner votre stock.
            </p>
            
            <button
              onClick={handleOpenForm}
              className="bg-white text-[#C72C1C] px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-sm lg:text-base w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Nouveau besoin
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive */}
        {user ? (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 -mt-6 lg:-mt-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-500">Besoins en cours</h3>
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-[#C72C1C]" />
                </div>
                <p className="text-xl lg:text-2xl font-bold">{stats.besoinsEnCours}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-500">Devis à étudier</h3>
                  <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
                </div>
                <p className="text-xl lg:text-2xl font-bold">{stats.devisAEtudier}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-500">Commandes en cours</h3>
                  <Truck className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
                <p className="text-xl lg:text-2xl font-bold">{stats.commandesEnCours}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-500">Stock à réappro</h3>
                  <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                </div>
                <p className="text-xl lg:text-2xl font-bold">{stats.stockAReappro}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 -mt-6 lg:-mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 lg:p-8 text-center border-2 border-dashed border-[#C72C1C]/30">
              <Package className="w-12 h-12 lg:w-16 lg:h-16 text-[#C72C1C]/50 mx-auto mb-3 lg:mb-4" />
              <h2 className="text-xl lg:text-2xl font-bold mb-2">Connectez-vous pour gérer vos approvisionnements</h2>
              <p className="text-sm lg:text-base text-gray-500 mb-6 max-w-lg mx-auto">
                Créez un compte ou connectez-vous pour soumettre vos besoins d'achat et suivre vos commandes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2 bg-[#C72C1C] hover:bg-[#A82315]">
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
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-6 lg:mt-8">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab("besoins")}
                  className={`px-4 py-2 lg:px-6 lg:py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "besoins"
                      ? "border-[#C72C1C] text-[#C72C1C]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Besoins d'achat
                </button>
              </div>

              {/* Liste des besoins */}
              {activeTab === "besoins" && (
                <div className="mt-4 lg:mt-6">
                  {/* Filtres - Version mobile avec toggle */}
                  <div className="bg-white rounded-lg p-3 lg:p-4 border mb-4 lg:mb-6">
                    {/* Barre de recherche toujours visible */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un besoin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 lg:py-2.5 border rounded-lg text-sm"
                      />
                    </div>
                    
                    {/* Bouton toggle filtres - mobile */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center justify-between w-full mt-3 pt-2 border-t text-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtres</span>
                        {(statusFilter || priorityFilter) && (
                          <span className="bg-[#C72C1C] text-white text-xs px-1.5 py-0.5 rounded-full">
                            {(statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0)}
                          </span>
                        )}
                      </div>
                      {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {/* Filtres - responsive */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:grid lg:grid-cols-3 gap-4 mt-3 lg:mt-4`}>
                      <select 
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
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
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                      >
                        <option value="">Toutes les priorités</option>
                        <option value="URGENTE">Urgente</option>
                        <option value="HAUTE">Haute</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="BASSE">Basse</option>
                      </select>
                      <div className="flex gap-2">
                        {(statusFilter || priorityFilter) && (
                          <button
                            onClick={() => {
                              setStatusFilter("")
                              setPriorityFilter("")
                            }}
                            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                          >
                            Réinitialiser
                          </button>
                        )}
                        <button 
                          onClick={loadNeeds}
                          className="p-2 hover:bg-gray-100 rounded-lg ml-auto"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Liste - Version mobile optimisée */}
                  {isLoadingNeeds ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72C1C]"></div>
                    </div>
                  ) : needs.length === 0 ? (
                    <div className="bg-white rounded-lg border p-8 lg:p-12 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun besoin</h3>
                      <p className="text-gray-500 mb-4">
                        Commencez par créer votre premier besoin d'approvisionnement
                      </p>
                      <button
                        onClick={handleOpenForm}
                        className="bg-[#C72C1C] text-white px-4 py-2 rounded-lg hover:bg-[#A82315] transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Nouveau besoin
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 lg:space-y-4">
                      {needs.map((need) => {
                        const { style: statusStyle, label: statusLabel } = getStatusBadge(need.status)
                        const isExpanded = expandedNeedId === need.id
                        
                        return (
                          <div key={need.id} className="bg-white rounded-lg border overflow-hidden">
                            {/* Carte compacte - toujours visible */}
                            <div className="p-4 lg:p-6">
                              <div className="flex flex-col gap-3">
                                {/* En-tête avec référence et statuts */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-mono text-gray-400">{need.reference}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
                                    {statusLabel}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(need.priority)}`}>
                                    {need.priority}
                                  </span>
                                </div>
                                
                                {/* Titre */}
                                <h3 className="text-base lg:text-lg font-semibold">{need.title}</h3>
                                
                                {/* Infos clés - version mobile en grille 2x2 */}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <Package className="w-3.5 h-3.5" />
                                    <span>{need.quantity} {need.quantityUnit}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{need.deadline ? format(new Date(need.deadline), "dd MMM", { locale: fr }) : "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>
                                      {need.budgetMin ? formatPrice(need.budgetMin) : "?"} - {need.budgetMax ? formatPrice(need.budgetMax) : "?"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>{need.responsesCount} devis</span>
                                  </div>
                                </div>
                                
                                {/* Boutons d'action */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <button
                                    onClick={() => setExpandedNeedId(isExpanded ? null : need.id)}
                                    className="text-sm text-[#C72C1C] flex items-center gap-1"
                                  >
                                    {isExpanded ? "Voir moins" : "Voir plus"}
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(need.id)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Détails étendus - visible quand expansé */}
                            {isExpanded && (
                              <div className="border-t bg-gray-50 p-4 lg:p-6">
                                <div className="space-y-4">
                                  {/* Description */}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">{need.description}</p>
                                  </div>
                                  
                                  {/* Infos client */}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Contact</h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="text-gray-600">{need.fullName}</p>
                                      <a href={`mailto:${need.email}`} className="text-[#C72C1C] hover:underline block">
                                        {need.email}
                                      </a>
                                      {need.phone && (
                                        <div className="flex items-center gap-3">
                                          <a href={`tel:${need.phone}`} className="text-[#C72C1C] hover:underline">
                                            {need.phone}
                                          </a>
                                          <a href={`https://wa.me/${need.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                          </a>
                                        </div>
                                      )}
                                      {need.company && (
                                        <p className="text-gray-500 text-sm">Société: {need.company}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Documents si disponibles */}
                                  {need.documents && need.documents.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2">Documents</h4>
                                      <div className="space-y-1">
                                        {need.documents.map((doc, idx) => (
                                          <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#C72C1C] hover:underline">
                                            <FileText className="w-3.5 h-3.5" />
                                            {doc.fileName}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Formulaire - Version responsive */}
            {showForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 lg:p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold">Nouveau besoin</h3>
                      <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1">
                        Décrivez ce que vous devez acheter
                      </p>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {submitError}
                      </div>
                    )}

                    {isSubmitting && uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Envoi en cours...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#C72C1C] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Titre du besoin *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="ex: T-shirts premium coton bio"
                          required
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#C72C1C]/20 focus:border-[#C72C1C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Type de produit *</label>
                        <input
                          type="text"
                          name="productType"
                          value={formData.productType}
                          onChange={handleInputChange}
                          placeholder="ex: Textile"
                          required
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#C72C1C]/20 focus:border-[#C72C1C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Description détaillée *</label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Spécifications techniques, matériaux, finitions, etc."
                        required
                        disabled={isSubmitting}
                        className="w-full p-2.5 lg:p-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#C72C1C]/20 focus:border-[#C72C1C]"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Quantité *</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder="1000"
                          required
                          min="1"
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#C72C1C]/20 focus:border-[#C72C1C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Unité *</label>
                        <select
                          name="quantityUnit"
                          value={formData.quantityUnit}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                        >
                          <option>pièces</option>
                          <option>kg</option>
                          <option>mètres</option>
                          <option>litres</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
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
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
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
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Date limite *</label>
                        <input
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Priorité *</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                        >
                          <option value="BASSE">Basse</option>
                          <option value="MOYENNE">Moyenne</option>
                          <option value="HAUTE">Haute</option>
                          <option value="URGENTE">Urgente</option>
                        </select>
                      </div>
                    </div>

                    {/* Section client */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm lg:text-base">
                        <Phone className="w-4 h-4 lg:w-5 lg:h-5" />
                        Vos coordonnées
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Nom complet *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Téléphone / WhatsApp</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+225 07 00 00 00"
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Société</label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Nom de votre entreprise"
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload fichiers */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Documents (max 10 Mo par fichier)
                      </label>
                      <div className="border-2 border-dashed rounded-lg p-4 lg:p-6 text-center">
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
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm truncate max-w-[150px] lg:max-w-xs">{file.name}</span>
                                  <span className="text-xs text-gray-400">
                                    ({(file.size / 1024).toFixed(0)} Ko)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  disabled={isSubmitting}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <label
                              htmlFor="file-upload"
                              className="inline-block mt-2 text-sm text-[#C72C1C] hover:underline cursor-pointer"
                            >
                              <Upload className="w-4 h-4 inline mr-1" />
                              Ajouter d'autres fichiers
                            </label>
                          </div>
                        ) : (
                          <label htmlFor="file-upload" className="cursor-pointer block">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              Cliquez pour uploader vos fichiers
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              PDF, images (max 10 Mo)
                            </p>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 flex flex-col-reverse lg:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 lg:px-6 lg:py-2 border rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 lg:px-6 lg:py-2 bg-[#C72C1C] text-white rounded-lg hover:bg-[#A82315] transition-colors inline-flex items-center justify-center gap-2 text-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {uploadProgress > 0 ? `${uploadProgress}%` : "Création..."}
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
              <DialogTitle className="text-center text-lg">Connexion requise</DialogTitle>
            </DialogHeader>
            <div className="text-center py-4 lg:py-6">
              <Package className="w-12 h-12 lg:w-16 lg:h-16 text-[#C72C1C]/50 mx-auto mb-4" />
              <p className="text-base lg:text-lg font-medium mb-2">Vous devez être connecté</p>
              <p className="text-sm text-gray-500 mb-6">
                Pour créer un besoin d'approvisionnement, veuillez vous connecter ou créer un compte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gap-2 bg-[#C72C1C] hover:bg-[#A82315]" onClick={() => setShowAuthModal(false)}>
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