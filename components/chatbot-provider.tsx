"use client"

import { useEffect, useState } from "react"
import { ChatbotWidget } from "./ChatbotWidget"
import { useAuth } from "@/lib/admin/auth-context" // ← Ajouter

export function ChatbotProvider() {
  const [sessionId, setSessionId] = useState<string>("")
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const { user } = useAuth() // ← Récupérer l'utilisateur

  useEffect(() => {
    if (user?.id) {
      // ✅ Connecté → utiliser user_id comme session
      setUserId(user.id)
      setSessionId(`user_${user.id}`)
    } else {
      // ✅ Déconnecté → générer un nouveau sessionId
      let id = localStorage.getItem("chat_session_id")
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem("chat_session_id", id)
      }
      setSessionId(id)
      setUserId(undefined)
    }
  }, [user]) // ← Se déclenche quand l'utilisateur change

  if (!sessionId) return null

  return <ChatbotWidget sessionId={sessionId} userId={userId} language="fr" />
}