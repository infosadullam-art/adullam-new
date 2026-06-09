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
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-24 lg:pb-0">
        <div className="max-w-[1440px] mx-auto">

          {/* Currency indicator mobile */}
          <div className="lg:hidden px-4 py-2 border-b border-gray-100">
            <CurrencyIndicator />
          </div>

          <div className="px-4 lg:px-10 py-3 lg:py-8">

            {/* Breadcrumb desktop */}
            <nav className="hidden lg:flex items-center gap-2 text-xs mb-8 text-gray-400">
              <a href="/" className="hover:text-gray-700 transition-colors">Accueil</a>
              <ChevronRight className="w-3 h-3" />
              <a href="/category/electronique" className="hover:text-gray-700 transition-colors">Électronique</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">{productName}</span>
            </nav>

            {/* ===== MOBILE LAYOUT ===== */}
            <div className="lg:hidden">
              {/* Mobile Gallery */}
              <div className="mb-5">
                <div className="relative rounded-2xl overflow-hidden bg-[#F8F8F8]" style={{ aspectRatio: '1/1' }}>
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={safeImages[selectedImage]}
                      alt={productName}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain p-6 transition-all duration-300"
                      priority
                    />
                  </button>

                  {/* Wishlist btn */}
                  <button
                    onClick={handleToggleWishlist}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#D4372B] text-[#D4372B]' : 'text-gray-400'}`} />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {safeImages.slice(0, 10).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`rounded-full transition-all duration-200 ${
                          selectedImage === idx
                            ? 'w-4 h-1.5 bg-[#D4372B]'
                            : 'w-1.5 h-1.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {safeImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
                    {safeImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-[#F8F8F8] border-2 transition-all duration-200 ${
                          selectedImage === idx ? 'border-[#D4372B] shadow-sm' : 'border-transparent opacity-60'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Miniature ${idx + 1}`}
                          width={56}
                          height={56}
                          className="w-full h-full object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Product Info */}
              <div className="space-y-4">
                {/* Badges + title */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#D4372B] text-white tracking-wide uppercase">
                      Top vente
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">#{product.id?.slice(-6)}</span>
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900 leading-snug">{productName}</h1>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-gray-700 font-medium ml-1">{reviewsStats.averageRating || 0}</span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">{reviewsStats.totalReviews} avis</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">1.2k ventes</span>
                </div>

                {/* Price block */}
                <div className="bg-[#F8F8F8] rounded-2xl p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#D4372B] tracking-tight">
                      {formatPrice(currentPrice)} × {grandTotal || 1}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                    </span>
                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-[#D4372B]">−20%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Prix unitaire: <span className="font-medium text-gray-600">{formatPrice(currentPrice)}</span></p>
                </div>

                {/* Variants */}
                {hasVariants && (
                  <>
                    {hasSimpleVariants && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{primaryAttrName}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                            const hasImage = attributeImages[`${simpleVariantType}:${value}`]
                            return (
                              <button
                                key={value}
                                onClick={() => openSimpleVariantModal(value)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-all relative flex items-center gap-1.5 font-medium border ${
                                  qty > 0
                                    ? 'border-[#D4372B] text-[#D4372B] bg-red-50'
                                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                                }`}
                              >
                                {hasImage && (
                                  <div className="w-4 h-4 rounded-full overflow-hidden">
                                    <Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={16} height={16} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                {value}
                                {qty > 0 && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D4372B] text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow">
                                    {qty}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                        {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                          if (qty === 0) return null
                          return (
                            <div key={value} className="flex items-center gap-2 mt-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              {attributeImages[`${simpleVariantType}:${value}`] && (
                                <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200">
                                  <Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={20} height={20} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span className="font-medium">{value}</span>
                              <span className="text-[#D4372B] font-bold">×{qty}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {hasComplexVariants && (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{primaryAttrName}</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(complexSelections).map((primaryValue) => {
                              const total = getPrimaryTotal(primaryValue)
                              const hasImage = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]
                              return (
                                <button
                                  key={primaryValue}
                                  onClick={() => openPrimaryModal(primaryValue)}
                                  className={`px-3 py-1.5 text-xs rounded-lg transition-all relative flex items-center gap-1.5 font-medium border ${
                                    total > 0
                                      ? 'border-[#D4372B] text-[#D4372B] bg-red-50'
                                      : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                                  }`}
                                >
                                  {hasImage && (
                                    <div className="w-4 h-4 rounded-full overflow-hidden">
                                      <Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={16} height={16} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  {primaryValue}
                                  {total > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D4372B] text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow">
                                      {total}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        {secondaryAttrName && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{secondaryAttrName}</p>
                            <div className="flex flex-wrap gap-2">
                              {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map((secondaryValue) => {
                                const total = getSecondaryTotal(secondaryValue)
                                return (
                                  <button
                                    key={secondaryValue}
                                    onClick={() => openSecondaryModal(secondaryValue)}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-all relative font-medium border ${
                                      total > 0
                                        ? 'border-[#D4372B] text-[#D4372B] bg-red-50'
                                        : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                                    }`}
                                  >
                                    {secondaryValue}
                                    {total > 0 && (
                                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D4372B] text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow">
                                        {total}
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {Object.entries(complexSelections).map(([primaryValue, secondarySelections]) => {
                          const nonZeroSelections = Object.entries(secondarySelections).filter(([_, qty]) => qty > 0)
                          if (nonZeroSelections.length === 0) return null
                          return (
                            <div key={primaryValue} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                {attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] && (
                                  <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200">
                                    <Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={20} height={20} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <span className="text-xs font-semibold text-gray-700">{primaryValue}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {nonZeroSelections.map(([secondaryValue, qty]) => (
                                  <span key={secondaryValue} className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded-lg">
                                    {secondaryValue} <span className="text-[#D4372B] font-bold">×{qty}</span>
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
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quantité</p>
                    <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-30"
                        disabled={simpleQuantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-gray-800">{simpleQuantity}</span>
                      <button
                        onClick={() => setSimpleQuantity(simpleQuantity + 1)}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Meta infos */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-[#D4372B]" /> MOQ: {minQuantity}</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> En stock</span>
                  {isLoadingLogistics ? (
                    <span className="flex items-center gap-1 text-gray-400">
                      <span className="w-3 h-3 border-2 border-gray-200 border-t-[#D4372B] rounded-full animate-spin" />
                      Calcul...
                    </span>
                  ) : (
                    <span>{logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg` : '— kg'}</span>
                  )}
                </div>

                {/* Shipping */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Livraison</p>
                    {selectedPortePorteCost > 0 && (
                      <span className="text-xs text-gray-600">Porte-à-porte: <span className="font-bold text-[#D4372B]">{formatPrice(selectedPortePorteCost)}</span></span>
                    )}
                  </div>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : logisticsError ? (
                    <div className="text-xs text-red-500 p-2 border border-red-100 rounded-xl bg-red-50">{logisticsError}</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { mode: "bateau", icon: Ship, label: "Mer" },
                        { mode: "avion", icon: Sparkles, label: "Air" },
                        { mode: "express", icon: Zap, label: "Express" }
                      ] as const).map((item) => {
                        const shippingMode = item.mode
                        const isAvailable = logisticsData?.shipping?.[shippingMode]
                        if (!isAvailable) return null
                        const days = getShippingDays(shippingMode)
                        const cost = getShippingCost(shippingMode)
                        const active = selectedShipping === shippingMode
                        return (
                          <button
                            key={item.mode}
                            onClick={() => setSelectedShipping(shippingMode)}
                            className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-2 transition-all text-center ${
                              active ? 'border-[#D4372B] bg-[#D4372B]' : 'border-gray-100 bg-[#F8F8F8] hover:border-gray-200'
                            }`}
                          >
                            <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                            <span className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
                            <span className={`text-[10px] ${active ? 'text-white/80' : 'text-gray-400'}`}>{days}</span>
                            <span className={`text-[11px] font-bold ${active ? 'text-white' : 'text-[#D4372B]'}`}>{formatPrice(cost)}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Protection Adullam */}
                <div
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-[#F8F8F8] cursor-pointer hover:border-gray-200 transition-all active:scale-[0.99]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#D4372B]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-[#D4372B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Protection Adullam</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {['MTN', 'Orange', 'Wave', 'Visa'].map((m) => (
                        <span key={m} className="text-[9px] px-1.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600 font-medium">{m}</span>
                      ))}
                    </div>
                  </div>
                  <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                </div>

                {/* MOQ warning */}
                {!isMOQMet && grandTotal > 0 && (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <span className="text-amber-500 flex-shrink-0">⚠</span>
                    Quantité minimum non atteinte ({minQuantity} min). Contactez-nous.
                  </div>
                )}

                {/* Mobile CTA bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 py-3 shadow-2xl">
                  <div className="flex gap-2 max-w-[1440px] mx-auto">
                    <button
                      onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
                      className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-lg"
                      style={{ background: (isMOQMet && grandTotal > 0) ? '#D4372B' : 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: 'white' }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {(isMOQMet && grandTotal > 0) ? `Ajouter (${grandTotal})` : 'Nous contacter'}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!isMOQMet || grandTotal === 0}
                      className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#111827] text-white transition-all active:scale-[0.98] hover:shadow-lg disabled:opacity-40"
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                {/* Trust badges mobile */}
                <div className="grid grid-cols-2 gap-2 py-4 text-xs border-y border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-600"><Shield className="w-3.5 h-3.5 text-[#D4372B]" /> Garantie 12 mois</div>
                  <div className="flex items-center gap-1.5 text-gray-600"><RotateCcw className="w-3.5 h-3.5 text-[#D4372B]" /> Retour 15 jours</div>
                </div>
              </div>

              {/* Mobile Tabs */}
              <div className="mt-6">
                <div className="flex gap-1 border-b border-gray-100 overflow-x-auto hide-scrollbar">
                  {[
                    { id: "description", label: "Description" },
                    { id: "specifications", label: "Caractéristiques" },
                    { id: "avis", label: `Avis (${reviewsStats.totalReviews})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm whitespace-nowrap font-medium transition-all relative ${
                        activeTab === tab.id ? 'text-[#D4372B]' : 'text-gray-500'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4372B] rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="py-5">
                  {activeTab === "description" && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {product.description || product.cleanedDesc || "Description non disponible"}
                      </p>
                      {product.features && product.features.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Points forts</h4>
                          <ul className="space-y-2">
                            {product.features.map((feature: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                <span className="w-1 h-1 rounded-full bg-[#D4372B] flex-shrink-0 mt-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "specifications" && (
                    <div className="space-y-0 divide-y divide-gray-100">
                      {(product.specifications || [
                        { label: "Marque", value: product.brand || "TechPro" },
                        { label: "Poids", value: product.weight ? `${product.weight} kg` : "N/A" },
                        { label: "Garantie", value: "12 mois" }
                      ]).map((spec: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-3">
                          <span className="text-xs text-gray-400 font-medium">{spec.label}</span>
                          <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "avis" && (
                    <div className="space-y-4">
                      {!showReviewForm && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="w-full py-3 border-2 border-[#D4372B] text-[#D4372B] rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                        >
                          Donner mon avis
                        </button>
                      )}

                      {showReviewForm && (
                        <div className="border border-gray-100 rounded-2xl p-4 space-y-4 bg-[#FAFAFA]">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 text-sm">Votre avis</h4>
                            <button onClick={() => setShowReviewForm(false)}>
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Note</label>
                            <div className="flex gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                                  <Star className={`w-7 h-7 transition-colors ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nom</label>
                            <input
                              type="text"
                              value={newReview.authorName}
                              onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4372B] bg-white transition-colors"
                              placeholder="Jean Dupont"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Commentaire</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full mt-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4372B] resize-none bg-white transition-colors"
                              rows={3}
                              placeholder="Partagez votre expérience..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowReviewForm(false)}
                              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleSubmitReview}
                              disabled={isSubmittingReview}
                              className="flex-1 py-2.5 bg-[#D4372B] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-[#B5271C] transition-colors"
                            >
                              {isSubmittingReview ? "Envoi..." : "Publier"}
                            </button>
                          </div>
                        </div>
                      )}

                      {isLoadingReviews ? (
                        <div className="space-y-3">
                          {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-100" />
                                <div className="h-3 bg-gray-100 rounded w-24" />
                              </div>
                              <div className="h-3 bg-gray-100 rounded w-full" />
                              <div className="h-3 bg-gray-100 rounded w-3/4" />
                            </div>
                          ))}
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-8">
                          <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Aucun avis pour le moment</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                            <div className="text-center">
                              <div className="text-3xl font-black text-[#D4372B]">{reviewsStats.averageRating}</div>
                              <div className="flex justify-center mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`w-3 h-3 ${star <= Math.round(reviewsStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">{reviewsStats.totalReviews} avis</p>
                            </div>
                            <div className="flex-1 space-y-1">
                              {[5, 4, 3, 2, 1].map((rating) => {
                                const count = reviewsStats.ratingDistribution[rating as keyof typeof reviewsStats.ratingDistribution] || 0
                                const percentage = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                                return (
                                  <div key={rating} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-4 text-gray-400">{rating}</span>
                                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-[#D4372B] rounded-full transition-all" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <span className="w-4 text-right text-gray-400">{count}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                                      {review.authorName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="text-xs font-semibold text-gray-900">{review.authorName}</span>
                                      {review.verifiedPurchase && (
                                        <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">Vérifié</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-gray-400">{formatReviewDate(review.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-0.5 mb-1.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`w-2.5 h-2.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-100'}`} />
                                  ))}
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
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

            {/* ===== DESKTOP LAYOUT ===== */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-10 mb-16">

              {/* Left: Gallery */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden bg-[#F8F8F8] aspect-square group mb-3 cursor-zoom-in" onClick={() => setIsImageModalOpen(true)}>
                  <Image
                    src={safeImages[selectedImage]}
                    alt={productName}
                    width={560}
                    height={560}
                    className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleWishlist(); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#D4372B] text-[#D4372B]' : 'text-gray-400'}`} />
                  </button>
                  {safeImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                      {selectedImage + 1} / {safeImages.length}
                    </div>
                  )}
                </div>

                {safeImages.length > 1 && (
                  <div className="relative">
                    {safeImages.length > 5 && (
                      <button onClick={() => scrollThumbnails("left")} className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <ChevronLeft className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                    <div ref={thumbnailRef} className="flex gap-2 overflow-x-hidden scroll-smooth" style={{ scrollbarWidth: "none" }}>
                      {safeImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 rounded-xl overflow-hidden bg-[#F8F8F8] border-2 transition-all duration-200 ${
                            selectedImage === idx ? 'border-[#D4372B] shadow-sm' : 'border-transparent hover:border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                          style={{ width: 'calc(20% - 8px)', aspectRatio: '1/1' }}
                        >
                          <Image src={img} alt={`${productName} ${idx + 1}`} width={80} height={80} className="w-full h-full object-contain p-2" />
                        </button>
                      ))}
                    </div>
                    {safeImages.length > 5 && (
                      <button onClick={() => scrollThumbnails("right")} className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="lg:col-span-7 flex flex-col gap-5">

                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#D4372B] text-white tracking-widest uppercase">Top vente</span>
                    <span className="text-xs text-gray-400 font-mono">#{product.id?.slice(-8)}</span>
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-900 leading-tight mb-3">{productName}</h1>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="font-semibold text-gray-800 ml-1">{reviewsStats.averageRating || 0}</span>
                    </div>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">{reviewsStats.totalReviews} avis</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">1,234+ commandes</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* Price + Variants block */}
                <div className="bg-[#F8F8F8] rounded-2xl p-5">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-black text-[#D4372B] tracking-tight">
                      {formatPrice(currentPrice)} × {grandTotal || 1}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                    </span>
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-lg bg-[#D4372B]">−20%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 font-medium text-[#D4372B]">Prix direct usine</span>
                    <span>USD ${Number(product.price).toFixed(2)} / unité</span>
                  </div>

                  {/* Variants desktop */}
                  {hasVariants && (
                    <>
                      {hasSimpleVariants && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{primaryAttrName}</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                              const hasImage = attributeImages[`${simpleVariantType}:${value}`]
                              return (
                                <button
                                  key={value}
                                  onClick={() => openSimpleVariantModal(value)}
                                  className={`px-3 py-2 text-xs rounded-xl transition-all relative flex items-center gap-2 font-medium border ${
                                    qty > 0 ? 'border-[#D4372B] text-[#D4372B] bg-red-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                                  }`}
                                >
                                  {hasImage && (
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-sm">
                                      <Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={20} height={20} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  {value}
                                  {qty > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4372B] text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow">
                                      {qty}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                          {Object.entries(simpleVariantQuantities).filter(([_, q]) => q > 0).map(([value, qty]) => (
                            <div key={value} className="flex items-center gap-2 mt-2 text-xs text-gray-600 bg-white px-3 py-2 rounded-xl border border-gray-100">
                              {attributeImages[`${simpleVariantType}:${value}`] && (
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                                  <Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={24} height={24} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span className="font-semibold">{value}</span>
                              <span className="text-[#D4372B] font-bold">×{qty}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasComplexVariants && (
                        <>
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{primaryAttrName}</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(complexSelections).map((primaryValue) => {
                                const total = getPrimaryTotal(primaryValue)
                                const hasImage = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]
                                return (
                                  <button
                                    key={primaryValue}
                                    onClick={() => openPrimaryModal(primaryValue)}
                                    className={`px-3 py-2 text-xs rounded-xl transition-all relative flex items-center gap-2 font-medium border ${
                                      total > 0 ? 'border-[#D4372B] text-[#D4372B] bg-red-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                                    }`}
                                  >
                                    {hasImage && (
                                      <div className="w-5 h-5 rounded-full overflow-hidden">
                                        <Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={20} height={20} className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    {primaryValue}
                                    {total > 0 && (
                                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4372B] text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow">
                                        {total}
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          {secondaryAttrName && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{secondaryAttrName}</p>
                              <div className="flex flex-wrap gap-2">
                                {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map((secondaryValue) => {
                                  const total = getSecondaryTotal(secondaryValue)
                                  return (
                                    <button
                                      key={secondaryValue}
                                      onClick={() => openSecondaryModal(secondaryValue)}
                                      className={`px-3 py-2 text-xs rounded-xl transition-all relative font-medium border ${
                                        total > 0 ? 'border-[#D4372B] text-[#D4372B] bg-red-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                                      }`}
                                    >
                                      {secondaryValue}
                                      {total > 0 && (
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4372B] text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow">
                                          {total}
                                        </span>
                                      )}
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
                              <div key={primaryValue} className="bg-white rounded-xl p-3 mb-2 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  {attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                                      <Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]} alt={primaryValue} width={24} height={24} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <span className="text-xs font-semibold text-gray-800">{primaryValue}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {nonZero.map(([secondaryValue, qty]) => (
                                    <span key={secondaryValue} className="text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                                      {secondaryValue} <span className="text-[#D4372B] font-bold">×{qty}</span>
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
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quantité</p>
                      <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                        <button
                          onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))}
                          className="p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-30"
                          disabled={simpleQuantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-gray-800">{simpleQuantity}</span>
                        <button
                          onClick={() => setSimpleQuantity(simpleQuantity + 1)}
                          className="p-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-[#D4372B]" /> MOQ: {minQuantity}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#D4372B]" /> {logisticsData?.recommended.days || '15–20'} jours</span>
                    {isLoadingLogistics ? (
                      <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-gray-200 border-t-[#D4372B] rounded-full animate-spin" /> Calcul...</span>
                    ) : (
                      <span>{logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg` : '— kg'}</span>
                    )}
                  </div>
                </div>

                {/* Protection Adullam */}
                <div
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#D4372B]/8 flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,55,43,0.07)' }}>
                    <Shield className="w-5 h-5 text-[#D4372B]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Protection des achats Adullam</p>
                    <div className="flex items-center gap-2">
                      {['MTN', 'Orange', 'Wave', 'Visa'].map((m) => (
                        <span key={m} className="text-[10px] px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 font-medium">{m}</span>
                      ))}
                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto"><Lock className="w-3 h-3" /> SSL sécurisé</span>
                    </div>
                  </div>
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>

                {/* Shipping */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">Mode de livraison</p>
                    {selectedPortePorteCost > 0 && (
                      <span className="text-xs text-gray-600">Porte-à-porte: <span className="font-bold text-[#D4372B]">{formatPrice(selectedPortePorteCost)}</span></span>
                    )}
                  </div>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
                    </div>
                  ) : logisticsError ? (
                    <div className="text-xs text-red-500 p-3 border border-red-100 rounded-xl bg-red-50">{logisticsError}</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { mode: "bateau", icon: Ship, label: "Maritime" },
                        { mode: "avion", icon: Sparkles, label: "Aérien" },
                        { mode: "express", icon: Zap, label: "Express" }
                      ] as const).map((item) => {
                        const shippingMode = item.mode
                        const isAvailable = logisticsData?.shipping?.[shippingMode]
                        if (!isAvailable) return null
                        const days = getShippingDays(shippingMode)
                        const cost = getShippingCost(shippingMode)
                        const estimatedDate = getEstimatedDate(shippingMode)
                        const active = selectedShipping === shippingMode
                        return (
                          <button
                            key={item.mode}
                            onClick={() => setSelectedShipping(shippingMode)}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${
                              active ? 'border-[#D4372B] bg-[#D4372B] shadow-lg shadow-red-100' : 'border-gray-100 bg-[#F8F8F8] hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                              <span className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
                            </div>
                            <p className={`text-xs font-black ${active ? 'text-white' : 'text-[#D4372B]'}`}>{formatPrice(cost)}</p>
                            <p className={`text-[10px] mt-0.5 ${active ? 'text-white/80' : 'text-gray-400'}`}>{days} · {estimatedDate}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* MOQ warning */}
                {!isMOQMet && grandTotal > 0 && (
                  <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <span className="text-amber-500">⚠</span>
                    Quantité minimum non atteinte ({minQuantity} min). Contactez-nous pour discuter.
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
                    className="flex-1 h-13 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-red-100 active:scale-[0.98]"
                    style={{ background: (isMOQMet && grandTotal > 0) ? '#D4372B' : 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: 'white' }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {(isMOQMet && grandTotal > 0) ? `Ajouter au panier (${grandTotal})` : 'Nous contacter'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!isMOQMet || grandTotal === 0}
                    className="flex-1 h-13 py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center bg-[#111827] transition-all hover:bg-[#1f2937] hover:shadow-lg active:scale-[0.98] disabled:opacity-40"
                  >
                    Acheter maintenant
                  </button>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Shield, label: "Garantie 12 mois" },
                    { icon: RotateCcw, label: "Retour 15 jours" },
                    { icon: Check, label: "Certifié qualité" },
                    { icon: Truck, label: "Suivi en temps réel" }
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                      <Icon className="w-3.5 h-3.5 text-[#D4372B] flex-shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* END DESKTOP GRID */}

            {/* Desktop Tabs */}
            <div className="hidden lg:block mt-2 mb-12">
              <div className="flex gap-1 border-b border-gray-100 mb-8">
                {[
                  { id: "description", label: "Description" },
                  { id: "specifications", label: "Caractéristiques" },
                  { id: "avis", label: `Avis (${reviewsStats.totalReviews})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3.5 text-sm font-medium transition-all relative ${
                      activeTab === tab.id ? 'text-[#D4372B]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4372B] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              <div>
                {activeTab === "description" && (
                  <div className="max-w-3xl">
                    <p className="text-gray-600 leading-relaxed text-sm mb-6">
                      {product.description || product.cleanedDesc || "Description non disponible"}
                    </p>
                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Points forts</h3>
                        <ul className="grid grid-cols-2 gap-3">
                          {product.features.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4372B] flex-shrink-0 mt-1.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="max-w-2xl">
                    <div className="divide-y divide-gray-100">
                      {(product.specifications || [
                        { label: "Marque", value: "TechPro" },
                        { label: "Modèle", value: "TP-EB001" },
                        { label: "Version Bluetooth", value: "5.2" },
                        { label: "Autonomie (écouteurs)", value: "6 heures" },
                        { label: "Autonomie (boîtier)", value: "24 heures" },
                        { label: "Temps de charge", value: "1.5 heures" },
                        { label: "Poids", value: "4.5g par écouteur" },
                        { label: "Garantie", value: "12 mois" }
                      ]).map((spec: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-3.5">
                          <span className="text-sm text-gray-400 font-medium">{spec.label}</span>
                          <span className="text-sm font-semibold text-gray-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "avis" && (
                  <div>
                    {!showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="mb-8 px-5 py-2.5 border-2 border-[#D4372B] text-[#D4372B] rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        Donner mon avis
                      </button>
                    )}

                    {showReviewForm && (
                      <div className="border border-gray-100 rounded-2xl p-6 mb-8 max-w-xl bg-[#FAFAFA]">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="font-semibold text-gray-900">Donnez votre avis</h3>
                          <button onClick={() => setShowReviewForm(false)}>
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Note</label>
                          <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className="transition-transform hover:scale-110">
                                <Star className={`w-7 h-7 ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nom</label>
                          <input
                            type="text"
                            value={newReview.authorName}
                            onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })}
                            className="w-full mt-1.5 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4372B] bg-white transition-colors"
                            placeholder="Jean Dupont"
                          />
                        </div>
                        <div className="mb-5">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Commentaire</label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="w-full mt-1.5 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4372B] resize-none bg-white transition-colors"
                            rows={4}
                            placeholder="Partagez votre expérience avec ce produit..."
                          />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
                          <button
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview}
                            className="px-5 py-2.5 bg-[#D4372B] text-white rounded-xl text-sm font-semibold hover:bg-[#B5271C] disabled:opacity-50 transition-colors"
                          >
                            {isSubmittingReview ? "Envoi..." : "Publier mon avis"}
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoadingReviews ? (
                      <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse pb-5 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-9 h-9 rounded-full bg-gray-100" />
                              <div className="h-3.5 bg-gray-100 rounded w-28" />
                            </div>
                            <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                          </div>
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-16">
                        <Star className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400">Aucun avis pour le moment</p>
                        <p className="text-sm text-gray-300 mt-1">Soyez le premier à donner votre avis</p>
                      </div>
                    ) : (
                      <div className="flex gap-12">
                        {/* Rating summary */}
                        <div className="flex-shrink-0 w-48 text-center">
                          <div className="text-5xl font-black text-[#D4372B] mb-2">{reviewsStats.averageRating}</div>
                          <div className="flex justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= Math.round(reviewsStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">{reviewsStats.totalReviews} avis</p>
                          <div className="mt-4 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviewsStats.ratingDistribution[rating as keyof typeof reviewsStats.ratingDistribution] || 0
                              const percentage = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                              return (
                                <div key={rating} className="flex items-center gap-2 text-xs">
                                  <span className="w-4 text-gray-400 text-right">{rating}</span>
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#D4372B] rounded-full transition-all duration-700" style={{ width: `${percentage}%` }} />
                                  </div>
                                  <span className="w-4 text-gray-400">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Reviews list */}
                        <div className="flex-1 space-y-6 max-h-[520px] overflow-y-auto pr-2">
                          {reviews.map((review) => (
                            <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {review.authorName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-gray-900">{review.authorName}</span>
                                      {review.verifiedPurchase && (
                                        <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">Achat vérifié</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-0.5 mt-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-100'}`} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-400 flex-shrink-0">{formatReviewDate(review.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed ml-12">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            <div className="mt-6 lg:mt-4">
              <div className="flex items-center justify-between mb-5 lg:mb-6">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Vous aimerez aussi</h2>
              </div>

              {isLoadingRelated ? (
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-shrink-0 w-40 lg:w-48">
                      <div className="aspect-square rounded-xl bg-gray-100 animate-pulse mb-2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse mb-1" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                    </div>
                  ))}
                </div>
              ) : relatedProducts.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Aucune recommandation disponible</p>
              ) : (
                <>
                  {/* Mobile related */}
                  <div className="lg:hidden overflow-x-auto hide-scrollbar -mx-4 px-4">
                    <div className="flex gap-3 w-max">
                      {relatedProducts.map((p) => (
                        <a key={p.id} href={`/products/${p.id}`} className="group w-[calc((100vw-4rem)/3)] min-w-[calc((100vw-4rem)/3)]">
                          <div className="bg-[#F8F8F8] rounded-xl aspect-square overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                            <Image src={p.image || "/placeholder.svg"} alt={p.name} width={140} height={140} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{p.name}</h3>
                          <p className="text-sm font-bold text-[#D4372B]">{formatPrice(p.priceUSD)}</p>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Desktop related */}
                  <div className="hidden lg:block relative">
                    <div ref={relatedCarouselRef} className="overflow-x-auto hide-scrollbar pb-2 scroll-smooth">
                      <div className="flex gap-4 w-max">
                        {relatedProducts.map((p) => (
                          <a key={p.id} href={`/products/${p.id}`} className="group" style={{ width: '180px' }}>
                            <div className="bg-[#F8F8F8] rounded-xl aspect-square overflow-hidden mb-3 group-hover:shadow-md transition-shadow duration-300">
                              <Image src={p.image || "/placeholder.svg"} alt={p.name} width={200} height={200} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{p.name}</h3>
                            <div className="flex items-center gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              ))}
                              <span className="text-xs text-gray-400">{p.rating || 4.5}</span>
                            </div>
                            <p className="text-sm font-bold text-[#D4372B]">{formatPrice(p.priceUSD)}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => scrollRelated("left")} className="absolute left-0 top-[40%] -translate-y-1/2 -ml-4 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors z-10">
                      <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => scrollRelated("right")} className="absolute right-0 top-[40%] -translate-y-1/2 -mr-4 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors z-10">
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ===== IMAGE MODAL ===== */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4" onClick={() => setIsImageModalOpen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative max-w-2xl w-full aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image src={safeImages[selectedImage]} alt={productName} width={700} height={700} className="w-full h-full object-contain" />
            {safeImages.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => setSelectedImage(Math.min(safeImages.length - 1, selectedImage + 1))} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                  {selectedImage + 1} / {safeImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== SIMPLE VARIANT MODAL ===== */}
      {isSimpleVariantModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {attributeImages[`${simpleVariantType}:${selectedSimpleValue}`] && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
                    <Image src={attributeImages[`${simpleVariantType}:${selectedSimpleValue}`]} alt={selectedSimpleValue} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{primaryAttrName} {selectedSimpleValue}</h3>
                  <p className="text-xs text-gray-400">Sélectionnez la quantité</p>
                </div>
              </div>
              <button onClick={() => setIsSimpleVariantModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between py-4 border border-gray-100 rounded-xl px-4 mb-4">
                <span className="text-sm text-gray-700 font-medium">Quantité</span>
                <div className="flex items-center gap-4">
                  <button onClick={decrementSimpleModal} disabled={simpleModalQuantity <= 0} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center text-lg font-bold text-[#D4372B]">{simpleModalQuantity}</span>
                  <button onClick={incrementSimpleModal} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="bg-[#111827] rounded-xl p-3 mb-4 flex justify-between items-center">
                <span className="text-white/70 text-sm">Total sélectionné</span>
                <span className="text-white font-bold">{simpleModalQuantity} article(s)</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsSimpleVariantModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={confirmSimpleVariantSelection} className="flex-1 py-3 bg-[#D4372B] text-white rounded-xl text-sm font-semibold hover:bg-[#B5271C] transition-colors">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== COMPLEX VARIANT MODAL ===== */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modalMode === 'primary' && modalPrimaryValue && attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`] && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
                    <Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`]} alt={modalPrimaryValue} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {modalMode === 'primary' ? `${primaryAttrName} ${modalPrimaryValue}` : `${modalAttrName} ${modalPrimaryValue}`}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Sélectionnez les {modalMode === 'primary' ? secondaryAttrName.toLowerCase() + 's' : primaryAttrName.toLowerCase() + 's'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsVariantModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {modalSecondaryOptions.map((value) => (
                <div key={value} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-medium text-gray-800">{value}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeModalQuantity(value)}
                      disabled={!modalQuantities[value]}
                      className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-all"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-[#D4372B]">{modalQuantities[value] || 0}</span>
                    <button
                      onClick={() => addModalQuantity(value)}
                      className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-[#111827] rounded-xl p-3 mt-2 flex justify-between items-center">
                <span className="text-white/70 text-sm">Total</span>
                <span className="text-white font-bold">{Object.values(modalQuantities).reduce((a, b) => a + b, 0)} articles</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setIsVariantModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={confirmModalSelection} className="flex-1 py-3 bg-[#D4372B] text-white rounded-xl text-sm font-semibold hover:bg-[#B5271C] transition-colors">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PROTECTION MODAL ===== */}
      {isProtectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,55,43,0.07)' }}>
                  <Shield className="w-4.5 h-4.5 text-[#D4372B]" style={{ width: '18px', height: '18px' }} />
                </div>
                <h3 className="font-semibold text-gray-900">Protection des achats Adullam</h3>
              </div>
              <button onClick={() => setIsProtectionModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Moyens de paiement</h4>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Smartphone, label: "MTN Money" },
                    { icon: Smartphone, label: "Orange Money" },
                    { icon: CreditCard, label: "Wave" },
                    { icon: CreditCard, label: "Visa / MC" }
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="bg-[#F8F8F8] border border-gray-100 rounded-xl p-3 text-center">
                      <Icon className="w-5 h-5 text-gray-500 mx-auto mb-1.5" />
                      <p className="text-[10px] font-medium text-gray-700 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Garanties</h4>
                <div className="space-y-3">
                  {[
                    { title: "Paiements sécurisés", desc: "Chaque transaction est protégée par un cryptage SSL strict." },
                    { title: "Garantie remboursement", desc: "Obtenez un remboursement si votre commande n'est pas expédiée." }
                  ].map(({ title, desc }) => (
                    <div key={title} className="bg-[#F8F8F8] rounded-xl p-4 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
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