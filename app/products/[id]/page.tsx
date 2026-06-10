"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import {
  ChevronRight,
  Heart,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  ChevronLeft,
  Clock,
  Package,
  Sparkles,
  Zap,
  Ship,
  X,
  Info,
  CreditCard,
  Smartphone,
  Lock
} from "lucide-react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { useLocale } from "@/context/LocaleProvider"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { CurrencyIndicator } from "@/components/currency-indicator"
import { toast } from "react-hot-toast"
import { wishlistApi } from "@/lib/admin/api-client"
import { useAuth } from "@/lib/admin/auth-context"
import { Loader } from "@/components/Loader"
import { apiFetch } from "@/lib/api"

// ============================================================
// INTERFACE POUR LES AVIS CLIENTS
// ============================================================
interface CustomerReview {
  id: string
  authorName: string
  rating: number
  comment: string
  createdAt: string
  verifiedPurchase: boolean
  helpfulCount: number
}

// ============================================================
// INTERFACE POUR LES DONNÉES DE L'API LOGISTIQUE
// ============================================================
interface ShippingOption {
  cost: number
  portePorteCost?: number
  minDays: number
  maxDays: number
  description: string
  estimatedDate: string
  estimatedDateRange: string
  icon: string
}

interface LogisticsData {
  product: any
  weight: {
    productWeight: number | null
    originalWeight: number | null
    packagingWeight: number
    totalWeight: number
    volumetricWeight: number
    chargeableWeight: number
    roundedWeight: number
    wasCredible: boolean
    weightReason: string
  }
  volume: {
    productVolume: number
    totalVolume: number
  }
  shipping: {
    bateau?: ShippingOption
    avion?: ShippingOption
    express?: ShippingOption
  }
  recommended: {
    mode: string
    cost: number
    days: string
    reason: string
    savings?: {
      vsNext: number
      vsFastest: number
      percentage: number
    }
  }
  meta: {
    quantity: number
    destination: string
    destinationName: string
    timestamp: string
  }
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("description")
  const [minQuantity, setMinQuantity] = useState(1)
  const [isMOQMet, setIsMOQMet] = useState(false)
  const { addToCart } = useCart()
  const { country, currency, locale } = useLocale()
  const thumbnailRef = useRef<HTMLDivElement>(null)
  const relatedCarouselRef = useRef<HTMLDivElement>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<"bateau" | "avion" | "express">("bateau")
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false)

  // ============================================================
  // ÉTATS POUR LES AVIS CLIENTS
  // ============================================================
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewsStats, setReviewsStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  // ============================================================
  // ÉTATS POUR LE FORMULAIRE D'AJOUT D'AVIS
  // ============================================================
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    authorName: ''
  })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // ============================================================
  // ÉTATS POUR LES DONNÉES LOGISTIQUES
  // ============================================================
  const [logisticsData, setLogisticsData] = useState<LogisticsData | null>(null)
  const [isLoadingLogistics, setIsLoadingLogistics] = useState(false)
  const [logisticsError, setLogisticsError] = useState<string | null>(null)

  // ============================================================
  // ÉTATS POUR LES VARIANTES
  // ============================================================
  const [attributeGroups, setAttributeGroups] = useState<Record<string, {
    name: string,
    values: string[],
    type: 'primary' | 'secondary',
    hasImages?: boolean
  }>>({})
  
  const [attributeImages, setAttributeImages] = useState<Record<string, string>>({})
  
  // Pour les variantes simples (ex: seulement couleur)
  const [simpleVariantQuantities, setSimpleVariantQuantities] = useState<Record<string, number>>({})
  const [simpleVariantType, setSimpleVariantType] = useState<string>("")
  
  // Pour les variantes multiples (ex: couleur + taille)
  const [complexSelections, setComplexSelections] = useState<Record<string, Record<string, number>>>({})
  const [primaryAttrName, setPrimaryAttrName] = useState<string>("")
  const [secondaryAttrName, setSecondaryAttrName] = useState<string>("")
  
  // Pour les produits sans variantes
  const [simpleQuantity, setSimpleQuantity] = useState(1)
  
  // Popup de sélection pour variantes simples
  const [isSimpleVariantModalOpen, setIsSimpleVariantModalOpen] = useState(false)
  const [selectedSimpleValue, setSelectedSimpleValue] = useState<string>("")
  const [simpleModalQuantity, setSimpleModalQuantity] = useState<number>(0)
  
  // Popup de sélection pour variantes multiples
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'primary' | 'secondary'>('primary')
  const [modalPrimaryValue, setModalPrimaryValue] = useState<string | null>(null)
  const [modalSecondaryOptions, setModalSecondaryOptions] = useState<string[]>([])
  const [modalQuantities, setModalQuantities] = useState<Record<string, number>>({})
  const [modalAttrName, setModalAttrName] = useState<string>("")

  // ✅ AJOUT : État pour la quantité totale à envoyer à l'API
  const [totalQuantity, setTotalQuantity] = useState(1)

  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const [product, setProduct] = useState<any>(null)

  // Couleurs dynamiques
  const brandColor = "#D4372B"
  const brandGradient = "#D4372B"
  const accentColor = "#F5A623"
  const softBg = "#F4F4F4"

  // ============================================================
  // GESTION DES IMAGES
  // ============================================================
  const [images, setImages] = useState<string[]>([])
  
  // ============================================================
  // CHARGEMENT DU PRODUIT
  // ============================================================
  useEffect(() => {
    if (!id) return
    apiFetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setProduct(res.data)
      })
      .catch((err) => console.error("Erreur produit", err))
  }, [id])

  // ============================================================
  // CHARGEMENT DES AVIS CLIENTS
  // ============================================================
  useEffect(() => {
    if (!product?.id) return

    const fetchReviews = async () => {
      setIsLoadingReviews(true)
      try {
        const response = await apiFetch(`/api/products/${product.id}/reviews`)
        const data = await response.json()
        
        if (data.success) {
          const allReviews = data.data || []
          setReviews(allReviews)
          
          const total = allReviews.length
          if (total > 0) {
            const avg = allReviews.reduce((sum: number, r: CustomerReview) => sum + r.rating, 0) / total
            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            allReviews.forEach((r: CustomerReview) => {
              if (r.rating >= 1 && r.rating <= 5) {
                distribution[r.rating as keyof typeof distribution]++
              }
            })
            
            setReviewsStats({
              averageRating: Math.round(avg * 10) / 10,
              totalReviews: total,
              ratingDistribution: distribution
            })
          } else {
            setReviewsStats({
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            })
          }
        }
      } catch (error) {
        console.error("Erreur chargement avis:", error)
      } finally {
        setIsLoadingReviews(false)
      }
    }
    
    fetchReviews()
  }, [product?.id])

  // ============================================================
  // FONCTION POUR FORMATER LA DATE
  // ============================================================
  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  // ============================================================
  // FONCTION POUR AJOUTER UN AVIS
  // ============================================================
  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      toast.error("Veuillez écrire un commentaire")
      return
    }
    
    if (!newReview.authorName.trim()) {
      toast.error("Veuillez entrer votre nom")
      return
    }
    
    setIsSubmittingReview(true)
    
    try {
      const response = await apiFetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment.trim(),
          authorName: newReview.authorName.trim(),
          verifiedPurchase: false,
          createdAt: new Date().toISOString(),
          helpfulCount: 0
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Merci pour votre avis !")
        setShowReviewForm(false)
        setNewReview({ rating: 5, comment: '', authorName: '' })
        
        const refreshResponse = await apiFetch(`/api/products/${product.id}/reviews`)
        const refreshData = await refreshResponse.json()
        
        if (refreshData.success) {
          const allReviews = refreshData.data || []
          setReviews(allReviews)
          
          const total = allReviews.length
          if (total > 0) {
            const avg = allReviews.reduce((sum: number, r: CustomerReview) => sum + r.rating, 0) / total
            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            allReviews.forEach((r: CustomerReview) => {
              if (r.rating >= 1 && r.rating <= 5) {
                distribution[r.rating as keyof typeof distribution]++
              }
            })
            
            setReviewsStats({
              averageRating: Math.round(avg * 10) / 10,
              totalReviews: total,
              ratingDistribution: distribution
            })
          }
        }
      } else {
        toast.error(data.error || "Erreur lors de l'envoi")
      }
    } catch (error) {
      console.error("Erreur submission:", error)
      toast.error("Une erreur est survenue")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // ============================================================
  // VÉRIFICATION SI LE PRODUIT EST DANS LA WISHLIST
  // ============================================================
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return
      
      try {
        const response = await wishlistApi.list()
        
        if (response.success && response.data) {
          const exists = response.data.some((item: any) => 
            item.productId === product.id || item.product?.id === product.id
          )
          setIsWishlisted(exists)
        }
      } catch (error) {
        console.error("Erreur vérification wishlist:", error)
      }
    }
    
    checkWishlist()
  }, [user, product])

  // ============================================================
  // FONCTION POUR AJOUTER/RETIRER DES FAVORIS
  // ============================================================
  const handleToggleWishlist = async () => {
    if (!user) {
      router.push("/account?mode=login")
      return
    }
    
    try {
      if (isWishlisted) {
        const response = await wishlistApi.remove(product.id)
        
        if (response.success) {
          setIsWishlisted(false)
          toast.success("Produit retiré des favoris")
        } else {
          toast.error(response.error || "Erreur lors du retrait des favoris")
        }
      } else {
        const response = await wishlistApi.add(product.id)
        
        if (response.success) {
          setIsWishlisted(true)
          toast.success("Produit ajouté aux favoris")
        } else {
          toast.error(response.error || "Erreur lors de l'ajout aux favoris")
        }
      }
    } catch (error) {
      console.error("Erreur wishlist:", error)
      toast.error("Une erreur est survenue")
    }
  }

  // ============================================================
  // MISE À JOUR DE LA QUANTITÉ TOTALE
  // ============================================================
  useEffect(() => {
    const newTotal = getGrandTotal()
    setTotalQuantity(newTotal > 0 ? newTotal : 1)
  }, [simpleQuantity, simpleVariantQuantities, complexSelections])

  // ============================================================
  // APPEL À L'API LOGISTIQUE
  // ============================================================
  useEffect(() => {
    if (!product || !country) return
    
    const fetchLogisticsEstimate = async () => {
      setIsLoadingLogistics(true)
      setLogisticsError(null)
      
      try {
        const params = new URLSearchParams({
          productId: product.id,
          productTitle: product.title || product.name || "Produit",
          productWeight: product.weight?.toString() || '',
          quantity: totalQuantity.toString(),
          country: country
        })
        
        const response = await apiFetch(`/api/logistics/estimate?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setLogisticsData(data.data)
          
          if (data.data.shipping) {
            const availableModes = ['bateau', 'avion', 'express'].filter(
              mode => data.data.shipping[mode as keyof typeof data.data.shipping]
            )
            if (availableModes.length > 0 && !availableModes.includes(selectedShipping)) {
              setSelectedShipping(availableModes[0] as "bateau" | "avion" | "express")
            }
          }
        } else {
          setLogisticsError(data.error || "Erreur lors du calcul des frais de livraison")
        }
      } catch (error) {
        console.error("Erreur API logistique:", error)
        setLogisticsError("Impossible de calculer les frais de livraison")
      } finally {
        setIsLoadingLogistics(false)
      }
    }
    
    fetchLogisticsEstimate()
  }, [product, country, totalQuantity])

  // ============================================================
  // EXTRACTION INTELLIGENTE DES ATTRIBUTS
  // ============================================================
  useEffect(() => {
    if (!product?.variants) return

    const allAttributes: Record<string, Set<string>> = {}
    const imageMap: Record<string, string> = {}
    const attributeNames: string[] = []
    
    const ignoredAttributes = [
      'color_image', 'colorimage', 'color image',
      'colour_image', 'colourimage', 'colour image',
      'couleur_image', 'couleurimage', 'couleur image'
    ]
    
    product.variants.forEach((variant: any) => {
      if (variant.attributes) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          const normalizedKey = key.toLowerCase().trim()
          
          if (ignoredAttributes.includes(normalizedKey)) return
          
          if (!allAttributes[normalizedKey]) {
            allAttributes[normalizedKey] = new Set()
            attributeNames.push(normalizedKey)
          }
          allAttributes[normalizedKey].add(String(value))
          
          if (variant.image) {
            const comboKey = Object.entries(variant.attributes)
              .filter(([k]) => !ignoredAttributes.includes(k.toLowerCase().trim()))
              .map(([k, v]) => `${k}:${v}`)
              .sort()
              .join('|')
            if (!imageMap[comboKey]) {
              imageMap[comboKey] = variant.image
            }
            
            if (normalizedKey.includes('color') || normalizedKey.includes('couleur')) {
              if (!imageMap[`${normalizedKey}:${value}`]) {
                imageMap[`${normalizedKey}:${value}`] = variant.image
              }
            }
          }
        })
      }
    })

    const formatAttributeName = (key: string): string => {
      const map: Record<string, string> = {
        color: "Couleur", colour: "Couleur", couleur: "Couleur",
        size: "Taille", taille: "Taille", pointure: "Pointure",
        eur_size: "Pointure", material: "Matière", matière: "Matière", matiere: "Matière"
      }
      return map[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1)
    }

    const hasMultipleAttrs = attributeNames.length > 1
    const primaryAttr = attributeNames[0] || ""
    
    setAttributeImages(imageMap)
    
    if (!hasMultipleAttrs) {
      const attrName = primaryAttr
      const attrValues = Array.from(allAttributes[attrName] || [])
      
      setSimpleVariantType(attrName)
      setPrimaryAttrName(formatAttributeName(attrName))
      
      const initialQuantities: Record<string, number> = {}
      attrValues.forEach(value => { initialQuantities[value] = 0 })
      setSimpleVariantQuantities(initialQuantities)
      
      setAttributeGroups({
        [attrName]: {
          name: formatAttributeName(attrName),
          values: attrValues,
          type: 'primary',
          hasImages: attrValues.some(v => imageMap[`${attrName}:${v}`])
        }
      })
    } else {
      const groups: Record<string, {name: string, values: string[], type: 'primary' | 'secondary', hasImages?: boolean}> = {}
      
      attributeNames.forEach((attr, index) => {
        groups[attr] = {
          name: formatAttributeName(attr),
          values: Array.from(allAttributes[attr] || []),
          type: index === 0 ? 'primary' : 'secondary',
          hasImages: index === 0 && Array.from(allAttributes[attr] || []).some(v => imageMap[`${attr}:${v}`])
        }
      })
      
      setAttributeGroups(groups)
      setPrimaryAttrName(groups[primaryAttr]?.name || primaryAttr)
      
      const initialSelections: Record<string, Record<string, number>> = {}
      Array.from(allAttributes[primaryAttr] || []).forEach(value => {
        initialSelections[value] = {}
      })
      setComplexSelections(initialSelections)
      
      const secondaryAttr = attributeNames[1] || ""
      setSecondaryAttrName(groups[secondaryAttr]?.name || secondaryAttr)
    }
    
    const price = product.variants[0]?.price || product.price || 0
    let minQty = 1
    if (price <= 3.26) minQty = 10
    else if (price <= 8.16) minQty = 6
    else if (price <= 16.32) minQty = 4
    else if (price <= 48.98) minQty = 3
    else minQty = 2
    setMinQuantity(minQty)
    
  }, [product])

  // ============================================================
  // COLLECTE DES IMAGES
  // ============================================================
  useEffect(() => {
    if (!product) return
    
    const allImages: string[] = []
    
    if (product.images?.length > 0) {
      allImages.push(...product.images)
    }
    
    if (product.variants?.length > 0) {
      product.variants.forEach((variant: any) => {
        if (variant.image && !allImages.includes(variant.image)) {
          allImages.push(variant.image)
        }
      })
    }
    
    const uniqueImages = allImages.filter((img: string) => img && img.trim() !== "")
    setImages(uniqueImages)
    
    if (selectedImage >= uniqueImages.length) {
      setSelectedImage(0)
    }
  }, [product])

  // ============================================================
  // RECHERCHE DE L'IMAGE PRINCIPALE
  // ============================================================
  useEffect(() => {
    if (!product) return
    
    if (product.variants && product.variants.length > 0) {
      if (Object.keys(simpleVariantQuantities).length > 0) {
        if (selectedSimpleValue && attributeImages[`${simpleVariantType}:${selectedSimpleValue}`]) {
          const imgIndex = images.findIndex(i => i === attributeImages[`${simpleVariantType}:${selectedSimpleValue}`])
          if (imgIndex !== -1) {
            setSelectedImage(imgIndex)
            return
          }
        }
        
        for (const [value, qty] of Object.entries(simpleVariantQuantities)) {
          if (qty > 0 && attributeImages[`${simpleVariantType}:${value}`]) {
            const imgIndex = images.findIndex(i => i === attributeImages[`${simpleVariantType}:${value}`])
            if (imgIndex !== -1) {
              setSelectedImage(imgIndex)
              return
            }
          }
        }
      } 
      else if (Object.keys(complexSelections).length > 0) {
        for (const [primaryValue, secondarySelections] of Object.entries(complexSelections)) {
          if (Object.keys(secondarySelections).length > 0 && attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]) {
            const imgIndex = images.findIndex(i => i === attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`])
            if (imgIndex !== -1) {
              setSelectedImage(imgIndex)
              return
            }
          }
        }
      }
    } else {
      setSelectedImage(0)
    }
  }, [simpleVariantQuantities, complexSelections, selectedSimpleValue, product, attributeImages, images, simpleVariantType])

  // ============================================================
  // FONCTIONS POUR VARIANTES SIMPLES
  // ============================================================
  const openSimpleVariantModal = (value: string) => {
    setSelectedSimpleValue(value)
    setSimpleModalQuantity(simpleVariantQuantities[value] || 0)
    setIsSimpleVariantModalOpen(true)
  }

  const incrementSimpleModal = () => {
    setSimpleModalQuantity(prev => prev + 1)
  }

  const decrementSimpleModal = () => {
    setSimpleModalQuantity(prev => Math.max(0, prev - 1))
  }

  const confirmSimpleVariantSelection = () => {
    setSimpleVariantQuantities(prev => ({
      ...prev,
      [selectedSimpleValue]: simpleModalQuantity
    }))
    setIsSimpleVariantModalOpen(false)
  }

  const getSimpleVariantTotal = (): number => {
    return Object.values(simpleVariantQuantities).reduce((sum, qty) => sum + qty, 0)
  }

  // ============================================================
  // FONCTIONS POUR VARIANTES MULTIPLES
  // ============================================================
  const getAvailableSecondary = (primaryValue: string): string[] => {
    if (!product?.variants) return []
    
    const secondaryValues = new Set<string>()
    const primaryAttr = Object.keys(attributeGroups)[0]
    const secondaryAttr = Object.keys(attributeGroups)[1]
    
    if (!secondaryAttr) return []
    
    product.variants.forEach((variant: any) => {
      const variantPrimary = variant.attributes?.[primaryAttr]
      if (variantPrimary === primaryValue && variant.attributes?.[secondaryAttr]) {
        secondaryValues.add(String(variant.attributes[secondaryAttr]))
      }
    })
    
    return Array.from(secondaryValues).sort()
  }

  const openPrimaryModal = (primaryValue: string) => {
    const secondaryOptions = getAvailableSecondary(primaryValue)
    if (secondaryOptions.length > 0) {
      setModalMode('primary')
      setModalPrimaryValue(primaryValue)
      setModalSecondaryOptions(secondaryOptions)
      setModalAttrName(secondaryAttrName)
      
      const existing: Record<string, number> = {}
      secondaryOptions.forEach(opt => {
        const qty = complexSelections[primaryValue]?.[opt] || 0
        if (qty > 0) existing[opt] = qty
      })
      setModalQuantities(existing)
      
      setIsVariantModalOpen(true)
    }
  }

  const openSecondaryModal = (secondaryValue: string) => {
    const primaryAttr = Object.keys(attributeGroups)[0]
    const primaryOptions = attributeGroups[primaryAttr]?.values || []
    
    setModalMode('secondary')
    setModalPrimaryValue(secondaryValue)
    setModalSecondaryOptions(primaryOptions)
    setModalAttrName(primaryAttrName)
    
    const existing: Record<string, number> = {}
    primaryOptions.forEach(primaryVal => {
      Object.entries(complexSelections[primaryVal] || {}).forEach(([secVal, qty]) => {
        if (secVal === secondaryValue && qty > 0) {
          existing[primaryVal] = (existing[primaryVal] || 0) + qty
        }
      })
    })
    setModalQuantities(existing)
    
    setIsVariantModalOpen(true)
  }

  const addModalQuantity = (value: string) => {
    setModalQuantities(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }))
  }

  const removeModalQuantity = (value: string) => {
    setModalQuantities(prev => {
      const newQty = (prev[value] || 0) - 1
      if (newQty <= 0) {
        const { [value]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [value]: newQty }
    })
  }

  const confirmModalSelection = () => {
    if (modalMode === 'primary' && modalPrimaryValue) {
      setComplexSelections(prev => {
        const updated = { ...prev }
        if (!updated[modalPrimaryValue]) {
          updated[modalPrimaryValue] = {}
        }
        updated[modalPrimaryValue] = { ...modalQuantities }
        return updated
      })
    } else if (modalMode === 'secondary' && modalPrimaryValue) {
      setComplexSelections(prev => {
        const updated = { ...prev }
        const primaryAttr = Object.keys(attributeGroups)[0]
        
        Object.entries(modalQuantities).forEach(([primaryVal, qty]) => {
          if (!updated[primaryVal]) {
            updated[primaryVal] = {}
          }
          if (qty > 0) {
            updated[primaryVal][modalPrimaryValue] = qty
          } else {
            delete updated[primaryVal][modalPrimaryValue]
          }
        })
        
        return updated
      })
    }
    setIsVariantModalOpen(false)
  }

  const getComplexTotal = (): number => {
    let total = 0
    Object.values(complexSelections).forEach(secondarySelections => {
      Object.values(secondarySelections).forEach(qty => {
        total += qty
      })
    })
    return total
  }

  const getPrimaryTotal = (primaryValue: string): number => {
    return Object.values(complexSelections[primaryValue] || {}).reduce((sum, qty) => sum + qty, 0)
  }

  const getSecondaryTotal = (secondaryValue: string): number => {
    let total = 0
    Object.values(complexSelections).forEach(selections => {
      total += selections[secondaryValue] || 0
    })
    return total
  }

  // ============================================================
  // CALCULER LE TOTAL GÉNÉRAL
  // ============================================================
  const getGrandTotal = (): number => {
    if (!product?.variants || product.variants.length === 0) {
      return simpleQuantity
    }
    
    if (Object.keys(simpleVariantQuantities).length > 0) {
      return getSimpleVariantTotal()
    }
    
    return getComplexTotal()
  }

  // ============================================================
  // CALCULS
  // ============================================================
  useEffect(() => {
    if (!product) return
    
    const grandTotal = getGrandTotal()
    setIsMOQMet(grandTotal >= minQuantity)
  }, [simpleVariantQuantities, complexSelections, simpleQuantity, product, minQuantity])

  // ============================================================
  // FONCTIONS D'ACHAT
  // ============================================================
  const handleAddToCart = () => {
    const grandTotal = getGrandTotal()
    if (!isMOQMet || !product || grandTotal === 0) {
      toast.error("Veuillez sélectionner des articles")
      return
    }
    
    let itemsAdded = 0
    
    if (!product.variants || product.variants.length === 0) {
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        quantity: simpleQuantity,
        shippingMode: selectedShipping,
        weight: product.weight,
        image: images[selectedImage] || "/placeholder.svg",
        variantKey: `${product.id}`,
      })
      itemsAdded = simpleQuantity
    }
    else if (Object.keys(simpleVariantQuantities).length > 0) {
      Object.entries(simpleVariantQuantities).forEach(([value, qty]) => {
        if (qty > 0) {
          addToCart({
            id: product.id,
            name: `${product.title} - ${primaryAttrName} ${value}`,
            price: product.price,
            quantity: qty,
            shippingMode: selectedShipping,
            weight: product.weight,
            image: attributeImages[`${simpleVariantType}:${value}`] || images[selectedImage] || "/placeholder.svg",
            variantKey: `${product.id}_${value}`,
            color: value,
          })
          itemsAdded += qty
        }
      })
    }
    else if (Object.keys(complexSelections).length > 0) {
      Object.entries(complexSelections).forEach(([primaryValue, secondarySelections]) => {
        Object.entries(secondarySelections).forEach(([secondaryValue, qty]) => {
          if (qty > 0) {
            addToCart({
              id: product.id,
              name: `${product.title} - ${primaryAttrName} ${primaryValue}, ${secondaryAttrName} ${secondaryValue}`,
              price: product.price,
              quantity: qty,
              shippingMode: selectedShipping,
              weight: product.weight,
              image: attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] || images[selectedImage] || "/placeholder.svg",
              variantKey: `${product.id}_${primaryValue}_${secondaryValue}`,
              color: primaryValue,
              eurSize: secondaryValue,
            })
            itemsAdded += qty
          }
        })
      })
    }
    
    toast.success(`${itemsAdded} article(s) ajouté(s) au panier`, {
      duration: 3000,
      position: 'top-center',
      icon: '🛒'
    })
  }

  const handleBuyNow = () => {
    const grandTotal = getGrandTotal()
    if (!isMOQMet || !product || grandTotal === 0) {
      toast.error("Veuillez sélectionner des articles")
      return
    }
    
    handleAddToCart()
    setTimeout(() => {
      router.push("/cart")
    }, 500)
  }

  const handleContactWhatsApp = () => {
    if (!product) return
    
    const grandTotal = getGrandTotal()
    let selectionsText = ""
    
    if (!product.variants || product.variants.length === 0) {
      selectionsText = `${simpleQuantity} pièce(s)`
    } else if (Object.keys(simpleVariantQuantities).length > 0) {
      selectionsText = Object.entries(simpleVariantQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([value, qty]) => `${primaryAttrName} ${value}: ${qty} pièces`)
        .join('\n')
    } else {
      selectionsText = Object.entries(complexSelections)
        .flatMap(([primaryValue, secondarySelections]) =>
          Object.entries(secondarySelections)
            .filter(([_, qty]) => qty > 0)
            .map(([secondaryValue, qty]) => 
              `${primaryAttrName} ${primaryValue}, ${secondaryAttrName} ${secondaryValue}: ${qty} pièces`
            )
        )
        .join('\n')
    }
    
    const message = `Bonjour, je souhaite commander:\n${selectionsText}\nTotal: ${grandTotal} pièces\nPays: ${country}\nMerci de me confirmer la disponibilité.`
    window.open(`https://wa.me/2250564749151?text=${encodeURIComponent(message)}`, "_blank")
  }

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailRef.current) {
      const container = thumbnailRef.current
      const scrollAmount = container.clientWidth
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  const scrollRelated = (direction: "left" | "right") => {
    if (relatedCarouselRef.current) {
      const container = relatedCarouselRef.current
      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  // ============================================================
  // API FALLBACK - RECOMMANDATIONS RAPIDES
  // ============================================================
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)

  useEffect(() => {
    const fetchFallbackRecommendations = async () => {
      try {
        const res = await apiFetch(`/api/graph/recommendations/fallback?limit=8&exclude=${product?.id || ''}`)
        const data = await res.json()
        if (data.success && data.data.length > 0) {
          setRelatedProducts(data.data)
        }
      } catch (error) {
        console.error('Erreur chargement fallback:', error)
      } finally {
        setIsLoadingRelated(false)
      }
    }
    
    if (product?.id) {
      fetchFallbackRecommendations()
    }
  }, [product?.id])

  // ============================================================
  // FONCTIONS POUR AFFICHER LES DONNÉES LOGISTIQUES
  // ============================================================
  const getShippingCost = (mode: "bateau" | "avion" | "express"): number => {
    if (!logisticsData?.shipping || !logisticsData.shipping[mode]) return 0
    return logisticsData.shipping[mode]?.cost || 0
  }

  const getPortePorteCost = (mode: "bateau" | "avion" | "express"): number => {
    if (!logisticsData?.shipping || !logisticsData.shipping[mode]) return 0
    return logisticsData.shipping[mode]?.portePorteCost || 0
  }

  const getEstimatedDate = (mode: "bateau" | "avion" | "express"): string => {
    if (!logisticsData?.shipping || !logisticsData.shipping[mode]) return ""
    return logisticsData.shipping[mode]?.estimatedDate || ""
  }

  const getShippingDays = (mode: "bateau" | "avion" | "express"): string => {
    if (!logisticsData?.shipping || !logisticsData.shipping[mode]) return ""
    const shipping = logisticsData.shipping[mode]
    return `${shipping?.minDays || 0}-${shipping?.maxDays || 0}j`
  }

  const selectedPortePorteCost = getPortePorteCost(selectedShipping)

  // ============================================================
  // RENDU CONDITIONNEL
  // ============================================================
  if (!product) {
    return <Loader />
  }

  const safeImages = images.length > 0 ? images : ["/placeholder.svg"]
  const productName = product.title || product.name || "Produit"

  const currentPrice = product.price || 0
  const grandTotal = getGrandTotal()
  const hasVariants = product.variants && product.variants.length > 0
  const hasSimpleVariants = Object.keys(simpleVariantQuantities).length > 0
  const hasComplexVariants = Object.keys(complexSelections).length > 0


  return (
    <div className="min-h-screen" style={{ background: '#0C0C0C', color: '#E8E8E8' }}>

      {/* Ambient top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] z-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,55,43,0.4), transparent)' }} />

      <div className="hidden lg:block relative z-10">
        <Header />
      </div>
      <div className="lg:hidden relative z-10">
        <MobileHeader />
      </div>

      <main className="pb-28 lg:pb-0 relative z-10">
        <div className="max-w-[1440px] mx-auto">

          {/* Currency indicator mobile */}
          <div className="lg:hidden px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <CurrencyIndicator />
          </div>

          <div className="px-4 lg:px-10 py-4 lg:py-10">

            {/* Breadcrumb desktop */}
            <nav className="hidden lg:flex items-center gap-2 text-xs mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <a href="/" className="transition-colors hover:text-white/70">Accueil</a>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
              <a href="/category/electronique" className="transition-colors hover:text-white/70">Électronique</a>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{productName}</span>
            </nav>

            {/* ═══════════════════════════════════════
                MOBILE LAYOUT
            ═══════════════════════════════════════ */}
            <div className="lg:hidden">

              {/* Mobile Gallery */}
              <div className="mb-6">
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{ background: '#161616', aspectRatio: '1/1' }}
                >
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={safeImages[selectedImage]}
                      alt={productName}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain p-8"
                      style={{ transition: 'opacity 0.3s ease' }}
                      priority
                    />
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleToggleWishlist}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isWishlisted ? '#D4372B' : 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Heart className="w-4 h-4" style={{ color: isWishlisted ? '#fff' : 'rgba(255,255,255,0.6)', fill: isWishlisted ? '#fff' : 'none' }} />
                  </button>

                  {/* Counter pill */}
                  {safeImages.length > 1 && (
                    <div
                      className="absolute bottom-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      {selectedImage + 1} / {safeImages.length}
                    </div>
                  )}

                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {safeImages.slice(0, 8).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: selectedImage === idx ? '16px' : '5px',
                          height: '5px',
                          background: selectedImage === idx ? '#D4372B' : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Thumbnails */}
                {safeImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
                    {safeImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-200"
                        style={{
                          background: '#161616',
                          border: `1.5px solid ${selectedImage === idx ? '#D4372B' : 'rgba(255,255,255,0.08)'}`,
                          opacity: selectedImage === idx ? 1 : 0.5,
                        }}
                      >
                        <Image src={img} alt="" width={56} height={56} className="w-full h-full object-contain p-1.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Product Info */}
              <div className="space-y-5">

                {/* Title + badges */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(212,55,43,0.15)', color: '#D4372B', border: '1px solid rgba(212,55,43,0.25)' }}
                    >
                      Top vente
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      #{product.id?.slice(-8)}
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold leading-tight" style={{ color: '#F0F0F0', letterSpacing: '-0.02em' }}>
                    {productName}
                  </h1>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                    ))}
                    <span className="ml-1 font-semibold" style={{ color: '#F0F0F0' }}>{reviewsStats.averageRating || 0}</span>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{reviewsStats.totalReviews} avis</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>1.2k ventes</span>
                </div>

                {/* Price block */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="text-2xl font-black" style={{ color: '#D4372B', letterSpacing: '-0.03em' }}>
                      {formatPrice(currentPrice)} × {grandTotal || 1}
                    </span>
                    <span className="text-sm line-through" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: '#D4372B', color: '#fff' }}>
                      −20%
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Prix unitaire: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{formatPrice(currentPrice)}</span>
                  </p>
                </div>

                {/* Variants mobile */}
                {hasVariants && (
                  <>
                    {hasSimpleVariants && (
                      <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{primaryAttrName}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                            const hasImg = attributeImages[`${simpleVariantType}:${value}`]
                            const active = qty > 0
                            return (
                              <button
                                key={value}
                                onClick={() => openSimpleVariantModal(value)}
                                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                style={{
                                  background: active ? 'rgba(212,55,43,0.15)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${active ? 'rgba(212,55,43,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                  color: active ? '#D4372B' : 'rgba(255,255,255,0.6)',
                                }}
                              >
                                {hasImg && <div className="w-4 h-4 rounded-full overflow-hidden"><Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={16} height={16} className="w-full h-full object-cover" /></div>}
                                {value}
                                {active && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center" style={{ background: '#D4372B', color: '#fff' }}>{qty}</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {hasComplexVariants && (
                      <>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{primaryAttrName}</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(complexSelections).map((primaryValue) => {
                              const total = getPrimaryTotal(primaryValue)
                              const hasImg = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]
                              return (
                                <button key={primaryValue} onClick={() => openPrimaryModal(primaryValue)}
                                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                  style={{ background: total > 0 ? 'rgba(212,55,43,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${total > 0 ? 'rgba(212,55,43,0.5)' : 'rgba(255,255,255,0.08)'}`, color: total > 0 ? '#D4372B' : 'rgba(255,255,255,0.6)' }}>
                                  {hasImg && <div className="w-4 h-4 rounded-full overflow-hidden"><Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={16} height={16} className="w-full h-full object-cover" /></div>}
                                  {primaryValue}
                                  {total > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center" style={{ background: '#D4372B', color: '#fff' }}>{total}</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        {secondaryAttrName && (
                          <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{secondaryAttrName}</p>
                            <div className="flex flex-wrap gap-2">
                              {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map((secondaryValue) => {
                                const total = getSecondaryTotal(secondaryValue)
                                return (
                                  <button key={secondaryValue} onClick={() => openSecondaryModal(secondaryValue)}
                                    className="relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                    style={{ background: total > 0 ? 'rgba(212,55,43,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${total > 0 ? 'rgba(212,55,43,0.5)' : 'rgba(255,255,255,0.08)'}`, color: total > 0 ? '#D4372B' : 'rgba(255,255,255,0.6)' }}>
                                    {secondaryValue}
                                    {total > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center" style={{ background: '#D4372B', color: '#fff' }}>{total}</span>}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {Object.entries(complexSelections).map(([primaryValue, secondarySelections]) => {
                          const nonZero = Object.entries(secondarySelections).filter(([_, qty]) => qty > 0)
                          if (nonZero.length === 0) return null
                          return (
                            <div key={primaryValue} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                              <div className="flex items-center gap-2 mb-2">
                                {attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] && <div className="w-5 h-5 rounded-full overflow-hidden"><Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={20} height={20} className="w-full h-full object-cover" /></div>}
                                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{primaryValue}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {nonZero.map(([sec, qty]) => (
                                  <span key={sec} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                                    {sec} <span style={{ color: '#D4372B', fontWeight: 700 }}>×{qty}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </>
                )}

                {!hasVariants && (
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Quantité</p>
                    <div className="inline-flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))} disabled={simpleQuantity <= 1} className="p-2.5 transition-colors disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Minus className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      </button>
                      <span className="w-12 text-center text-sm font-bold" style={{ color: '#F0F0F0' }}>{simpleQuantity}</span>
                      <button onClick={() => setSimpleQuantity(simpleQuantity + 1)} className="p-2.5 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Plus className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Meta infos */}
                <div className="flex flex-wrap gap-3 text-xs">
                  {[
                    { icon: Package, label: `MOQ: ${minQuantity}` },
                    { icon: Check, label: 'En stock', green: true },
                  ].map(({ icon: Icon, label, green }) => (
                    <span key={label} className="flex items-center gap-1.5" style={{ color: green ? '#4ADE80' : 'rgba(255,255,255,0.4)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: green ? '#4ADE80' : '#D4372B' }} />
                      {label}
                    </span>
                  ))}
                  {isLoadingLogistics ? (
                    <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <span className="w-3 h-3 rounded-full border-2 border-t-[#D4372B] animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#D4372B' }} />
                      Calcul...
                    </span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>{logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg` : '— kg'}</span>
                  )}
                </div>

                {/* Shipping */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Livraison</p>
                    {selectedPortePorteCost > 0 && (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Porte-à-porte: <span style={{ color: '#D4372B', fontWeight: 700 }}>{formatPrice(selectedPortePorteCost)}</span></span>
                    )}
                  </div>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
                    </div>
                  ) : logisticsError ? (
                    <div className="text-xs rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>{logisticsError}</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { mode: 'bateau', icon: Ship, label: 'Mer' },
                        { mode: 'avion', icon: Sparkles, label: 'Air' },
                        { mode: 'express', icon: Zap, label: 'Express' },
                      ] as const).map((item) => {
                        const isAvailable = logisticsData?.shipping?.[item.mode]
                        if (!isAvailable) return null
                        const active = selectedShipping === item.mode
                        return (
                          <button
                            key={item.mode}
                            onClick={() => setSelectedShipping(item.mode)}
                            className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                            style={{
                              background: active ? '#D4372B' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${active ? '#D4372B' : 'rgba(255,255,255,0.08)'}`,
                              transform: active ? 'translateY(-1px)' : 'none',
                            }}
                          >
                            <item.icon className="w-4 h-4" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                            <span className="text-[11px] font-semibold" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                            <span className="text-[10px]" style={{ color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}>{getShippingDays(item.mode)}</span>
                            <span className="text-[11px] font-bold" style={{ color: active ? '#fff' : '#D4372B' }}>{formatPrice(getShippingCost(item.mode))}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Protection */}
                <button
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,55,43,0.12)' }}>
                    <Shield className="w-4 h-4" style={{ color: '#D4372B' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#F0F0F0' }}>Protection Adullam</p>
                    <div className="flex gap-1.5">
                      {['MTN', 'Orange', 'Wave', 'Visa'].map(m => (
                        <span key={m} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </button>

                {/* MOQ warning */}
                {!isMOQMet && grandTotal > 0 && (
                  <div className="text-xs rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                    <span>⚠</span> Quantité minimum non atteinte ({minQuantity} min). Contactez-nous.
                  </div>
                )}

                {/* Mobile CTA bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4" style={{ background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex gap-2.5 max-w-[1440px] mx-auto">
                    <button
                      onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
                      className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                      style={{ background: isMOQMet && grandTotal > 0 ? '#D4372B' : 'linear-gradient(135deg,#F59E0B,#FBBF24)', color: '#fff' }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isMOQMet && grandTotal > 0 ? `Ajouter (${grandTotal})` : 'Nous contacter'}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!isMOQMet || grandTotal === 0}
                      className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center transition-all active:scale-[0.97] disabled:opacity-30"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', color: '#F0F0F0' }}
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                {/* Trust row */}
                <div className="grid grid-cols-2 gap-2 pt-2 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {[
                    { icon: Shield, label: 'Garantie 12 mois' },
                    { icon: RotateCcw, label: 'Retour 15 jours' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: '#D4372B' }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Tabs */}
              <div className="mt-6">
                <div className="flex overflow-x-auto hide-scrollbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'specifications', label: 'Caractéristiques' },
                    { id: 'avis', label: `Avis (${reviewsStats.totalReviews})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex-shrink-0 px-4 py-3.5 text-sm font-medium relative transition-colors"
                      style={{ color: activeTab === tab.id ? '#F0F0F0' : 'rgba(255,255,255,0.3)' }}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-3 right-3 h-px rounded-full" style={{ background: '#D4372B' }} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="py-6">
                  {activeTab === 'description' && (
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: '1.8' }}>
                        {product.description || product.cleanedDesc || 'Description non disponible'}
                      </p>
                      {product.features?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Points forts</h4>
                          <ul className="space-y-2.5">
                            {product.features.map((f: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2" style={{ background: '#D4372B' }} />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'specifications' && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {(product.specifications || [
                        { label: 'Marque', value: product.brand || 'N/A' },
                        { label: 'Poids', value: product.weight ? `${product.weight} kg` : 'N/A' },
                        { label: 'Garantie', value: '12 mois' },
                      ]).map((s: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</span>
                          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'avis' && (
                    <div className="space-y-5">
                      {!showReviewForm && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                          style={{ border: '1px solid rgba(212,55,43,0.4)', color: '#D4372B', background: 'rgba(212,55,43,0.05)' }}
                        >
                          Donner mon avis
                        </button>
                      )}
                      {showReviewForm && (
                        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm" style={{ color: '#F0F0F0' }}>Votre avis</h4>
                            <button onClick={() => setShowReviewForm(false)}><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /></button>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Note</label>
                            <div className="flex gap-2 mt-2">
                              {[1,2,3,4,5].map(s => (
                                <button key={s} onClick={() => setNewReview({ ...newReview, rating: s })}>
                                  <Star className="w-6 h-6 transition-colors" style={{ fill: s <= newReview.rating ? '#F59E0B' : 'none', color: s <= newReview.rating ? '#F59E0B' : 'rgba(255,255,255,0.2)' }} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Nom</label>
                            <input
                              type="text" value={newReview.authorName}
                              onChange={e => setNewReview({ ...newReview, authorName: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-xl outline-none transition-colors"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0' }}
                              placeholder="Jean Dupont"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Commentaire</label>
                            <textarea
                              value={newReview.comment} rows={3}
                              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-xl outline-none resize-none transition-colors"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0' }}
                              placeholder="Partagez votre expérience..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setShowReviewForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>Annuler</button>
                            <button onClick={handleSubmitReview} disabled={isSubmittingReview} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50" style={{ background: '#D4372B', color: '#fff' }}>
                              {isSubmittingReview ? 'Envoi...' : 'Publier'}
                            </button>
                          </div>
                        </div>
                      )}
                      {isLoadingReviews ? (
                        <div className="space-y-4">
                          {[1,2].map(i => <div key={i} className="animate-pulse space-y-2"><div className="flex gap-2"><div className="w-7 h-7 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} /><div className="h-3 rounded w-24" style={{ background: 'rgba(255,255,255,0.08)' }} /></div><div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.05)' }} /><div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.05)' }} /></div>)}
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-10">
                          <Star className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.1)' }} />
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun avis pour le moment</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="text-center">
                              <div className="text-3xl font-black" style={{ color: '#D4372B' }}>{reviewsStats.averageRating}</div>
                              <div className="flex justify-center mt-1">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3" style={{ fill: s <= Math.round(reviewsStats.averageRating) ? '#F59E0B' : 'none', color: s <= Math.round(reviewsStats.averageRating) ? '#F59E0B' : 'rgba(255,255,255,0.15)' }} />)}</div>
                              <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{reviewsStats.totalReviews} avis</p>
                            </div>
                            <div className="flex-1 space-y-1.5">
                              {[5,4,3,2,1].map(r => {
                                const count = reviewsStats.ratingDistribution[r as keyof typeof reviewsStats.ratingDistribution] || 0
                                const pct = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                                return (
                                  <div key={r} className="flex items-center gap-2 text-[10px]">
                                    <span style={{ color: 'rgba(255,255,255,0.25)', width: '12px' }}>{r}</span>
                                    <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#D4372B' }} /></div>
                                    <span style={{ color: 'rgba(255,255,255,0.25)', width: '12px' }}>{count}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="space-y-4">
                            {reviews.map(review => (
                              <div key={review.id} className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.1)', color: '#F0F0F0' }}>{review.authorName.charAt(0).toUpperCase()}</div>
                                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{review.authorName}</span>
                                    {review.verifiedPurchase && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>Vérifié</span>}
                                  </div>
                                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatReviewDate(review.createdAt)}</span>
                                </div>
                                <div className="flex gap-0.5 mb-1.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5" style={{ fill: s <= review.rating ? '#F59E0B' : 'none', color: s <= review.rating ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />)}</div>
                                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{review.comment}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* END MOBILE */}

            {/* ═══════════════════════════════════════
                DESKTOP LAYOUT
            ═══════════════════════════════════════ */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-12 mb-16">

              {/* Left: Gallery */}
              <div className="lg:col-span-5">
                {/* Main image */}
                <div
                  className="relative rounded-2xl overflow-hidden mb-3 group cursor-zoom-in"
                  style={{ background: '#141414', aspectRatio: '1/1', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image
                    src={safeImages[selectedImage]}
                    alt={productName}
                    width={560} height={560}
                    className="w-full h-full object-contain p-10"
                    style={{ transition: 'transform 0.5s ease', transform: 'scale(1)' }}
                    priority
                  />

                  {/* Wishlist */}
                  <button
                    onClick={e => { e.stopPropagation(); handleToggleWishlist(); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isWishlisted ? '#D4372B' : 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${isWishlisted ? '#D4372B' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <Heart className="w-4 h-4" style={{ color: '#fff', fill: isWishlisted ? '#fff' : 'none' }} />
                  </button>

                  {safeImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.6)' }}>
                      {selectedImage + 1} / {safeImages.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {safeImages.length > 1 && (
                  <div className="relative">
                    {safeImages.length > 5 && (
                      <button onClick={() => scrollThumbnails('left')} className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      </button>
                    )}
                    <div ref={thumbnailRef} className="flex gap-2 overflow-x-hidden scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                      {safeImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className="flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200"
                          style={{
                            width: 'calc(20% - 8px)',
                            aspectRatio: '1/1',
                            background: '#141414',
                            border: `1.5px solid ${selectedImage === idx ? '#D4372B' : 'rgba(255,255,255,0.07)'}`,
                            opacity: selectedImage === idx ? 1 : 0.45,
                          }}
                        >
                          <Image src={img} alt="" width={80} height={80} className="w-full h-full object-contain p-2" />
                        </button>
                      ))}
                    </div>
                    {safeImages.length > 5 && (
                      <button onClick={() => scrollThumbnails('right')} className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="lg:col-span-7 flex flex-col gap-6">

                {/* Header */}
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ background: 'rgba(212,55,43,0.12)', color: '#D4372B', border: '1px solid rgba(212,55,43,0.2)' }}>
                      Top vente
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.18)' }}>#{product.id?.slice(-10)}</span>
                  </div>
                  <h1 className="text-2xl font-semibold leading-tight mb-3" style={{ color: '#F2F2F2', letterSpacing: '-0.025em' }}>{productName}</h1>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4" style={{ fill: '#F59E0B', color: '#F59E0B' }} />)}
                      <span className="font-semibold ml-1" style={{ color: '#F2F2F2' }}>{reviewsStats.averageRating || 0}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{reviewsStats.totalReviews} avis</span>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>1,234+ commandes</span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                {/* Price + Variants */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-black" style={{ color: '#D4372B', letterSpacing: '-0.03em' }}>
                      {formatPrice(currentPrice)} × {grandTotal || 1}
                    </span>
                    <span className="text-sm line-through" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: '#D4372B', color: '#fff' }}>−20%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(212,55,43,0.1)', color: '#D4372B', border: '1px solid rgba(212,55,43,0.2)' }}>Prix direct usine</span>
                    <span>USD ${Number(product.price).toFixed(2)} / unité</span>
                  </div>

                  {/* Variants desktop */}
                  {hasVariants && (
                    <>
                      {hasSimpleVariants && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{primaryAttrName}</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                              const hasImg = attributeImages[`${simpleVariantType}:${value}`]
                              const active = qty > 0
                              return (
                                <button key={value} onClick={() => openSimpleVariantModal(value)}
                                  className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
                                  style={{ background: active ? 'rgba(212,55,43,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? 'rgba(212,55,43,0.4)' : 'rgba(255,255,255,0.08)'}`, color: active ? '#D4372B' : 'rgba(255,255,255,0.55)' }}>
                                  {hasImg && <div className="w-5 h-5 rounded-full overflow-hidden"><Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={20} height={20} className="w-full h-full object-cover" /></div>}
                                  {value}
                                  {active && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#D4372B', color: '#fff' }}>{qty}</span>}
                                </button>
                              )
                            })}
                          </div>
                          {Object.entries(simpleVariantQuantities).filter(([_, q]) => q > 0).map(([value, qty]) => (
                            <div key={value} className="flex items-center gap-2 mt-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                              {attributeImages[`${simpleVariantType}:${value}`] && <div className="w-5 h-5 rounded-full overflow-hidden"><Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={20} height={20} className="w-full h-full object-cover" /></div>}
                              <span className="font-medium">{value}</span>
                              <span style={{ color: '#D4372B', fontWeight: 700 }}>×{qty}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasComplexVariants && (
                        <>
                          <div className="mb-4">
                            <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{primaryAttrName}</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(complexSelections).map(primaryValue => {
                                const total = getPrimaryTotal(primaryValue)
                                const hasImg = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]
                                return (
                                  <button key={primaryValue} onClick={() => openPrimaryModal(primaryValue)}
                                    className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
                                    style={{ background: total > 0 ? 'rgba(212,55,43,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${total > 0 ? 'rgba(212,55,43,0.4)' : 'rgba(255,255,255,0.08)'}`, color: total > 0 ? '#D4372B' : 'rgba(255,255,255,0.55)' }}>
                                    {hasImg && <div className="w-5 h-5 rounded-full overflow-hidden"><Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={20} height={20} className="w-full h-full object-cover" /></div>}
                                    {primaryValue}
                                    {total > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#D4372B', color: '#fff' }}>{total}</span>}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          {secondaryAttrName && (
                            <div className="mb-4">
                              <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{secondaryAttrName}</p>
                              <div className="flex flex-wrap gap-2">
                                {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map(secondaryValue => {
                                  const total = getSecondaryTotal(secondaryValue)
                                  return (
                                    <button key={secondaryValue} onClick={() => openSecondaryModal(secondaryValue)}
                                      className="relative px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
                                      style={{ background: total > 0 ? 'rgba(212,55,43,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${total > 0 ? 'rgba(212,55,43,0.4)' : 'rgba(255,255,255,0.08)'}`, color: total > 0 ? '#D4372B' : 'rgba(255,255,255,0.55)' }}>
                                      {secondaryValue}
                                      {total > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#D4372B', color: '#fff' }}>{total}</span>}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          {Object.entries(complexSelections).map(([primaryValue, secondarySelections]) => {
                            const nonZero = Object.entries(secondarySelections).filter(([_, qty]) => qty > 0)
                            if (nonZero.length === 0) return null
                            return (
                              <div key={primaryValue} className="rounded-xl p-3 mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                  {attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] && <div className="w-5 h-5 rounded-full overflow-hidden"><Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={20} height={20} className="w-full h-full object-cover" /></div>}
                                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{primaryValue}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {nonZero.map(([sec, qty]) => (
                                    <span key={sec} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                                      {sec} <span style={{ color: '#D4372B', fontWeight: 700 }}>×{qty}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </>
                      )}
                    </>
                  )}

                  {!hasVariants && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Quantité</p>
                      <div className="inline-flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))} disabled={simpleQuantity <= 1} className="p-2.5 transition-colors disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <Minus className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                        </button>
                        <span className="w-12 text-center text-sm font-bold" style={{ color: '#F0F0F0' }}>{simpleQuantity}</span>
                        <button onClick={() => setSimpleQuantity(simpleQuantity + 1)} className="p-2.5 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <Plus className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-5 text-xs pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                    <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" style={{ color: '#D4372B' }} /> MOQ: {minQuantity}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" style={{ color: '#D4372B' }} /> {logisticsData?.recommended?.days || '15–20'} jours</span>
                    {isLoadingLogistics
                      ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#D4372B' }} /> Calcul...</span>
                      : <span>{logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg` : '— kg'}</span>
                    }
                  </div>
                </div>

                {/* Protection */}
                <button
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left w-full transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,55,43,0.1)' }}>
                    <Shield className="w-5 h-5" style={{ color: '#D4372B' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1.5" style={{ color: '#F0F0F0' }}>Protection des achats Adullam</p>
                    <div className="flex items-center gap-2">
                      {['MTN', 'Orange', 'Wave', 'Visa'].map(m => (
                        <span key={m} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>{m}</span>
                      ))}
                      <span className="ml-auto text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}><Lock className="w-3 h-3" /> SSL</span>
                    </div>
                  </div>
                  <Info className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </button>

                {/* Shipping desktop */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: '#F0F0F0' }}>Mode de livraison</p>
                    {selectedPortePorteCost > 0 && (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Porte-à-porte: <span style={{ color: '#D4372B', fontWeight: 700 }}>{formatPrice(selectedPortePorteCost)}</span></span>
                    )}
                  </div>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}</div>
                  ) : logisticsError ? (
                    <div className="text-xs rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>{logisticsError}</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { mode: 'bateau', icon: Ship, label: 'Maritime' },
                        { mode: 'avion', icon: Sparkles, label: 'Aérien' },
                        { mode: 'express', icon: Zap, label: 'Express' },
                      ] as const).map(item => {
                        const isAvailable = logisticsData?.shipping?.[item.mode]
                        if (!isAvailable) return null
                        const active = selectedShipping === item.mode
                        const days = getShippingDays(item.mode)
                        const cost = getShippingCost(item.mode)
                        const estimatedDate = getEstimatedDate(item.mode)
                        return (
                          <button
                            key={item.mode}
                            onClick={() => setSelectedShipping(item.mode)}
                            className="p-3.5 rounded-xl text-left transition-all duration-200"
                            style={{
                              background: active ? 'rgba(212,55,43,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1.5px solid ${active ? '#D4372B' : 'rgba(255,255,255,0.08)'}`,
                              transform: active ? 'translateY(-2px)' : 'none',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2.5">
                              <item.icon className="w-4 h-4" style={{ color: active ? '#D4372B' : 'rgba(255,255,255,0.35)' }} />
                              <span className="text-xs font-bold" style={{ color: active ? '#F0F0F0' : 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                            </div>
                            <p className="text-sm font-black" style={{ color: active ? '#D4372B' : 'rgba(255,255,255,0.7)' }}>{formatPrice(cost)}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{days} · {estimatedDate}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* MOQ warning */}
                {!isMOQMet && grandTotal > 0 && (
                  <div className="text-sm rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', color: '#FCD34D' }}>
                    <span>⚠</span> Quantité minimum non atteinte ({minQuantity} min). Contactez-nous.
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{
                      background: isMOQMet && grandTotal > 0 ? '#D4372B' : 'linear-gradient(135deg,#F59E0B,#FBBF24)',
                      color: '#fff',
                      boxShadow: isMOQMet && grandTotal > 0 ? '0 4px 24px rgba(212,55,43,0.25)' : 'none',
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isMOQMet && grandTotal > 0 ? `Ajouter au panier (${grandTotal})` : 'Nous contacter'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!isMOQMet || grandTotal === 0}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#F0F0F0' }}
                  >
                    Acheter maintenant
                  </button>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { icon: Shield, label: 'Garantie 12 mois' },
                    { icon: RotateCcw, label: 'Retour 15 jours' },
                    { icon: Check, label: 'Certifié qualité' },
                    { icon: Truck, label: 'Suivi en temps réel' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D4372B' }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* END DESKTOP GRID */}

            {/* ═══════════════════════════════════════
                DESKTOP TABS
            ═══════════════════════════════════════ */}
            <div className="hidden lg:block mb-12">
              <div className="flex gap-1 mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'specifications', label: 'Caractéristiques' },
                  { id: 'avis', label: `Avis (${reviewsStats.totalReviews})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-4 text-sm font-medium relative transition-colors"
                    style={{ color: activeTab === tab.id ? '#F0F0F0' : 'rgba(255,255,255,0.3)' }}
                  >
                    {tab.label}
                    {activeTab === tab.id && <span className="absolute bottom-0 left-4 right-4 h-px rounded-full" style={{ background: '#D4372B' }} />}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <div className="max-w-3xl">
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.9' }}>
                    {product.description || product.cleanedDesc || 'Description non disponible'}
                  </p>
                  {product.features?.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>Points forts</h3>
                      <ul className="grid grid-cols-2 gap-3">
                        {product.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2" style={{ background: '#D4372B' }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="max-w-2xl" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {(product.specifications || [
                    { label: 'Marque', value: 'TechPro' }, { label: 'Modèle', value: 'TP-EB001' },
                    { label: 'Bluetooth', value: '5.2' }, { label: 'Autonomie écouteurs', value: '6 heures' },
                    { label: 'Autonomie boîtier', value: '24 heures' }, { label: 'Charge', value: '1.5 heures' },
                    { label: 'Poids', value: '4.5g / écouteur' }, { label: 'Garantie', value: '12 mois' },
                  ]).map((s: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                      <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'avis' && (
                <div>
                  {!showReviewForm && (
                    <button onClick={() => setShowReviewForm(true)} className="mb-8 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ border: '1px solid rgba(212,55,43,0.35)', color: '#D4372B', background: 'rgba(212,55,43,0.07)' }}>
                      Donner mon avis
                    </button>
                  )}
                  {showReviewForm && (
                    <div className="rounded-2xl p-6 mb-8 max-w-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-sm" style={{ color: '#F0F0F0' }}>Donnez votre avis</h3>
                        <button onClick={() => setShowReviewForm(false)}><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /></button>
                      </div>
                      <div className="mb-4">
                        <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Note</label>
                        <div className="flex gap-2 mt-2">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setNewReview({ ...newReview, rating: s })}><Star className="w-7 h-7 transition-colors" style={{ fill: s <= newReview.rating ? '#F59E0B' : 'none', color: s <= newReview.rating ? '#F59E0B' : 'rgba(255,255,255,0.15)' }} /></button>)}</div>
                      </div>
                      <div className="mb-4">
                        <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Nom</label>
                        <input type="text" value={newReview.authorName} onChange={e => setNewReview({ ...newReview, authorName: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0' }} placeholder="Jean Dupont" />
                      </div>
                      <div className="mb-5">
                        <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Commentaire</label>
                        <textarea value={newReview.comment} rows={4} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl outline-none resize-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0' }} placeholder="Partagez votre expérience..." />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>Annuler</button>
                        <button onClick={handleSubmitReview} disabled={isSubmittingReview} className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors" style={{ background: '#D4372B', color: '#fff' }}>
                          {isSubmittingReview ? 'Envoi...' : 'Publier mon avis'}
                        </button>
                      </div>
                    </div>
                  )}
                  {isLoadingReviews ? (
                    <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><div className="flex gap-3 mb-3"><div className="w-9 h-9 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} /><div className="h-4 rounded w-32" style={{ background: 'rgba(255,255,255,0.07)' }} /></div><div className="h-3 rounded w-full mb-1.5" style={{ background: 'rgba(255,255,255,0.05)' }} /><div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.05)' }} /></div>)}</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-16">
                      <Star className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.07)' }} />
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun avis pour le moment</p>
                    </div>
                  ) : (
                    <div className="flex gap-14">
                      <div className="flex-shrink-0 w-44 text-center">
                        <div className="text-5xl font-black mb-2" style={{ color: '#D4372B' }}>{reviewsStats.averageRating}</div>
                        <div className="flex justify-center gap-0.5 mb-2">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4" style={{ fill: s <= Math.round(reviewsStats.averageRating) ? '#F59E0B' : 'none', color: s <= Math.round(reviewsStats.averageRating) ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />)}</div>
                        <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>{reviewsStats.totalReviews} avis</p>
                        <div className="space-y-2">
                          {[5,4,3,2,1].map(r => {
                            const count = reviewsStats.ratingDistribution[r as keyof typeof reviewsStats.ratingDistribution] || 0
                            const pct = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                            return (
                              <div key={r} className="flex items-center gap-2 text-xs">
                                <span className="w-3 text-right" style={{ color: 'rgba(255,255,255,0.25)' }}>{r}</span>
                                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#D4372B' }} /></div>
                                <span className="w-3" style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex-1 space-y-6 max-h-[520px] overflow-y-auto pr-2">
                        {reviews.map(review => (
                          <div key={review.id} className="pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)', color: '#F0F0F0' }}>{review.authorName.charAt(0).toUpperCase()}</div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold" style={{ color: '#F0F0F0' }}>{review.authorName}</span>
                                    {review.verifiedPurchase && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>Achat vérifié</span>}
                                  </div>
                                  <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3" style={{ fill: s <= review.rating ? '#F59E0B' : 'none', color: s <= review.rating ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />)}</div>
                                </div>
                              </div>
                              <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatReviewDate(review.createdAt)}</span>
                            </div>
                            <p className="text-sm leading-relaxed ml-12" style={{ color: 'rgba(255,255,255,0.5)' }}>{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════
                RELATED PRODUCTS
            ═══════════════════════════════════════ */}
            <div className="mt-4 lg:mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base lg:text-lg font-semibold" style={{ color: '#F0F0F0', letterSpacing: '-0.01em' }}>Vous aimerez aussi</h2>
              </div>

              {isLoadingRelated ? (
                <div className="flex gap-4 overflow-hidden">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex-shrink-0 w-40 lg:w-48">
                      <div className="aspect-square rounded-xl animate-pulse mb-2.5" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-3 rounded animate-pulse mb-1.5" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-3 rounded animate-pulse w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                  ))}
                </div>
              ) : relatedProducts.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Aucune recommandation disponible</p>
              ) : (
                <>
                  {/* Mobile related */}
                  <div className="lg:hidden overflow-x-auto hide-scrollbar -mx-4 px-4">
                    <div className="flex gap-3 w-max">
                      {relatedProducts.map(p => (
                        <a key={p.id} href={`/products/${p.id}`} className="group" style={{ width: 'calc((100vw - 4rem) / 2.5)' }}>
                          <div className="aspect-square rounded-xl overflow-hidden mb-2 transition-all" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Image src={p.image || '/placeholder.svg'} alt={p.name} width={150} height={150} className="w-full h-full object-contain p-3" />
                          </div>
                          <h3 className="text-xs font-medium line-clamp-2 mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{p.name}</h3>
                          <p className="text-sm font-bold" style={{ color: '#D4372B' }}>{formatPrice(p.priceUSD)}</p>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Desktop related */}
                  <div className="hidden lg:block relative">
                    <div ref={relatedCarouselRef} className="overflow-x-auto hide-scrollbar pb-2 scroll-smooth">
                      <div className="flex gap-4 w-max">
                        {relatedProducts.map(p => (
                          <a key={p.id} href={`/products/${p.id}`} className="group" style={{ width: '180px' }}>
                            <div className="aspect-square rounded-xl overflow-hidden mb-3 transition-all" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <Image src={p.image || '/placeholder.svg'} alt={p.name} width={200} height={200} className="w-full h-full object-contain p-4" />
                            </div>
                            <h3 className="text-sm font-medium line-clamp-2 mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{p.name}</h3>
                            <div className="flex items-center gap-1 mb-1">{[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5" style={{ fill: '#F59E0B', color: '#F59E0B' }} />)}<span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.rating || 4.5}</span></div>
                            <p className="text-sm font-bold" style={{ color: '#D4372B' }}>{formatPrice(p.priceUSD)}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => scrollRelated('left')} className="absolute left-0 top-[40%] -translate-y-1/2 -ml-4 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <ChevronLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                    <button onClick={() => scrollRelated('right')} className="absolute right-0 top-[40%] -translate-y-1/2 -mr-4 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════
          IMAGE MODAL
      ═══════════════════════════════════════ */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }} onClick={() => setIsImageModalOpen(false)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <X className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <div className="relative max-w-2xl w-full aspect-square" onClick={e => e.stopPropagation()}>
            <Image src={safeImages[selectedImage]} alt={productName} width={700} height={700} className="w-full h-full object-contain" />
            {safeImages.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}><ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
                <button onClick={() => setSelectedImage(Math.min(safeImages.length - 1, selectedImage + 1))} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}><ChevronRight className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{selectedImage + 1} / {safeImages.length}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          SIMPLE VARIANT MODAL
      ═══════════════════════════════════════ */}
      {isSimpleVariantModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-t-2xl lg:rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                {attributeImages[`${simpleVariantType}:${selectedSimpleValue}`] && (
                  <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Image src={attributeImages[`${simpleVariantType}:${selectedSimpleValue}`]} alt={selectedSimpleValue} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: '#F0F0F0' }}>{primaryAttrName} {selectedSimpleValue}</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Sélectionnez la quantité</p>
                </div>
              </div>
              <button onClick={() => setIsSimpleVariantModalOpen(false)} className="p-1.5 rounded-full transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Quantité</span>
                <div className="flex items-center gap-4">
                  <button onClick={decrementSimpleModal} disabled={simpleModalQuantity <= 0} className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Minus className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                  <span className="w-8 text-center text-lg font-black" style={{ color: '#D4372B' }}>{simpleModalQuantity}</span>
                  <button onClick={incrementSimpleModal} className="w-9 h-9 rounded-full flex items-center justify-center transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Plus className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                </div>
              </div>
              <div className="rounded-xl p-3 mb-4 flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Total sélectionné</span>
                <span className="font-bold text-sm" style={{ color: '#F0F0F0' }}>{simpleModalQuantity} article(s)</span>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setIsSimpleVariantModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>Annuler</button>
                <button onClick={confirmSimpleVariantSelection} className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors" style={{ background: '#D4372B', color: '#fff' }}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          COMPLEX VARIANT MODAL
      ═══════════════════════════════════════ */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-t-2xl lg:rounded-2xl overflow-hidden max-h-[80vh] overflow-y-auto" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div className="sticky top-0 p-4 flex items-center justify-between z-10" style={{ background: '#111111', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2.5">
                {modalMode === 'primary' && modalPrimaryValue && attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`] && (
                  <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`]} alt={modalPrimaryValue} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: '#F0F0F0' }}>{modalMode === 'primary' ? `${primaryAttrName} ${modalPrimaryValue}` : `${modalAttrName} ${modalPrimaryValue}`}</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Sélectionnez les {modalMode === 'primary' ? secondaryAttrName.toLowerCase() + 's' : primaryAttrName.toLowerCase() + 's'}</p>
                </div>
              </div>
              <button onClick={() => setIsVariantModalOpen(false)} className="p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {modalSecondaryOptions.map(value => (
                <div key={value} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeModalQuantity(value)} disabled={!modalQuantities[value]} className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Minus className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold" style={{ color: '#D4372B' }}>{modalQuantities[value] || 0}</span>
                    <button onClick={() => addModalQuantity(value)} className="w-8 h-8 rounded-full flex items-center justify-center transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Plus className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="rounded-xl p-3 mt-1 flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Total</span>
                <span className="font-bold text-sm" style={{ color: '#F0F0F0' }}>{Object.values(modalQuantities).reduce((a, b) => a + b, 0)} articles</span>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => setIsVariantModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>Annuler</button>
                <button onClick={confirmModalSelection} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: '#D4372B', color: '#fff' }}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          PROTECTION MODAL
      ═══════════════════════════════════════ */}
      {isProtectionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div className="sticky top-0 p-5 flex items-center justify-between" style={{ background: '#111111', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,55,43,0.1)' }}>
                  <Shield className="w-4 h-4" style={{ color: '#D4372B' }} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: '#F0F0F0' }}>Protection des achats Adullam</h3>
              </div>
              <button onClick={() => setIsProtectionModalOpen(false)} className="p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Moyens de paiement</h4>
                <div className="grid grid-cols-4 gap-2.5">
                  {[{ icon: Smartphone, label: 'MTN Money' }, { icon: Smartphone, label: 'Orange Money' }, { icon: CreditCard, label: 'Wave' }, { icon: CreditCard, label: 'Visa / MC' }].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                      <p className="text-[10px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Garanties</h4>
                <div className="space-y-2.5">
                  {[
                    { title: 'Paiements sécurisés', desc: 'Chaque transaction est protégée par un cryptage SSL strict.' },
                    { title: 'Garantie remboursement', desc: "Obtenez un remboursement si votre commande n'est pas expédiée." },
                  ].map(({ title, desc }) => (
                    <div key={title} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-sm font-semibold mb-1" style={{ color: '#F0F0F0' }}>{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}