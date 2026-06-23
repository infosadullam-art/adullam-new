"use client"

// components/ChatbotWidget.tsx
// Bulle flottante du chatbot Adu
// VENDEUR ULTIME - Version 4.0
// Mode vocal, cartes produits, offres, compte à rebours, scroll infini, COUPONS 🎫

import { useState, useEffect, useRef, useCallback } from "react"
import { OfferBanner } from "@/components/OfferBanner"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useLocale } from "@/context/LocaleProvider"

// ============================================================
// ICÔNES PRO (SVG inline, aucune dépendance)
// ============================================================

function BotIcon({ size = 22, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="16" height="11" rx="4" stroke={color} strokeWidth="1.8" />
      <path d="M12 4v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="3.2" r="1.4" fill={color} />
      <circle cx="9" cy="13.5" r="1.3" fill={color} />
      <circle cx="15" cy="13.5" r="1.3" fill={color} />
      <path d="M9.5 16.5h5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 12H2.6M20 12h1.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12l16-7-7 16-2.5-6.5L4 12z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function MicIcon({ size = 16, color = "#fff", active = false }: { size?: number; color?: string; active?: boolean }) {
  if (active) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="7" width="10" height="10" rx="2" fill={color} />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke={color} strokeWidth="1.8" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ size = 16, color = "#fff", up = false }: { size?: number; color?: string; up?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: up ? "rotate(180deg)" : "none" }}>
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StopIcon({ size = 14, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" fill={color} />
    </svg>
  )
}

// ============================================================
// TYPES
// ============================================================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: Product[]
  offer?: Offer
}

interface Product {
  id: string
  name?: string
  title?: string
  price?: number
  image?: string
  score?: number
  source?: string
  reason?: string
}

interface Offer {
  type: 'safe' | 'risky' | 'none'
  discount_1: number
  discount_2: number
  time_limit: number
  urgency_message?: string
  taunt_message?: string
}

interface ChatbotWidgetProps {
  sessionId: string
  userId?: string
  language?: 'fr' | 'en' | 'pt'
  token?: string
}

// ============================================================
// CONSTANTES
// ============================================================

const TRIGGER_CHECK_INTERVAL = 30000
const INACTIVITY_THRESHOLD   = 15
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.adullamarket.com'

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function ChatbotWidget({ sessionId, userId, language = 'fr', token }: ChatbotWidgetProps) {
  // ✅ Hooks
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const { country, currency, locale } = useLocale()

  // ✅ États principaux
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null)
  const [isFirstOpen, setIsFirstOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [loadOffset, setLoadOffset] = useState(3)
  
  // 🎤 Vocal
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)

  // 🏷️ Offres
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null)
  const [offerTimer, setOfferTimer] = useState<number>(0)
  const [showOfferBanner, setShowOfferBanner] = useState(false)

  // 🎫 Coupons
  const [activeCoupon, setActiveCoupon] = useState<any>(null)
  const [showCouponBanner, setShowCouponBanner] = useState(false)
  const [couponTimer, setCouponTimer] = useState<number>(0)
  const [pendingOfferProduct, setPendingOfferProduct] = useState<Product | null>(null)
  const [pendingOfferDiscount, setPendingOfferDiscount] = useState<number | null>(null)
  const [waitingForOfferResponse, setWaitingForOfferResponse] = useState(false)
  const [hasBeenOffered, setHasBeenOffered] = useState(false)

  // Refs
  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLInputElement>(null)
  const lastActionRef   = useRef<number>(Date.now())
  const triggerTimerRef = useRef<NodeJS.Timeout>()
  const viewCountRef    = useRef(0)
  const recognitionRef  = useRef<any>(null)
  const speechSynthRef  = useRef<SpeechSynthesis | null>(null)

  // 🖱️ Déplacement (drag) façon Messenger
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)     // fenêtre (desktop)
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null) // bulle flottante
  const [isDragging, setIsDragging] = useState(false)
  const [snapAnimating, setSnapAnimating] = useState(false) // animation d'accroche au bord
  const dragStateRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
    mode: 'window' | 'bubble'
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLButtonElement>(null)

  // ⌨️ Hauteur clavier (visualViewport) façon Messenger
  const [keyboardInset, setKeyboardInset] = useState(0)

  // ============================================================
  // HOOKS & EFFETS
  // ============================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const hasSpeechRecognition = !!(
      window.SpeechRecognition || window.webkitSpeechRecognition
    )
    const hasSpeechSynthesis = !!window.speechSynthesis
    setVoiceSupported(hasSpeechRecognition && hasSpeechSynthesis)
    if (window.speechSynthesis) {
      speechSynthRef.current = window.speechSynthesis
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const trackActivity = () => {
      lastActionRef.current = Date.now()
    }
    window.addEventListener('mousemove', trackActivity)
    window.addEventListener('scroll', trackActivity)
    window.addEventListener('click', trackActivity)
    return () => {
      window.removeEventListener('mousemove', trackActivity)
      window.removeEventListener('scroll', trackActivity)
      window.removeEventListener('click', trackActivity)
    }
  }, [])

  // ⌨️ Gestion clavier mobile (façon Messenger : la fenêtre reste ancrée
  // au-dessus du clavier et CONSERVE sa hauteur au lieu d'être écrasée)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return
    const vv = window.visualViewport

    const handleViewport = () => {
      // Hauteur "mangée" par le clavier = différence entre la fenêtre
      // et le viewport visible (+ décalage de scroll éventuel)
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardInset(inset > 80 ? inset : 0) // seuil pour ignorer les barres natives
    }

    vv.addEventListener('resize', handleViewport)
    vv.addEventListener('scroll', handleViewport)
    handleViewport()
    return () => {
      vv.removeEventListener('resize', handleViewport)
      vv.removeEventListener('scroll', handleViewport)
    }
  }, [])

  // 🖱️ Déplacement fluide (fenêtre OU bulle) — souris + tactile
  useEffect(() => {
    if (!isDragging) return

    const bubbleSize = isMobile ? 48 : 56
    const clamp = (x: number, y: number, mode: 'window' | 'bubble') => {
      const el = mode === 'bubble' ? bubbleRef.current : containerRef.current
      const w = el?.offsetWidth ?? (mode === 'bubble' ? bubbleSize : 380)
      const h = el?.offsetHeight ?? (mode === 'bubble' ? bubbleSize : 540)
      const maxX = window.innerWidth - w - 8
      const maxY = window.innerHeight - h - 8
      return {
        x: Math.min(Math.max(8, x), Math.max(8, maxX)),
        y: Math.min(Math.max(8, y), Math.max(8, maxY)),
      }
    }

    const onMove = (clientX: number, clientY: number) => {
      const s = dragStateRef.current
      if (!s) return
      const dx = clientX - s.startX
      const dy = clientY - s.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) s.moved = true
      const pos = clamp(s.originX + dx, s.originY + dy, s.mode)
      if (s.mode === 'bubble') setBubblePos(pos)
      else setDragPos(pos)
    }

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY)
        e.preventDefault()
      }
    }

    const onEnd = () => {
      const s = dragStateRef.current
      // 🧲 Accroche au bord le plus proche (façon Messenger) pour la bulle
      if (s?.mode === 'bubble' && s.moved) {
        const el = bubbleRef.current
        const w = el?.offsetWidth ?? bubbleSize
        setBubblePos(prev => {
          if (!prev) return prev
          const center = prev.x + w / 2
          const snapLeft = 12
          const snapRight = window.innerWidth - w - 12
          return { x: center < window.innerWidth / 2 ? snapLeft : snapRight, y: prev.y }
        })
        setSnapAnimating(true)
        window.setTimeout(() => setSnapAnimating(false), 320)
      }
      setIsDragging(false)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [isDragging, isMobile])

  // Démarrage du drag (en-tête de fenêtre ou bulle)
  const startDrag = useCallback((clientX: number, clientY: number, mode: 'window' | 'bubble') => {
    const el = mode === 'bubble' ? bubbleRef.current : containerRef.current
    const rect = el?.getBoundingClientRect()
    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      originX: rect?.left ?? 0,
      originY: rect?.top ?? 0,
      moved: false,
      mode,
    }
    setIsDragging(true)
  }, [])

  // Compte à rebours offre
  useEffect(() => {
    if (offerTimer > 0 && showOfferBanner) {
      const interval = setInterval(() => {
        setOfferTimer(prev => {
          if (prev <= 1) {
            setShowOfferBanner(false)
            setActiveOffer(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [offerTimer, showOfferBanner])

  // Compte à rebours coupon
  useEffect(() => {
    if (couponTimer > 0 && showCouponBanner) {
      const interval = setInterval(() => {
        setCouponTimer(prev => {
          if (prev <= 1) {
            setShowCouponBanner(false)
            setActiveCoupon(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [couponTimer, showCouponBanner])

  // ============================================================
  // SAUVEGARDE DES MESSAGES
  // ============================================================

  const saveMessageToHistory = useCallback(async (content: string, products?: Product[], offer?: Offer, couponCode?: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: null,
          type: 'CHAT_CONVERSATION',
          context: 'CHATBOT',
          sessionId: sessionId,
          userId: userId || null,
          metadata: {
            user_message: couponCode ? `coupon_${couponCode}` : 'assistant_message',
            assistant_message: content.slice(0, 500),
            intent: {
              categories: [],
              has_offer: !!offer,
              has_products: !!(products && products.length > 0),
              coupon_code: couponCode || null,
            },
            language: language,
            user_type: 'particular',
          }
        })
      })
      console.log('✅ Message assistant sauvegardé')
    } catch (e) {
      console.debug('⚠️ Erreur sauvegarde message:', e)
    }
  }, [sessionId, userId, language])

  // ============================================================
  // CHARGER HISTORIQUE
  // ============================================================

  useEffect(() => {
    if (!sessionId) return

    const loadHistory = async () => {
      try {
        const url = `${API_BASE_URL}/api/chat?sessionId=${sessionId}${userId ? `&userId=${userId}` : ''}`
        const res = await fetch(url)
        const data = await res.json()

        if (data.success && data.history?.length > 0) {
          const loaded: Message[] = data.history.map((m: any, i: number) => ({
            id: `history_${i}`,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
            products: m.products || [],
            offer: m.offer || null,
          }))
          setMessages(loaded)
          
          // ✅ Vérifier si un coupon actif existe dans l'historique
          const lastCoupon = loaded.find(m => 
            m.content.includes('coupon spécial') && 
            m.content.includes('ADU-')
          )
          if (lastCoupon) {
            const codeMatch = lastCoupon.content.match(/ADU-[A-Z0-9-]+/)
            if (codeMatch) {
              // On pourrait restaurer le coupon ici
              console.log('🔍 Coupon trouvé dans l\'historique:', codeMatch[0])
            }
          }
        }

        // ✅ Ne pas afficher "Content de te revoir" si on vient de cliquer sur un produit
        const justClickedProduct = sessionStorage.getItem('just_clicked_product') === 'true'
        
        if (data.welcome_back_message && !justClickedProduct && messages.length === 0) {
          setProactiveMessage(data.welcome_back_message)
          setHasUnread(true)
        } else if (messages.length === 0) {
          const welcomes = {
            fr: "Salut ! 👋 Je suis Adu, ton vendeur Adullam. Dis-moi ce que tu cherches, je suis là pour t'aider !",
            en: "Hey! 👋 I'm Adu, your Adullam seller. Tell me what you're looking for!",
            pt: "Oi! 👋 Sou o Adu, seu vendedor Adullam. Me diz o que você procura!",
          }
          addAssistantMessage(welcomes[language] || welcomes.fr)
        }
        
        if (justClickedProduct) {
          sessionStorage.removeItem('just_clicked_product')
        }
      } catch (error) {
        console.error("Erreur chargement historique:", error)
        if (messages.length === 0) {
          addAssistantMessage("Salut ! 👋 Je suis Adu, ton vendeur Adullam. Comment puis-je t'aider ?")
        }
      }
    }

    loadHistory()
  }, [sessionId, userId, language])

  // Trigger proactif
  useEffect(() => {
    if (!sessionId) return

    const checkTrigger = async () => {
      if (isOpen) return

      const inactivitySeconds = (Date.now() - lastActionRef.current) / 1000
      if (inactivitySeconds < INACTIVITY_THRESHOLD) return

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId || null,
            inactivity_seconds: inactivitySeconds,
            viewed_count: viewCountRef.current,
            has_added_to_cart: checkCartStatus(),
            has_visited_checkout: checkCheckoutStatus(),
            has_come_back: true,
          }),
        })

        const data = await res.json()

        if (data.should_trigger && data.message) {
          setProactiveMessage(data.message)
          setHasUnread(true)
          
          if (data.trigger_type === 'hesitation_strong' || data.trigger_type === 'abandoned_cart') {
            const offer: Offer = {
              type: 'risky',
              discount_1: 5,
              discount_2: 10,
              time_limit: 20,
              urgency_message: data.message,
              taunt_message: data.message,
            }
            setActiveOffer(offer)
            setOfferTimer(20 * 60)
            setShowOfferBanner(true)
          }
        }
      } catch (error) {
        console.error("Erreur trigger:", error)
      }
    }

    triggerTimerRef.current = setInterval(checkTrigger, TRIGGER_CHECK_INTERVAL)
    return () => {
      if (triggerTimerRef.current) clearInterval(triggerTimerRef.current)
    }
  }, [sessionId, userId, isOpen])

  const checkCartStatus = () => {
    return messages.some(m => m.products && m.products.length > 0 && m.role === 'assistant')
  }

  const checkCheckoutStatus = () => {
    return localStorage.getItem('checkout_visited') === 'true'
  }

  // ============================================================
  // ACTIONS
  // ============================================================

  const addAssistantMessage = useCallback((content: string, products?: Product[], offer?: Offer) => {
    const msg: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      products,
      offer,
    }
    setMessages(prev => [...prev, msg])
    
    // ✅ Sauvegarder dans l'historique
    if (content.length > 5 && !content.includes('...')) {
      saveMessageToHistory(content, products, offer)
    }
    
    if (offer && offer.type !== 'none') {
      setActiveOffer(offer)
      setOfferTimer(offer.time_limit * 60)
      setShowOfferBanner(true)
    }
    
    if (voiceSupported && speechSynthRef.current) {
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.lang = language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-PT' : 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1.1
      setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      speechSynthRef.current.speak(utterance)
    }
  }, [language, voiceSupported, saveMessageToHistory])

  const openChat = useCallback(() => {
    setIsOpen(true)
    setIsMinimized(false)
    setHasUnread(false)

    if (proactiveMessage && isFirstOpen) {
      setIsFirstOpen(false)
      addAssistantMessage(proactiveMessage)
      setProactiveMessage(null)
    }

    setTimeout(() => inputRef.current?.focus(), 100)
  }, [proactiveMessage, isFirstOpen, addAssistantMessage])

  // ============================================================
  // VOCAL
  // ============================================================

  const startVoiceRecognition = useCallback(() => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      setIsRecording(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Reconnaissance vocale non supportée")
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-PT' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    setIsRecording(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
      recognitionRef.current = null
      
      setTimeout(() => {
        if (transcript.trim()) {
          const sendEvent = new Event('send-voice-message')
          window.dispatchEvent(sendEvent)
        }
      }, 500)
    }

    recognition.onerror = (event: any) => {
      console.error("Erreur reconnaissance vocale:", event.error)
      setIsRecording(false)
      recognitionRef.current = null
      
      if (event.error === 'not-allowed') {
        alert("Veuillez autoriser l'accès au microphone pour utiliser la voix.")
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null
    }

    try {
      recognition.start()
    } catch (e) {
      console.error("Erreur démarrage reconnaissance:", e)
      setIsRecording(false)
    }
  }, [language, isRecording])

  const stopSpeaking = useCallback(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // ============================================================
  // PRODUITS
  // ============================================================

  const handleProductClick = useCallback(async (product: Product, messageId: string) => {
    sessionStorage.setItem('just_clicked_product', 'true')

    const productElement = document.getElementById(`product-${product.id}`)
    if (productElement) {
      productElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    localStorage.setItem('checkout_visited', 'true')

    try {
      await fetch(`${API_BASE_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          type: 'CLICK',
          context: 'CHATBOT',
          sessionId: sessionId,
          userId: userId || null,
          metadata: {
            message_id: messageId,
            source: 'chatbot_recommendation',
            reason: product.reason,
          }
        })
      })
    } catch (e) {}

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId || null,
          product_id: product.id,
          weight: 5.0,
          limit: 3,
        })
      })
      const data = await response.json()
      if (data.success && data.products?.length > 0) {
        addAssistantMessage(
          `Ah, excellent choix ! Puisque tu aimes celui-ci, je te montre des produits qui vont super bien avec 👀`,
          data.products
        )
      }
    } catch (error) {
      console.error("Erreur recalcul:", error)
    }

    window.location.href = `/products/${product.id}`
  }, [sessionId, userId, addAssistantMessage])

  // ============================================================
  // COUPONS 🎫
  // ============================================================

  const generateCoupon = useCallback(async (productId: string, discount: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || null,
          session_id: sessionId,
          product_id: productId,
          discount: discount,
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        setActiveCoupon(data.coupon)
        setShowCouponBanner(true)
        setCouponTimer(data.coupon.time_limit * 60)
        
        const couponMessage = `🎉 Top ! J'ai généré un coupon spécial pour toi : **${data.coupon.code}**\nTu as **${data.coupon.discount}%** de réduction valable **${data.coupon.time_limit}min** ! ⏱️`
        
        // ✅ Sauvegarder le message dans l'historique
        await saveMessageToHistory(couponMessage, undefined, undefined, data.coupon.code)
        
        // ✅ Ajouter au chat localement
        addAssistantMessage(couponMessage)
      } else {
        addAssistantMessage("Désolé, je n'ai pas pu générer le coupon. Réessaie ! 🙏")
      }
    } catch (error) {
      console.error("Erreur génération coupon:", error)
      addAssistantMessage("Oups, erreur technique. Réessaie dans un instant !")
    }
  }, [sessionId, userId, addAssistantMessage, saveMessageToHistory])

  const proposeOffer = useCallback((product: Product) => {
    // ✅ Ne proposer qu'une seule fois
    if (hasBeenOffered || activeCoupon) {
      return
    }
    
    const discounts = [5, 6, 7, 8, 9, 10]
    const discount = discounts[Math.floor(Math.random() * discounts.length)]
    
    setHasBeenOffered(true)
    
    const offerMessage = `Je vois que tu hésites sur ce produit... 👀\nJe peux te faire un petit geste : **${discount}%** de réduction.\nTu es intéressé ? 😊`
    
    addAssistantMessage(offerMessage)
    
    setPendingOfferProduct(product)
    setPendingOfferDiscount(discount)
    setWaitingForOfferResponse(true)
  }, [addAssistantMessage, hasBeenOffered, activeCoupon])

  // ============================================================
  // ENVOI DE MESSAGE
  // ============================================================

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    lastActionRef.current = Date.now()

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          user_id: userId || null,
          language: language,
          token: token || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const formattedProducts = data.suggested_products?.map((p: any) => ({
          id: p.id,
          title: p.title || p.name,
          price: p.price,
          image: p.image,
          reason: p.reason,
        })) || []

        const offer = data.offer || null
        addAssistantMessage(data.response, formattedProducts, offer)

        if (waitingForOfferResponse && pendingOfferProduct && pendingOfferDiscount) {
          const lowerText = text.toLowerCase()
          if (lowerText.includes('oui') || lowerText.includes('ok') || lowerText.includes('yes') || lowerText.includes('d\'accord')) {
            await generateCoupon(pendingOfferProduct.id, pendingOfferDiscount)
            setWaitingForOfferResponse(false)
            setPendingOfferProduct(null)
            setPendingOfferDiscount(null)
          }
        }

        try {
          await fetch(`${API_BASE_URL}/api/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: null,
              type: 'CHAT_CONVERSATION',
              context: 'CHATBOT',
              sessionId: sessionId,
              userId: userId || null,
              metadata: {
                user_message: text.slice(0, 500),
                assistant_message: data.response.slice(0, 500),
                intent: data.intent,
                language: language,
                user_type: data.user_context?.user_type || 'particular',
                business_name: data.user_context?.business_name || null,
              }
            })
          })
        } catch (e) {
          console.debug("Tracker error:", e)
        }
      } else {
        addAssistantMessage("Désolé, je n'ai pas pu traiter ta demande. Réessaie ! 🙏")
      }
    } catch (error) {
      console.error("Erreur envoi message:", error)
      addAssistantMessage("Oups, un souci de connexion. Réessaie dans un instant 😅")
    } finally {
      setIsTyping(false)
    }
  }

  // ============================================================
  // LOAD MORE
  // ============================================================

  const loadMoreProducts = useCallback(async (query: string, categories: string[] = []) => {
    try {
      const seenIds = messages
        .flatMap(m => m.products?.map(p => p.id) || [])
        .filter(Boolean)
        .join(',')

      const res = await fetch(`${API_BASE_URL}/api/chat/more`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId || null,
          query: query,
          categories: categories,
          limit: 12,
          seen_ids: seenIds,
        }),
      })

      const data = await res.json()
      if (data.success && data.products?.length > 0) {
        setLoadOffset(prev => prev + 12)
        addAssistantMessage(
          `Voici d'autres produits qui pourraient te plaire ! 👀`,
          data.products
        )
        setTimeout(scrollToBottom, 300)
      } else {
        addAssistantMessage("Je n'ai pas trouvé d'autres produits pour le moment. Tu veux essayer un autre mot-clé ?")
      }
    } catch (error) {
      console.error("Erreur chargement plus:", error)
      addAssistantMessage("Oups, erreur de chargement. Réessaie !")
    }
  }, [sessionId, userId, addAssistantMessage, scrollToBottom, messages])

  // ============================================================
  // VOIX
  // ============================================================

  useEffect(() => {
    const handleVoiceSend = () => sendMessage()
    window.addEventListener('send-voice-message' as any, handleVoiceSend)
    return () => window.removeEventListener('send-voice-message' as any, handleVoiceSend)
  }, [input, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ============================================================
  // RENDU
  // ============================================================

  const buttonSize = isMobile ? 48 : 56
  const buttonFontSize = isMobile ? 20 : 24
  const bottomPosition = isMobile ? 80 : 24
  const rightPosition = isMobile ? 12 : 24
  const widgetWidth = isMobile ? 'calc(100vw - 24px)' : '380px'
  const widgetHeight = isMobile ? '500px' : '540px'

  // Positionnement de la fenêtre :
  // - Mobile ouvert : ancré entre le haut et juste au-dessus du clavier (top + bottom),
  //   la fenêtre occupe la zone visible → l'input reste toujours visible, rien n'est coupé.
  // - Mobile réduit : barre en bas.
  // - Desktop : bas-droite, ou position libre si déplacée (drag).
  let positionStyle: React.CSSProperties
  let heightStyle: React.CSSProperties
  if (isMobile) {
    if (isMinimized) {
      positionStyle = { bottom: bottomPosition, left: 12, right: 12 }
      heightStyle = { height: '52px', maxHeight: '52px' }
    } else {
      positionStyle = { top: 8, left: 12, right: 12, bottom: keyboardInset + 8 }
      heightStyle = { height: 'auto' } // top + bottom définissent la hauteur visible
    }
  } else if (dragPos) {
    positionStyle = { top: dragPos.y, left: dragPos.x }
    heightStyle = { height: isMinimized ? '52px' : widgetHeight, maxHeight: 'calc(100vh - 48px)' }
  } else {
    positionStyle = { bottom: bottomPosition, right: rightPosition }
    heightStyle = { height: isMinimized ? '52px' : widgetHeight, maxHeight: 'calc(100vh - 48px)' }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {showOfferBanner && activeOffer && offerTimer > 0 && (
        <OfferBanner
          discount={activeOffer.discount_2}
          timeLimit={offerTimer}
          message={activeOffer.taunt_message || `-${activeOffer.discount_2}% si vous validez maintenant !`}
          variant={activeOffer.type === 'risky' ? 'risky' : 'safe'}
          onAccept={() => {
            setShowOfferBanner(false)
            setActiveOffer(null)
            window.location.href = '/cart'
          }}
          onDecline={() => {
            setShowOfferBanner(false)
            setActiveOffer(null)
          }}
        />
      )}

      {showCouponBanner && activeCoupon && couponTimer > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '110px',
          right: '20px',
          zIndex: 9999,
          maxWidth: '340px',
          width: '100%',
          background: '#D4372B',
          borderRadius: '16px',
          padding: '20px',
          color: '#fff',
          boxShadow: '0 8px 40px rgba(212,55,43,0.4)',
          animation: 'slideUp 0.4s ease-out',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>
                🎁 Réduction spéciale
              </p>
              <p style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>
                -{activeCoupon.discount}%
              </p>
              <p style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
                Code: <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>
                  {activeCoupon.code}
                </span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', opacity: 0.7 }}>Expire dans</p>
              <p style={{ fontSize: '22px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(couponTimer)}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeCoupon.code)
                const btn = document.getElementById('copy-coupon-btn')
                if (btn) {
                  btn.textContent = '✅ Copié !'
                  setTimeout(() => { btn.textContent = '📋 Copier' }, 2000)
                }
              }}
              id="copy-coupon-btn"
              style={{
                flex: 1,
                padding: '10px',
                background: '#fff',
                color: '#D4372B',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              📋 Copier
            </button>
            <button
              onClick={() => window.location.href = '/cart'}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
            >
              🛒 Panier
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          ref={bubbleRef}
          onClick={() => {
            // Ouvre le chat seulement si on n'a pas déplacé la bulle
            if (dragStateRef.current?.mode === 'bubble' && dragStateRef.current?.moved) return
            openChat()
          }}
          onMouseDown={e => startDrag(e.clientX, e.clientY, 'bubble')}
          onTouchStart={e => {
            const t = e.touches[0]
            if (t) startDrag(t.clientX, t.clientY, 'bubble')
          }}
          aria-label="Ouvrir Adu, votre vendeur (déplaçable)"
          style={{
            position: 'fixed',
            ...(bubblePos
              ? { top: bubblePos.y, left: bubblePos.x }
              : { bottom: bottomPosition, right: rightPosition }),
            width: buttonSize,
            height: buttonSize,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: 'none',
            cursor: isDragging && dragStateRef.current?.mode === 'bubble' ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDragging && dragStateRef.current?.mode === 'bubble'
              ? '0 16px 40px rgba(212,55,43,0.55), 0 4px 12px rgba(0,0,0,0.18)'
              : '0 8px 28px rgba(212,55,43,0.45), 0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 1000,
            // Suivi 1:1 pendant le drag, accroche animée au relâcher, sinon micro-anim
            transition: isDragging && dragStateRef.current?.mode === 'bubble'
              ? 'box-shadow 0.15s ease'
              : snapAnimating
                ? 'left 0.3s cubic-bezier(0.22,1,0.36,1), top 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.2s ease, box-shadow 0.2s ease'
                : 'transform 0.2s ease, box-shadow 0.2s ease',
            transform: isDragging && dragStateRef.current?.mode === 'bubble' ? 'scale(1.08)' : 'scale(1)',
            touchAction: 'none',
            fontSize: buttonFontSize,
          }}
        >
          <BotIcon size={isMobile ? 24 : 28} />
          {hasUnread && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#E67700',
              border: '2px solid var(--background)',
              fontSize: '9px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>!</span>
          )}
        </button>
      )}

      {!isOpen && proactiveMessage && (() => {
        // 🐛 FIX — avant : la bulle de notif utilisait toujours
        // bottomPosition/rightPosition (la position INITIALE), même
        // après un drag. Elle s'affichait donc à l'ancien emplacement
        // au lieu de suivre la bulle déplacée. On calcule maintenant
        // sa position à partir de bubblePos quand la bulle a été bougée.
        const onLeft = bubblePos ? bubblePos.x < window.innerWidth / 2 : false
        const anchorStyle: React.CSSProperties = bubblePos
          ? {
              top: bubblePos.y - 8,
              transform: 'translateY(-100%)',
              ...(onLeft
                ? { left: bubblePos.x }
                : { right: window.innerWidth - bubblePos.x - buttonSize }),
            }
          : { bottom: bottomPosition + buttonSize + 8, right: rightPosition }

        return (
          <div
            onClick={openChat}
            style={{
              position: 'fixed',
              ...anchorStyle,
              maxWidth: isMobile ? '220px' : '260px',
              background: 'var(--background)',
              borderRadius: '12px',
              padding: '10px 12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 999,
              cursor: 'pointer',
              fontSize: isMobile ? '12px' : '13px',
              color: 'var(--foreground)',
              fontFamily: "'Poppins', sans-serif",
              lineHeight: 1.4,
              border: '0.5px solid var(--border)',
              transition: 'left 0.3s cubic-bezier(0.22,1,0.36,1), right 0.3s cubic-bezier(0.22,1,0.36,1), top 0.3s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Adu · </span>
            {proactiveMessage}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              ...(onLeft ? { left: '22px' } : { right: '22px' }),
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid var(--background)',
            }} />
          </div>
        )
      })()}

      {isOpen && (
        <div
          ref={containerRef}
          className="chatbot-container"
          style={{
            position: 'fixed',
            ...positionStyle,
            ...heightStyle,
            width: widgetWidth,
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--background)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Poppins', sans-serif",
            // Pas de transition pendant le drag pour un suivi 1:1 du curseur
            transition: isDragging ? 'none' : 'height 0.3s ease, bottom 0.25s ease',
            touchAction: isDragging ? 'none' : 'auto',
            userSelect: isDragging ? 'none' : 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: 'var(--accent)',
              cursor: isMobile ? 'pointer' : (isDragging ? 'grabbing' : 'grab'),
              flexShrink: 0,
              touchAction: isMobile ? 'auto' : 'none',
            }}
            onMouseDown={e => {
              // Déplacement de la fenêtre réservé au desktop (sur mobile elle est ancrée)
              if (isMobile) return
              if ((e.target as HTMLElement).closest('button')) return
              startDrag(e.clientX, e.clientY, 'window')
            }}
            onTouchStart={e => {
              if (isMobile) return
              if ((e.target as HTMLElement).closest('button')) return
              const t = e.touches[0]
              if (t) startDrag(t.clientX, t.clientY, 'window')
            }}
            onClick={() => {
              // Clic = réduire/agrandir, mais seulement si on n'a pas déplacé
              if (dragStateRef.current?.moved) return
              setIsMinimized(!isMinimized)
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <BotIcon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                Adu {isSpeaking && '🔊'}
              </p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>
                {isRecording ? '🎤 Écoute...' : 'Votre vendeur Adullam'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {isSpeaking && (
                <button
                  onClick={(e) => { e.stopPropagation(); stopSpeaking() }}
                  aria-label="Arrêter la voix"
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                >
                  <StopIcon size={14} />
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); setIsMinimized(!isMinimized) }}
                aria-label={isMinimized ? "Agrandir" : "Réduire"}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
              >
                <ChevronIcon size={16} up={isMinimized} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsOpen(false) }}
                aria-label="Fermer"
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
              >
                <CloseIcon size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '8px' : '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      gap: '4px',
                      alignItems: 'flex-end',
                      animation: 'fadeIn 0.4s ease-out',
                      animationDelay: `${idx * 0.04}s`,
                      opacity: 0,
                      animationFillMode: 'forwards',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: isMobile ? '20px' : '24px',
                        height: isMobile ? '20px' : '24px',
                        borderRadius: '50%',
                        background: 'var(--accent-light)',
                        fontSize: isMobile ? '10px' : '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}><BotIcon size={isMobile ? 12 : 14} color="var(--accent)" /></div>
                    )}
                    <div style={{
                      maxWidth: isMobile ? '85%' : '78%',
                      padding: isMobile ? '6px 10px' : '8px 12px',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                      color: msg.role === 'user' ? 'var(--accent-foreground)' : 'var(--foreground)',
                      fontSize: isMobile ? '11px' : '12px',
                      lineHeight: 1.4,
                    }}>
                      {msg.content}
                      
                      {msg.products && msg.products.length > 0 && (
                        <div style={{
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          width: '100%',
                        }}>
                          {msg.products.slice(0, isMobile ? 2 : 3).map((p, index) => (
                            <div
                              key={p.id}
                              id={`product-${p.id}`}
                              onClick={() => handleProductClick(p, msg.id)}
                              style={{
                                display: 'flex',
                                gap: '10px',
                                background: 'var(--surface-elevated)',
                                borderRadius: '8px',
                                padding: '8px 10px',
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: 'var(--shadow-xs)',
                                alignItems: 'center',
                                animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--accent)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-accent)'
                                e.currentTarget.style.transform = 'translateY(-1px)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.boxShadow = 'var(--shadow-xs)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '6px',
                                background: 'var(--surface-sunken)',
                                flexShrink: 0,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.title || p.name || 'Produit'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <span style={{ fontSize: '24px' }}>📦</span>
                                )}
                              </div>
                              
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  margin: 0,
                                  fontSize: isMobile ? '11px' : '12px',
                                  fontWeight: 500,
                                  color: 'var(--foreground)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {p.title || p.name || 'Produit'}
                                </p>
                                {p.price && (
                                  <p style={{
                                    margin: '2px 0 0 0',
                                    fontSize: isMobile ? '11px' : '12px',
                                    color: 'var(--accent)',
                                    fontWeight: 600,
                                  }}>
                                    {formatPrice(p.price)}
                                  </p>
                                )}
                                <p style={{
                                  margin: '1px 0 0 0',
                                  fontSize: isMobile ? '8px' : '9px',
                                  color: 'var(--muted-foreground)',
                                }}>
                                  💡 {p.reason || 'Recommandé pour vous'}
                                </p>
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 8px',
                                background: index === 0 ? '#D4372B' : index === 1 ? '#E67700' : '#999',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '8px',
                                fontWeight: 600,
                                height: '16px',
                                flexShrink: 0,
                              }}>
                                {index === 0 ? 'TOP' : index === 1 ? '⭐' : '👍'}
                              </div>
                            </div>
                          ))}
                          
                          {msg.products.length > (isMobile ? 2 : 3) && (
                            <button
                              onClick={() => {
                                const query = msg.products.map(p => p.title || p.name).filter(Boolean).join(' ')
                                loadMoreProducts(query, [])
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'transparent',
                                border: '1px dashed var(--accent)',
                                borderRadius: '20px',
                                color: 'var(--accent)',
                                fontSize: isMobile ? '10px' : '11px',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--accent-light)'
                                e.currentTarget.style.borderColor = 'var(--accent)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.borderColor = 'var(--accent)'
                              }}
                            >
                              Voir plus de produits →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    animation: 'fadeIn 0.3s ease-out',
                  }}>
                    <div style={{
                      width: isMobile ? '20px' : '24px',
                      height: isMobile ? '20px' : '24px',
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      fontSize: isMobile ? '10px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}><BotIcon size={isMobile ? 12 : 14} color="var(--accent)" /></div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'var(--surface)',
                      borderRadius: '12px 12px 12px 2px',
                      display: 'flex',
                      gap: '3px',
                      alignItems: 'center',
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: isMobile ? '5px' : '6px',
                          height: isMobile ? '5px' : '6px',
                          borderRadius: '50%',
                          background: 'var(--muted-foreground)',
                          animation: `bounce 1.2s ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{
                padding: isMobile ? '6px 10px' : '10px 12px',
                borderTop: '0.5px solid var(--border)',
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                flexShrink: 0,
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecording ? "🎤 Écoute en cours..." : "Dis-moi ce que tu cherches..."}
                  disabled={isTyping || isRecording}
                  style={{
                    flex: 1,
                    border: '0.5px solid var(--border)',
                    borderRadius: '20px',
                    padding: isMobile ? '6px 12px' : '8px 14px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontFamily: "'Poppins', sans-serif",
                    outline: 'none',
                    background: isRecording ? '#FFF8E1' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                />
                
                {voiceSupported && (
                  <button
                    onClick={startVoiceRecognition}
                    disabled={isTyping}
                    style={{
                      width: isMobile ? '30px' : '34px',
                      height: isMobile ? '30px' : '34px',
                      borderRadius: '50%',
                      background: isRecording ? '#E67700' : 'var(--surface)',
                      border: 'none',
                      cursor: isTyping ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '12px' : '14px',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      boxShadow: isRecording ? '0 0 20px rgba(230,119,0,0.3)' : 'none',
                    }}
                  >
                    <MicIcon size={isMobile ? 14 : 16} color={isRecording ? '#fff' : 'var(--ink-2)'} active={isRecording} />
                  </button>
                )}
                
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: isMobile ? '30px' : '34px',
                    height: isMobile ? '30px' : '34px',
                    borderRadius: '50%',
                    background: input.trim() && !isTyping ? 'var(--accent)' : 'var(--surface)',
                    border: 'none',
                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '12px' : '14px',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  <SendIcon size={isMobile ? 14 : 16} color={input.trim() && !isTyping ? '#fff' : 'var(--muted-foreground)'} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .chatbot-container {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}