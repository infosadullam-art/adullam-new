"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { sourcingApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Types
type SourcingStatus = "PENDING" | "IN_REVIEW" | "QUOTED" | "RESPONDED" | "COMMANDE" | "STOCK_BAS" | "CLOSED" | "ARCHIVED"
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

// Couleurs de la charte - EN DEHORS du composant
const brandColor = "#D4372B"
const bgGray = "#FAFAFA"
const surfaceGray = "#F4F4F4"
const textPrimary = "#0A0A0A"
const textSecondary = "#AAAAAA"
const borderColor = "#ECECEC"

// ✅ COMPOSANT CONTENU - avec useSearchParams
function SourcingContent() {
  console.log("🚀🚀🚀 [SOURCING PAGE] COMPOSANT CHARGÉ - VERSION DEBUG FINALE 🚀🚀🚀")
  
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // ✅ Récupérer les paramètres URL pour le pré-remplissage
  const productParam = searchParams?.get('product') || ''
  const quantityParam = searchParams?.get('quantity') || ''
  const priceParam = searchParams?.get('price') || ''
  const productIdParam = searchParams?.get('product_id') || ''

  // Hook de devise dynamique
  const { formatPrice, getCurrencySymbol, convertToUSD } = useCurrencyFormatter()

  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"besoins">("besoins")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [expandedNeedId, setExpandedNeedId] = useState<string | null>(null)
  
  const [needs, setNeeds] = useState<SourcingNeed[]>([])
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true)
  
  const [budgetMinLocal, setBudgetMinLocal] = useState("")
  const [budgetMaxLocal, setBudgetMaxLocal] = useState("")
  
  const [formData, setFormData] = useState({
    title: productParam || "",
    productType: "",
    description: productParam ? `Je souhaite me renseigner sur le produit : ${productParam}${productIdParam ? ` (ID: ${productIdParam})` : ''}` : "",
    quantity: quantityParam || "",
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

  useEffect(() => {
    if (productParam || quantityParam) {
      setFormData(prev => ({
        ...prev,
        title: productParam || prev.title,
        quantity: quantityParam || prev.quantity,
        description: productParam ? `Je souhaite me renseigner sur le produit : ${productParam}${productIdParam ? ` (ID: ${productIdParam})` : ''}` : prev.description
      }))
    }
  }, [productParam, quantityParam, productIdParam])

  useEffect(() => {
    if (productParam && user) {
      setShowForm(true)
    }
  }, [productParam, user])

  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [stats, setStats] = useState({
    besoinsEnCours: 0,
    devisAEtudier: 0,
    commandesEnCours: 0,
    stockAReappro: 0
  })

  // ✅ Fonction de mise à jour des stats avec les nouveaux statuts
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

    const enCours = needs.filter(n => 
      n.status === "PENDING" || n.status === "IN_REVIEW"
    ).length

    const devisAEtudier = needs.filter(n => 
      n.status === "QUOTED"
    ).length

    const commandesEnCours = needs.filter(n => 
      n.status === "COMMANDE"
    ).length

    const stockAReappro = needs.filter(n => 
      n.status === "STOCK_BAS"
    ).length

    setStats({
      besoinsEnCours: enCours,
      devisAEtudier: devisAEtudier,
      commandesEnCours: commandesEnCours,
      stockAReappro: stockAReappro
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
    return () => clearInterval(timer)
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
        router.push('/sourcing')
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
      PENDING: "bg-[#FFF8E1] text-[#F5A623]",
      IN_REVIEW: "bg-[#FFF0F0] text-[#D4372B]",
      QUOTED: "bg-[#E8F5E9] text-[#2E7D32]",
      RESPONDED: "bg-[#E3F2FD] text-[#1565C0]",
      COMMANDE: "bg-[#F3E5F5] text-[#7B1FA2]",
      STOCK_BAS: "bg-[#FFEBEE] text-[#D32F2F]",
      CLOSED: "bg-[#F4F4F4] text-[#AAAAAA]",
      ARCHIVED: "bg-[#F4F4F4] text-[#AAAAAA]",
    }
    const labels: Record<string, string> = {
      PENDING: "En attente",
      IN_REVIEW: "En cours",
      QUOTED: "Devis envoyé",
      RESPONDED: "Répondu",
      COMMANDE: "Commandé",
      STOCK_BAS: "Stock bas",
      CLOSED: "Clôturé",
      ARCHIVED: "Archivé",
    }
    return { style: styles[status] || styles.PENDING, label: labels[status] || status }
  }

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      BASSE: "bg-[#F4F4F4] text-[#AAAAAA]",
      MOYENNE: "bg-[#FFF8E1] text-[#F5A623]",
      HAUTE: "bg-[#FFF0F0] text-[#D4372B]",
      URGENTE: "bg-[#FFEBEE] text-[#D32F2F]"
    }
    return styles[priority] || styles.MOYENNE
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgGray }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: bgGray }}>
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div style={{ background: textPrimary }}>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
            <Package className="w-10 h-10 lg:w-12 lg:h-12 mb-3 lg:mb-4" style={{ color: brandColor }} />
            <h1 
              className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4"
              style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}
            >
              Gestion des approvisionnements
            </h1>
            <p className="text-sm lg:text-base mb-6 lg:mb-8 max-w-2xl" style={{ color: textSecondary, fontFamily: "'Poppins', sans-serif" }}>
              Gérez vos besoins d'achat, suivez les devis fournisseurs et commandez pour réapprovisionner votre stock.
            </p>
            
            <button
              onClick={handleOpenForm}
              className="px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold transition-all hover:opacity-90 inline-flex items-center gap-2 text-sm lg:text-base"
              style={{ background: brandColor, color: "#fff", fontFamily: "'Poppins', sans-serif" }}
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Nouveau besoin
            </button>
          </div>
        </div>

        {user ? (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 -mt-6 lg:-mt-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="rounded-lg p-4 lg:p-6 shadow-sm" style={{ background: "#fff", border: `0.5px solid ${borderColor}` }}>
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium" style={{ color: textSecondary }}>Besoins en cours</h3>
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: brandColor }} />
                </div>
                <p className="text-xl lg:text-2xl font-bold" style={{ color: textPrimary }}>{stats.besoinsEnCours}</p>
              </div>
              
              <div className="rounded-lg p-4 lg:p-6 shadow-sm" style={{ background: "#fff", border: `0.5px solid ${borderColor}` }}>
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium" style={{ color: textSecondary }}>Devis à étudier</h3>
                  <Eye className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: "#F5A623" }} />
                </div>
                <p className="text-xl lg:text-2xl font-bold" style={{ color: textPrimary }}>{stats.devisAEtudier}</p>
              </div>
              
              <div className="rounded-lg p-4 lg:p-6 shadow-sm" style={{ background: "#fff", border: `0.5px solid ${borderColor}` }}>
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium" style={{ color: textSecondary }}>Commandes en cours</h3>
                  <Truck className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: "#2D9CDB" }} />
                </div>
                <p className="text-xl lg:text-2xl font-bold" style={{ color: textPrimary }}>{stats.commandesEnCours}</p>
              </div>
              
              <div className="rounded-lg p-4 lg:p-6 shadow-sm" style={{ background: "#fff", border: `0.5px solid ${borderColor}` }}>
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <h3 className="text-xs lg:text-sm font-medium" style={{ color: textSecondary }}>Stock à réappro</h3>
                  <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: "#D32F2F" }} />
                </div>
                <p className="text-xl lg:text-2xl font-bold" style={{ color: textPrimary }}>{stats.stockAReappro}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 -mt-6 lg:-mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 lg:p-8 text-center border-2 border-dashed" style={{ borderColor: `${brandColor}30` }}>
              <Package className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4" style={{ color: `${brandColor}80` }} />
              <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: textPrimary }}>Connectez-vous pour gérer vos approvisionnements</h2>
              <p className="text-sm lg:text-base mb-6 max-w-lg mx-auto" style={{ color: textSecondary }}>
                Créez un compte ou connectez-vous pour soumettre vos besoins d'achat et suivre vos commandes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2" style={{ background: brandColor, color: "#fff" }}>
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

        {user && (
          <>
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-6 lg:mt-8">
              <div className="border-b" style={{ borderColor: borderColor }}>
                <button
                  onClick={() => setActiveTab("besoins")}
                  className={`px-4 py-2 lg:px-6 lg:py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "besoins"
                      ? `border-[#D4372B] text-[#D4372B]`
                      : "border-transparent text-[#AAAAAA] hover:text-[#0A0A0A]"
                  }`}
                >
                  Besoins d'achat
                </button>
              </div>

              {activeTab === "besoins" && (
                <div className="mt-4 lg:mt-6">
                  <div className="rounded-lg p-3 lg:p-4 border mb-4 lg:mb-6" style={{ background: "#fff", borderColor: borderColor }}>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textSecondary }} />
                      <input
                        type="text"
                        placeholder="Rechercher un besoin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 lg:py-2.5 rounded-lg text-sm"
                        style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                      />
                    </div>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center justify-between w-full mt-3 pt-2"
                      style={{ borderTop: `0.5px solid ${borderColor}`, color: textSecondary }}
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtres</span>
                        {(statusFilter || priorityFilter) && (
                          <span className="text-white text-xs px-1.5 py-0.5 rounded-full" style={{ background: brandColor }}>
                            {(statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0)}
                          </span>
                        )}
                      </div>
                      {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:grid lg:grid-cols-3 gap-4 mt-3 lg:mt-4`}>
                      <select 
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ border: `0.5px solid ${borderColor}`, background: "#fff", color: textPrimary }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">Tous les statuts</option>
                        <option value="PENDING">En attente</option>
                        <option value="IN_REVIEW">En cours</option>
                        <option value="QUOTED">Devis envoyé</option>
                        <option value="RESPONDED">Répondu</option>
                        <option value="COMMANDE">Commandé</option>
                        <option value="STOCK_BAS">Stock bas</option>
                        <option value="CLOSED">Clôturé</option>
                      </select>
                      <select 
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ border: `0.5px solid ${borderColor}`, background: "#fff", color: textPrimary }}
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
                            className="px-3 py-2 text-sm hover:opacity-70"
                            style={{ color: textSecondary }}
                          >
                            Réinitialiser
                          </button>
                        )}
                        <button 
                          onClick={loadNeeds}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100 ml-auto"
                        >
                          <RefreshCw className="w-4 h-4" style={{ color: textSecondary }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isLoadingNeeds ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }}></div>
                    </div>
                  ) : needs.length === 0 ? (
                    <div className="rounded-lg border p-8 lg:p-12 text-center" style={{ background: "#fff", borderColor: borderColor }}>
                      <Package className="w-12 h-12 mx-auto mb-4" style={{ color: textSecondary }} />
                      <h3 className="text-lg font-semibold mb-2" style={{ color: textPrimary }}>Aucun besoin</h3>
                      <p className="mb-4" style={{ color: textSecondary }}>
                        Commencez par créer votre premier besoin d'approvisionnement
                      </p>
                      <button
                        onClick={handleOpenForm}
                        className="px-4 py-2 rounded-lg transition-all hover:opacity-90 inline-flex items-center gap-2"
                        style={{ background: brandColor, color: "#fff" }}
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
                          <div key={need.id} className="rounded-lg border overflow-hidden" style={{ background: "#fff", borderColor: borderColor }}>
                            <div className="p-4 lg:p-6">
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-mono" style={{ color: textSecondary }}>{need.reference}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
                                    {statusLabel}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(need.priority)}`}>
                                    {need.priority}
                                  </span>
                                </div>
                                
                                <h3 className="text-base lg:text-lg font-semibold" style={{ color: textPrimary }}>{need.title}</h3>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center gap-1.5" style={{ color: textSecondary }}>
                                    <Package className="w-3.5 h-3.5" />
                                    <span>{need.quantity} {need.quantityUnit}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" style={{ color: textSecondary }}>
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{need.deadline ? format(new Date(need.deadline), "dd MMM", { locale: fr }) : "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" style={{ color: textSecondary }}>
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>
                                      {need.budgetMin ? formatPrice(need.budgetMin) : "?"} - {need.budgetMax ? formatPrice(need.budgetMax) : "?"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5" style={{ color: textSecondary }}>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>{need.responsesCount} devis</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2" style={{ borderTop: `0.5px solid ${borderColor}` }}>
                                  <button
                                    onClick={() => setExpandedNeedId(isExpanded ? null : need.id)}
                                    className="text-sm flex items-center gap-1"
                                    style={{ color: brandColor }}
                                  >
                                    {isExpanded ? "Voir moins" : "Voir plus"}
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(need.id)}
                                    className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                                    style={{ color: "#D32F2F" }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="border-t p-4 lg:p-6" style={{ borderColor: borderColor, background: bgGray }}>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>Description</h4>
                                    <p className="text-sm" style={{ color: textSecondary }}>{need.description}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>Contact</h4>
                                    <div className="space-y-1 text-sm">
                                      <p style={{ color: textSecondary }}>{need.fullName}</p>
                                      <a href={`mailto:${need.email}`} className="hover:underline block" style={{ color: brandColor }}>
                                        {need.email}
                                      </a>
                                      {need.phone && (
                                        <div className="flex items-center gap-3">
                                          <a href={`tel:${need.phone}`} className="hover:underline" style={{ color: brandColor }}>
                                            {need.phone}
                                          </a>
                                          <a href={`https://wa.me/${need.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1" style={{ color: "#25D366" }}>
                                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                          </a>
                                        </div>
                                      )}
                                      {need.company && (
                                        <p style={{ color: textSecondary }}>Société: {need.company}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {need.documents && Array.isArray(need.documents) && need.documents.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>Documents</h4>
                                      <div className="space-y-1">
                                        {need.documents.map((doc, idx) => (
                                          <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline" style={{ color: brandColor }}>
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

            {showForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 lg:p-6 flex justify-between items-center" style={{ borderColor: borderColor }}>
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold" style={{ color: textPrimary }}>Nouveau besoin</h3>
                      <p className="text-xs lg:text-sm mt-0.5 lg:mt-1" style={{ color: textSecondary }}>
                        Décrivez ce que vous devez acheter
                      </p>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" style={{ color: textSecondary }} />
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
                            className="h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%`, background: brandColor }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Titre du besoin *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="ex: T-shirts premium coton bio"
                          required
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Type de produit *</label>
                        <input
                          type="text"
                          name="productType"
                          value={formData.productType}
                          onChange={handleInputChange}
                          placeholder="ex: Textile"
                          required
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Description détaillée *</label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Spécifications techniques, matériaux, finitions, etc."
                        required
                        disabled={isSubmitting}
                        className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                        style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Quantité *</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder="1000"
                          required
                          min="1"
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Unité *</label>
                        <select
                          name="quantityUnit"
                          value={formData.quantityUnit}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
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
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>
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
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>
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
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Date limite *</label>
                        <input
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Priorité *</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                          style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                        >
                          <option value="BASSE">Basse</option>
                          <option value="MOYENNE">Moyenne</option>
                          <option value="HAUTE">Haute</option>
                          <option value="URGENTE">Urgente</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4" style={{ borderTop: `0.5px solid ${borderColor}` }}>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm lg:text-base" style={{ color: textPrimary }}>
                        <Phone className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: brandColor }} />
                        Vos coordonnées
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Nom complet *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                            style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                            style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Téléphone / WhatsApp</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+225 07 00 00 00"
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                            style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Société</label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Nom de votre entreprise"
                            disabled={isSubmitting}
                            className="w-full p-2.5 lg:p-3 rounded-lg text-sm"
                            style={{ border: `0.5px solid ${borderColor}`, background: surfaceGray, color: textPrimary }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>
                        Documents (max 10 Mo par fichier)
                      </label>
                      <div className="border-2 border-dashed rounded-lg p-4 lg:p-6 text-center" style={{ borderColor: `${borderColor}` }}>
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
                              <div key={index} className="flex items-center justify-between p-2 rounded text-sm" style={{ background: surfaceGray }}>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" style={{ color: textSecondary }} />
                                  <span className="text-sm truncate max-w-[150px] lg:max-w-xs" style={{ color: textPrimary }}>{file.name}</span>
                                  <span className="text-xs" style={{ color: textSecondary }}>
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
                              className="inline-block mt-2 text-sm hover:underline cursor-pointer"
                              style={{ color: brandColor }}
                            >
                              <Upload className="w-4 h-4 inline mr-1" style={{ color: brandColor }} />
                              Ajouter d'autres fichiers
                            </label>
                          </div>
                        ) : (
                          <label htmlFor="file-upload" className="cursor-pointer block">
                            <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: textSecondary }} />
                            <p className="text-sm" style={{ color: textSecondary }}>
                              Cliquez pour uploader vos fichiers
                            </p>
                            <p className="text-xs mt-1" style={{ color: textSecondary }}>
                              PDF, images (max 10 Mo)
                            </p>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col-reverse lg:flex-row justify-end gap-3" style={{ borderTop: `0.5px solid ${borderColor}` }}>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 lg:px-6 lg:py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        style={{ border: `0.5px solid ${borderColor}`, color: textPrimary }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 lg:px-6 lg:py-2 text-white rounded-lg hover:opacity-90 transition-colors inline-flex items-center justify-center gap-2 text-sm"
                        style={{ background: brandColor }}
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

        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-lg" style={{ color: textPrimary }}>Connexion requise</DialogTitle>
            </DialogHeader>
            <div className="text-center py-4 lg:py-6">
              <Package className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4" style={{ color: `${brandColor}80` }} />
              <p className="text-base lg:text-lg font-medium mb-2" style={{ color: textPrimary }}>Vous devez être connecté</p>
              <p className="text-sm mb-6" style={{ color: textSecondary }}>
                Pour créer un besoin d'approvisionnement, veuillez vous connecter ou créer un compte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gap-2" style={{ background: brandColor, color: "#fff" }}>
                  <Link href={`/account?mode=login&redirect=${encodeURIComponent('/sourcing')}`}>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
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

// ✅ PAGE PRINCIPALE AVEC SUSPENSE
export default function SourcingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgGray }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }}></div>
      </div>
    }>
      <SourcingContent />
    </Suspense>
  )
}