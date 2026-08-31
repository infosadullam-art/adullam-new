// components/ChatbotWidget.tsx
// Bulle flottante du chatbot Adu
// VENDEUR ULTIME - Version 6.5
// ✅ Support des tableaux Markdown (remark-gfm)
// ✅ Détection automatique du pays et de la devise
// Mode vocal, cartes produits, offres, compte à rebours, scroll infini, COUPONS 🎫
// ✅ FIX : sauvegarde et restauration des produits dans l'historique
// ✅ FIX : déconnexion - efface l'historique de la session
// ✅ FIX : TOUS les produits affichés en cartes cliquables (même le premier)
// ✅ FIX : Réception des messages depuis la page produit (MOQ)
// ✅ FIX : Les produits ne sont affichés que dans le dernier message assistant
// ✅ FIX : Compteur de vues produit réellement alimenté (déclenchement proactif)
// ✅ FIX : Suppression de la détection d'offre dupliquée côté client — le
//    serveur est l'unique source de vérité pour hésitation/offre/coupon.
// ✅ FIX v6.5 : Restauration du coupon actif après refresh — le serveur
//    (Redis, TTL calé sur expires_at) est l'unique source de vérité, plus
//    besoin de localStorage. Le coupon survit désormais à un F5.

import { useState, useEffect, useRef, useCallback } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { OfferBanner } from "@/components/OfferBanner"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useLocale } from "@/context/LocaleProvider"

// ============================================================
// ICÔNES
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
  type: 'safe' | 'risky' | 'none' | 'coupon'
  discount_1: number
  discount_2: number
  time_limit: number
  urgency_message?: string
  taunt_message?: string
  coupon?: any
}

interface ChatbotWidgetProps {
  sessionId: string
  userId?: string
  language?: 'fr' | 'en' | 'pt'
  token?: string
  onLogout?: () => void
}

// ============================================================
// CONSTANTES
// ============================================================

const TRIGGER_CHECK_INTERVAL = 60000
const INACTIVITY_THRESHOLD   = 30
const MIN_VIEWS_BEFORE_TRIGGER = 3
const FIRST_TRIGGER_DELAY = 30000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.adullamarket.com'

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function ChatbotWidget({ sessionId, userId, language = 'fr', token, onLogout }: ChatbotWidgetProps) {
  const { formatPrice } = useCurrencyFormatter()
  const { country, currency } = useLocale()

  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null)
  const [isFirstOpen, setIsFirstOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [loadOffset, setLoadOffset] = useState(3)

  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)

  const [activeOffer, setActiveOffer] = useState<Offer | null>(null)
  const [offerTimer, setOfferTimer] = useState<number>(0)
  const [showOfferBanner, setShowOfferBanner] = useState(false)

  const [activeCoupon, setActiveCoupon] = useState<any>(null)
  // ✅ Choix à deux options (urgente/patiente) reçu du serveur — rien n'est
  // créé en base tant que le client n'a pas cliqué un des deux boutons.
  const [offerChoice, setOfferChoice] = useState<any>(null)
  const [showCouponBanner, setShowCouponBanner] = useState(false)
  const [couponExpanded, setCouponExpanded] = useState(false)
  const [couponPos, setCouponPos] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingCoupon, setIsDraggingCoupon] = useState(false)
  const couponDragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null)
  const couponRef = useRef<HTMLDivElement>(null)

  const [remainingTime, setRemainingTime] = useState(0)
  const [couponY, setCouponY] = useState(50)
  const [isDraggingY, setIsDraggingY] = useState(false)
  const dragYRef = useRef<{ startY: number; startOffset: number } | null>(null)

  // ✅ État pour recevoir les messages de la page produit
  // ✅ FIX : ref plutôt que state — un state lu dans sendMessage() (fonction
  // non mémoïsée) capture une closure périmée quand sendMessage() est appelé
  // via setTimeout juste après un setPendingProductFromPage() synchrone (cas
  // du bouton "Nous contacter" sur MOQ non atteint). Une ref lit toujours la
  // valeur à jour, peu importe quelle version de sendMessage l'appelle.
  const pendingProductFromPageRef = useRef<any>(null)

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLTextAreaElement>(null)
  const lastActionRef   = useRef<number>(Date.now())
  const triggerTimerRef = useRef<NodeJS.Timeout>()
  const viewCountRef    = useRef(0)
  const recognitionRef  = useRef<any>(null)
  const speechSynthRef  = useRef<SpeechSynthesis | null>(null)

  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [snapAnimating, setSnapAnimating] = useState(false)
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

  const [keyboardInset, setKeyboardInset] = useState(0)
  const [windowHeight, setWindowHeight] = useState(700)
  const keyboardTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================================
  // MARKDOWN
  // ============================================================

  const MarkdownMessage = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p style={{ margin: '4px 0', lineHeight: 1.5 }}>{children}</p>,
          strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--accent)' }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
          ul: ({ children }) => <ul style={{ margin: '6px 0', paddingLeft: '20px', listStyle: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '6px 0', paddingLeft: '20px', listStyle: 'decimal' }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
          h1: ({ children }) => <h1 style={{ fontSize: '1.2em', fontWeight: 700, margin: '6px 0' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '1.1em', fontWeight: 600, margin: '4px 0' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '1em', fontWeight: 600, margin: '4px 0' }}>{children}</h3>,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '8px 0', WebkitOverflowScrolling: 'touch' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '10px',
                border: '1px solid var(--border)',
                minWidth: '300px',
              }}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead style={{ background: 'var(--surface-sunken)' }}>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr style={{ borderBottom: '1px solid var(--border)' }}>{children}</tr>,
          th: ({ children }) => (
            <th style={{
              padding: '4px 6px',
              border: '1px solid var(--border)',
              fontWeight: 600,
              textAlign: 'left',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              color: 'var(--muted-foreground)',
            }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{
              padding: '4px 6px',
              border: '1px solid var(--border)',
              fontSize: '9px',
              whiteSpace: 'nowrap',
            }}>
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a href={href} style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}>
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code style={{ background: 'var(--surface-sunken)', padding: '1px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>
              {children}
            </code>
          ),
          div: ({ children, ...props }) => {
            const style = props.style as React.CSSProperties
            if (style?.overflowX === 'auto') {
              return (
                <div style={{ overflowX: 'auto', margin: '8px 0', WebkitOverflowScrolling: 'touch' }}>
                  {children}
                </div>
              )
            }
            return <div {...props}>{children}</div>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  // ============================================================
  // HOOKS
  // ============================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setWindowHeight(window.innerHeight)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
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
    const trackActivity = () => { lastActionRef.current = Date.now() }
    window.addEventListener('mousemove', trackActivity)
    window.addEventListener('scroll', trackActivity)
    window.addEventListener('click', trackActivity)
    return () => {
      window.removeEventListener('mousemove', trackActivity)
      window.removeEventListener('scroll', trackActivity)
      window.removeEventListener('click', trackActivity)
    }
  }, [])

  // ✅ Incrémente le compteur de vues produit réel (émis par ForYouSection,
  // la page produit, et potentiellement d'autres sources futures) pour
  // alimenter le trigger proactif.
  useEffect(() => {
    const handleProductViewed = () => {
      viewCountRef.current += 1
    }
    window.addEventListener('adullam:product-viewed', handleProductViewed)
    return () => window.removeEventListener('adullam:product-viewed', handleProductViewed)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) return

    const updateInset = () => {
      if (!window.visualViewport) return
      const vv = window.visualViewport
      const gap = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardInset(gap > 50 ? gap : 0)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateInset)
      window.visualViewport.addEventListener('scroll', updateInset)
    }

    const onFocus = () => setTimeout(updateInset, 120)
    const onBlur = () => setTimeout(updateInset, 120)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateInset)
        window.visualViewport.removeEventListener('scroll', updateInset)
      }
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
      if (keyboardTimeoutRef.current) clearTimeout(keyboardTimeoutRef.current)
    }
  }, [isMobile])

  useEffect(() => {
    if (!isDraggingCoupon) return
    const onMove = (clientX: number, clientY: number) => {
      const s = couponDragRef.current
      if (!s) return
      const dx = clientX - s.startX
      const dy = clientY - s.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) s.moved = true
      const el = couponRef.current
      const w = el?.offsetWidth ?? 200
      const h = el?.offsetHeight ?? 80
      setCouponPos({
        x: Math.min(Math.max(8, s.originX + dx), window.innerWidth - w - 8),
        y: Math.min(Math.max(8, s.originY + dy), window.innerHeight - h - 8),
      })
    }
    const onEnd = () => setIsDraggingCoupon(false)
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) { onMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault() } }
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
  }, [isDraggingCoupon])

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

  useEffect(() => {
    if (!activeCoupon?.expires_at) return
    const updateRemaining = () => {
      const diff = Math.floor((new Date(activeCoupon.expires_at).getTime() - Date.now()) / 1000)
      setRemainingTime(diff > 0 ? diff : 0)
      if (diff <= 0) {
        setShowCouponBanner(false)
        setActiveCoupon(null)
      }
    }
    updateRemaining()
    const interval = setInterval(updateRemaining, 1000)
    return () => clearInterval(interval)
  }, [activeCoupon?.expires_at])

  useEffect(() => {
    if (remainingTime > 0 && showCouponBanner) {
      if (remainingTime <= 600 && !couponExpanded) {
        setCouponExpanded(true)
      }

      if (remainingTime === 300 && activeCoupon) {
        addAssistantMessage(`⚠️ Ton coupon **${activeCoupon.code}** expire dans 5min ! Utilise-le vite 🔥`)
        setCouponExpanded(true)
      }
    }
  }, [remainingTime, showCouponBanner, activeCoupon, couponExpanded])

  // ============================================================
  // SAUVEGARDE
  // ============================================================

  const saveMessageToHistory = useCallback(async (content: string, products?: Product[], offer?: Offer, couponCode?: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/track`, {
        method: 'POST',
        credentials: 'include',
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
            products: products?.map(p => ({
              id: p.id,
              title: p.title || p.name,
              price: p.price,
              image: p.image,
              reason: p.reason,
            })) || [],
            intent: {
              categories: [],
              has_offer: !!offer,
              has_products: !!(products && products.length > 0),
              coupon_code: couponCode || null,
            },
            language: language,
            user_type: 'particular',
            country: country,
          }
        })
      })
    } catch (e) {
      console.debug('⚠️ Erreur sauvegarde message:', e)
    }
  }, [sessionId, userId, language, country])

  // ============================================================
  // CHARGER HISTORIQUE
  // ============================================================

  useEffect(() => {
    if (!sessionId) return

    setMessages([])
    setProactiveMessage(null)
    setHasUnread(false)

    const loadHistory = async () => {
      try {
        const url = `${API_BASE_URL}/api/chat?sessionId=${sessionId}${userId ? `&userId=${userId}` : ''}`
        const res = await fetch(url, { credentials: 'include' })
        const data = await res.json()

        let loaded: Message[] = []

        if (data.success && data.history?.length > 0) {
          const lastProducts = data.conversation_state?.products_offered || []

          loaded = data.history.map((m: any, i: number) => {
            let products: any[] = []
            if (m.role === 'assistant' && i === data.history.length - 1) {
              products = lastProducts
            }

            return {
              id: `history_${i}`,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.timestamp),
              products: products.map((p: any) => ({
                id: p.id,
                title: p.title || p.name,
                price: p.price,
                image: p.image,
                reason: p.reason,
              })),
              offer: m.offer || null,
            }
          })
          setMessages(loaded)
        }

        // ✅ Restauration du coupon actif après refresh — le serveur
        // (Redis, TTL calé sur expires_at) est l'unique source de vérité.
        // On ne recrée rien côté client, on affiche juste ce que le
        // serveur nous dit être encore valide à cet instant.
        if (data.active_coupon) {
          const expiresAt = new Date(data.active_coupon.expires_at).getTime()
          const remaining = Math.floor((expiresAt - Date.now()) / 1000)
          if (remaining > 0) {
            setActiveCoupon(data.active_coupon)
            setShowCouponBanner(true)
            setRemainingTime(remaining)
            setTimeout(() => setCouponExpanded(true), 500)
          }
        }

        const justClickedProduct = sessionStorage.getItem('just_clicked_product') === 'true'

        if (data.welcome_back_message && !justClickedProduct && loaded.length === 0) {
          setProactiveMessage(data.welcome_back_message)
          setHasUnread(true)
        } else if (loaded.length === 0) {
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
        addAssistantMessage("Salut ! 👋 Je suis Adu, ton vendeur Adullam. Comment puis-je t'aider ?")
      }
    }

    loadHistory()
  }, [sessionId, userId, language])

  // ============================================================
  // DÉCONNEXION
  // ============================================================

  const handleLogout = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/api/chat/history/session/${sessionId}`, {
          method: 'DELETE'
        })
        console.log('🗑️ Historique du chat effacé')
      } catch (e) {
        console.debug('⚠️ Erreur effacement historique:', e)
      }
    }

    setMessages([])
    setProactiveMessage(null)
    setHasUnread(false)

    if (onLogout) {
      onLogout()
    }
  }, [sessionId, onLogout])

  // ============================================================
  // TRIGGER PROACTIF
  // ============================================================

  useEffect(() => {
    if (!sessionId) return

    const initialDelay = setTimeout(() => {

      const checkTrigger = async () => {
        if (isOpen) return

        const inactivitySeconds = (Date.now() - lastActionRef.current) / 1000
        const viewedCount = viewCountRef.current

        if (viewedCount < MIN_VIEWS_BEFORE_TRIGGER) return
        if (inactivitySeconds < INACTIVITY_THRESHOLD) return

        try {
          const res = await fetch(`${API_BASE_URL}/api/chat/trigger`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              user_id: userId || null,
              inactivity_seconds: inactivitySeconds,
              viewed_count: viewedCount,
              has_added_to_cart: checkCartStatus(),
              has_visited_checkout: checkCheckoutStatus(),
              has_come_back: true,
              country: country,
            }),
          })

          const data = await res.json()

          if (data.should_trigger && data.message) {
            setProactiveMessage(data.message)
            setHasUnread(true)
            // ✅ Ouvre le chat automatiquement pour que le message proactif
            // (et le coupon éventuel) soit visible immédiatement, plutôt
            // qu'un simple badge que le client pourrait ne jamais remarquer.
            setIsOpen(true)
            addAssistantMessage(data.message)

            // ✅ Coupon RÉEL généré en base (chatbot_service.py -> Prisma),
            // relayé par /api/chat/trigger. Avant ce fix, ce champ était
            // ignoré et aucune bulle countdown ne s'affichait jamais suite
            // à une relance proactive, même quand un vrai coupon existait.
            if (data.coupon) {
              setActiveCoupon(data.coupon)
              setShowCouponBanner(true)
              setRemainingTime((data.coupon.time_limit || 20) * 60)
              setTimeout(() => setCouponExpanded(true), 500)
            }

            // ✅ Choix à deux options — rien n'est créé en base tant que le
            // client n'a pas cliqué. On affiche deux boutons plutôt que
            // d'obliger à taper du texte.
            if (data.offer_choice) {
              setOfferChoice(data.offer_choice)
            }
          }
        } catch (error) {
          console.error("Erreur trigger:", error)
        }
      }

      triggerTimerRef.current = setInterval(checkTrigger, TRIGGER_CHECK_INTERVAL)

    }, FIRST_TRIGGER_DELAY)

    return () => {
      clearTimeout(initialDelay)
      if (triggerTimerRef.current) clearInterval(triggerTimerRef.current)
    }
  }, [sessionId, userId, isOpen, country])

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

    if (content.length > 5 && !content.includes('...')) {
      saveMessageToHistory(content, products, offer)
    }

    // ✅ Seule source de vérité pour l'affichage offre/coupon : ce que le
    // serveur a décidé et renvoyé dans `offer`. Aucune détection côté client.
    // ✅ FIX : 'choice' n'a pas les champs discount_2/time_limit qu'attend
    // l'ancien OfferBanner — ce type est géré séparément via offerChoice
    // (deux boutons), jamais par cette branche.
    if (offer && offer.type === 'coupon' && offer.coupon) {
      setActiveCoupon(offer.coupon)
      setShowCouponBanner(true)
      setRemainingTime(offer.coupon.time_limit * 60)
      setTimeout(() => setCouponExpanded(true), 500)
    } else if (offer && offer.type !== 'none' && offer.type !== 'choice') {
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

  // Ferme avec une animation de sortie (au lieu d'un démontage brutal) :
  // on joue chatClose pendant ~220ms, puis on retire le composant du DOM.
  const closeChat = useCallback(() => {
    setIsClosing(true)
    setIsMinimized(false)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 220)
  }, [])

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
        credentials: 'include',
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
            country: country,
          }
        })
      })
    } catch (e) {}

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/recommend`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId || null,
          product_id: product.id,
          weight: 5.0,
          limit: 3,
          country: country,
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
  }, [sessionId, userId, addAssistantMessage, country])

  // ============================================================
  // ENVOI DE MESSAGE
  // ============================================================
  // ✅ Accepte un texte optionnel (utilisé par le banner d'offre pour envoyer
  // une confirmation sans que l'utilisateur ait à taper). Sans argument,
  // utilise le contenu de l'input comme avant.

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    // Le textarea a grandi avec le message tapé — on le remet à sa
    // hauteur d'une ligne une fois envoyé.
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setIsTyping(true)
    lastActionRef.current = Date.now()

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          user_id: userId || null,
          language: language,
          token: token || null,
          country: country,
          product_from_page: pendingProductFromPageRef.current || null,
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

        // ✅ Le serveur décide seul de l'offre/coupon (hésitation réelle,
        // mémoire de conversation) — addAssistantMessage se charge de
        // l'afficher correctement selon offer.type.
        const offer = data.offer || null
        addAssistantMessage(data.response, formattedProducts, offer)

        // ✅ Choix à deux options — peut désormais arriver aussi via un
        // message conversationnel normal (pas seulement le trigger
        // proactif), depuis l'unification du système de coupon côté
        // backend. Même mécanisme que dans le trigger : rien n'est créé
        // en base tant que le client n'a pas cliqué un des deux boutons.
        if (data.offer_choice) {
          setOfferChoice(data.offer_choice)
        }

        try {
          await fetch(`${API_BASE_URL}/api/track`, {
            method: 'POST',
            credentials: 'include',
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
                country: country,
                currency: currency,
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
      pendingProductFromPageRef.current = null
    }
  }

  // ✅ Le client accepte l'offre affichée dans le banner : on envoie une
  // vraie confirmation au serveur (qui gère memory.get_offer_waiting +
  // is_offer_confirmation) au lieu de sauter directement sur /cart sans
  // jamais générer de coupon réel.
  const acceptOffer = useCallback(() => {
    setShowOfferBanner(false)
    setActiveOffer(null)
    sendMessage("Oui, je suis intéressé par cette offre !")
  }, [sendMessage])

  const declineOffer = useCallback(() => {
    setShowOfferBanner(false)
    setActiveOffer(null)
    sendMessage("Non merci, pas maintenant.")
  }, [sendMessage])

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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId || null,
          query: query,
          categories: categories,
          limit: 12,
          seen_ids: seenIds,
          country: country,
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
  }, [sessionId, userId, addAssistantMessage, scrollToBottom, messages, country])

  // ============================================================
  // ÉCOUTEUR D'ÉVÉNEMENT POUR LE PRE-REMPLISSAGE DEPUIS LA PAGE PRODUIT
  // ============================================================

  useEffect(() => {
    const handleOpenChatWithMessage = (event: CustomEvent) => {
      const { message, product } = event.detail || {}

      if (!message) return

      setIsOpen(true)
      setIsMinimized(false)
      setHasUnread(false)

      setInput(message)

      if (product) {
        pendingProductFromPageRef.current = product
      }

      setTimeout(() => {
        sendMessage()
      }, 800)
    }

    window.addEventListener('openChatbotWithMessage' as any, handleOpenChatWithMessage)
    return () => window.removeEventListener('openChatbotWithMessage' as any, handleOpenChatWithMessage)
  }, [sendMessage])

  // ============================================================
  // VOIX
  // ============================================================

  useEffect(() => {
    const handleVoiceSend = () => sendMessage()
    window.addEventListener('send-voice-message' as any, handleVoiceSend)
    return () => window.removeEventListener('send-voice-message' as any, handleVoiceSend)
  }, [sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Entrée seule = envoi. Maj+Entrée = retour à la ligne (comportement
    // natif du textarea, on ne fait rien). isComposing exclu pour ne pas
    // couper une saisie IME (clavier chinois/japonais/coréen) en cours.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ============================================================
  // FORMATAGE
  // ============================================================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ============================================================
  // RENDU
  // ============================================================

  const buttonSize = isMobile ? 48 : 56
  const buttonFontSize = isMobile ? 20 : 24
  const bottomPosition = isMobile ? 80 : 24
  const rightPosition = isMobile ? 12 : 24
  const widgetWidth = isMobile ? 'calc(100vw - 24px)' : '400px'
  // Hauteur "façon Messenger" : plus généreuse que l'ancienne fenêtre étriquée,
  // proche du plein écran sur mobile, fenêtre haute sur desktop.
  const widgetHeight = isMobile ? '78dvh' : '648px'

  let positionStyle: React.CSSProperties
  let heightStyle: React.CSSProperties

  if (isMobile) {
    if (isMinimized) {
      positionStyle = { bottom: bottomPosition, left: 12, right: 12 }
      heightStyle = { height: '52px', maxHeight: '52px' }
    } else {
      positionStyle = {
        bottom: keyboardInset > 0 ? keyboardInset + 8 : 72,
        left: 8,
        right: 8,
        transition: 'bottom 0.2s ease',
      }
      heightStyle = {
        height: keyboardInset > 0
          ? `${windowHeight - keyboardInset - 80}px`
          : 'calc(100dvh - 96px)',
        maxHeight: 'calc(100dvh - 96px)',
      }
    }
  } else if (dragPos) {
    positionStyle = { top: dragPos.y, left: dragPos.x }
    heightStyle = { height: isMinimized ? '52px' : widgetHeight, maxHeight: 'calc(100vh - 48px)' }
  } else {
    positionStyle = { bottom: bottomPosition, right: rightPosition }
    heightStyle = { height: isMinimized ? '52px' : widgetHeight, maxHeight: 'calc(100vh - 48px)' }
  }

  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isAtTop = target.scrollTop === 0
    const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight

    if (isAtTop || isAtBottom) {
      e.stopPropagation()
    }
  }

  useEffect(() => {
    if (!isMobile) return
    if (isOpen && !isMinimized) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen, isMinimized, isMobile])

  useEffect(() => {
    const handlePopState = () => {
      if (isOpen && isMobile) {
        closeChat()
        window.history.pushState(null, '', window.location.href)
      }
    }

    if (isOpen && isMobile) {
      window.history.pushState({ chatbot: true }, '', window.location.href)
      window.addEventListener('popstate', handlePopState)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, isMobile, closeChat])

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <>
      {showOfferBanner && activeOffer && offerTimer > 0 && (
        <OfferBanner
          discount={activeOffer.discount_2}
          timeLimit={offerTimer}
          message={activeOffer.taunt_message || `-${activeOffer.discount_2}% si vous validez maintenant !`}
          variant={activeOffer.type === 'risky' ? 'risky' : 'safe'}
          onAccept={acceptOffer}
          onDecline={declineOffer}
        />
      )}

      {showCouponBanner && activeCoupon && remainingTime > 0 && (
        <div
          ref={couponRef}
          style={{
            position: 'fixed',
            top: `${couponY}%`,
            right: couponExpanded ? '0px' : '0px',
            transform: 'translateY(-50%)',
            zIndex: 9999,
            width: couponExpanded ? '280px' : '44px',
            background: couponExpanded ? 'var(--accent)' : 'transparent',
            borderRadius: '12px 0 0 12px',
            padding: couponExpanded ? '16px 18px' : '0px',
            color: '#fff',
            boxShadow: couponExpanded ? '0 8px 40px rgba(212,55,43,0.4)' : 'none',
            transition: isDraggingY ? 'none' : 'right 0.4s cubic-bezier(0.22, 1, 0.36, 1), top 0.1s ease, width 0.3s ease',
            border: 'none',
            borderRight: 'none',
            cursor: isDraggingY ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
            height: couponExpanded ? 'auto' : '50px',
            overflow: 'visible',
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            const startY = e.clientY
            const currentY = couponY
            dragYRef.current = { startY, startOffset: currentY }
            setIsDraggingY(true)

            const onMove = (ev: MouseEvent) => {
              const diff = ev.clientY - startY
              const newY = Math.max(5, Math.min(95, currentY + (diff / window.innerHeight) * 100))
              setCouponY(newY)
              if (couponRef.current) {
                couponRef.current.style.transition = 'none'
                couponRef.current.style.top = `${newY}%`
              }
            }

            const onUp = () => {
              document.removeEventListener('mousemove', onMove)
              document.removeEventListener('mouseup', onUp)
              setIsDraggingY(false)
              if (couponRef.current) {
                couponRef.current.style.transition = 'right 0.4s cubic-bezier(0.22, 1, 0.36, 1), top 0.1s ease, width 0.3s ease'
              }
            }

            document.addEventListener('mousemove', onMove)
            document.addEventListener('mouseup', onUp)
          }}
          onTouchStart={(e) => {
            const touch = e.touches[0]
            const startY = touch.clientY
            const currentY = couponY
            dragYRef.current = { startY, startOffset: currentY }
            setIsDraggingY(true)

            const onMove = (ev: TouchEvent) => {
              const touch = ev.touches[0]
              const diff = touch.clientY - startY
              const newY = Math.max(5, Math.min(95, currentY + (diff / window.innerHeight) * 100))
              setCouponY(newY)
              if (couponRef.current) {
                couponRef.current.style.transition = 'none'
                couponRef.current.style.top = `${newY}%`
              }
            }

            const onUp = () => {
              document.removeEventListener('touchmove', onMove)
              document.removeEventListener('touchend', onUp)
              setIsDraggingY(false)
              if (couponRef.current) {
                couponRef.current.style.transition = 'right 0.4s cubic-bezier(0.22, 1, 0.36, 1), top 0.1s ease, width 0.3s ease'
              }
            }

            document.addEventListener('touchmove', onMove, { passive: false })
            document.addEventListener('touchend', onUp)
            e.preventDefault()
          }}
        >
          {!couponExpanded && (
            <div
              onClick={() => setCouponExpanded(true)}
              style={{
                position: 'absolute',
                right: '0px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--accent)',
                padding: '12px 8px',
                borderRadius: '8px 0 0 8px',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRight: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '32px',
                boxShadow: '-2px 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: '16px' }}>🎁</span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 4px',
                borderRadius: '4px',
              }}>
                -{activeCoupon.discount}%
              </span>
              <span style={{
                fontSize: '7px',
                opacity: 0.6,
                marginTop: '2px',
              }}>
                {formatTime(remainingTime)}
              </span>
            </div>
          )}

          {couponExpanded && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: isMobile ? '8px' : '10px',
                    textTransform: 'uppercase',
                    opacity: 0.7,
                    letterSpacing: '0.5px',
                    margin: 0,
                  }}>
                    🎁 Réduction spéciale
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{
                      fontSize: isMobile ? '24px' : '28px',
                      fontWeight: 700,
                      lineHeight: 1.1,
                      margin: 0,
                    }}>
                      -{activeCoupon.discount}%
                    </p>
                    <p style={{
                      fontSize: isMobile ? '10px' : '12px',
                      opacity: 0.8,
                      margin: 0,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      background: 'rgba(255,255,255,0.15)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}>
                      {activeCoupon.code}
                    </p>
                  </div>
                  <p style={{
                    fontSize: isMobile ? '9px' : '11px',
                    opacity: 0.6,
                    margin: '2px 0 0 0',
                  }}>
                    {remainingTime <= 300 ? '⚠️ Expire bientôt !' : 'Valable 20min'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: isMobile ? '7px' : '10px', opacity: 0.7, margin: 0 }}>Expire</p>
                  <p style={{
                    fontSize: isMobile ? '18px' : '22px',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    margin: 0,
                    color: remainingTime <= 300 ? '#FFD700' : '#fff',
                  }}>
                    {formatTime(remainingTime)}
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: isMobile ? '10px' : '14px',
                display: 'flex',
                gap: '6px',
              }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeCoupon.code)
                    const btn = document.getElementById('copy-coupon-btn')
                    if (btn) {
                      btn.textContent = '✅'
                      setTimeout(() => { btn.textContent = '📋 Copier' }, 1500)
                    }
                  }}
                  id="copy-coupon-btn"
                  style={{
                    flex: 1,
                    padding: isMobile ? '8px' : '10px',
                    background: '#fff',
                    color: 'var(--accent)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  📋 Copier
                </button>
                <button
                  onClick={() => window.location.href = '/cart'}
                  style={{
                    flex: 1,
                    padding: isMobile ? '8px' : '10px',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🛒 Panier
                </button>
              </div>

              <button
                onClick={() => setCouponExpanded(false)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                ✕
              </button>
            </>
          )}
        </div>
      )}

      {!isOpen && (
        <button
          ref={bubbleRef}
          onClick={() => {
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

      {(isOpen || isClosing) && (
        <div
          ref={containerRef}
          className={`chatbot-container${isClosing ? ' chatbot-container-closing' : ''}`}
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
            transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.22, 1, 0.36, 1), bottom 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            touchAction: isDragging ? 'none' : 'auto',
            userSelect: isDragging ? 'none' : 'auto',
            overscrollBehavior: 'contain',
            willChange: 'transform, opacity',
          }}
          onWheel={(e) => {
            const target = e.currentTarget
            const scrollable = target.querySelector('.chat-messages') as HTMLDivElement
            if (!scrollable) return

            const isAtTop = scrollable.scrollTop === 0
            const isAtBottom = scrollable.scrollHeight - scrollable.scrollTop === scrollable.clientHeight

            if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
              e.preventDefault()
            }
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
                onClick={e => { e.stopPropagation(); closeChat() }}
                aria-label="Fermer"
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
              >
                <CloseIcon size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div
                className="chat-messages"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: isMobile ? '8px' : '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  transform: 'translateZ(0)',
                }}
                onScroll={handleChatScroll}
                onTouchMove={(e) => {
                  const target = e.currentTarget
                  const isAtTop = target.scrollTop === 0
                  const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight

                  if ((isAtTop && (e.target as HTMLElement).scrollTop === 0) || isAtBottom) {
                    e.stopPropagation()
                  }
                }}
              >
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
                      lineHeight: 1.5,
                    }}>
                      {msg.role === 'assistant' ? (
                        <MarkdownMessage content={msg.content} />
                      ) : (
                        msg.content
                      )}

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
                                <p style={{
                                  margin: '2px 0 0 0',
                                  fontSize: isMobile ? '11px' : '12px',
                                  color: 'var(--accent)',
                                  fontWeight: 600,
                                }}>
                                  {formatPrice(p.price)}
                                </p>
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
                                background: index === 0 ? 'var(--accent)' : index === 1 ? '#E67700' : '#999',
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

                {offerChoice && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'var(--accent-light)',
                    animation: 'fadeIn 0.3s ease-out',
                  }}>
                    <button
                      onClick={() => {
                        sendMessage(language === 'en' ? "I'll take the urgent offer, right now" : "Je prends l'offre rapide, maintenant")
                        setOfferChoice(null)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--accent)',
                        background: 'var(--accent)',
                        color: 'var(--accent-foreground)',
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <span>⚡ -{offerChoice.urgent?.discount}%</span>
                      <span style={{ opacity: 0.85, fontWeight: 400 }}>
                        {offerChoice.urgent?.time_limit_minutes} min
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        sendMessage(language === 'en' ? "I'd rather take my time" : "Je préfère prendre mon temps")
                        setOfferChoice(null)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--foreground)',
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <span>🕐 -{offerChoice.patient?.discount}%</span>
                      <span style={{ opacity: 0.7, fontWeight: 400 }}>
                        {offerChoice.patient?.time_limit_minutes} min
                      </span>
                    </button>
                  </div>
                )}

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
                alignItems: 'flex-end',
                flexShrink: 0,
                backgroundColor: 'var(--background)',
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    const el = e.target
                    el.style.height = 'auto'
                    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecording ? "🎤 Écoute en cours..." : "Dis-moi ce que tu cherches..."}
                  disabled={isTyping || isRecording}
                  rows={1}
                  // Empêche Chrome mobile d'afficher sa barre de suggestions
                  // (autofill / correction / "onglets") au-dessus du clavier.
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck={false}
                  name="adu-chat-message"
                  enterKeyHint="send"
                  inputMode="text"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                  style={{
                    flex: 1,
                    border: '0.5px solid var(--border)',
                    borderRadius: '18px',
                    padding: isMobile ? '7px 12px' : '9px 14px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: isRecording ? '#FFF8E1' : 'var(--surface)',
                    color: 'var(--foreground)',
                    resize: 'none',
                    minHeight: isMobile ? '30px' : '34px',
                    maxHeight: '96px',
                    lineHeight: 1.4,
                    overflowY: 'auto',
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
                  onClick={() => sendMessage()}
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
        @keyframes chatOpen {
          from { opacity: 0; transform: translateY(28px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatClose {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .chatbot-container {
          animation: chatOpen 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: bottom center;
        }
        .chatbot-container-closing {
          animation: chatClose 0.22s cubic-bezier(0.4, 0, 1, 1) both;
          pointer-events: none;
        }
        .chat-messages {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          transform: translateZ(0);
        }
        .coupon-drawer {
          transition: right 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .chat-messages table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          border: 1px solid var(--border);
          min-width: 300px;
        }
        .chat-messages th {
          padding: 4px 6px;
          border: 1px solid var(--border);
          background: var(--surface-sunken);
          font-weight: 600;
          text-align: left;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--muted-foreground);
        }
        .chat-messages td {
          padding: 4px 6px;
          border: 1px solid var(--border);
          font-size: 9px;
          white-space: nowrap;
        }
        .chat-messages tr {
          border-bottom: 1px solid var(--border);
        }
        .chat-messages div[style*="overflow-x: auto"] {
          overflow-x: auto;
          margin: 8px 0;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </>
  )
}