"use client"

// components/ChatbotWidget.tsx
// Bulle flottante du chatbot Adu
// Proactif, mémorant, adapté mobile

import { useState, useEffect, useRef, useCallback } from "react"

// ============================================================
// TYPES
// ============================================================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: Product[]
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

interface ChatbotWidgetProps {
  sessionId: string
  userId?: string
  language?: 'fr' | 'en' | 'pt'
}

// ============================================================
// CONSTANTES
// ============================================================

const TRIGGER_CHECK_INTERVAL = 30000   // 30s
const INACTIVITY_THRESHOLD   = 15      // 15s sans action → trigger

// URL du backend Next.js (API Route) sur VPS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.adullamarket.com'

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function ChatbotWidget({ sessionId, userId, language = 'fr' }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null)
  const [isFirstOpen, setIsFirstOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLInputElement>(null)
  const lastActionRef   = useRef<number>(Date.now())
  const triggerTimerRef = useRef<NodeJS.Timeout>()
  const viewCountRef    = useRef(0)

  // ✅ Détecter mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  // ── Charger historique au montage ─────────────────────────
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
            fr: "Salut ! 👋 Je suis Adu, ton assistant Adullam. Dis-moi ce que tu cherches, je suis là pour t'aider !",
            en: "Hey! 👋 I'm Adu, your Adullam assistant. Tell me what you're looking for!",
            pt: "Oi! 👋 Sou o Adu, seu assistente Adullam. Me diz o que você procura!",
          }
          addAssistantMessage(welcomes[language] || welcomes.fr)
        }
      } catch (error) {
        console.error("Erreur chargement historique:", error)
        addAssistantMessage("Salut ! 👋 Je suis Adu, ton assistant Adullam. Comment puis-je t'aider ?")
      }
    }

    loadHistory()
  }, [sessionId, userId, language])

  // ── Trigger proactif ──────────────────────────────────────
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
          }),
        })

        const data = await res.json()

        if (data.should_trigger && data.message) {
          setProactiveMessage(data.message)
          setHasUnread(true)
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

  // ============================================================
  // ACTIONS
  // ============================================================

  const addAssistantMessage = useCallback((content: string, products?: Product[]) => {
    const msg: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      products,
    }
    setMessages(prev => [...prev, msg])
  }, [])

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

        addAssistantMessage(data.response, formattedProducts)

        try {
          await fetch(`${API_BASE_URL}/api/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: null,
              type: 'CHAT_CONVERSATION',
              context: 'CHATBOT',
              sessionId: sessionId,
              metadata: {
                user_message: text.slice(0, 500),
                assistant_message: data.response.slice(0, 500),
                intent: data.intent,
                language: language
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ============================================================
  // RENDU
  // ============================================================

  // ✅ Styles adaptatifs mobile
  const buttonSize = isMobile ? 48 : 56
  const buttonFontSize = isMobile ? 20 : 24
  const bottomPosition = isMobile ? 80 : 24  // ✅ Remonté sur mobile
  const rightPosition = isMobile ? 12 : 24
  const widgetWidth = isMobile ? 'calc(100vw - 24px)' : '380px'
  const widgetHeight = isMobile ? '480px' : '520px'
  const widgetMaxWidth = isMobile ? 'calc(100vw - 24px)' : 'calc(100vw - 32px)'

  return (
    <>
      {!isOpen && (
        <button
          onClick={openChat}
          aria-label="Ouvrir Adu, votre assistant"
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
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
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
        <div style={{
          position: 'fixed',
          bottom: bottomPosition,
          right: rightPosition,
          width: widgetWidth,
          maxWidth: widgetMaxWidth,
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
          transition: 'height 0.25s ease',
        }}>
          <div style={{
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
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '13px' }}>Adu</p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>Votre assistant Adullam</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                {messages.map(msg => (
                  <div key={msg.id} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '4px',
                    alignItems: 'flex-end',
                  }}>
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
                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {msg.products.slice(0, isMobile ? 2 : 3).map(p => (
                            <div key={p.id} style={{
                              padding: '4px 8px',
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: '4px',
                              fontSize: isMobile ? '10px' : '11px',
                              cursor: 'pointer',
                            }}
                              onClick={() => window.location.href = `/products/${p.id}`}
                            >
                              🛍️ {p.reason || p.title || 'Produit recommandé'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
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
                  placeholder="Dis-moi ce que tu cherches..."
                  disabled={isTyping}
                  style={{
                    flex: 1,
                    border: '0.5px solid #ECECEC',
                    borderRadius: '20px',
                    padding: isMobile ? '6px 12px' : '8px 14px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontFamily: "'Poppins', sans-serif",
                    outline: 'none',
                    background: '#FAFAFA',
                    color: '#0A0A0A',
                  }}
                />
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
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}