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


  // ─── Token system ───────────────────────────────────────────
  // bg:    #0A0A0A   surface: #121212   raised: #1C1C1C
  // line:  rgba(255,255,255,0.07)
  // text:  #F5F5F5 / 0.5 / 0.25
  // red:   #C8392B   red-dim: rgba(200,57,43,0.12)
  // gold:  #E8B94F  (stars only)

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F5F5', fontFamily: 'inherit' }}>

      {/* ── thin red top line ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, #C8392B 40%, #C8392B 60%, transparent 100%)', zIndex: 100, opacity: 0.6 }} />

      <div className="hidden lg:block" style={{ position: 'relative', zIndex: 10 }}><Header /></div>
      <div className="lg:hidden" style={{ position: 'relative', zIndex: 10 }}><MobileHeader /></div>

      <main style={{ paddingBottom: '88px' }} className="lg:pb-0">
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

          {/* currency mobile */}
          <div className="lg:hidden" style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <CurrencyIndicator />
          </div>

          {/* ════════════════════════════════════════════════════
              DESKTOP LAYOUT  — split-screen asymétrique
          ════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex" style={{ minHeight: '90vh' }}>

            {/* LEFT PANEL — image collée au bord, sticky */}
            <div style={{ width: '52%', position: 'sticky', top: 0, height: '100vh', background: '#0E0E0E', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>

              {/* breadcrumb dans le panel */}
              <div style={{ padding: '28px 40px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                <a href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>Accueil</a>
                <span style={{ opacity: 0.3 }}>›</span>
                <a href="/category/electronique" style={{ color: 'inherit', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>Électronique</a>
                <span style={{ opacity: 0.3 }}>›</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productName}</span>
              </div>

              {/* image principale */}
              <div
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', cursor: 'zoom-in', position: 'relative' }}
                onClick={() => setIsImageModalOpen(true)}
              >
                <Image
                  src={safeImages[selectedImage]}
                  alt={productName}
                  width={520} height={520}
                  style={{ width: '100%', maxWidth: '420px', height: 'auto', objectFit: 'contain', transition: 'transform .6s cubic-bezier(.16,1,.3,1)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  priority
                />

                {/* wishlist */}
                <button
                  onClick={e => { e.stopPropagation(); handleToggleWishlist(); }}
                  style={{
                    position: 'absolute', top: '20px', right: '20px',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: isWishlisted ? '#C8392B' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isWishlisted ? '#C8392B' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                  onMouseEnter={e => { if (!isWishlisted) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                  onMouseLeave={e => { if (!isWishlisted) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                >
                  <Heart style={{ width: '16px', height: '16px', color: '#fff', fill: isWishlisted ? '#fff' : 'none' }} />
                </button>
              </div>

              {/* thumbnails — bande horizontale en bas */}
              {safeImages.length > 1 && (
                <div style={{ padding: '0 40px 28px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {safeImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      style={{
                        flexShrink: 0, width: '56px', height: '56px', borderRadius: '10px',
                        background: '#181818',
                        border: `1.5px solid ${selectedImage === idx ? '#C8392B' : 'rgba(255,255,255,0.07)'}`,
                        overflow: 'hidden', cursor: 'pointer',
                        opacity: selectedImage === idx ? 1 : 0.45,
                        transition: 'all .2s',
                      }}
                    >
                      <Image src={img} alt="" width={56} height={56} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT PANEL — scroll */}
            <div style={{ width: '48%', overflowY: 'auto', padding: '48px 52px', scrollbarWidth: 'none' }}>

              {/* ── Header produit ── */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8392B', padding: '4px 10px', borderRadius: '4px', background: 'rgba(200,57,43,0.1)', border: '1px solid rgba(200,57,43,0.2)' }}>
                    Top vente
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)' }}>#{product.id?.slice(-10)}</span>
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.025em', color: '#F5F5F5', marginBottom: '16px' }}>
                  {productName}
                </h1>

                {/* rating row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => <Star key={s} style={{ width: '14px', height: '14px', fill: '#E8B94F', color: '#E8B94F' }} />)}
                    <span style={{ fontWeight: 600, color: '#F5F5F5', marginLeft: '4px' }}>{reviewsStats.averageRating || 0}</span>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{reviewsStats.totalReviews} avis</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>1 234+ commandes</span>
                </div>
              </div>

              {/* ── Séparateur ── */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 28px' }} />

              {/* ── Prix ── */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '34px', fontWeight: 900, color: '#F5F5F5', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {formatPrice(currentPrice * (grandTotal || 1))}
                  </span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                    {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#C8392B', padding: '2px 7px', borderRadius: '4px', background: 'rgba(200,57,43,0.12)', border: '1px solid rgba(200,57,43,0.2)' }}>
                    −20%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                  <span>Prix unitaire: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{formatPrice(currentPrice)}</strong></span>
                  <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                  <span style={{ color: '#C8392B', fontWeight: 600 }}>Direct usine</span>
                </div>
              </div>

              {/* ── Variantes desktop ── */}
              {hasVariants && (
                <div style={{ marginBottom: '28px' }}>
                  {hasSimpleVariants && (
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>{primaryAttrName}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                          const hasImg = attributeImages[`${simpleVariantType}:${value}`]
                          const active = qty > 0
                          return (
                            <button key={value} onClick={() => openSimpleVariantModal(value)}
                              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .15s', background: active ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(200,57,43,0.4)' : 'rgba(255,255,255,0.09)'}`, color: active ? '#C8392B' : 'rgba(255,255,255,0.6)' }}>
                              {hasImg && <div style={{ width: '18px', height: '18px', borderRadius: '50%', overflow: 'hidden' }}><Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={18} height={18} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                              {value}
                              {active && <span style={{ position: 'absolute', top: '-8px', right: '-8px', width: '18px', height: '18px', borderRadius: '50%', background: '#C8392B', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {hasComplexVariants && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>{primaryAttrName}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {Object.keys(complexSelections).map(pv => {
                            const total = getPrimaryTotal(pv)
                            const hasImg = attributeImages[`${Object.keys(attributeGroups)[0]}:${pv}`]
                            return (
                              <button key={pv} onClick={() => openPrimaryModal(pv)}
                                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .15s', background: total > 0 ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${total > 0 ? 'rgba(200,57,43,0.4)' : 'rgba(255,255,255,0.09)'}`, color: total > 0 ? '#C8392B' : 'rgba(255,255,255,0.6)' }}>
                                {hasImg && <div style={{ width: '18px', height: '18px', borderRadius: '50%', overflow: 'hidden' }}><Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${pv}`]} alt={pv} width={18} height={18} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                                {pv}
                                {total > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', width: '18px', height: '18px', borderRadius: '50%', background: '#C8392B', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{total}</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      {secondaryAttrName && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>{secondaryAttrName}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map(sv => {
                              const total = getSecondaryTotal(sv)
                              return (
                                <button key={sv} onClick={() => openSecondaryModal(sv)}
                                  style={{ position: 'relative', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .15s', background: total > 0 ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${total > 0 ? 'rgba(200,57,43,0.4)' : 'rgba(255,255,255,0.09)'}`, color: total > 0 ? '#C8392B' : 'rgba(255,255,255,0.6)' }}>
                                  {sv}
                                  {total > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', width: '18px', height: '18px', borderRadius: '50%', background: '#C8392B', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{total}</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {/* résumé sélection */}
                      {Object.entries(complexSelections).map(([pv, ss]) => {
                        const nz = Object.entries(ss).filter(([_, q]) => q > 0)
                        if (!nz.length) return null
                        return (
                          <div key={pv} style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              {attributeImages[`${Object.keys(attributeGroups)[0]}:${pv}`] && <div style={{ width: '18px', height: '18px', borderRadius: '50%', overflow: 'hidden' }}><Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${pv}`]} alt={pv} width={18} height={18} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{pv}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {nz.map(([sv, q]) => <span key={sv} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{sv} <strong style={{ color: '#C8392B' }}>×{q}</strong></span>)}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}

              {!hasVariants && (
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Quantité</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <button onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))} disabled={simpleQuantity <= 1} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', opacity: simpleQuantity <= 1 ? 0.3 : 1 }}>
                      <Minus style={{ width: '14px', height: '14px' }} />
                    </button>
                    <span style={{ width: '48px', textAlign: 'center', fontSize: '15px', fontWeight: 700, color: '#F5F5F5' }}>{simpleQuantity}</span>
                    <button onClick={() => setSimpleQuantity(simpleQuantity + 1)} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                      <Plus style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Méta ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package style={{ width: '13px', height: '13px', color: '#C8392B' }} />MOQ: {minQuantity}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check style={{ width: '13px', height: '13px', color: '#4ADE80' }} /><span style={{ color: '#4ADE80' }}>En stock</span></span>
                {isLoadingLogistics
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #C8392B', animation: 'spin 1s linear infinite', display: 'inline-block' }} />Calcul...</span>
                  : <span>{logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg` : '—'}</span>
                }
              </div>

              {/* ── Livraison — 3 cartes ── */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5' }}>Livraison vers Abidjan</p>
                  {selectedPortePorteCost > 0 && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Porte-à-porte: <strong style={{ color: '#C8392B' }}>{formatPrice(selectedPortePorteCost)}</strong></span>}
                </div>
                {isLoadingLogistics ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[1,2,3].map(i => <div key={i} style={{ height: '90px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
                  </div>
                ) : logisticsError ? (
                  <div style={{ fontSize: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>{logisticsError}</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {([
                      { mode: 'bateau', icon: Ship, label: 'Mer' },
                      { mode: 'avion', icon: Sparkles, label: 'Air' },
                      { mode: 'express', icon: Zap, label: 'Express' },
                    ] as const).map(item => {
                      if (!logisticsData?.shipping?.[item.mode]) return null
                      const active = selectedShipping === item.mode
                      const cost = getShippingCost(item.mode)
                      const days = getShippingDays(item.mode)
                      return (
                        <button key={item.mode} onClick={() => setSelectedShipping(item.mode)}
                          style={{ padding: '14px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s cubic-bezier(.16,1,.3,1)', background: active ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${active ? '#C8392B' : 'rgba(255,255,255,0.07)'}`, transform: active ? 'translateY(-2px)' : 'none' }}>
                          <item.icon style={{ width: '16px', height: '16px', color: active ? '#C8392B' : 'rgba(255,255,255,0.3)', marginBottom: '8px' }} />
                          <div style={{ fontSize: '13px', fontWeight: 700, color: active ? '#F5F5F5' : 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{formatPrice(cost)}</div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{item.label} · {days}</div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Protection ── */}
              <button onClick={() => setIsProtectionModalOpen(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', marginBottom: '24px', transition: 'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(200,57,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield style={{ width: '17px', height: '17px', color: '#C8392B' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5', marginBottom: '5px' }}>Protection Adullam</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['MTN', 'Orange', 'Wave', 'Visa'].map(m => <span key={m} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>{m}</span>)}
                  </div>
                </div>
                <Info style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              </button>

              {/* MOQ */}
              {!isMOQMet && grandTotal > 0 && (
                <div style={{ fontSize: '12px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', color: '#FCD34D', display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span>⚠</span> Quantité minimum non atteinte ({minQuantity} min).
                </div>
              )}

              {/* ── CTA ── */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button
                  onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
                  style={{ flex: 1, height: '50px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: isMOQMet && grandTotal > 0 ? '#C8392B' : 'linear-gradient(135deg,#F59E0B,#FBBF24)', color: '#fff', boxShadow: isMOQMet && grandTotal > 0 ? '0 8px 32px rgba(200,57,43,0.3)' : 'none', transition: 'all .2s', letterSpacing: '-0.01em' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; if (isMOQMet && grandTotal > 0) e.currentTarget.style.boxShadow = '0 12px 40px rgba(200,57,43,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; if (isMOQMet && grandTotal > 0) e.currentTarget.style.boxShadow = '0 8px 32px rgba(200,57,43,0.3)' }}
                >
                  <ShoppingCart style={{ width: '16px', height: '16px' }} />
                  {isMOQMet && grandTotal > 0 ? `Ajouter au panier (${grandTotal})` : 'Nous contacter'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!isMOQMet || grandTotal === 0}
                  style={{ flex: 1, height: '50px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#F5F5F5', transition: 'all .2s', letterSpacing: '-0.01em', opacity: !isMOQMet || grandTotal === 0 ? 0.3 : 1 }}
                  onMouseEnter={e => { if (isMOQMet && grandTotal > 0) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none' }}
                >
                  Acheter maintenant
                </button>
              </div>

              {/* Trust row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '40px' }}>
                {[
                  { icon: Shield, label: 'Garantie 12 mois' },
                  { icon: RotateCcw, label: 'Retour 15 jours' },
                  { icon: Check, label: 'Certifié qualité' },
                  { icon: Truck, label: 'Suivi en temps réel' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Icon style={{ width: '13px', height: '13px', color: '#C8392B', flexShrink: 0 }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* ── Tabs desktop (dans le right panel) ── */}
              <div>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '28px' }}>
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'specifications', label: 'Caractéristiques' },
                    { id: 'avis', label: `Avis (${reviewsStats.totalReviews})` },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', position: 'relative', color: activeTab === tab.id ? '#F5F5F5' : 'rgba(255,255,255,0.3)', transition: 'color .2s' }}>
                      {tab.label}
                      {activeTab === tab.id && <span style={{ position: 'absolute', bottom: 0, left: '16px', right: '16px', height: '1px', background: '#C8392B', borderRadius: '1px' }} />}
                    </button>
                  ))}
                </div>

                {activeTab === 'description' && (
                  <div>
                    <p style={{ fontSize: '13px', lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>{product.description || product.cleanedDesc || 'Description non disponible'}</p>
                    {product.features?.length > 0 && (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {product.features.map((f: string, i: number) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C8392B', flexShrink: 0, marginTop: '8px' }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {(product.specifications || [
                      { label: 'Marque', value: 'TechPro' }, { label: 'Modèle', value: 'TP-EB001' },
                      { label: 'Bluetooth', value: '5.2' }, { label: 'Autonomie', value: '6h (écouteurs)' },
                      { label: 'Boîtier', value: '24h' }, { label: 'Charge', value: '1h 30min' },
                      { label: 'Poids', value: '4.5g / oreille' }, { label: 'Garantie', value: '12 mois' },
                    ]).map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'avis' && (
                  <div>
                    {!showReviewForm && (
                      <button onClick={() => setShowReviewForm(true)}
                        style={{ marginBottom: '24px', padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: 'rgba(200,57,43,0.08)', border: '1px solid rgba(200,57,43,0.3)', color: '#C8392B' }}>
                        Écrire un avis
                      </button>
                    )}
                    {showReviewForm && (
                      <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5' }}>Votre avis</h3>
                          <button onClick={() => setShowReviewForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.3)' }} /></button>
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' }}>Note</label>
                          <div style={{ display: 'flex', gap: '6px' }}>{[1,2,3,4,5].map(s => <button key={s} onClick={() => setNewReview({ ...newReview, rating: s })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Star style={{ width: '24px', height: '24px', fill: s <= newReview.rating ? '#E8B94F' : 'none', color: s <= newReview.rating ? '#E8B94F' : 'rgba(255,255,255,0.2)' }} /></button>)}</div>
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' }}>Nom</label>
                          <input type="text" value={newReview.authorName} onChange={e => setNewReview({ ...newReview, authorName: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Jean Dupont" />
                        </div>
                        <div style={{ marginBottom: '18px' }}>
                          <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' }}>Commentaire</label>
                          <textarea value={newReview.comment} rows={4} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Partagez votre expérience..." />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => setShowReviewForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>Annuler</button>
                          <button onClick={handleSubmitReview} disabled={isSubmittingReview} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: '#C8392B', border: 'none', color: '#fff', opacity: isSubmittingReview ? 0.5 : 1 }}>{isSubmittingReview ? 'Envoi...' : 'Publier'}</button>
                        </div>
                      </div>
                    )}
                    {isLoadingReviews ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[1,2,3].map(i => <div key={i} style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}><div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} /><div style={{ height: '14px', width: '120px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)' }} /></div><div style={{ height: '12px', width: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', marginBottom: '6px' }} /><div style={{ height: '12px', width: '60%', borderRadius: '4px', background: 'rgba(255,255,255,0.04)' }} /></div>)}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <Star style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.07)', margin: '0 auto 12px' }} />
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Aucun avis</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '40px' }}>
                        <div style={{ flexShrink: 0, width: '140px', textAlign: 'center' }}>
                          <div style={{ fontSize: '52px', fontWeight: 900, color: '#F5F5F5', lineHeight: 1, marginBottom: '8px' }}>{reviewsStats.averageRating}</div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '8px' }}>{[1,2,3,4,5].map(s => <Star key={s} style={{ width: '14px', height: '14px', fill: s <= Math.round(reviewsStats.averageRating) ? '#E8B94F' : 'none', color: s <= Math.round(reviewsStats.averageRating) ? '#E8B94F' : 'rgba(255,255,255,0.1)' }} />)}</div>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>{reviewsStats.totalReviews} avis</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {[5,4,3,2,1].map(r => {
                              const count = reviewsStats.ratingDistribution[r as keyof typeof reviewsStats.ratingDistribution] || 0
                              const pct = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                              return (
                                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                                  <span style={{ width: '10px', textAlign: 'right', color: 'rgba(255,255,255,0.3)' }}>{r}</span>
                                  <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: '2px', background: '#C8392B', width: `${pct}%` }} /></div>
                                  <span style={{ width: '16px', color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
                          {reviews.map(review => (
                            <div key={review.id} style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#F5F5F5' }}>{review.authorName.charAt(0).toUpperCase()}</div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5' }}>{review.authorName}</span>
                                      {review.verifiedPurchase && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>VÉRIFIÉ</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(s => <Star key={s} style={{ width: '11px', height: '11px', fill: s <= review.rating ? '#E8B94F' : 'none', color: s <= review.rating ? '#E8B94F' : 'rgba(255,255,255,0.1)' }} />)}</div>
                                  </div>
                                </div>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{formatReviewDate(review.createdAt)}</span>
                              </div>
                              <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', paddingLeft: '44px' }}>{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
          {/* END DESKTOP */}

          {/* ════════════════════════════════════════════════════
              PRODUITS SIMILAIRES  (desktop + mobile)
          ════════════════════════════════════════════════════ */}
          <div style={{ padding: '56px 40px 64px', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="hidden lg:block">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#F5F5F5', letterSpacing: '-0.02em' }}>Vous aimerez aussi</h2>
            </div>
            {isLoadingRelated ? (
              <div style={{ display: 'flex', gap: '14px' }}>
                {[1,2,3,4,5,6].map(i => <div key={i} style={{ width: '180px', flexShrink: 0 }}><div style={{ aspectRatio: '1/1', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', marginBottom: '10px' }} /><div style={{ height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', marginBottom: '6px' }} /><div style={{ height: '12px', borderRadius: '4px', width: '50%', background: 'rgba(255,255,255,0.03)' }} /></div>)}
              </div>
            ) : relatedProducts.length === 0 ? null : (
              <div style={{ position: 'relative' }}>
                <div ref={relatedCarouselRef} style={{ display: 'flex', gap: '14px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px', scrollBehavior: 'smooth' }}>
                  {relatedProducts.map(p => (
                    <a key={p.id} href={`/products/${p.id}`} style={{ flexShrink: 0, width: '180px', textDecoration: 'none', display: 'block' }}
                      onMouseEnter={e => { const el = e.currentTarget.querySelector('.rp-img') as HTMLElement; if (el) el.style.transform = 'scale(1.04)' }}
                      onMouseLeave={e => { const el = e.currentTarget.querySelector('.rp-img') as HTMLElement; if (el) el.style.transform = 'scale(1)' }}>
                      <div style={{ aspectRatio: '1/1', borderRadius: '14px', background: '#121212', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '10px' }}>
                        <Image src={p.image || '/placeholder.svg'} alt={p.name} width={180} height={180} className="rp-img" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px', transition: 'transform .4s cubic-bezier(.16,1,.3,1)' }} />
                      </div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, marginBottom: '5px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>{[1,2,3,4,5].map(s => <Star key={s} style={{ width: '10px', height: '10px', fill: '#E8B94F', color: '#E8B94F' }} />)}</div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#C8392B' }}>{formatPrice(p.priceUSD)}</p>
                    </a>
                  ))}
                </div>
                <button onClick={() => scrollRelated('left')} style={{ position: 'absolute', left: '-18px', top: '35%', width: '36px', height: '36px', borderRadius: '50%', background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.6)' }} />
                </button>
                <button onClick={() => scrollRelated('right')} style={{ position: 'absolute', right: '-18px', top: '35%', width: '36px', height: '36px', borderRadius: '50%', background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.6)' }} />
                </button>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════
              MOBILE LAYOUT
          ════════════════════════════════════════════════════ */}
          <div className="lg:hidden" style={{ padding: '0 0 20px' }}>

            {/* Galerie mobile */}
            <div style={{ position: 'relative', background: '#0E0E0E', marginBottom: '20px' }}>
              <div style={{ aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px', cursor: 'zoom-in' }} onClick={() => setIsImageModalOpen(true)}>
                <Image src={safeImages[selectedImage]} alt={productName} width={380} height={380} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity .3s' }} priority />
              </div>
              {/* dots */}
              <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                {safeImages.slice(0, 8).map((_, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} style={{ height: '4px', borderRadius: '2px', cursor: 'pointer', border: 'none', transition: 'all .25s', width: selectedImage === idx ? '18px' : '4px', background: selectedImage === idx ? '#C8392B' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
              {/* wishlist */}
              <button onClick={handleToggleWishlist} style={{ position: 'absolute', top: '14px', right: '14px', width: '36px', height: '36px', borderRadius: '50%', background: isWishlisted ? '#C8392B' : 'rgba(255,255,255,0.07)', border: `1px solid ${isWishlisted ? '#C8392B' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Heart style={{ width: '15px', height: '15px', color: '#fff', fill: isWishlisted ? '#fff' : 'none' }} />
              </button>
              {/* counter */}
              {safeImages.length > 1 && <div style={{ position: 'absolute', top: '14px', left: '14px', fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(6px)' }}>{selectedImage + 1}/{safeImages.length}</div>}
            </div>

            {/* thumbs mobile */}
            {safeImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 16px', scrollbarWidth: 'none' }}>
                {safeImages.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} style={{ flexShrink: 0, width: '52px', height: '52px', borderRadius: '10px', background: '#161616', border: `1.5px solid ${selectedImage === idx ? '#C8392B' : 'rgba(255,255,255,0.07)'}`, overflow: 'hidden', cursor: 'pointer', opacity: selectedImage === idx ? 1 : 0.45, transition: 'all .2s' }}>
                    <Image src={img} alt="" width={52} height={52} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: '0 16px' }}>

              {/* header mobile */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8392B', padding: '3px 8px', borderRadius: '4px', background: 'rgba(200,57,43,0.1)', border: '1px solid rgba(200,57,43,0.2)' }}>Top vente</span>
                  <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)' }}>#{product.id?.slice(-8)}</span>
                </div>
                <h1 style={{ fontSize: '19px', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.02em', color: '#F5F5F5', marginBottom: '12px' }}>{productName}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(s => <Star key={s} style={{ width: '12px', height: '12px', fill: '#E8B94F', color: '#E8B94F' }} />)}</div>
                  <span style={{ fontWeight: 600, color: '#F5F5F5' }}>{reviewsStats.averageRating || 0}</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{reviewsStats.totalReviews} avis</span>
                </div>
              </div>

              {/* prix mobile */}
              <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#F5F5F5', letterSpacing: '-0.04em', lineHeight: 1 }}>{formatPrice(currentPrice * (grandTotal || 1))}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>{formatPrice(currentPrice * 1.2 * (grandTotal || 1))}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#C8392B', padding: '2px 6px', borderRadius: '4px', background: 'rgba(200,57,43,0.1)', border: '1px solid rgba(200,57,43,0.2)' }}>−20%</span>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Unitaire: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{formatPrice(currentPrice)}</strong></p>
              </div>

              {/* variantes mobile */}
              {hasVariants && (
                <div style={{ marginBottom: '20px' }}>
                  {hasSimpleVariants && (
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>{primaryAttrName}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                        {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                          const hasImg = attributeImages[`${simpleVariantType}:${value}`]
                          const active = qty > 0
                          return (
                            <button key={value} onClick={() => openSimpleVariantModal(value)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', background: active ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(200,57,43,0.4)' : 'rgba(255,255,255,0.09)'}`, color: active ? '#C8392B' : 'rgba(255,255,255,0.6)' }}>
                              {hasImg && <div style={{ width: '16px', height: '16px', borderRadius: '50%', overflow: 'hidden' }}><Image src={attributeImages[`${simpleVariantType}:${value}`]} alt={value} width={16} height={16} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                              {value}
                              {active && <span style={{ position: 'absolute', top: '-7px', right: '-7px', width: '16px', height: '16px', borderRadius: '50%', background: '#C8392B', color: '#fff', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {hasComplexVariants && (
                    <>
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>{primaryAttrName}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                          {Object.keys(complexSelections).map(pv => {
                            const total = getPrimaryTotal(pv)
                            const hasImg = attributeImages[`${Object.keys(attributeGroups)[0]}:${pv}`]
                            return (
                              <button key={pv} onClick={() => openPrimaryModal(pv)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', background: total > 0 ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${total > 0 ? 'rgba(200,57,43,0.4)' : 'rgba(255,255,255,0.09)'}`, color: total > 0 ? '#C8392B' : 'rgba(255,255,255,0.6)' }}>
                                {hasImg && <div style={{ width: '16px', height: '16px', borderRadius: '50%', overflow: 'hidden' }}><Image src={attributeImages[`${Object.keys(attributeGroups)[0]}:${pv}`]} alt={pv} width={16} height={16} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                                {pv}
                                {total > 0 && <span style={{ position: 'absolute', top: '-7px', right: '-7px', width: '16px', height: '16px', borderRadius: '50%', background: '#C8392B', color: '#fff', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{total}</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      {secondaryAttrName && (
                        <div style={{ marginBottom: '14px' }}>
                          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>{secondaryAttrName}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                            {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map(sv => {
                              const total = getSecondaryTotal(sv)
                              return (
                                <button key={sv} onClick={() => openSecondaryModal(sv)} style={{ position: 'relative', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', background: total > 0 ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${total > 0 ? 'rgba(200,57,43,0.4)' : 'rgba(255,255,255,0.09)'}`, color: total > 0 ? '#C8392B' : 'rgba(255,255,255,0.6)' }}>
                                  {sv}
                                  {total > 0 && <span style={{ position: 'absolute', top: '-7px', right: '-7px', width: '16px', height: '16px', borderRadius: '50%', background: '#C8392B', color: '#fff', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{total}</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {Object.entries(complexSelections).map(([pv, ss]) => {
                        const nz = Object.entries(ss).filter(([_, q]) => q > 0)
                        if (!nz.length) return null
                        return (
                          <div key={pv} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '7px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>{pv}</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{nz.map(([sv, q]) => <span key={sv} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}>{sv} <strong style={{ color: '#C8392B' }}>×{q}</strong></span>)}</div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}

              {!hasVariants && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>Quantité</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <button onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))} disabled={simpleQuantity <= 1} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', opacity: simpleQuantity <= 1 ? 0.3 : 1 }}><Minus style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.6)' }} /></button>
                    <span style={{ width: '44px', textAlign: 'center', fontSize: '15px', fontWeight: 700, color: '#F5F5F5' }}>{simpleQuantity}</span>
                    <button onClick={() => setSimpleQuantity(simpleQuantity + 1)} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer' }}><Plus style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.6)' }} /></button>
                  </div>
                </div>
              )}

              {/* meta mobile */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)' }}><Package style={{ width: '12px', height: '12px', color: '#C8392B' }} />MOQ: {minQuantity}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ADE80' }}><Check style={{ width: '12px', height: '12px' }} />En stock</span>
              </div>

              {/* livraison mobile */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5', marginBottom: '12px' }}>Livraison</p>
                {isLoadingLogistics ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>{[1,2,3].map(i => <div key={i} style={{ height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}</div>
                ) : logisticsError ? (
                  <div style={{ fontSize: '11px', padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}>{logisticsError}</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {([
                      { mode: 'bateau', icon: Ship, label: 'Mer' },
                      { mode: 'avion', icon: Sparkles, label: 'Air' },
                      { mode: 'express', icon: Zap, label: 'Express' },
                    ] as const).map(item => {
                      if (!logisticsData?.shipping?.[item.mode]) return null
                      const active = selectedShipping === item.mode
                      return (
                        <button key={item.mode} onClick={() => setSelectedShipping(item.mode)}
                          style={{ padding: '12px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', background: active ? 'rgba(200,57,43,0.1)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${active ? '#C8392B' : 'rgba(255,255,255,0.07)'}`, transform: active ? 'translateY(-1px)' : 'none' }}>
                          <item.icon style={{ width: '14px', height: '14px', color: active ? '#C8392B' : 'rgba(255,255,255,0.3)', marginBottom: '6px' }} />
                          <div style={{ fontSize: '12px', fontWeight: 700, color: active ? '#F5F5F5' : 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{formatPrice(getShippingCost(item.mode))}</div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>{item.label} · {getShippingDays(item.mode)}</div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* protection mobile */}
              <button onClick={() => setIsProtectionModalOpen(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(200,57,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield style={{ width: '15px', height: '15px', color: '#C8392B' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5', marginBottom: '4px' }}>Protection Adullam</p>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {['MTN', 'Orange', 'Wave', 'Visa'].map(m => <span key={m} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>{m}</span>)}
                  </div>
                </div>
                <Info style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              </button>

              {/* MOQ mobile */}
              {!isMOQMet && grandTotal > 0 && (
                <div style={{ fontSize: '11px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', color: '#FCD34D', marginBottom: '16px', display: 'flex', gap: '6px' }}>
                  <span>⚠</span> Quantité minimum non atteinte ({minQuantity} min).
                </div>
              )}

              {/* tabs mobile */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '20px', overflowX: 'auto' }}>
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'specifications', label: 'Caractéristiques' },
                    { id: 'avis', label: `Avis (${reviewsStats.totalReviews})` },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      style={{ flexShrink: 0, padding: '12px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', position: 'relative', color: activeTab === tab.id ? '#F5F5F5' : 'rgba(255,255,255,0.3)', transition: 'color .2s', whiteSpace: 'nowrap' }}>
                      {tab.label}
                      {activeTab === tab.id && <span style={{ position: 'absolute', bottom: 0, left: '12px', right: '12px', height: '1px', background: '#C8392B', borderRadius: '1px' }} />}
                    </button>
                  ))}
                </div>

                {activeTab === 'description' && (
                  <div>
                    <p style={{ fontSize: '13px', lineHeight: 1.85, color: 'rgba(255,255,255,0.5)' }}>{product.description || product.cleanedDesc || 'Description non disponible'}</p>
                    {product.features?.length > 0 && (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {product.features.map((f: string, i: number) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C8392B', flexShrink: 0, marginTop: '8px' }} />
                            {f}
                          </li>
                        ))}
                      </ul>
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
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'avis' && (
                  <div>
                    {!showReviewForm && (
                      <button onClick={() => setShowReviewForm(true)} style={{ width: '100%', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: 'rgba(200,57,43,0.08)', border: '1px solid rgba(200,57,43,0.25)', color: '#C8392B', marginBottom: '20px' }}>
                        Écrire un avis
                      </button>
                    )}
                    {showReviewForm && (
                      <div style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5' }}>Votre avis</h4>
                          <button onClick={() => setShowReviewForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.3)' }} /></button>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '7px' }}>Note</label>
                          <div style={{ display: 'flex', gap: '5px' }}>{[1,2,3,4,5].map(s => <button key={s} onClick={() => setNewReview({ ...newReview, rating: s })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Star style={{ width: '22px', height: '22px', fill: s <= newReview.rating ? '#E8B94F' : 'none', color: s <= newReview.rating ? '#E8B94F' : 'rgba(255,255,255,0.2)' }} /></button>)}</div>
                        </div>
                        <input type="text" value={newReview.authorName} onChange={e => setNewReview({ ...newReview, authorName: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Votre nom" />
                        <textarea value={newReview.comment} rows={3} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5', fontSize: '13px', outline: 'none', resize: 'none', marginBottom: '12px', boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Votre expérience..." />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setShowReviewForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>Annuler</button>
                          <button onClick={handleSubmitReview} disabled={isSubmittingReview} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: '#C8392B', border: 'none', color: '#fff', opacity: isSubmittingReview ? 0.5 : 1 }}>{isSubmittingReview ? 'Envoi...' : 'Publier'}</button>
                        </div>
                      </div>
                    )}
                    {isLoadingReviews ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{[1,2].map(i => <div key={i} style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} /><div style={{ height: '12px', width: '100px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)' }} /></div><div style={{ height: '11px', width: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} /></div>)}</div>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <Star style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.07)', margin: '0 auto 10px' }} />
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Aucun avis pour le moment</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '40px', fontWeight: 900, color: '#F5F5F5', lineHeight: 1 }}>{reviewsStats.averageRating}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '6px 0' }}>{[1,2,3,4,5].map(s => <Star key={s} style={{ width: '11px', height: '11px', fill: s <= Math.round(reviewsStats.averageRating) ? '#E8B94F' : 'none', color: s <= Math.round(reviewsStats.averageRating) ? '#E8B94F' : 'rgba(255,255,255,0.1)' }} />)}</div>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{reviewsStats.totalReviews}</p>
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {[5,4,3,2,1].map(r => {
                              const count = reviewsStats.ratingDistribution[r as keyof typeof reviewsStats.ratingDistribution] || 0
                              const pct = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                              return (
                                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                                  <span style={{ width: '10px', textAlign: 'right', color: 'rgba(255,255,255,0.25)' }}>{r}</span>
                                  <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}><div style={{ height: '100%', background: '#C8392B', width: `${pct}%`, borderRadius: '2px' }} /></div>
                                  <span style={{ width: '14px', color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          {reviews.map(review => (
                            <div key={review.id} style={{ paddingBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#F5F5F5' }}>{review.authorName.charAt(0).toUpperCase()}</div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>{review.authorName}</span>
                                      {review.verifiedPurchase && <span style={{ fontSize: '8px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>✓</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(s => <Star key={s} style={{ width: '10px', height: '10px', fill: s <= review.rating ? '#E8B94F' : 'none', color: s <= review.rating ? '#E8B94F' : 'rgba(255,255,255,0.1)' }} />)}</div>
                                  </div>
                                </div>
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{formatReviewDate(review.createdAt)}</span>
                              </div>
                              <p style={{ fontSize: '12px', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' }}>{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* produits similaires mobile */}
              <div style={{ marginTop: '36px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5', marginBottom: '16px', letterSpacing: '-0.01em' }}>Vous aimerez aussi</h2>
                {!isLoadingRelated && relatedProducts.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -16px', padding: '0 16px 4px' }}>
                    {relatedProducts.map(p => (
                      <a key={p.id} href={`/products/${p.id}`} style={{ flexShrink: 0, width: '130px', textDecoration: 'none' }}>
                        <div style={{ aspectRatio: '1/1', borderRadius: '12px', background: '#121212', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '8px' }}>
                          <Image src={p.image || '/placeholder.svg'} alt={p.name} width={130} height={130} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                        </div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.35, marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#C8392B' }}>{formatPrice(p.priceUSD)}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
          {/* END MOBILE */}

        </div>
      </main>

      {/* ── BARRE CTA FIXE MOBILE ── */}
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '12px 16px', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
            style={{ flex: 1, height: '48px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: isMOQMet && grandTotal > 0 ? '#C8392B' : 'linear-gradient(135deg,#F59E0B,#FBBF24)', color: '#fff', boxShadow: isMOQMet && grandTotal > 0 ? '0 4px 20px rgba(200,57,43,0.35)' : 'none' }}>
            <ShoppingCart style={{ width: '16px', height: '16px' }} />
            {isMOQMet && grandTotal > 0 ? `Ajouter (${grandTotal})` : 'Nous contacter'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!isMOQMet || grandTotal === 0}
            style={{ flex: 1, height: '48px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#F5F5F5', opacity: !isMOQMet || grandTotal === 0 ? 0.35 : 1 }}>
            Acheter
          </button>
        </div>
      </div>

      {/* ══════════════════════════
          MODALS
      ══════════════════════════ */}

      {/* Image modal */}
      {isImageModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }} onClick={() => setIsImageModalOpen(false)}>
          <button onClick={() => setIsImageModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <div style={{ position: 'relative', maxWidth: '640px', width: '100%', aspectRatio: '1/1' }} onClick={e => e.stopPropagation()}>
            <Image src={safeImages[selectedImage]} alt={productName} width={640} height={640} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            {safeImages.length > 1 && <>
              <button onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))} style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.7)' }} /></button>
              <button onClick={() => setSelectedImage(Math.min(safeImages.length - 1, selectedImage + 1))} style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.7)' }} /></button>
              <div style={{ position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{selectedImage + 1} / {safeImages.length}</div>
            </>}
          </div>
        </div>
      )}

      {/* Simple variant modal */}
      {isSimpleVariantModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} className="lg:items-center lg:p-4">
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '20px 20px 0 0', background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }} className="lg:rounded-2xl">
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {attributeImages[`${simpleVariantType}:${selectedSimpleValue}`] && <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}><Image src={attributeImages[`${simpleVariantType}:${selectedSimpleValue}`]} alt={selectedSimpleValue} width={38} height={38} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                <div><p style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5' }}>{primaryAttrName} · {selectedSimpleValue}</p><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Sélectionnez la quantité</p></div>
              </div>
              <button onClick={() => setIsSimpleVariantModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Quantité</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={decrementSimpleModal} disabled={simpleModalQuantity <= 0} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: simpleModalQuantity <= 0 ? 0.3 : 1 }}><Minus style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.6)' }} /></button>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#C8392B', minWidth: '28px', textAlign: 'center' }}>{simpleModalQuantity}</span>
                  <button onClick={incrementSimpleModal} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.6)' }} /></button>
                </div>
              </div>
              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Total</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F5' }}>{simpleModalQuantity} article(s)</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsSimpleVariantModalOpen(false)} style={{ flex: 1, padding: '13px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>Annuler</button>
                <button onClick={confirmSimpleVariantSelection} style={{ flex: 1, padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', background: '#C8392B', border: 'none', color: '#fff' }}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complex variant modal */}
      {isVariantModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} className="lg:items-center lg:p-4">
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '20px 20px 0 0', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="lg:rounded-2xl">
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5' }}>{modalMode === 'primary' ? `${primaryAttrName} ${modalPrimaryValue}` : `${modalAttrName} ${modalPrimaryValue}`}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Sélectionnez les {modalMode === 'primary' ? secondaryAttrName?.toLowerCase() + 's' : primaryAttrName?.toLowerCase() + 's'}</p>
              </div>
              <button onClick={() => setIsVariantModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} /></button>
            </div>
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {modalSecondaryOptions.map(value => (
                  <div key={value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{value}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <button onClick={() => removeModalQuantity(value)} disabled={!modalQuantities[value]} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !modalQuantities[value] ? 0.3 : 1 }}><Minus style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.6)' }} /></button>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#C8392B', minWidth: '22px', textAlign: 'center' }}>{modalQuantities[value] || 0}</span>
                      <button onClick={() => addModalQuantity(value)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.6)' }} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', margin: '12px 0', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Total</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F5' }}>{Object.values(modalQuantities).reduce((a, b) => a + b, 0)} articles</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsVariantModalOpen(false)} style={{ flex: 1, padding: '13px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>Annuler</button>
                <button onClick={confirmModalSelection} style={{ flex: 1, padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', background: '#C8392B', border: 'none', color: '#fff' }}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Protection modal */}
      {isProtectionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
          <div style={{ width: '100%', maxWidth: '480px', borderRadius: '20px', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(200,57,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield style={{ width: '17px', height: '17px', color: '#C8392B' }} /></div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5' }}>Protection Adullam</p>
              </div>
              <button onClick={() => setIsProtectionModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Paiement</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                  {[{ icon: Smartphone, label: 'MTN Money' }, { icon: Smartphone, label: 'Orange Money' }, { icon: CreditCard, label: 'Wave' }, { icon: CreditCard, label: 'Visa / MC' }].map(({ icon: Icon, label }) => (
                    <div key={label} style={{ padding: '12px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                      <Icon style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.4)', margin: '0 auto 6px' }} />
                      <p style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Garanties</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { title: 'Paiements sécurisés SSL', desc: 'Chaque transaction est chiffrée de bout en bout.' },
                    { title: 'Garantie remboursement', desc: "Remboursement complet si votre commande n'est pas expédiée." },
                  ].map(({ title, desc }) => (
                    <div key={title} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5', marginBottom: '5px' }}>{title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</p>
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
        * { scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}