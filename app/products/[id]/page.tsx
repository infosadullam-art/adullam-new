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

// ============================================================
// INTERFACE POUR LES DONNÉES DE L'API LOGISTIQUE
// ============================================================
interface ShippingOption {
  cost: number
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

  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const [product, setProduct] = useState<any>(null)

  // Couleurs dynamiques
  const brandColor = "#2B4F3C"
  const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)"
  const accentColor = "#F59E0B"
  const softBg = "#F3F4F6"

  // ============================================================
  // GESTION DES IMAGES
  // ============================================================
  const [images, setImages] = useState<string[]>([])
  
  // ============================================================
  // CHARGEMENT DU PRODUIT
  // ============================================================
  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setProduct(res.data)
      })
      .catch((err) => console.error("Erreur produit", err))
  }, [id])

  // ============================================================
  // VÉRIFICATION SI LE PRODUIT EST DANS LA WISHLIST
  // ============================================================
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return
      
      console.log("🔍 [WISHLIST] Vérification si produit en favoris:", product.id)
      
      try {
        const response = await wishlistApi.list()
        console.log("🔍 [WISHLIST] Réponse list:", response)
        
        if (response.success && response.data) {
          const exists = response.data.some((item: any) => 
            item.productId === product.id || item.product?.id === product.id
          )
          console.log("🔍 [WISHLIST] Produit en favoris:", exists)
          setIsWishlisted(exists)
        }
      } catch (error) {
        console.error("❌ Erreur vérification wishlist:", error)
      }
    }
    
    checkWishlist()
  }, [user, product])

  // ============================================================
  // FONCTION POUR AJOUTER/RETIRER DES FAVORIS AVEC LOGS
  // ============================================================
  const handleToggleWishlist = async () => {
    console.log("🔴 [DEBUG] ========== CLIC SUR FAVORIS ==========")
    console.log("🔴 [DEBUG] handleToggleWishlist appelé")
    console.log("🔴 [DEBUG] user:", user?.email || "non connecté")
    console.log("🔴 [DEBUG] productId:", product?.id)
    console.log("🔴 [DEBUG] isWishlisted actuel:", isWishlisted)
    
    if (!user) {
      console.log("🔴 [DEBUG] Pas d'utilisateur, redirection vers login")
      router.push("/account?mode=login")
      return
    }
    
    try {
      if (isWishlisted) {
        console.log("🔴 [DEBUG] Tentative de RETRAIT du produit des favoris...")
        console.log("🔴 [DEBUG] Appel wishlistApi.remove avec productId:", product.id)
        
        const response = await wishlistApi.remove(product.id)
        console.log("🔴 [DEBUG] Réponse retrait:", response)
        
        if (response.success) {
          console.log("✅ [DEBUG] Retrait réussi!")
          setIsWishlisted(false)
          toast.success("Produit retiré des favoris")
        } else {
          console.log("❌ [DEBUG] Retrait échoué:", response.error)
          toast.error(response.error || "Erreur lors du retrait des favoris")
        }
      } else {
        console.log("🔴 [DEBUG] Tentative d'AJOUT du produit aux favoris...")
        console.log("🔴 [DEBUG] Appel wishlistApi.add avec productId:", product.id)
        
        const response = await wishlistApi.add(product.id)
        console.log("🔴 [DEBUG] Réponse ajout:", response)
        
        if (response.success) {
          console.log("✅ [DEBUG] Ajout réussi!")
          setIsWishlisted(true)
          toast.success("Produit ajouté aux favoris")
        } else {
          console.log("❌ [DEBUG] Ajout échoué:", response.error)
          toast.error(response.error || "Erreur lors de l'ajout aux favoris")
        }
      }
    } catch (error) {
      console.error("❌ [DEBUG] Erreur wishlist:", error)
      toast.error("Une erreur est survenue")
    }
    
    console.log("🔴 [DEBUG] ========== FIN CLIC ==========")
  }

  // ============================================================
  // APPEL À L'API LOGISTIQUE
  // ============================================================
  useEffect(() => {
    if (!product || !country) return
    
    const grandTotal = getGrandTotal()
    const quantityToUse = grandTotal > 0 ? grandTotal : 1
    
    const fetchLogisticsEstimate = async () => {
      setIsLoadingLogistics(true)
      setLogisticsError(null)
      
      try {
        const params = new URLSearchParams({
          productId: product.id,
          productTitle: product.title || product.name || "Produit",
          productWeight: product.weight?.toString() || '',
          quantity: quantityToUse.toString(),
          country: country
        })
        
        const response = await fetch(`/api/logistics/estimate?${params}`)
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
        setLogisticsError("Impossible de calculer les frais de livraison")
      } finally {
        setIsLoadingLogistics(false)
      }
    }
    
    fetchLogisticsEstimate()
  }, [product, country])

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
  // RECHERCHE DE L'IMAGE PRINCIPALE - CORRIGÉ POUR LES VARIANTES
  // ============================================================
  useEffect(() => {
    if (!product) return
    
    if (product.variants && product.variants.length > 0) {
      // CAS 1: Variantes simples
      if (Object.keys(simpleVariantQuantities).length > 0) {
        // Priorité 1: Image de la variante cliquée (même si quantité = 0)
        if (selectedSimpleValue && attributeImages[`${simpleVariantType}:${selectedSimpleValue}`]) {
          const imgIndex = images.findIndex(i => i === attributeImages[`${simpleVariantType}:${selectedSimpleValue}`])
          if (imgIndex !== -1) {
            setSelectedImage(imgIndex)
            return
          }
        }
        
        // Priorité 2: Image de la première variante avec quantité > 0
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
      // CAS 2: Variantes multiples
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
  // FONCTIONS POUR VARIANTES SIMPLES (1 attribut) - AVEC POPUP
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
  // FONCTIONS D'ACHAT AVEC NOTIFICATION
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
        variant: null
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
            variant: value
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
              variant: `${primaryValue}|${secondaryValue}`
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

  const relatedProducts = [
    { id: 1, name: "Câble USB-C Premium", priceUSD: 4.08, image: "/usb-c-cable-premium.jpg", orders: 1523, rating: 4.8 },
    { id: 2, name: "Chargeur Rapide 20W", priceUSD: 8.00, image: "/fast-charger-20w.jpg", orders: 2341, rating: 4.7 },
    { id: 3, name: "Étui de Protection", priceUSD: 2.94, image: "/protective-case-earbuds.jpg", orders: 892, rating: 4.5 },
    { id: 4, name: "Support Téléphone Bureau", priceUSD: 5.22, image: "/phone-desk-stand.jpg", orders: 1678, rating: 4.6 },
    { id: 5, name: "Adaptateur Secteur USB", priceUSD: 3.50, image: "/usb-adapter.jpg", orders: 3456, rating: 4.9 },
    { id: 6, name: "Câble Lightning", priceUSD: 4.50, image: "/lightning-cable.jpg", orders: 2789, rating: 4.7 },
    { id: 7, name: "Batterie Externe 10000mAh", priceUSD: 12.99, image: "/powerbank.jpg", orders: 1234, rating: 4.6 },
    { id: 8, name: "Support Voiture Téléphone", priceUSD: 3.99, image: "/car-holder.jpg", orders: 3456, rating: 4.5 }
  ]

  // ============================================================
  // FONCTIONS POUR AFFICHER LES DONNÉES LOGISTIQUES
  // ============================================================
  const getShippingCost = (mode: "bateau" | "avion" | "express"): number => {
    if (!logisticsData?.shipping || !logisticsData.shipping[mode]) return 0
    return logisticsData.shipping[mode]?.cost || 0
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

  // ============================================================
  // RENDU CONDITIONNEL
  // ============================================================
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#2B4F3C] rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  const safeImages = images.length > 0 ? images : ["/placeholder.svg"]
  const productName = product.title || product.name || "Produit"

  const displayedShippingCosts = {
    bateau: getShippingCost("bateau"),
    avion: getShippingCost("avion"),
    express: getShippingCost("express")
  }

  const currentPrice = product.price || 0
  const grandTotal = getGrandTotal()
  const hasVariants = product.variants && product.variants.length > 0
  const hasSimpleVariants = Object.keys(simpleVariantQuantities).length > 0
  const hasComplexVariants = Object.keys(complexSelections).length > 0

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-24 lg:pb-0">
        <div className="max-w-[1440px] mx-auto">
          
          <div className="lg:hidden px-4 py-3 border-b border-gray-100">
            <CurrencyIndicator />
          </div>

          <div className="px-4 lg:px-8 py-3 lg:py-8">
            
            <div className="hidden lg:flex items-center gap-2 text-xs mb-6 text-gray-400">
              <a href="/" className="hover:text-gray-600">Accueil</a>
              <ChevronRight className="w-3 h-3" />
              <a href="/category/electronique" className="hover:text-gray-600">Électronique</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600">{productName}</span>
            </div>

            {/* SECTION MOBILE */}
            <div className="lg:hidden">
              {/* Mobile Gallery */}
              <div className="mb-4">
                <div className="relative">
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden"
                  >
                    <Image
                      src={safeImages[selectedImage]}
                      alt={productName}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </button>
                  
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {safeImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          selectedImage === idx 
                            ? 'w-4 bg-[#2B4F3C]' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {safeImages.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1 hide-scrollbar">
                    {safeImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className="flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden border"
                        style={{
                          borderColor: selectedImage === idx ? brandColor : '#f0f0f0'
                        }}
                      >
                        <Image
                          src={img}
                          alt={`Miniature ${idx + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Product Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: brandGradient, color: 'white' }}
                      >
                        Top vente
                      </span>
                      <span className="text-xs text-gray-400">SKU: {product.id}</span>
                    </div>
                    <h1 className="text-lg font-medium leading-tight">{productName}</h1>
                  </div>
                  <button 
                    onClick={handleToggleWishlist}
                    className="p-2 -mt-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-gray-600">4.9</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">210 avis</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">1.2k ventes</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ background: brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatPrice(currentPrice)} x {grandTotal || 1}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                  </span>
                  <span className="text-xs text-white px-1.5 py-0.5 rounded" style={{ background: brandGradient }}>-20%</span>
                </div>

                {/* AFFICHAGE DYNAMIQUE DES VARIANTES - VERSION MOBILE AVEC GRANDS BLOCS GRIS */}
                {hasVariants && (
                  <>
                    {/* CAS 1: Variantes simples */}
                    {hasSimpleVariants && (
                      <div className="bg-gray-100 p-4 rounded-xl mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          {primaryAttrName}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                            const hasImage = attributeImages[`${simpleVariantType}:${value}`]
                            
                            return (
                              <button
                                key={value}
                                onClick={() => openSimpleVariantModal(value)}
                                className={`
                                  px-3 py-1.5 text-xs rounded-md transition-all relative
                                  ${qty > 0 
                                    ? 'bg-[#2B4F3C] text-white font-medium' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                  }
                                `}
                              >
                                {hasImage ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full overflow-hidden">
                                      <Image
                                        src={attributeImages[`${simpleVariantType}:${value}`]}
                                        alt={value}
                                        width={16}
                                        height={16}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span>{value}</span>
                                  </div>
                                ) : (
                                  value
                                )}
                                {qty > 0 && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#2B4F3C] text-white text-[8px] rounded-full flex items-center justify-center shadow-lg">
                                    {qty}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Résumé des sélections */}
                        {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                          if (qty === 0) return null
                          
                          return (
                            <div key={value} className="bg-white p-2 rounded-lg mt-3 border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {attributeImages[`${simpleVariantType}:${value}`] && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                                      <Image
                                        src={attributeImages[`${simpleVariantType}:${value}`]}
                                        alt={value}
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-gray-700">{value}</span>
                                  <span className="text-xs text-gray-500">x{qty}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* CAS 2: Variantes multiples */}
                    {hasComplexVariants && (
                      <>
                        {/* Bloc Attribut principal */}
                        <div className="bg-gray-100 p-4 rounded-xl mb-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">
                            {primaryAttrName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(complexSelections).map((primaryValue) => {
                              const total = getPrimaryTotal(primaryValue)
                              const hasImage = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]
                              
                              return (
                                <button
                                  key={primaryValue}
                                  onClick={() => openPrimaryModal(primaryValue)}
                                  className={`
                                    px-3 py-1.5 text-xs rounded-md transition-all relative
                                    ${total > 0 
                                      ? 'bg-[#2B4F3C] text-white font-medium' 
                                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }
                                  `}
                                >
                                  {hasImage ? (
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-4 rounded-full overflow-hidden">
                                        <Image
                                          src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]}
                                          alt={primaryValue}
                                          width={16}
                                          height={16}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span>{primaryValue}</span>
                                    </div>
                                  ) : (
                                    primaryValue
                                  )}
                                  {total > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#2B4F3C] text-white text-[8px] rounded-full flex items-center justify-center shadow-lg">
                                      {total}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Bloc Attribut secondaire */}
                        {secondaryAttrName && (
                          <div className="bg-gray-100 p-4 rounded-xl mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                              {secondaryAttrName}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map((secondaryValue) => {
                                const total = getSecondaryTotal(secondaryValue)
                                
                                return (
                                  <button
                                    key={secondaryValue}
                                    onClick={() => openSecondaryModal(secondaryValue)}
                                    className={`
                                      px-3 py-1.5 text-xs rounded-md transition-all relative
                                      ${total > 0 
                                        ? 'bg-[#2B4F3C] text-white font-medium' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                      }
                                    `}
                                  >
                                    {secondaryValue}
                                    {total > 0 && (
                                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#2B4F3C] text-white text-[8px] rounded-full flex items-center justify-center shadow-lg">
                                        {total}
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Résumé des sélections */}
                        {Object.entries(complexSelections).map(([primaryValue, secondarySelections]) => {
                          const nonZeroSelections = Object.entries(secondarySelections).filter(([_, qty]) => qty > 0)
                          if (nonZeroSelections.length === 0) return null
                          
                          return (
                            <div key={primaryValue} className="bg-white p-3 rounded-lg mb-2 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                {attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                                    <Image
                                      src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]}
                                      alt={primaryValue}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-700">{primaryValue}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 pl-2">
                                {nonZeroSelections.map(([secondaryValue, qty]) => (
                                  <div key={secondaryValue} className="bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs">
                                    <span className="font-medium">{secondaryValue}</span>
                                    <span className="ml-1 text-[#2B4F3C] font-bold">x{qty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </>
                )}

                {/* SÉLECTEUR DE QUANTITÉ POUR PRODUITS SANS VARIANTES */}
                {!hasVariants && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Quantité</h3>
                    <div className="flex items-center border rounded-lg w-fit shadow-sm">
                      <button
                        onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))}
                        className="p-2 hover:bg-gray-50 transition-colors"
                        disabled={simpleQuantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-medium">{simpleQuantity}</span>
                      <button
                        onClick={() => setSimpleQuantity(simpleQuantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>MOQ: {minQuantity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>En stock</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isLoadingLogistics ? (
                      <span className="inline-flex items-center text-gray-400">
                        <span className="w-3 h-3 border-2 border-gray-300 border-t-[#2B4F3C] rounded-full animate-spin mr-1"></span>
                        Calcul...
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        {logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg total` : '0.00 kg total'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mode de livraison */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-medium text-gray-500">Mode de livraison</h3>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col items-center p-2 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
                          <div className="w-4 h-4 bg-gray-200 rounded-full mb-1"></div>
                          <div className="w-8 h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="w-6 h-2 bg-gray-200 rounded mb-1"></div>
                          <div className="w-10 h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : logisticsError ? (
                    <div className="text-xs text-red-500 p-2 border border-red-200 rounded-lg bg-red-50">
                      {logisticsError}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { mode: "bateau", icon: Ship, label: "Mer" },
                        { mode: "avion", icon: Sparkles, label: "Air" },
                        { mode: "express", icon: Zap, label: "Express" }
                      ].map((item) => {
                        const shippingMode = item.mode as "bateau" | "avion" | "express"
                        const isAvailable = logisticsData?.shipping?.[shippingMode]
                        const days = getShippingDays(shippingMode)
                        const cost = getShippingCost(shippingMode)
                        
                        if (!isAvailable) return null
                        
                        return (
                          <button
                            key={item.mode}
                            onClick={() => setSelectedShipping(shippingMode)}
                            className="flex flex-col items-center p-2 rounded-lg border transition-all hover:shadow-md"
                            style={{
                              borderColor: selectedShipping === shippingMode ? brandColor : '#e5e7eb',
                              background: selectedShipping === shippingMode ? brandGradient : 'white'
                            }}
                          >
                            <item.icon className="w-4 h-4 mb-1" style={{ color: selectedShipping === shippingMode ? 'white' : '#9ca3af' }} />
                            <span className="text-xs font-medium" style={{ color: selectedShipping === shippingMode ? 'white' : '#374151' }}>
                              {item.label}
                            </span>
                            <span className="text-[10px]" style={{ color: selectedShipping === shippingMode ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>
                              {days}
                            </span>
                            <span className="text-xs font-semibold mt-0.5" style={{ color: selectedShipping === shippingMode ? 'white' : brandColor }}>
                              {formatPrice(cost)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Protection */}
                <div 
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" style={{ color: brandColor }} />
                      <span className="text-xs font-medium text-gray-900">Protection Adullam</span>
                    </div>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {['MTN', 'Orange', 'Wave', 'Visa'].map((method) => (
                      <span key={method} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-gray-400" />
                    Paiement sécurisé
                  </p>
                </div>

                {!isMOQMet && grandTotal > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 shadow-sm">
                    Quantité minimum non atteinte ({minQuantity} min). Contactez-nous pour discuter.
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 lg:relative lg:border-0 lg:p-0 z-50 shadow-lg">
                  <div className="flex gap-2 max-w-[1440px] mx-auto">
                    <button
                      onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
                      className="flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-lg"
                      style={{
                        background: (isMOQMet && grandTotal > 0) ? brandGradient : 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                        color: 'white'
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {(isMOQMet && grandTotal > 0) ? `Ajouter (${grandTotal})` : 'Nous contacter'}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!isMOQMet || grandTotal === 0}
                      className="flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #1A2F3F 0%, #2D3F4F 100%)',
                        color: 'white',
                        opacity: (isMOQMet && grandTotal > 0) ? 1 : 0.5
                      }}
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 text-xs border-y border-gray-100 my-2">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>Garantie 12 mois</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>Retour 15 jours</span>
                  </div>
                </div>
              </div>

              {/* Mobile Tabs */}
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-sm">
                <div className="overflow-x-auto hide-scrollbar border-b border-gray-200">
                  <div className="flex gap-4 min-w-max px-1">
                    {[
                      { id: "description", label: "Description" },
                      { id: "specifications", label: "Caractéristiques" },
                      { id: "avis", label: "Avis (210)" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors`}
                        style={{
                          color: activeTab === tab.id ? brandColor : '#6B7280',
                          borderColor: activeTab === tab.id ? brandColor : 'transparent'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-4">
                  {activeTab === "description" && (
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-700 leading-relaxed">
                        {product.description || product.cleanedDesc || "Description non disponible"}
                      </p>
                      {product.features && (
                        <ul className="space-y-2 mt-3">
                          {product.features.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "specifications" && product.specifications && (
                    <div className="space-y-2 text-sm">
                      {product.specifications.map((spec: any, i: number) => (
                        <div key={i} className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-500">{spec.label}</span>
                          <span className="font-medium text-gray-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === "avis" && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Avis clients à venir...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION DESKTOP */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6 lg:gap-8 mb-16">
              
              {/* GALLERY DESKTOP */}
              <div className="lg:col-span-5">
                <div className="bg-white mb-2 aspect-square flex items-center justify-center overflow-hidden border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Image
                    src={safeImages[selectedImage]}
                    alt={productName}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain p-4"
                    priority
                  />
                </div>

                {safeImages.length > 0 && (
                  <div className="relative mt-2 w-full">
                    {safeImages.length > 5 && (
                      <button
                        onClick={() => scrollThumbnails("left")}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-1 shadow-md border hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}

                    <div
                      ref={thumbnailRef}
                      className="flex gap-1.5 overflow-x-hidden scroll-smooth"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none"
                      }}
                    >
                      {safeImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className="flex-shrink-0 w-1/5 aspect-square bg-white rounded-lg overflow-hidden border transition-all hover:shadow-md"
                          style={{
                            flexBasis: "calc(20% - 5px)",
                            borderColor: selectedImage === idx ? brandColor : '#e5e7eb',
                            opacity: selectedImage === idx ? 1 : 0.7
                          }}
                        >
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`${productName} ${idx + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-contain p-1"
                          />
                        </button>
                      ))}
                    </div>

                    {safeImages.length > 5 && (
                      <button
                        onClick={() => scrollThumbnails("right")}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-1 shadow-md border hover:bg-gray-50"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* INFO PRODUIT DESKTOP */}
              <div className="lg:col-span-7">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: brandGradient, color: 'white' }}
                      >
                        Top vente
                      </span>
                      <span className="text-xs text-gray-400">SKU: {product.id}</span>
                    </div>
                    <h1 className="text-xl font-medium">{productName}</h1>
                    
                    <div className="flex items-center gap-3 text-xs mt-2">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-gray-600 ml-1">4.9</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">210 avis</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">1,234+ commandes</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleToggleWishlist}
                    className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 mb-4 shadow-sm">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold" style={{ background: brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {formatPrice(currentPrice)} x {grandTotal || 1}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                    </span>
                    <span className="text-xs text-white px-1.5 py-0.5 rounded" style={{ background: brandGradient }}>-20%</span>
                  </div>
                  
                  {/* VERSION DESKTOP - AVEC DESIGN DYNAMIQUE */}
                  {hasVariants && (
                    <>
                      {/* CAS 1: Variantes simples */}
                      {hasSimpleVariants && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-2">{primaryAttrName}</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                              const hasImage = attributeImages[`${simpleVariantType}:${value}`]
                              
                              return (
                                <button
                                  key={value}
                                  onClick={() => openSimpleVariantModal(value)}
                                  className={`
                                    px-3 py-1.5 text-xs border rounded-lg transition-all flex items-center gap-2 hover:shadow-md
                                    ${qty > 0 
                                      ? 'border-[#2B4F3C] text-[#2B4F3C] font-medium shadow-sm' 
                                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }
                                  `}
                                  style={{
                                    background: qty > 0 ? 'linear-gradient(135deg, #2B4F3C10 0%, #3A6B4E10 100%)' : 'white'
                                  }}
                                >
                                  {hasImage && (
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-sm">
                                      <Image
                                        src={attributeImages[`${simpleVariantType}:${value}`]}
                                        alt={value}
                                        width={20}
                                        height={20}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  {value}
                                  {qty > 0 && (
                                    <span className="ml-1 text-xs bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-[#2B4F3C]">
                                      {qty}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>

                          {/* Résumé des sélections */}
                          {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                            if (qty === 0) return null
                            
                            return (
                              <div key={value} className="bg-gray-50 p-3 rounded-lg mt-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {attributeImages[`${simpleVariantType}:${value}`] && (
                                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
                                        <Image
                                          src={attributeImages[`${simpleVariantType}:${value}`]}
                                          alt={value}
                                          width={32}
                                          height={32}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700">{value}</span>
                                  </div>
                                  <span className="text-sm font-bold" style={{ color: brandColor }}>x{qty}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* CAS 2: Variantes multiples */}
                      {hasComplexVariants && (
                        <>
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-2">{primaryAttrName}</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(complexSelections).map((primaryValue) => {
                                const total = getPrimaryTotal(primaryValue)
                                const hasImage = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]
                                
                                return (
                                  <button
                                    key={primaryValue}
                                    onClick={() => openPrimaryModal(primaryValue)}
                                    className={`
                                      px-3 py-1.5 text-xs border rounded-lg transition-all flex items-center gap-2 hover:shadow-md
                                      ${total > 0 
                                        ? 'border-[#2B4F3C] text-[#2B4F3C] font-medium shadow-sm' 
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                      }
                                    `}
                                    style={{
                                      background: total > 0 ? 'linear-gradient(135deg, #2B4F3C10 0%, #3A6B4E10 100%)' : 'white'
                                    }}
                                  >
                                    {hasImage && (
                                      <div className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-sm">
                                        <Image
                                          src={attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]}
                                          alt={primaryValue}
                                          width={20}
                                          height={20}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    {primaryValue}
                                    {total > 0 && (
                                      <span className="ml-1 text-xs bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-[#2B4F3C]">
                                        {total}
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Attribut secondaire */}
                          {secondaryAttrName && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-500 mb-2">{secondaryAttrName}</div>
                              <div className="flex flex-wrap gap-2">
                                {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map((secondaryValue) => {
                                  const total = getSecondaryTotal(secondaryValue)
                                  
                                  return (
                                    <button
                                      key={secondaryValue}
                                      onClick={() => openSecondaryModal(secondaryValue)}
                                      className={`
                                        px-3 py-1.5 text-xs border rounded-lg transition-all relative hover:shadow-md
                                        ${total > 0 
                                          ? 'border-[#2B4F3C] text-[#2B4F3C] font-medium shadow-sm' 
                                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }
                                      `}
                                      style={{
                                        background: total > 0 ? 'linear-gradient(135deg, #2B4F3C10 0%, #3A6B4E10 100%)' : 'white'
                                      }}
                                    >
                                      {secondaryValue}
                                      {total > 0 && (
                                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#2B4F3C] text-white text-[8px] rounded-full flex items-center justify-center shadow-lg">
                                          {total}
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* SÉLECTEUR DE QUANTITÉ - DESKTOP (sans variantes) */}
                  {!hasVariants && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-2">Quantité</div>
                      <div className="flex items-center border rounded-lg w-fit shadow-sm">
                        <button
                          onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))}
                          className="p-1.5 hover:bg-gray-50 transition-colors"
                          disabled={simpleQuantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center text-sm font-medium">{simpleQuantity}</span>
                        <button
                          onClick={() => setSimpleQuantity(simpleQuantity + 1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-full text-white" style={{ background: brandGradient }}>Prix direct usine</span>
                    <span className="text-gray-500">Prix en {getCurrencySymbol()} (USD ${Number(product.price).toFixed(2)})</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Package className="w-3.5 h-3.5" style={{ color: brandColor }} />
                      <span>MOQ: {minQuantity}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3.5 h-3.5" style={{ color: brandColor }} />
                      <span>Délai: {logisticsData?.recommended.days || '15-20'} jours</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      {isLoadingLogistics ? (
                        <span className="inline-flex items-center text-gray-500">
                          <span className="w-3 h-3 border-2 border-gray-300 border-t-[#2B4F3C] rounded-full animate-spin mr-1"></span>
                          Calcul...
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg total` : '0.00 kg total'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" style={{ color: brandColor }} />
                      <span className="text-sm font-medium text-gray-900">Protection des achats Adullam</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {['MTN', 'Orange', 'Wave', 'Visa'].map((method) => (
                      <span key={method} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Paiement sécurisé - Cliquez pour en savoir plus
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Mode de livraison</h3>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                            <div>
                              <div className="w-8 h-3 bg-gray-200 rounded mb-1"></div>
                              <div className="w-6 h-2 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-10 h-3 bg-gray-200 rounded mb-1"></div>
                            <div className="w-8 h-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : logisticsError ? (
                    <div className="text-xs text-red-500 p-2 border border-red-200 rounded-lg bg-red-50">
                      {logisticsError}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { mode: "bateau", icon: Ship, label: "Maritime" },
                        { mode: "avion", icon: Sparkles, label: "Aérien" },
                        { mode: "express", icon: Zap, label: "Express" }
                      ].map((item) => {
                        const shippingMode = item.mode as "bateau" | "avion" | "express"
                        const isAvailable = logisticsData?.shipping?.[shippingMode]
                        const days = getShippingDays(shippingMode)
                        const cost = getShippingCost(shippingMode)
                        const estimatedDate = getEstimatedDate(shippingMode)
                        
                        if (!isAvailable) return null
                        
                        return (
                          <button
                            key={item.mode}
                            onClick={() => setSelectedShipping(shippingMode)}
                            className="flex items-center justify-between p-2 rounded-lg border transition-all text-xs hover:shadow-md"
                            style={{
                              borderColor: selectedShipping === shippingMode ? brandColor : '#e5e7eb',
                              background: selectedShipping === shippingMode ? brandGradient : 'white'
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <item.icon className="w-3.5 h-3.5" style={{ color: selectedShipping === shippingMode ? 'white' : '#9ca3af' }} />
                              <div className="text-left">
                                <p className="font-medium text-xs" style={{ color: selectedShipping === shippingMode ? 'white' : '#374151' }}>
                                  {item.label}
                                </p>
                                <p className="text-[10px]" style={{ color: selectedShipping === shippingMode ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>
                                  {days}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-xs" style={{ color: selectedShipping === shippingMode ? 'white' : brandColor }}>
                                {formatPrice(cost)}
                              </p>
                              <p className="text-[9px]" style={{ color: selectedShipping === shippingMode ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>
                                {estimatedDate}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {!isMOQMet && grandTotal > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800 shadow-sm">
                      MOQ non atteint ({minQuantity} min). Contactez-nous.
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactWhatsApp}
                      className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 hover:shadow-lg"
                      style={{
                        background: (isMOQMet && grandTotal > 0) ? brandGradient : 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                        color: 'white'
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {(isMOQMet && grandTotal > 0) ? `Ajouter (${grandTotal})` : "Nous contacter"}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!isMOQMet || grandTotal === 0}
                      className="flex-1 py-2.5 text-sm text-white font-medium rounded-lg transition-all hover:shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #1A2F3F 0%, #2D3F4F 100%)',
                        opacity: (isMOQMet && grandTotal > 0) ? 1 : 0.5
                      }}
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg text-xs shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>Garantie 12 mois</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>Retour 15j</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>Certifié</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    <span>Suivi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block mt-8 bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-sm">
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
                  {[
                    { id: "description", label: "Description" },
                    { id: "specifications", label: "Caractéristiques" },
                    { id: "avis", label: "Avis (210)" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 px-1 text-sm font-medium transition-colors relative`}
                      style={{
                        color: activeTab === tab.id ? brandColor : '#6B7280',
                        borderBottom: activeTab === tab.id ? `2px solid ${brandColor}` : '2px solid transparent'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm">
                {activeTab === "description" && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3 text-gray-900">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {product.description || product.cleanedDesc || "Description non disponible"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3 text-gray-900">Caractéristiques principales</h3>
                      <ul className="space-y-2 text-gray-700">
                        {product.features ? (
                          product.features.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                              <span>Réduction active du bruit (ANC) jusqu'à 35dB</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                              <span>Autonomie de 30 heures avec le boîtier de charge</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                              <span>Résistance à l'eau IPX5 - Idéal pour le sport</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                              <span>Bluetooth 5.2 pour une connexion stable</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === "specifications" && (
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {product.specifications ? (
                        product.specifications.slice(0, 4).map((spec: any, i: number) => (
                          <div key={i} className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-500">{spec.label}</span>
                            <span className="font-medium text-gray-800">{spec.value}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          {[
                            { label: "Marque", value: "TechPro" },
                            { label: "Modèle", value: "TP-EB001" },
                            { label: "Version Bluetooth", value: "5.2" },
                            { label: "Autonomie (écouteurs)", value: "6 heures" }
                          ].map((spec, i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-gray-500">{spec.label}</span>
                              <span className="font-medium text-gray-800">{spec.value}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {product.specifications ? (
                        product.specifications.slice(4, 8).map((spec: any, i: number) => (
                          <div key={i} className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-500">{spec.label}</span>
                            <span className="font-medium text-gray-800">{spec.value}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          {[
                            { label: "Autonomie (boîtier)", value: "24 heures" },
                            { label: "Temps de charge", value: "1.5 heures" },
                            { label: "Poids", value: "4.5g par écouteur" },
                            { label: "Garantie", value: "12 mois" }
                          ].map((spec, i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-gray-500">{spec.label}</span>
                              <span className="font-medium text-gray-800">{spec.value}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === "avis" && (
                  <div>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ background: brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>4.9</div>
                        <div className="flex justify-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">210 avis</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2 text-xs">
                            <span className="w-8">{rating} étoiles</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full" 
                                style={{ width: rating === 5 ? '80%' : rating === 4 ? '15%' : '5%', background: brandGradient }} 
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8">
                              {rating === 5 ? '168' : rating === 4 ? '32' : '10'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b border-gray-200 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
                              <span className="text-sm font-medium">Jean D.</span>
                            </div>
                            <span className="text-xs text-gray-400">15 déc. 2024</span>
                          </div>
                          <div className="flex items-center gap-1 ml-8 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700 ml-8">
                            Très bonne qualité sonore, confortable et bonne autonomie. Je recommande !
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RELATED PRODUCTS */}
            <div className="mt-8 lg:mt-12">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-base lg:text-lg font-medium">Vous aimerez aussi</h2>
              </div>
              
              {/* Mobile carousel */}
              <div className="lg:hidden">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-sm">
                  <div className="relative">
                    <div className="overflow-x-auto overflow-y-hidden hide-scrollbar">
                      <div className="flex gap-3 w-max">
                        {relatedProducts.map((p) => (
                          <a 
                            key={p.id} 
                            href={`/products/${p.id}`} 
                            className="group w-[calc((100vw-4rem)/3-0.5rem)] min-w-[calc((100vw-4rem)/3-0.5rem)]"
                          >
                            <div className="bg-white rounded-lg aspect-square mb-2 overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                              <Image
                                src={p.image || "/placeholder.svg"}
                                alt={p.name}
                                width={150}
                                height={150}
                                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <h3 className="font-medium text-xs mb-0.5 line-clamp-2 text-gray-800">{p.name}</h3>
                            <div className="flex items-center gap-1 mb-0.5">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-[9px] text-gray-500">{p.rating}</span>
                            </div>
                            <p className="text-sm font-bold" style={{ background: brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                              {formatPrice(p.priceUSD)}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{p.orders}+ commandes</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop carousel */}
              <div className="hidden lg:block relative">
                <div 
                  ref={relatedCarouselRef}
                  className="overflow-x-auto overflow-y-hidden hide-scrollbar pb-4 scroll-smooth"
                >
                  <div className="flex gap-4 w-max">
                    {relatedProducts.map((p) => (
                      <a 
                        key={p.id} 
                        href={`/products/${p.id}`} 
                        className="group w-[calc((1440px-4rem)/6-1rem)] min-w-[180px]"
                      >
                        <div className="bg-white rounded-xl aspect-square mb-3 overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                          <Image
                            src={p.image || "/placeholder.svg"}
                            alt={p.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2 text-gray-800">{p.name}</h3>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{p.rating}</span>
                        </div>
                        <p className="text-base font-bold" style={{ background: brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {formatPrice(p.priceUSD)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{p.orders}+ commandes</p>
                      </a>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => scrollRelated("left")}
                  className="absolute left-0 top-1/3 -translate-y-1/2 -ml-4 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => scrollRelated("right")}
                  className="absolute right-0 top-1/3 -translate-y-1/2 -mr-4 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE SÉLECTION POUR VARIANTES SIMPLES */}
      {isSimpleVariantModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-t-xl lg:rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {attributeImages[`${simpleVariantType}:${selectedSimpleValue}`] && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <Image
                      src={attributeImages[`${simpleVariantType}:${selectedSimpleValue}`]}
                      alt={selectedSimpleValue}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {primaryAttrName} {selectedSimpleValue}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sélectionnez la quantité
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSimpleVariantModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-sm mb-4">
                <span className="text-sm font-medium">Quantité</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementSimpleModal}
                    disabled={simpleModalQuantity <= 0}
                    className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold" style={{ color: brandColor }}>
                    {simpleModalQuantity}
                  </span>
                  <button
                    onClick={incrementSimpleModal}
                    className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg" style={{ background: brandGradient }}>
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Total sélectionné:</span>
                  <span>{simpleModalQuantity} article(s)</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsSimpleVariantModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:shadow-sm transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmSimpleVariantSelection}
                  className="flex-1 py-3 rounded-lg text-sm font-medium text-white hover:shadow-lg transition-all"
                  style={{ background: brandGradient }}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SÉLECTION POUR VARIANTES MULTIPLES */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-t-xl lg:rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modalMode === 'primary' && modalPrimaryValue && attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`] && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <Image
                      src={attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`]}
                      alt={modalPrimaryValue}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {modalMode === 'primary' 
                      ? `${primaryAttrName} ${modalPrimaryValue}`
                      : `${modalAttrName} ${modalPrimaryValue}`
                    }
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sélectionnez les {modalMode === 'primary' ? secondaryAttrName.toLowerCase() + 's' : primaryAttrName.toLowerCase() + 's'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsVariantModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {modalSecondaryOptions.map((value) => (
                <div key={value} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium">{value}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeModalQuantity(value)}
                      disabled={!modalQuantities[value]}
                      className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{modalQuantities[value] || 0}</span>
                    <button
                      onClick={() => addModalQuantity(value)}
                      className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 rounded-lg" style={{ background: brandGradient }}>
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Total sélectionné:</span>
                  <span>
                    {Object.values(modalQuantities).reduce((a, b) => a + b, 0)} articles
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsVariantModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:shadow-sm transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmModalSelection}
                  className="flex-1 py-3 rounded-lg text-sm font-medium text-white hover:shadow-lg transition-all"
                  style={{ background: brandGradient }}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROTECTION ADULLAM */}
      {isProtectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: brandColor }} />
                <h3 className="text-base font-semibold text-gray-900">Protection des achats Adullam</h3>
              </div>
              <button 
                onClick={() => setIsProtectionModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Moyens de paiement acceptés</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                    <Smartphone className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">MTN Money</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                    <Smartphone className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Orange Money</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                    <CreditCard className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Wave</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                    <CreditCard className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Visa/Mastercard</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Protection de votre commande</h4>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-900 mb-1">Paiements sécurisés</p>
                    <p className="text-sm text-gray-600">
                      Chaque transaction est protégée par un cryptage SSL strict.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-900 mb-1">Garantie remboursement</p>
                    <p className="text-sm text-gray-600">
                      Obtenez un remboursement si votre commande n'est pas expédiée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}