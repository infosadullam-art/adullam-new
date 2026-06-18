"use client"

// components/ChatbotWidget.tsx
// Bulle flottante du chatbot Adu
// VENDEUR ULTIME - Version 4.0
// Mode vocal, cartes produits, offres, compte à rebours, scroll infini

import { useState, useEffect, useRef, useCallback } from "react"
import { OfferBanner } from "@/components/OfferBanner"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter" // ✅ AJOUT

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
  // ✅ Hook pour la devise dynamique
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()

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
  
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)

  const [activeOffer, setActiveOffer] = useState<Offer | null>(null)
  const [offerTimer, setOfferTimer] = useState<number>(0)
  const [showOfferBanner, setShowOfferBanner] = useState(false)

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLInputElement>(null)
  const lastActionRef   = useRef<number>(Date.now())
  const triggerTimerRef = useRef<NodeJS.Timeout>()
  const viewCountRef    = useRef(0)
  const recognitionRef  = useRef<any>(null)
  const speechSynthRef  = useRef<SpeechSynthesis | null>(null)

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
          }))
          setMessages(loaded)
        }

        if (data.welcome_back_message) {
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
      } catch (error) {
        console.error("Erreur chargement historique:", error)
        addAssistantMessage("Salut ! 👋 Je suis Adu, ton vendeur Adullam. Comment puis-je t'aider ?")
      }
    }

    loadHistory()
  }, [sessionId, userId, language])

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
  }, [language, voiceSupported])

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

  // ✅ Clic sur un produit
  const handleProductClick = useCallback(async (product: Product, messageId: string) => {
    // Scroll vers le produit
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
  }, [sessionId, userId, addAssistantMessage])

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

  // ✅ loadMoreProducts avec seen_ids pour éviter les doublons
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

  const buttonSize = isMobile ? 48 : 56
  const buttonFontSize = isMobile ? 20 : 24
  const bottomPosition = isMobile ? 80 : 24
  const rightPosition = isMobile ? 12 : 24
  const widgetWidth = isMobile ? 'calc(100vw - 24px)' : '380px'
  const widgetHeight = isMobile ? '500px' : '540px'

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

      {!isOpen && (
        <button
          onClick={openChat}
          aria-label="Ouvrir Adu, votre vendeur"
          style={{
            position: 'fixed',
            bottom: bottomPosition,
            right: rightPosition,
            width: buttonSize,
            height: buttonSize,
            borderRadius: '50%',
            background: '#D4372B',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(212,55,43,0.4)',
            zIndex: 1000,
            transition: 'transform 0.2s ease',
            fontSize: buttonFontSize,
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🤖
          {hasUnread && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#E67700',
              border: '2px solid #fff',
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

      {!isOpen && proactiveMessage && (
        <div
          onClick={openChat}
          style={{
            position: 'fixed',
            bottom: bottomPosition + buttonSize + 8,
            right: rightPosition,
            maxWidth: isMobile ? '220px' : '260px',
            background: '#fff',
            borderRadius: '12px',
            padding: '10px 12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            zIndex: 999,
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '13px',
            color: '#0A0A0A',
            fontFamily: "'Poppins', sans-serif",
            lineHeight: 1.4,
            border: '0.5px solid #ECECEC',
          }}
        >
          <span style={{ fontWeight: 600, color: '#D4372B' }}>Adu · </span>
          {proactiveMessage}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            right: '22px',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #fff',
          }} />
        </div>
      )}

      {isOpen && (
        <div
          className="chatbot-container"
          style={{
            position: 'fixed',
            bottom: bottomPosition,
            right: rightPosition,
            width: widgetWidth,
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '52px' : widgetHeight,
            maxHeight: 'calc(100vh - 48px)',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Poppins', sans-serif",
            transition: 'height 0.3s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: '#D4372B',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                Adu {isSpeaking && '🔊'}
              </p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>
                {isRecording ? '🎤 Écoute...' : 'Votre vendeur Adullam'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {isSpeaking && (
                <button
                  onClick={(e) => { e.stopPropagation(); stopSpeaking() }}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                >
                  ⏹
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); setIsMinimized(!isMinimized) }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', padding: '2px' }}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsOpen(false) }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', padding: '2px' }}
              >
                ✕
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
                        background: '#FFF0F0',
                        fontSize: isMobile ? '10px' : '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>🤖</div>
                    )}
                    <div style={{
                      maxWidth: isMobile ? '85%' : '78%',
                      padding: isMobile ? '6px 10px' : '8px 12px',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'user' ? '#D4372B' : '#F5F5F5',
                      color: msg.role === 'user' ? '#fff' : '#0A0A0A',
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
                                background: '#fff',
                                borderRadius: '8px',
                                padding: '8px 10px',
                                border: '1px solid #F0F0F0',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                alignItems: 'center',
                                animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#D4372B'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,55,43,0.08)'
                                e.currentTarget.style.transform = 'translateY(-1px)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#F0F0F0'
                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '6px',
                                background: '#F8F8F8',
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
                                  color: '#0A0A0A',
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
                                    // ✅ Formatage dynamique avec formatPrice
                                    color: '#D4372B',
                                    fontWeight: 600,
                                  }}>
                                    {formatPrice(p.price)}
                                  </p>
                                )}
                                <p style={{
                                  margin: '1px 0 0 0',
                                  fontSize: isMobile ? '8px' : '9px',
                                  color: '#999',
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
                                border: '1px dashed #D4372B',
                                borderRadius: '20px',
                                color: '#D4372B',
                                fontSize: isMobile ? '10px' : '11px',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#FFF5F3'
                                e.currentTarget.style.borderColor = '#D4372B'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.borderColor = '#D4372B'
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
                      background: '#FFF0F0',
                      fontSize: isMobile ? '10px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>🤖</div>
                    <div style={{
                      padding: '6px 12px',
                      background: '#F5F5F5',
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
                          background: '#AAAAAA',
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
                borderTop: '0.5px solid #ECECEC',
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
                    border: '0.5px solid #ECECEC',
                    borderRadius: '20px',
                    padding: isMobile ? '6px 12px' : '8px 14px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontFamily: "'Poppins', sans-serif",
                    outline: 'none',
                    background: isRecording ? '#FFF8E1' : '#FAFAFA',
                    color: '#0A0A0A',
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
                      background: isRecording ? '#E67700' : '#ECECEC',
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
                    {isRecording ? '⏹' : '🎤'}
                  </button>
                )}
                
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: isMobile ? '30px' : '34px',
                    height: isMobile ? '30px' : '34px',
                    borderRadius: '50%',
                    background: input.trim() && !isTyping ? '#D4372B' : '#ECECEC',
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
                  ➤
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