"use client"

import { useEffect, useState } from "react"
import { ChatbotWidget } from "./ChatbotWidget"
import { useAuth } from "@/lib/admin/auth-context"

export function ChatbotProvider() {
  const [sessionId, setSessionId] = useState<string>("")
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      // ✅ Connecté : session = user_id
      setUserId(user.id)
      setSessionId(`user_${user.id}`)
    } else {
      // ✅ Déconnecté : NOUVEAU sessionId (pas l'ancien !)
      const id = crypto.randomUUID() // ← Toujours un nouveau !
      localStorage.setItem("chat_session_id", id)
      setSessionId(id)
      setUserId(undefined)
    }
  }, [user]) // ← Se déclenche quand l'utilisateur change

  if (!sessionId) return null

  return <ChatbotWidget sessionId={sessionId} userId={userId} language="fr" />
}