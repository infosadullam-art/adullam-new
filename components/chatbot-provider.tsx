"use client"

import { useEffect, useState } from "react"
import { ChatbotWidget } from "./ChatbotWidget"

export function ChatbotProvider() {
  const [sessionId, setSessionId] = useState<string>("")
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Récupérer ou générer un sessionId
    let id = localStorage.getItem("chat_session_id")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("chat_session_id", id)
    }
    setSessionId(id)

    // Récupérer userId si connecté (à adapter selon ton auth)
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        setUserId(userData.id)
      } catch {
        // Ignorer
      }
    }
  }, [])

  if (!sessionId) return null

  return <ChatbotWidget sessionId={sessionId} userId={userId} language="fr" />
}