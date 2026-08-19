"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import {
  ChevronRight,
  ChevronDown,
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
  Lock,
  PenLine,
} from "lucide-react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
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

// ============================================================
// Parseur de description brute (souvent scrapée type "Label: valeur Label:
// valeur ..." collés sans retour à la ligne). Extrait les paires clé/valeur
// pour un rendu en tableau façon Alibaba, en isolant l'intro (avant la
// première clé) et le reste (Contact Us / Company Profile / FAQ / etc.) qui
// n'a pas de structure clé/valeur exploitable.
// ============================================================
const DESCRIPTION_SECTION_MARKERS = [
  "Contact Us",
  "Company Profile",
  "Our Factory",
  "Test Report",
  "Product Shipping",
  "Packaging",
  "Package Details",
  "After-sale",
  "After Sale",
  "About Us",
  "Certifications",
  "Warranty",
  "FAQ",
]

// Libellés courants dans les fiches produits (Alibaba et similaires). Utiliser
// une liste connue plutôt qu'une détection générique évite de fusionner par
// erreur la fin d'une valeur avec le début du label suivant (ex: "China
// Season:" au lieu de "Season:" seul) quand le texte brut n'a pas de
// séparateur (retour à la ligne, point-virgule...) entre les champs.
const KNOWN_DESCRIPTION_LABELS = [
  "Place of Origin",
  "Brand Name",
  "Model Number",
  "Output Product Name",
  "Product Name",
  "Application Fields",
  "Applicable Industries",
  "Domain of Application",
  "Application",
  "Midsole Material",
  "Upper Material",
  "Outsole Material",
  "Lining Material",
  "Sole Material",
  "Outer Material",
  "Inner Material",
  "Raw Material",
  "Fabric Type",
  "Material",
  "Item Weight",
  "Package Weight",
  "Net Weight",
  "Gross Weight",
  "Weight",
  "Pattern Type",
  "Closure Type",
  "Item Type",
  "Product Type",
  "Age Group",
  "Department Name",
  "Style",
  "Season",
  "Gender",
  "Feature",
  "Function",
  "Color",
  "Colour",
  "Size",
  "Type",
  "Rated Voltage",
  "Voltage",
  "Power",
  "Capacity",
  "Usage",
  "Occasion",
  "Warranty",
  "Certification",
  "Certificate",
  "Supply Ability",
  "Port",
  "Payment Terms",
  "Minimum Order Quantity",
  "Packaging Details",
  "Delivery Time",
  "Origin",
  "Heel Height",
  "Keyword",
  "Condition",
  "Key Selling Points",
  "After-sales Service",
  "After Sale Service",
  "Name",
  "Brand",
]

const DESCRIPTION_LABEL_PATTERN = new RegExp(
  "(?:^|\\s)(" +
    KNOWN_DESCRIPTION_LABELS.slice()
      .sort((a, b) => b.length - a.length)
      .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|") +
    ")\\s*:\\s",
  "gi"
)

// Détecte un contenu qui n'est en fait pas une vraie description, mais du
// CSS/HTML brut mal nettoyé (résidu de scraping, ex: bloc "detail_decorate_root"
// / classes ".magic-N{...}" utilisées par Alibaba pour la mise en page de la
// fiche produit). Ce genre de contenu ne doit jamais être affiché tel quel.
function isLikelyMarkupJunk(text: string): boolean {
  if (!text) return false
  if (/detail_decorate_root/i.test(text)) return true
  // Plusieurs règles CSS type ".magic-12{...}" ou "#id{...}"
  const cssRuleMatches = text.match(/[.#][\w-]+\s*\{[^}]*\}/g)
  if (cssRuleMatches && cssRuleMatches.length >= 3) return true
  // Forte densité de déclarations "propriete:valeur;" typiques du CSS inline
  const cssPropMatches = text.match(/[a-z-]+:\s*[^;{}]+;/gi)
  if (cssPropMatches && cssPropMatches.length >= 5) return true
  return false
}

// Choisit la première source de description qui n'est pas du CSS/HTML brut
// (product.description en priorité, sinon product.cleanedDesc), et retombe
// sur un message par défaut si aucune des deux n'est exploitable.
function getCleanDescriptionText(product: any): string {
  const candidates = [product?.description, product?.cleanedDesc].filter(
    (t: string | undefined) => typeof t === "string" && t.trim().length > 0
  ) as string[]
  const clean = candidates.find((t) => !isLikelyMarkupJunk(t))
  return clean || "Description non disponible"
}

function parseDescriptionSpecs(rawText: string): {
  intro: string
  specs: { label: string; value: string }[]
  extra: string
} {
  if (!rawText) return { intro: "", specs: [], extra: "" }

  DESCRIPTION_LABEL_PATTERN.lastIndex = 0
  const matches: { label: string; start: number; end: number }[] = []
  let m: RegExpExecArray | null
  while ((m = DESCRIPTION_LABEL_PATTERN.exec(rawText)) !== null) {
    const label = m[1]
    const labelStart = m.index + m[0].indexOf(label)
    const matchEnd = m.index + m[0].length
    matches.push({ label: label.trim(), start: labelStart, end: matchEnd })
  }

  if (matches.length === 0) {
    return { intro: rawText, specs: [], extra: "" }
  }

  const intro = rawText.slice(0, matches[0].start).trim()

  // Coupure : premier marqueur de section connu (Contact Us, FAQ, ...) trouvé
  // après le début du premier label, pour éviter qu'une valeur n'avale tout
  // le reste du texte quand il n'y a plus de label reconnu après elle.
  let cutoffIndex = rawText.length
  const lowerText = rawText.toLowerCase()
  DESCRIPTION_SECTION_MARKERS.forEach((marker) => {
    const idx = lowerText.indexOf(marker.toLowerCase(), matches[0].start)
    if (idx !== -1 && idx < cutoffIndex) {
      cutoffIndex = idx
    }
  })

  const specs: { label: string; value: string }[] = []
  matches.forEach((match, i) => {
    if (match.end >= cutoffIndex) return // label situé après la coupure : ignoré
    const nextStart = i + 1 < matches.length ? matches[i + 1].start : cutoffIndex
    const valueEnd = Math.min(nextStart, cutoffIndex)
    const value = rawText.slice(match.end, valueEnd).trim()
    if (value) {
      specs.push({ label: match.label, value })
    }
  })

  const extra = cutoffIndex < rawText.length ? rawText.slice(cutoffIndex).trim() : ""

  return { intro, specs, extra }
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("description")
  const [showAllSpecs, setShowAllSpecs] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [minQuantity, setMinQuantity] = useState(1)
  const [isMOQMet, setIsMOQMet] = useState(false)
  const { addToCart, addItemsToCart } = useCart()
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
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  })

  // ============================================================
  // ÉTATS POUR LE FORMULAIRE D'AJOUT D'AVIS
  // ============================================================
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    authorName: "",
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
  const [attributeGroups, setAttributeGroups] = useState<
    Record<
      string,
      {
        name: string
        values: string[]
        type: "primary" | "secondary"
        hasImages?: boolean
      }
    >
  >({})

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
  const [modalMode, setModalMode] = useState<"primary" | "secondary">("primary")
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
  // TRACKING VIEW SUR LA PAGE PRODUIT
  // ============================================================
  const hasTrackedViewRef = useRef(false)

  useEffect(() => {
    if (!product?.id || hasTrackedViewRef.current) return
    hasTrackedViewRef.current = true

    let sessionId = localStorage.getItem("adullam_session_id")
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem("adullam_session_id", sessionId)
    }
    document.cookie = `sessionId=${sessionId}; path=/; max-age=86400; SameSite=Lax`

    apiFetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        type: "VIEW",
        context: "PRODUCT_PAGE",
        sessionId,
      }),
    }).catch(() => {})

    window.dispatchEvent(new CustomEvent("adullam:product-viewed", { detail: { productId: product.id } }))
  }, [product?.id])

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
              ratingDistribution: distribution,
            })
          } else {
            setReviewsStats({
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
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
      year: "numeric",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment.trim(),
          authorName: newReview.authorName.trim(),
          verifiedPurchase: false,
          createdAt: new Date().toISOString(),
          helpfulCount: 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Merci pour votre avis !")
        setShowReviewForm(false)
        setNewReview({ rating: 5, comment: "", authorName: "" })

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
              ratingDistribution: distribution,
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
          const exists = response.data.some(
            (item: any) => item.productId === product.id || item.product?.id === product.id,
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
          productWeight: product.weight?.toString() || "",
          quantity: totalQuantity.toString(),
          country: country,
        })

        const response = await apiFetch(`/api/logistics/estimate?${params}`)
        const data = await response.json()

        if (data.success) {
          setLogisticsData(data.data)

          if (data.data.shipping) {
            const availableModes = ["bateau", "avion", "express"].filter(
              (mode) => data.data.shipping[mode as keyof typeof data.data.shipping],
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
      "color_image",
      "colorimage",
      "color image",
      "colour_image",
      "colourimage",
      "colour image",
      "couleur_image",
      "couleurimage",
      "couleur image",
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
              .join("|")
            if (!imageMap[comboKey]) {
              imageMap[comboKey] = variant.image
            }

            if (normalizedKey.includes("color") || normalizedKey.includes("couleur")) {
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
        color: "Couleur",
        colour: "Couleur",
        couleur: "Couleur",
        size: "Taille",
        taille: "Taille",
        pointure: "Pointure",
        eur_size: "Pointure",
        material: "Matière",
        matière: "Matière",
        matiere: "Matière",
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
      attrValues.forEach((value) => {
        initialQuantities[value] = 0
      })
      setSimpleVariantQuantities(initialQuantities)

      setAttributeGroups({
        [attrName]: {
          name: formatAttributeName(attrName),
          values: attrValues,
          type: "primary",
          hasImages: attrValues.some((v) => imageMap[`${attrName}:${v}`]),
        },
      })
    } else {
      const groups: Record<
        string,
        { name: string; values: string[]; type: "primary" | "secondary"; hasImages?: boolean }
      > = {}

      attributeNames.forEach((attr, index) => {
        groups[attr] = {
          name: formatAttributeName(attr),
          values: Array.from(allAttributes[attr] || []),
          type: index === 0 ? "primary" : "secondary",
          hasImages: index === 0 && Array.from(allAttributes[attr] || []).some((v) => imageMap[`${attr}:${v}`]),
        }
      })

      setAttributeGroups(groups)
      setPrimaryAttrName(groups[primaryAttr]?.name || primaryAttr)

      const initialSelections: Record<string, Record<string, number>> = {}
      Array.from(allAttributes[primaryAttr] || []).forEach((value) => {
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
          const imgIndex = images.findIndex((i) => i === attributeImages[`${simpleVariantType}:${selectedSimpleValue}`])
          if (imgIndex !== -1) {
            setSelectedImage(imgIndex)
            return
          }
        }

        for (const [value, qty] of Object.entries(simpleVariantQuantities)) {
          if (qty > 0 && attributeImages[`${simpleVariantType}:${value}`]) {
            const imgIndex = images.findIndex((i) => i === attributeImages[`${simpleVariantType}:${value}`])
            if (imgIndex !== -1) {
              setSelectedImage(imgIndex)
              return
            }
          }
        }
      } else if (Object.keys(complexSelections).length > 0) {
        for (const [primaryValue, secondarySelections] of Object.entries(complexSelections)) {
          if (
            Object.keys(secondarySelections).length > 0 &&
            attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]
          ) {
            const imgIndex = images.findIndex(
              (i) => i === attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`],
            )
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
    setSimpleModalQuantity((prev) => prev + 1)
  }

  const decrementSimpleModal = () => {
    setSimpleModalQuantity((prev) => Math.max(0, prev - 1))
  }

  const confirmSimpleVariantSelection = () => {
    setSimpleVariantQuantities((prev) => ({
      ...prev,
      [selectedSimpleValue]: simpleModalQuantity,
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
      setModalMode("primary")
      setModalPrimaryValue(primaryValue)
      setModalSecondaryOptions(secondaryOptions)
      setModalAttrName(secondaryAttrName)

      const existing: Record<string, number> = {}
      secondaryOptions.forEach((opt) => {
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

    setModalMode("secondary")
    setModalPrimaryValue(secondaryValue)
    setModalSecondaryOptions(primaryOptions)
    setModalAttrName(primaryAttrName)

    const existing: Record<string, number> = {}
    primaryOptions.forEach((primaryVal) => {
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
    setModalQuantities((prev) => ({
      ...prev,
      [value]: (prev[value] || 0) + 1,
    }))
  }

  const removeModalQuantity = (value: string) => {
    setModalQuantities((prev) => {
      const newQty = (prev[value] || 0) - 1
      if (newQty <= 0) {
        const { [value]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [value]: newQty }
    })
  }

  const confirmModalSelection = () => {
    if (modalMode === "primary" && modalPrimaryValue) {
      setComplexSelections((prev) => {
        const updated = { ...prev }
        if (!updated[modalPrimaryValue]) {
          updated[modalPrimaryValue] = {}
        }
        updated[modalPrimaryValue] = { ...modalQuantities }
        return updated
      })
    } else if (modalMode === "secondary" && modalPrimaryValue) {
      setComplexSelections((prev) => {
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
    Object.values(complexSelections).forEach((secondarySelections) => {
      Object.values(secondarySelections).forEach((qty) => {
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
    Object.values(complexSelections).forEach((selections) => {
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
  // FONCTIONS D'ACHAT - CORRIGÉES (MOQ GLOBAL)
  // ============================================================
  const handleAddToCart = () => {
    const grandTotal = getGrandTotal()
    
    // ✅ Vérification MOQ globale (toutes variantes confondues)
    if (!product || grandTotal === 0) {
      toast.error("Veuillez sélectionner des articles")
      return
    }

    // ✅ Si grandTotal < minQuantity, bloquer l'ajout
    if (grandTotal < minQuantity) {
      toast.error(`Quantité minimum de ${minQuantity} pièces requise pour ce produit`, {
        duration: 4000,
        position: "top-center",
      })
      return
    }

    // ✅ On construit le LOT complet d'abord, puis on l'envoie en une seule
    // fois à addItemsToCart. Important : si on appelait addToCart séparément
    // pour chaque variante, chaque appel vérifierait le MOQ isolément AVANT
    // que les autres variantes du lot ne soient dans le panier, ce qui
    // rejette à tort un lot pourtant valide dans son ensemble (ex: 3+4+5=12
    // pièces pour un MOQ de 10, alors que 3, 4 et 5 pris séparément sont
    // chacun < 10).
    const itemsToAdd: CartItem[] = []

    if (!product.variants || product.variants.length === 0) {
      itemsToAdd.push({
        id: product.id,
        name: product.title,
        price: product.price,
        quantity: simpleQuantity,
        shippingMode: selectedShipping,
        weight: product.weight,
        image: images[selectedImage] || "/placeholder.svg",
        variantKey: `${product.id}`,
        minQuantity: minQuantity,
      })
    } else if (Object.keys(simpleVariantQuantities).length > 0) {
      Object.entries(simpleVariantQuantities).forEach(([value, qty]) => {
        if (qty > 0) {
          itemsToAdd.push({
            id: product.id,
            name: `${product.title} - ${primaryAttrName} ${value}`,
            price: product.price,
            quantity: qty,
            shippingMode: selectedShipping,
            weight: product.weight,
            image: attributeImages[`${simpleVariantType}:${value}`] || images[selectedImage] || "/placeholder.svg",
            variantKey: `${product.id}_${value}`,
            color: value,
            minQuantity: minQuantity,
          })
        }
      })
    } else if (Object.keys(complexSelections).length > 0) {
      Object.entries(complexSelections).forEach(([primaryValue, secondarySelections]) => {
        Object.entries(secondarySelections).forEach(([secondaryValue, qty]) => {
          if (qty > 0) {
            itemsToAdd.push({
              id: product.id,
              name: `${product.title} - ${primaryAttrName} ${primaryValue}, ${secondaryAttrName} ${secondaryValue}`,
              price: product.price,
              quantity: qty,
              shippingMode: selectedShipping,
              weight: product.weight,
              image:
                attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] ||
                images[selectedImage] ||
                "/placeholder.svg",
              variantKey: `${product.id}_${primaryValue}_${secondaryValue}`,
              color: primaryValue,
              eurSize: secondaryValue,
              minQuantity: minQuantity,
            })
          }
        })
      })
    }

    if (itemsToAdd.length === 0) {
      toast.error("Veuillez sélectionner des articles")
      return
    }

    // ✅ Un seul appel atomique : le MOQ est vérifié sur la somme du lot
    const result = addItemsToCart(itemsToAdd)

    if (result.success) {
      toast.success(`${result.addedCount} article(s) ajouté(s) au panier`, {
        duration: 3000,
        position: "top-center",
        icon: "🛒",
      })
    }
    // En cas d'échec, addItemsToCart affiche déjà le toast d'erreur MOQ —
    // on ne montre donc pas de faux succès en parallèle.
  }

  const handleBuyNow = () => {
    const grandTotal = getGrandTotal()
    
    // ✅ Vérification MOQ globale
    if (!product || grandTotal === 0) {
      toast.error("Veuillez sélectionner des articles")
      return
    }

    if (grandTotal < minQuantity) {
      toast.error(`Quantité minimum de ${minQuantity} pièces requise pour ce produit`, {
        duration: 4000,
        position: "top-center",
      })
      return
    }

    handleAddToCart()
    setTimeout(() => {
      router.push("/cart")
    }, 500)
  }

  const handleContactChatbot = () => {
    if (!product) return

    const grandTotal = getGrandTotal()
    const productName = product.title || product.name || "Produit"
    const priceFormatted = formatPrice(product.price)
    
    const message = `Bonjour Adu, je souhaite commander le produit : ${productName}\nQuantité : ${grandTotal} pièces\nPrix unitaire : ${priceFormatted}\nPays : ${country}\n\nJe n'atteins pas la quantité minimum (${minQuantity} pièces). Peux-tu m'aider ?`
    
    const event = new CustomEvent('openChatbotWithMessage', { 
      detail: { 
        message: message,
        product: {
          id: product.id,
          title: productName,
          price: product.price,
          quantity: grandTotal
        }
      } 
    })
    window.dispatchEvent(event)
  }

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailRef.current) {
      const container = thumbnailRef.current
      const scrollAmount = container.clientWidth
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const scrollRelated = (direction: "left" | "right") => {
    if (relatedCarouselRef.current) {
      const container = relatedCarouselRef.current
      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
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
        const res = await apiFetch(`/api/graph/recommendations/fallback?limit=8&exclude=${product?.id || ""}`)
        const data = await res.json()
        if (data.success && data.data.length > 0) {
          setRelatedProducts(data.data)
        }
      } catch (error) {
        console.error("Erreur chargement fallback:", error)
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
    if (shipping?.minDays === shipping?.maxDays) {
      return `${shipping.minDays}j`
    }
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

  const SHIPPING_OPTIONS = [
    { mode: "bateau", icon: Ship, label: "Maritime", labelShort: "Mer" },
    { mode: "avion", icon: Sparkles, label: "Aérien", labelShort: "Air" },
    { mode: "express", icon: Zap, label: "Express", labelShort: "Express" },
  ] as const

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-24 lg:pb-0">
        <div className="max-w-[1200px] mx-auto">
          <div className="lg:hidden px-4 py-3 border-b border-border">
            <CurrencyIndicator />
          </div>

          <div className="px-4 lg:px-8 py-3 lg:py-8">
            <div className="hidden lg:flex items-center gap-2 text-xs mb-6 text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Accueil
              </a>
              <ChevronRight className="w-3 h-3" />
              <a href="/category/electronique" className="hover:text-foreground transition-colors">
                Électronique
              </a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{productName}</span>
            </div>

            {/* SECTION MOBILE */}
            <div className="lg:hidden">
              {/* Mobile Gallery */}
              <div className="mb-4">
                <div className="relative">
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="w-full aspect-square bg-card flex items-center justify-center overflow-hidden rounded-2xl border border-border"
                  >
                    <Image
                      src={safeImages[selectedImage] || "/placeholder.svg"}
                      alt={productName}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </button>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border">
                      <div className="flex gap-1.5">
                        {safeImages.slice(0, 12).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`transition-all duration-200 rounded-full ${
                              selectedImage === idx ? "w-3 h-1 rounded-full" : "w-1.5 h-1.5 bg-muted-foreground/50"
                            }`}
                            style={selectedImage === idx ? { background: brandColor } : undefined}
                          />
                        ))}
                      </div>

                      {safeImages.length > 12 && (
                        <div className="flex items-center gap-1 pl-1.5 border-l border-border">
                          <button
                            onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                          >
                            <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <span className="text-[9px] font-medium text-muted-foreground min-w-[32px] text-center">
                            {selectedImage + 1}/{safeImages.length}
                          </span>
                          <button
                            onClick={() => setSelectedImage(Math.min(safeImages.length - 1, selectedImage + 1))}
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                          >
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {safeImages.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1 hide-scrollbar">
                    {safeImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className="flex-shrink-0 w-16 h-16 bg-card rounded-xl overflow-hidden border-2 transition-all"
                        style={{
                          borderColor: selectedImage === idx ? brandColor : "transparent",
                        }}
                      >
                        <Image
                          src={img || "/placeholder.svg"}
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
                        className="text-xs font-semibold px-2 py-0.5 rounded-md text-white"
                        style={{ background: brandColor, fontFamily: "'Poppins', sans-serif" }}
                      >
                        Top vente
                      </span>
                      <span className="text-xs text-muted-foreground">SKU: {product.id}</span>
                    </div>
                    <h1 className="text-lg font-semibold leading-tight text-balance">{productName}</h1>
                  </div>
                  <button
                    onClick={handleToggleWishlist}
                    className="p-2 -mt-1 hover:bg-muted rounded-full transition-colors"
                    aria-label="Ajouter aux favoris"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-muted-foreground">{reviewsStats.averageRating || 0}</span>
                  </div>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">{reviewsStats.totalReviews} avis</span>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">1.2k ventes</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: brandColor, fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}
                  >
                    {formatPrice(currentPrice)} x {grandTotal || 1}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                  </span>
                  <span className="text-xs text-white px-1.5 py-0.5 rounded-md" style={{ background: brandColor }}>
                    -20%
                  </span>
                </div>

                {/* AFFICHAGE DYNAMIQUE DES VARIANTES */}
                {hasVariants && (
                  <>
                    {hasSimpleVariants && (
                      <div className="p-4 rounded-2xl mb-4 bg-muted border border-border">
                        <h3 className="text-sm font-semibold text-foreground mb-3">{primaryAttrName}</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                            const hasImage = attributeImages[`${simpleVariantType}:${value}`]

                            return (
                              <button
                                key={value}
                                onClick={() => openSimpleVariantModal(value)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-all relative ${
                                  qty > 0
                                    ? "text-white font-semibold shadow-sm"
                                    : "bg-card text-foreground hover:bg-accent border border-border"
                                }`}
                                style={qty > 0 ? { background: brandColor } : undefined}
                              >
                                {hasImage ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full overflow-hidden">
                                      <Image
                                        src={attributeImages[`${simpleVariantType}:${value}`] || "/placeholder.svg"}
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
                                  <span
                                    className="absolute -top-1 -right-1 w-4 h-4 text-white text-[8px] rounded-full flex items-center justify-center font-bold"
                                    style={{ background: brandColor }}
                                  >
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
                            <div key={value} className="bg-card p-2 rounded-lg mt-3 border border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {attributeImages[`${simpleVariantType}:${value}`] && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-border">
                                      <Image
                                        src={attributeImages[`${simpleVariantType}:${value}`] || "/placeholder.svg"}
                                        alt={value}
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-foreground">{value}</span>
                                  <span className="text-xs text-muted-foreground">x{qty}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {hasComplexVariants && (
                      <>
                        <div className="p-4 rounded-2xl mb-4 bg-muted border border-border">
                          <h3 className="text-sm font-semibold text-foreground mb-3">{primaryAttrName}</h3>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(complexSelections).map((primaryValue) => {
                              const total = getPrimaryTotal(primaryValue)
                              const hasImage = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]

                              return (
                                <button
                                  key={primaryValue}
                                  onClick={() => openPrimaryModal(primaryValue)}
                                  className={`px-3 py-1.5 text-xs rounded-lg transition-all relative ${
                                    total > 0
                                      ? "text-white font-semibold shadow-sm"
                                      : "bg-card text-foreground hover:bg-accent border border-border"
                                  }`}
                                  style={total > 0 ? { background: brandColor } : undefined}
                                >
                                  {hasImage ? (
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-4 rounded-full overflow-hidden">
                                        <Image
                                          src={
                                            attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] ||
                                            "/placeholder.svg"
                                          }
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
                                    <span
                                      className="absolute -top-1 -right-1 w-4 h-4 text-white text-[8px] rounded-full flex items-center justify-center font-bold"
                                      style={{ background: brandColor }}
                                    >
                                      {total}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {secondaryAttrName && (
                          <div className="p-4 rounded-2xl mb-4 bg-muted border border-border">
                            <h3 className="text-sm font-semibold text-foreground mb-3">{secondaryAttrName}</h3>
                            <div className="flex flex-wrap gap-2">
                              {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map((secondaryValue) => {
                                const total = getSecondaryTotal(secondaryValue)

                                return (
                                  <button
                                    key={secondaryValue}
                                    onClick={() => openSecondaryModal(secondaryValue)}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-all relative ${
                                      total > 0
                                        ? "text-white font-semibold shadow-sm"
                                        : "bg-card text-foreground hover:bg-accent border border-border"
                                    }`}
                                    style={total > 0 ? { background: brandColor } : undefined}
                                  >
                                    {secondaryValue}
                                    {total > 0 && (
                                      <span
                                        className="absolute -top-1 -right-1 w-4 h-4 text-white text-[8px] rounded-full flex items-center justify-center font-bold"
                                        style={{ background: brandColor }}
                                      >
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
                            <div key={primaryValue} className="bg-card p-3 rounded-lg mb-2 border border-border">
                              <div className="flex items-center gap-2 mb-2">
                                {attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden border border-border">
                                    <Image
                                      src={
                                        attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] ||
                                        "/placeholder.svg"
                                      }
                                      alt={primaryValue}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-foreground">{primaryValue}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 pl-2">
                                {nonZeroSelections.map(([secondaryValue, qty]) => (
                                  <div key={secondaryValue} className="bg-muted px-2 py-1 rounded-md border border-border text-xs">
                                    <span className="font-medium">{secondaryValue}</span>
                                    <span className="ml-1 font-bold" style={{ color: brandColor }}>
                                      x{qty}
                                    </span>
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

                {!hasVariants && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Quantité</h3>
                    <div className="flex items-center rounded-lg overflow-hidden border border-border w-fit">
                      <button
                        onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))}
                        className="p-2.5 bg-muted hover:bg-accent transition-colors"
                        disabled={simpleQuantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold">{simpleQuantity}</span>
                      <button
                        onClick={() => setSimpleQuantity(simpleQuantity + 1)}
                        className="p-2.5 bg-muted hover:bg-accent transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                      <span className="inline-flex items-center text-muted-foreground">
                        <span
                          className="w-3 h-3 border-2 border-border rounded-full animate-spin mr-1"
                          style={{ borderTopColor: brandColor }}
                        />
                        Calcul...
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg total` : "0.00 kg total"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>Mode de livraison</span>
                    {selectedPortePorteCost > 0 && (
                      <span className="text-xs font-medium text-foreground">
                        Frais porte-à-porte:{" "}
                        <span className="font-bold" style={{ color: brandColor }}>
                          {formatPrice(selectedPortePorteCost)}
                        </span>
                      </span>
                    )}
                  </h3>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center p-2 rounded-lg border border-border bg-muted animate-pulse"
                        >
                          <div className="w-4 h-4 bg-border rounded-full mb-1" />
                          <div className="w-8 h-3 bg-border rounded mb-1" />
                          <div className="w-6 h-2 bg-border rounded mb-1" />
                          <div className="w-10 h-3 bg-border rounded" />
                        </div>
                      ))}
                    </div>
                  ) : logisticsError ? (
                    <div className="text-xs text-red-600 p-2 border border-red-300 rounded-lg bg-red-50 dark:bg-red-950/30">
                      {logisticsError}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-1.5">
                        {SHIPPING_OPTIONS.map((item) => {
                          const shippingMode = item.mode as "bateau" | "avion" | "express"
                          const isAvailable = logisticsData?.shipping?.[shippingMode]
                          const days = getShippingDays(shippingMode)
                          const cost = getShippingCost(shippingMode)
                          const isSelected = selectedShipping === shippingMode

                          if (!isAvailable) return null

                          return (
                            <button
                              key={item.mode}
                              onClick={() => setSelectedShipping(shippingMode)}
                              className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                                isSelected ? "text-white" : "bg-card border-border text-foreground hover:bg-accent"
                              }`}
                              style={isSelected ? { borderColor: brandColor, background: brandColor } : undefined}
                            >
                              <item.icon
                                className="w-4 h-4 mb-1"
                                style={{ color: isSelected ? "white" : undefined }}
                              />
                              <span className="text-xs font-medium">{item.labelShort}</span>
                              <span className="text-[10px] opacity-80">{days}</span>
                              <span
                                className="text-xs font-semibold mt-0.5"
                                style={{ color: isSelected ? "white" : brandColor }}
                              >
                                {formatPrice(cost)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <div className="text-center mt-1">
                        <span className="text-[10px] text-muted-foreground">* Frais de porte-à-porte inclus</span>
                      </div>
                    </>
                  )}
                </div>

                <div
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="rounded-2xl p-3 cursor-pointer transition-all bg-muted border border-border hover:border-foreground/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" style={{ color: brandColor }} />
                      <span className="text-xs font-semibold text-foreground">Protection Adullam</span>
                    </div>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {["MTN", "Orange", "Wave", "Visa"].map((method) => (
                      <span
                        key={method}
                        className="text-xs px-2 py-1 bg-card border border-border rounded-md text-muted-foreground"
                      >
                        {method}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Paiement sécurisé
                  </p>
                </div>

                {!isMOQMet && grandTotal > 0 && (
                  <div className="border rounded-xl p-3 text-sm" style={{ background: `${accentColor}1a`, borderColor: `${accentColor}66`, color: accentColor }}>
                    Quantité minimum non atteinte ({minQuantity} min). Contactez-nous pour discuter.
                  </div>
                )}

                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 lg:relative lg:border-0 lg:p-0 z-50 shadow-lg">
                  <div className="flex gap-2 max-w-[1440px] mx-auto">
                    <button
                      onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactChatbot}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-white"
                      style={{ background: isMOQMet && grandTotal > 0 ? brandColor : accentColor }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isMOQMet && grandTotal > 0 ? `Ajouter (${grandTotal})` : "Nous contacter"}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!isMOQMet || grandTotal === 0}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-white"
                      style={{ background: "#0A0A0A", opacity: isMOQMet && grandTotal > 0 ? 1 : 0.5 }}
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 text-xs border-y border-border my-2">
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
              <div className="mt-6 bg-card rounded-2xl p-4 border border-border">
                <div className="overflow-x-auto hide-scrollbar border-b border-border">
                  <div className="flex gap-4 min-w-max px-1">
                    {[
                      { id: "description", label: "Description" },
                      { id: "specifications", label: "Caractéristiques" },
                      { id: "avis", label: `Avis (${reviewsStats.totalReviews})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="py-2.5 px-1 text-sm font-medium whitespace-nowrap transition-all"
                        style={{
                          color: activeTab === tab.id ? brandColor : undefined,
                          borderBottom: activeTab === tab.id ? `2px solid ${brandColor}` : "2px solid transparent",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-4">
                  {activeTab === "description" && (
                    <div className="space-y-3">
                      {(() => {
                        const fullText = getCleanDescriptionText(product)
                        const { intro, specs, extra } = parseDescriptionSpecs(fullText)

                        // Fallback : aucune paire clé/valeur détectée -> texte simple tronqué
                        if (specs.length === 0) {
                          const charLimit = 280
                          const isLong = fullText.length > charLimit
                          const displayText =
                            isLong && !showFullDescription ? `${fullText.slice(0, charLimit).trim()}…` : fullText
                          return (
                            <>
                              <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-line">
                                {displayText}
                              </p>
                              {isLong && (
                                <button
                                  onClick={() => setShowFullDescription((prev) => !prev)}
                                  className="text-xs font-medium flex items-center gap-1"
                                  style={{ color: brandColor }}
                                >
                                  {showFullDescription ? "Voir moins" : "Voir plus"}
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${showFullDescription ? "rotate-180" : ""}`}
                                  />
                                </button>
                              )}
                            </>
                          )
                        }

                        return (
                          <>
                            {intro && (
                              <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-line">
                                {intro}
                              </p>
                            )}
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border border-border rounded-lg overflow-hidden border-collapse">
                                <tbody>
                                  {specs.map((spec, i) => (
                                    <tr key={i} className="border-b border-border last:border-b-0">
                                      <td className="py-2.5 px-3 bg-muted/40 text-muted-foreground font-medium w-[38%] align-top border-r border-border">
                                        {spec.label}
                                      </td>
                                      <td className="py-2.5 px-3 text-foreground break-words align-top">
                                        {spec.value}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {extra && (
                              <>
                                {showFullDescription && (
                                  <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-line">
                                    {extra}
                                  </p>
                                )}
                                <button
                                  onClick={() => setShowFullDescription((prev) => !prev)}
                                  className="text-xs font-medium flex items-center gap-1"
                                  style={{ color: brandColor }}
                                >
                                  {showFullDescription ? "Voir moins" : "Voir plus"}
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${showFullDescription ? "rotate-180" : ""}`}
                                  />
                                </button>
                              </>
                            )}
                          </>
                        )
                      })()}
                      {product.features && product.features.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Points forts :</h4>
                          <table className="w-full text-xs border-collapse">
                            <tbody>
                              {product.features.map((feature: string, i: number) => (
                                <tr key={i} className="border-b border-border">
                                  <td className="py-1.5 pr-2 w-6">
                                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: brandColor }} />
                                  </td>
                                  <td className="py-1.5 text-muted-foreground break-words">{feature}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "specifications" && (
                    <div className="overflow-x-auto">
                      {(() => {
                        const specs =
                          product.specifications && product.specifications.length > 0
                            ? product.specifications
                            : [
                                { label: "Marque", value: product.brand || "TechPro" },
                                { label: "Modèle", value: product.model || "Standard" },
                                { label: "Poids", value: product.weight ? `${product.weight} kg` : "N/A" },
                                { label: "Garantie", value: "12 mois" },
                              ]
                        const visibleLimit = 6
                        const hasMore = specs.length > visibleLimit
                        const visibleSpecs = showAllSpecs ? specs : specs.slice(0, visibleLimit)

                        return (
                          <>
                            <table className="w-full text-xs border border-border rounded-lg overflow-hidden border-collapse">
                              <tbody>
                                {visibleSpecs.map((spec: any, i: number) => (
                                  <tr key={i} className="border-b border-border last:border-b-0">
                                    <td className="py-2.5 px-3 bg-muted/40 text-muted-foreground font-medium w-[38%] align-top border-r border-border">
                                      {spec.label}
                                    </td>
                                    <td className="py-2.5 px-3 text-foreground break-words align-top">{spec.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {hasMore && (
                              <button
                                onClick={() => setShowAllSpecs((prev) => !prev)}
                                className="w-full mt-2 py-2 text-xs font-medium flex items-center justify-center gap-1"
                                style={{ color: brandColor }}
                              >
                                {showAllSpecs ? "Voir moins" : "Voir plus"}
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${showAllSpecs ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}

                  {activeTab === "avis" && (
                    <div className="space-y-4">
                      {!showReviewForm && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="w-full py-3 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          style={{ background: brandColor }}
                        >
                          <PenLine className="w-4 h-4" />
                          Donner mon avis
                        </button>
                      )}

                      {showReviewForm && (
                        <div className="rounded-2xl p-4 space-y-4 bg-card border border-border">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Votre avis</h4>
                            <button
                              onClick={() => setShowReviewForm(false)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div>
                            <label className="text-sm text-muted-foreground font-medium">Note</label>
                            <div className="flex gap-3 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`w-8 h-8 ${
                                      star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-border"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-muted-foreground font-medium">Votre nom</label>
                            <input
                              type="text"
                              value={newReview.authorName}
                              onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })}
                              className="w-full mt-1.5 p-3 bg-background border border-border rounded-lg focus:outline-none transition-all"
                              style={{ outlineColor: brandColor }}
                              placeholder="Jean Dupont"
                            />
                          </div>

                          <div>
                            <label className="text-sm text-muted-foreground font-medium">Votre commentaire</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full mt-1.5 p-3 bg-background border border-border rounded-lg focus:outline-none resize-none"
                              rows={4}
                              placeholder="Partagez votre expérience avec ce produit..."
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => setShowReviewForm(false)}
                              className="flex-1 py-3 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleSubmitReview}
                              disabled={isSubmittingReview}
                              className="flex-1 py-3 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ background: brandColor }}
                            >
                              {isSubmittingReview ? "Envoi..." : "Publier"}
                            </button>
                          </div>
                        </div>
                      )}

                      {isLoadingReviews ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="flex items-center justify-between mb-2">
                                <div className="h-4 bg-muted rounded w-24" />
                                <div className="h-3 bg-muted rounded w-20" />
                              </div>
                              <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star} className="w-3 h-3 bg-muted rounded" />
                                ))}
                              </div>
                              <div className="h-3 bg-muted rounded w-full mb-1" />
                              <div className="h-3 bg-muted rounded w-3/4" />
                            </div>
                          ))}
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                            <Star className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                          <p className="text-muted-foreground text-sm">Aucun avis pour le moment</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Soyez le premier à donner votre avis</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 pb-3 border-b border-border">
                            <div className="text-center">
                              <div
                                className="text-3xl font-black"
                                style={{ color: brandColor, fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.03em" }}
                              >
                                {reviewsStats.averageRating}
                              </div>
                              <div className="flex justify-center mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= Math.round(reviewsStats.averageRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-border"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">{reviewsStats.totalReviews} avis</p>
                            </div>
                            <div className="flex-1 space-y-1">
                              {[5, 4, 3, 2, 1].map((rating) => {
                                const count =
                                  reviewsStats.ratingDistribution[rating as keyof typeof reviewsStats.ratingDistribution] || 0
                                const percentage = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                                return (
                                  <div key={rating} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-6">{rating} ★</span>
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: brandColor }} />
                                    </div>
                                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {reviews.map((review) => (
                              <div key={review.id} className="border-b border-border pb-3 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-foreground text-xs font-medium">
                                      {review.authorName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium text-foreground">{review.authorName}</span>
                                    {review.verifiedPurchase && (
                                      <span className="text-[9px] px-1.5 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-full">
                                        Vérifié
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">{formatReviewDate(review.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-0.5 mb-1 ml-8">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-2.5 h-2.5 ${
                                        star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed ml-8">{review.comment}</p>
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

            {/* SECTION DESKTOP */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="hidden lg:grid lg:grid-cols-2 gap-8 mb-16 items-start"
            >
              {/* PARTIE GAUCHE - IMAGE (sticky + hauteur fixe 400px) */}
              <div className="sticky top-24">
                <div className="bg-card mb-2 h-[400px] flex items-center justify-center overflow-hidden border border-border rounded-2xl transition-all">
                  <Image
                    src={safeImages[selectedImage] || "/placeholder.svg"}
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
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-background rounded-full p-1 shadow-sm border border-border hover:bg-muted"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}

                    <div
                      ref={thumbnailRef}
                      className="flex gap-1.5 overflow-x-hidden scroll-smooth"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {safeImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className="flex-shrink-0 w-1/5 aspect-square bg-card rounded-xl overflow-hidden border-2 transition-all"
                          style={{
                            flexBasis: "calc(20% - 5px)",
                            borderColor: selectedImage === idx ? brandColor : "transparent",
                            opacity: selectedImage === idx ? 1 : 0.7,
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
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-background rounded-full p-1 shadow-sm border border-border hover:bg-muted"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* PARTIE DROITE - INFOS PRODUIT */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-md text-white"
                        style={{ background: brandColor, fontFamily: "'Poppins', sans-serif" }}
                      >
                        Top vente
                      </span>
                      <span className="text-xs text-muted-foreground">SKU: {product.id}</span>
                    </div>
                    <h1 className="text-xl font-semibold text-balance">{productName}</h1>

                    <div className="flex items-center gap-3 text-xs mt-2">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-muted-foreground ml-1">{reviewsStats.averageRating || 0}</span>
                      </div>
                      <span className="text-border">|</span>
                      <span className="text-muted-foreground">{reviewsStats.totalReviews} avis</span>
                      <span className="text-border">|</span>
                      <span className="text-muted-foreground">1,234+ commandes</span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleWishlist}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Ajouter aux favoris"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                </div>

                <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: brandColor, fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}
                    >
                      {formatPrice(currentPrice)} x {grandTotal || 1}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(currentPrice * 1.2 * (grandTotal || 1))}
                    </span>
                    <span className="text-xs text-white px-1.5 py-0.5 rounded-md" style={{ background: brandColor }}>
                      -20%
                    </span>
                  </div>

                  {hasVariants && (
                    <>
                      {hasSimpleVariants && (
                        <div className="mb-3">
                          <div className="text-xs text-muted-foreground mb-2">{primaryAttrName}</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(simpleVariantQuantities).map(([value, qty]) => {
                              const hasImage = attributeImages[`${simpleVariantType}:${value}`]

                              return (
                                <button
                                  key={value}
                                  onClick={() => openSimpleVariantModal(value)}
                                  className="px-3 py-1.5 text-xs border rounded-lg transition-all flex items-center gap-2"
                                  style={{
                                    borderColor: qty > 0 ? brandColor : "var(--border)",
                                    color: qty > 0 ? brandColor : undefined,
                                    background: qty > 0 ? `${brandColor}14` : "var(--card)",
                                    fontWeight: qty > 0 ? 600 : 400,
                                  }}
                                >
                                  {hasImage && (
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-border">
                                      <Image
                                        src={attributeImages[`${simpleVariantType}:${value}`] || "/placeholder.svg"}
                                        alt={value}
                                        width={20}
                                        height={20}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  {value}
                                  {qty > 0 && (
                                    <span
                                      className="ml-1 text-xs px-1.5 py-0.5 rounded-md border"
                                      style={{ borderColor: brandColor, background: "var(--background)" }}
                                    >
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
                              <div key={value} className="bg-muted p-3 rounded-lg mt-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {attributeImages[`${simpleVariantType}:${value}`] && (
                                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-card">
                                        <Image
                                          src={attributeImages[`${simpleVariantType}:${value}`] || "/placeholder.svg"}
                                          alt={value}
                                          width={32}
                                          height={32}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <span className="text-sm font-medium text-foreground">{value}</span>
                                  </div>
                                  <span className="text-sm font-bold" style={{ color: brandColor }}>
                                    x{qty}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {hasComplexVariants && (
                        <>
                          <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-2">{primaryAttrName}</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(complexSelections).map((primaryValue) => {
                                const total = getPrimaryTotal(primaryValue)
                                const hasImage = attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`]

                                return (
                                  <button
                                    key={primaryValue}
                                    onClick={() => openPrimaryModal(primaryValue)}
                                    className="px-3 py-1.5 text-xs border rounded-lg transition-all flex items-center gap-2"
                                    style={{
                                      borderColor: total > 0 ? brandColor : "var(--border)",
                                      color: total > 0 ? brandColor : undefined,
                                      background: total > 0 ? `${brandColor}14` : "var(--card)",
                                      fontWeight: total > 0 ? 600 : 400,
                                    }}
                                  >
                                    {hasImage && (
                                      <div className="w-5 h-5 rounded-full overflow-hidden border border-border">
                                        <Image
                                          src={
                                            attributeImages[`${Object.keys(attributeGroups)[0]}:${primaryValue}`] ||
                                            "/placeholder.svg"
                                          }
                                          alt={primaryValue}
                                          width={20}
                                          height={20}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    {primaryValue}
                                    {total > 0 && (
                                      <span
                                        className="ml-1 text-xs px-1.5 py-0.5 rounded-md border"
                                        style={{ borderColor: brandColor, background: "var(--background)" }}
                                      >
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
                              <div className="text-xs text-muted-foreground mb-2">{secondaryAttrName}</div>
                              <div className="flex flex-wrap gap-2">
                                {attributeGroups[Object.keys(attributeGroups)[1]]?.values.map((secondaryValue) => {
                                  const total = getSecondaryTotal(secondaryValue)

                                  return (
                                    <button
                                      key={secondaryValue}
                                      onClick={() => openSecondaryModal(secondaryValue)}
                                      className="px-3 py-1.5 text-xs border rounded-lg transition-all relative"
                                      style={{
                                        borderColor: total > 0 ? brandColor : "var(--border)",
                                        color: total > 0 ? brandColor : undefined,
                                        background: total > 0 ? `${brandColor}14` : "var(--card)",
                                        fontWeight: total > 0 ? 600 : 400,
                                      }}
                                    >
                                      {secondaryValue}
                                      {total > 0 && (
                                        <span
                                          className="absolute -top-2 -right-2 w-4 h-4 text-white text-[8px] rounded-full flex items-center justify-center"
                                          style={{ background: brandColor }}
                                        >
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

                  {!hasVariants && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-2">Quantité</div>
                      <div className="flex items-center rounded-lg overflow-hidden border border-border w-fit">
                        <button
                          onClick={() => setSimpleQuantity(Math.max(1, simpleQuantity - 1))}
                          className="p-1.5 hover:bg-muted transition-colors"
                          disabled={simpleQuantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center text-sm font-semibold">{simpleQuantity}</span>
                        <button
                          onClick={() => setSimpleQuantity(simpleQuantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-md text-white" style={{ background: brandColor }}>
                      Prix direct usine
                    </span>
                    <span className="text-muted-foreground">
                      Prix en {getCurrencySymbol()} (USD ${Number(product.price).toFixed(2)})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package className="w-3.5 h-3.5" style={{ color: brandColor }} />
                      <span>MOQ: {minQuantity}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" style={{ color: brandColor }} />
                      <span>Délai: {logisticsData?.recommended.days || "15-20"} jours</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {isLoadingLogistics ? (
                        <span className="inline-flex items-center text-muted-foreground">
                          <span
                            className="w-3 h-3 border-2 border-border rounded-full animate-spin mr-1"
                            style={{ borderTopColor: brandColor }}
                          />
                          Calcul...
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {logisticsData ? `${logisticsData.weight.totalWeight.toFixed(2)} kg total` : "0.00 kg total"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="bg-muted border border-border rounded-2xl p-4 mb-4 cursor-pointer hover:border-foreground/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" style={{ color: brandColor }} />
                      <span className="text-sm font-semibold text-foreground">Protection des achats Adullam</span>
                    </div>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {["MTN", "Orange", "Wave", "Visa"].map((method) => (
                      <span
                        key={method}
                        className="text-xs px-3 py-1.5 bg-card border border-border rounded-md text-muted-foreground"
                      >
                        {method}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Paiement sécurisé - Cliquez pour en savoir plus
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center justify-between">
                    <span>Mode de livraison</span>
                    {selectedPortePorteCost > 0 && (
                      <span className="text-xs font-medium text-foreground">
                        Frais porte-à-porte:{" "}
                        <span className="font-bold" style={{ color: brandColor }}>
                          {formatPrice(selectedPortePorteCost)}
                        </span>
                      </span>
                    )}
                  </h3>
                  {isLoadingLogistics ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted animate-pulse"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-border rounded-full" />
                            <div>
                              <div className="w-8 h-3 bg-border rounded mb-1" />
                              <div className="w-6 h-2 bg-border rounded" />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-10 h-3 bg-border rounded mb-1" />
                            <div className="w-8 h-2 bg-border rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : logisticsError ? (
                    <div className="text-xs text-red-600 p-2 border border-red-300 rounded-lg bg-red-50 dark:bg-red-950/30">
                      {logisticsError}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {SHIPPING_OPTIONS.map((item) => {
                        const shippingMode = item.mode as "bateau" | "avion" | "express"
                        const isAvailable = logisticsData?.shipping?.[shippingMode]
                        const days = getShippingDays(shippingMode)
                        const cost = getShippingCost(shippingMode)
                        const estimatedDate = getEstimatedDate(shippingMode)
                        const isSelected = selectedShipping === shippingMode

                        if (!isAvailable) return null

                        return (
                          <button
                            key={item.mode}
                            onClick={() => setSelectedShipping(shippingMode)}
                            className={`flex items-center justify-between p-2 rounded-lg border transition-all text-xs ${
                              isSelected ? "text-white" : "bg-card border-border text-foreground hover:bg-accent"
                            }`}
                            style={isSelected ? { borderColor: brandColor, background: brandColor } : undefined}
                          >
                            <div className="flex items-center gap-1.5">
                              <item.icon className="w-3.5 h-3.5" style={{ color: isSelected ? "white" : undefined }} />
                              <div className="text-left">
                                <p className="font-medium text-xs">{item.label}</p>
                                <p className="text-[10px] opacity-80">{days}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-xs" style={{ color: isSelected ? "white" : brandColor }}>
                                {formatPrice(cost)}
                              </p>
                              <p className="text-[9px] opacity-80">{estimatedDate}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {!isMOQMet && grandTotal > 0 && (
                    <div
                      className="border rounded-xl p-2 text-xs"
                      style={{ background: `${accentColor}1a`, borderColor: `${accentColor}66`, color: accentColor }}
                    >
                      MOQ non atteint ({minQuantity} min). Contactez-nous.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={isMOQMet && grandTotal > 0 ? handleAddToCart : handleContactChatbot}
                      className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 text-white hover:opacity-90"
                      style={{ background: isMOQMet && grandTotal > 0 ? brandColor : accentColor }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isMOQMet && grandTotal > 0 ? `Ajouter (${grandTotal})` : "Nous contacter"}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!isMOQMet || grandTotal === 0}
                      className="flex-1 py-2.5 text-sm text-white font-semibold rounded-xl transition-all hover:opacity-90"
                      style={{ background: "#0A0A0A", opacity: isMOQMet && grandTotal > 0 ? 1 : 0.5 }}
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-2xl text-xs border border-border">
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
            </motion.div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block mt-8 bg-card rounded-2xl p-6 border border-border">
              <div className="border-b border-border mb-6">
                <div className="flex gap-6">
                  {[
                    { id: "description", label: "Description" },
                    { id: "specifications", label: "Caractéristiques" },
                    { id: "avis", label: `Avis (${reviewsStats.totalReviews})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="pb-3 px-1 text-sm font-medium transition-colors relative"
                      style={{
                        color: activeTab === tab.id ? brandColor : undefined,
                        borderBottom: activeTab === tab.id ? `2px solid ${brandColor}` : "2px solid transparent",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm">
                {activeTab === "description" && (
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Description</h3>
                    {(() => {
                      const fullText = getCleanDescriptionText(product)
                      const { intro, specs, extra } = parseDescriptionSpecs(fullText)

                      // Fallback : aucune paire clé/valeur détectée -> texte simple tronqué
                      if (specs.length === 0) {
                        const charLimit = 500
                        const isLong = fullText.length > charLimit
                        const displayText =
                          isLong && !showFullDescription ? `${fullText.slice(0, charLimit).trim()}…` : fullText
                        return (
                          <>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{displayText}</p>
                            {isLong && (
                              <button
                                onClick={() => setShowFullDescription((prev) => !prev)}
                                className="mt-2 text-sm font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                style={{ color: brandColor }}
                              >
                                {showFullDescription ? "Voir moins" : "Voir plus"}
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${showFullDescription ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </>
                        )
                      }

                      return (
                        <>
                          {intro && <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-3">{intro}</p>}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-border rounded-lg overflow-hidden border-collapse">
                              <tbody>
                                {specs.map((spec, i) => (
                                  <tr key={i} className="border-b border-border last:border-b-0">
                                    <td className="py-2.5 px-4 bg-muted/40 text-muted-foreground font-medium w-1/3 align-top border-r border-border">
                                      {spec.label}
                                    </td>
                                    <td className="py-2.5 px-4 text-foreground break-words align-top">
                                      {spec.value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {extra && (
                            <>
                              {showFullDescription && (
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line mt-3">
                                  {extra}
                                </p>
                              )}
                              <button
                                onClick={() => setShowFullDescription((prev) => !prev)}
                                className="mt-2 text-sm font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                style={{ color: brandColor }}
                              >
                                {showFullDescription ? "Voir moins" : "Voir plus"}
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${showFullDescription ? "rotate-180" : ""}`}
                                />
                              </button>
                            </>
                          )}
                        </>
                      )
                    })()}
                    {product.features && product.features.length > 0 && (
                      <div className="mt-6 overflow-x-auto">
                        <h3 className="font-semibold mb-3 text-foreground">Caractéristiques principales</h3>
                        <table className="w-full text-sm border-collapse">
                          <tbody>
                            {product.features.map((feature: string, i: number) => (
                              <tr key={i} className="border-b border-border">
                                <td className="py-2 pr-3 w-8">
                                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: brandColor }} />
                                </td>
                                <td className="py-2 text-muted-foreground">{feature}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="overflow-x-auto">
                    {(() => {
                      const specs =
                        product.specifications && product.specifications.length > 0
                          ? product.specifications
                          : [
                              { label: "Marque", value: product.brand || "TechPro" },
                              { label: "Modèle", value: product.model || "Standard" },
                              { label: "Poids", value: product.weight ? `${product.weight} kg` : "N/A" },
                              { label: "Garantie", value: "12 mois" },
                            ]
                      const visibleLimit = 6
                      const hasMore = specs.length > visibleLimit
                      const visibleSpecs = showAllSpecs ? specs : specs.slice(0, visibleLimit)

                      return (
                        <>
                          <table className="w-full text-sm border border-border rounded-lg overflow-hidden border-collapse">
                            <tbody>
                              {visibleSpecs.map((spec: any, i: number) => (
                                <tr key={i} className="border-b border-border last:border-b-0">
                                  <td className="py-2.5 px-4 bg-muted/40 text-muted-foreground font-medium w-1/3 align-top border-r border-border">
                                    {spec.label}
                                  </td>
                                  <td className="py-2.5 px-4 text-foreground break-words align-top">{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {hasMore && (
                            <button
                              onClick={() => setShowAllSpecs((prev) => !prev)}
                              className="w-full mt-3 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity"
                              style={{ color: brandColor }}
                            >
                              {showAllSpecs ? "Voir moins" : "Voir plus"}
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${showAllSpecs ? "rotate-180" : ""}`}
                              />
                            </button>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}

                {activeTab === "avis" && (
                  <div>
                    {!showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="mb-6 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        style={{ background: brandColor }}
                      >
                        <PenLine className="w-4 h-4" />
                        Donner mon avis
                      </button>
                    )}

                    {showReviewForm && (
                      <div className="bg-background border border-border rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">Donnez votre avis</h3>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <label className="text-sm text-muted-foreground font-medium">Note</label>
                          <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-border"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="text-sm text-muted-foreground font-medium">Votre nom</label>
                          <input
                            type="text"
                            value={newReview.authorName}
                            onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })}
                            className="w-full mt-1 p-2 bg-card border border-border rounded-lg focus:outline-none"
                            placeholder="Jean Dupont"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="text-sm text-muted-foreground font-medium">Votre commentaire</label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="w-full mt-1 p-2 bg-card border border-border rounded-lg focus:outline-none resize-none"
                            rows={4}
                            placeholder="Partagez votre expérience..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview}
                            className="px-4 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                            style={{ background: brandColor }}
                          >
                            {isSubmittingReview ? "Envoi..." : "Publier mon avis"}
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoadingReviews ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-6 mb-6 animate-pulse">
                          <div className="text-center">
                            <div className="w-16 h-8 bg-muted rounded mb-1" />
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-4 h-4 bg-muted rounded" />
                              ))}
                            </div>
                            <div className="w-16 h-3 bg-muted rounded mt-1" />
                          </div>
                          <div className="flex-1 space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-12 h-3 bg-muted rounded" />
                                <div className="flex-1 h-2 bg-muted rounded" />
                                <div className="w-8 h-3 bg-muted rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border-b border-border pb-4 animate-pulse">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-muted rounded-full" />
                                  <div className="h-4 bg-muted rounded w-24" />
                                </div>
                                <div className="h-3 bg-muted rounded w-20" />
                              </div>
                              <div className="flex gap-1 ml-10 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star} className="w-3 h-3 bg-muted rounded" />
                                ))}
                              </div>
                              <div className="ml-10 space-y-1">
                                <div className="h-3 bg-muted rounded w-full" />
                                <div className="h-3 bg-muted rounded w-3/4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <Star className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground">Aucun avis pour le moment</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">Soyez le premier à donner votre avis</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-6 mb-6">
                          <div className="text-center">
                            <div
                              className="text-2xl font-bold"
                              style={{ color: brandColor, fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}
                            >
                              {reviewsStats.averageRating}
                            </div>
                            <div className="flex justify-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= Math.round(reviewsStats.averageRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-border"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{reviewsStats.totalReviews} avis</p>
                          </div>
                          <div className="flex-1 space-y-1">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count =
                                reviewsStats.ratingDistribution[rating as keyof typeof reviewsStats.ratingDistribution] || 0
                              const percentage = reviewsStats.totalReviews > 0 ? (count / reviewsStats.totalReviews) * 100 : 0
                              return (
                                <div key={rating} className="flex items-center gap-3 text-sm">
                                  <span className="w-12 text-muted-foreground">{rating} étoiles</span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: brandColor }} />
                                  </div>
                                  <span className="w-12 text-right text-muted-foreground text-sm">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b border-border pb-5 last:border-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-foreground text-sm font-medium">
                                    {review.authorName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-foreground">{review.authorName}</span>
                                      {review.verifiedPurchase && (
                                        <span className="text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-full">
                                          Achat vérifié
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-3 h-3 ${
                                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{formatReviewDate(review.createdAt)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground ml-11 leading-relaxed">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RELATED PRODUCTS */}
            <div className="mt-8 lg:mt-12">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-base lg:text-lg font-semibold">Vous aimerez aussi</h2>
              </div>

              {isLoadingRelated ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }} />
                </div>
              ) : relatedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Aucune recommandation pour le moment</div>
              ) : (
                <>
                  <div className="lg:hidden">
                    <div className="bg-card rounded-2xl p-4 border border-border">
                      <div className="relative">
                        <div className="overflow-x-auto overflow-y-hidden hide-scrollbar">
                          <div className="flex gap-3 w-max">
                            {relatedProducts.map((p) => (
                              <a
                                key={p.id}
                                href={`/products/${p.id}`}
                                className="group w-[calc((100vw-4rem)/3-0.5rem)] min-w-[calc((100vw-4rem)/3-0.5rem)]"
                              >
                                <div className="bg-background rounded-xl aspect-square mb-2 overflow-hidden border border-border group-hover:border-foreground/20 transition-all">
                                  <Image
                                    src={p.image || "/placeholder.svg"}
                                    alt={p.name}
                                    width={150}
                                    height={150}
                                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <h3 className="font-medium text-xs mb-0.5 line-clamp-2 text-foreground">{p.name}</h3>
                                <div className="flex items-center gap-1 mb-0.5">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <span className="text-[9px] text-muted-foreground">{p.rating || 4.5}</span>
                                </div>
                                <p
                                  className="text-sm font-bold"
                                  style={{ color: brandColor, fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}
                                >
                                  {formatPrice(p.priceUSD)}
                                </p>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block relative">
                    <div ref={relatedCarouselRef} className="overflow-x-auto overflow-y-hidden hide-scrollbar pb-4 scroll-smooth">
                      <div className="flex gap-4 w-max">
                        {relatedProducts.map((p) => (
                          <a key={p.id} href={`/products/${p.id}`} className="group w-[calc((1200px-4rem)/6-1rem)] min-w-[160px]">
                            <div className="bg-card rounded-xl aspect-square mb-3 overflow-hidden border border-border group-hover:border-foreground/20 transition-all">
                              <Image
                                src={p.image || "/placeholder.svg"}
                                alt={p.name}
                                width={180}
                                height={180}
                                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <h3 className="font-medium text-xs mb-1 line-clamp-2 text-foreground">{p.name}</h3>
                            <div className="flex items-center gap-1 mb-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{p.rating || 4.5}</span>
                            </div>
                            <p className="text-xs font-bold" style={{ color: brandColor }}>
                              {formatPrice(p.priceUSD)}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => scrollRelated("left")}
                      className="absolute left-0 top-1/3 -translate-y-1/2 -ml-4 w-7 h-7 bg-background rounded-full shadow-sm border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => scrollRelated("right")}
                      className="absolute right-0 top-1/3 -translate-y-1/2 -mr-4 w-7 h-7 bg-background rounded-full shadow-sm border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE SÉLECTION POUR VARIANTES SIMPLES */}
      {isSimpleVariantModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-background rounded-t-2xl lg:rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-border"
          >
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {attributeImages[`${simpleVariantType}:${selectedSimpleValue}`] && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-card">
                    <Image
                      src={attributeImages[`${simpleVariantType}:${selectedSimpleValue}`] || "/placeholder.svg"}
                      alt={selectedSimpleValue}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {primaryAttrName} {selectedSimpleValue}
                  </h3>
                  <p className="text-xs text-muted-foreground">Sélectionnez la quantité</p>
                </div>
              </div>
              <button
                onClick={() => setIsSimpleVariantModalOpen(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl mb-4">
                <span className="text-sm font-medium">Quantité</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementSimpleModal}
                    disabled={simpleModalQuantity <= 0}
                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold" style={{ color: brandColor }}>
                    {simpleModalQuantity}
                  </span>
                  <button
                    onClick={incrementSimpleModal}
                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl" style={{ background: "#0A0A0A" }}>
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Total sélectionné:</span>
                  <span>{simpleModalQuantity} article(s)</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsSimpleVariantModalOpen(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmSimpleVariantSelection}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: brandColor }}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL DE SÉLECTION POUR VARIANTES MULTIPLES */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-background rounded-t-2xl lg:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl border border-border"
          >
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modalMode === "primary" &&
                  modalPrimaryValue &&
                  attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`] && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-card">
                      <Image
                        src={attributeImages[`${Object.keys(attributeGroups)[0]}:${modalPrimaryValue}`] || "/placeholder.svg"}
                        alt={modalPrimaryValue}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {modalMode === "primary"
                      ? `${primaryAttrName} ${modalPrimaryValue}`
                      : `${modalAttrName} ${modalPrimaryValue}`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez les{" "}
                    {modalMode === "primary" ? secondaryAttrName.toLowerCase() + "s" : primaryAttrName.toLowerCase() + "s"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsVariantModalOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {modalSecondaryOptions.map((value) => (
                <div key={value} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <span className="text-sm font-medium">{value}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeModalQuantity(value)}
                      disabled={!modalQuantities[value]}
                      className="w-8 h-8 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{modalQuantities[value] || 0}</span>
                    <button
                      onClick={() => addModalQuantity(value)}
                      className="w-8 h-8 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 rounded-xl" style={{ background: "#0A0A0A" }}>
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Total sélectionné:</span>
                  <span>{Object.values(modalQuantities).reduce((a, b) => a + b, 0)} articles</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsVariantModalOpen(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmModalSelection}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: brandColor }}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL PROTECTION ADULLAM */}
      {isProtectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-border"
          >
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: brandColor }} />
                <h3 className="text-base font-semibold text-foreground">Protection des achats Adullam</h3>
              </div>
              <button
                onClick={() => setIsProtectionModalOpen(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Moyens de paiement acceptés</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted border border-border rounded-xl p-3 text-center">
                    <Smartphone className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs font-medium text-foreground">MTN Money</p>
                  </div>
                  <div className="bg-muted border border-border rounded-xl p-3 text-center">
                    <Smartphone className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs font-medium text-foreground">Orange Money</p>
                  </div>
                  <div className="bg-muted border border-border rounded-xl p-3 text-center">
                    <CreditCard className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs font-medium text-foreground">Wave</p>
                  </div>
                  <div className="bg-muted border border-border rounded-xl p-3 text-center">
                    <CreditCard className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs font-medium text-foreground">Visa/Mastercard</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Protection de votre commande</h4>
                <div className="space-y-3">
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground mb-1">Paiements sécurisés</p>
                    <p className="text-sm text-muted-foreground">Chaque transaction est protégée par un cryptage SSL strict.</p>
                  </div>

                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground mb-1">Garantie remboursement</p>
                    <p className="text-sm text-muted-foreground">
                      Obtenez un remboursement si votre commande n&apos;est pas expédiée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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