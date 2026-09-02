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
      // ✅ FIX : on relit d'abord l'ancien chat_session_id avant d'en créer
      // un nouveau. Avant ce fix, un nouvel UUID était généré à CHAQUE
      // montage sans utilisateur connecté (rechargement de page, nouvel
      // onglet, navigation qui remonte le layout) — l'identifiant Python
      // (anon_{session_id}) changeait donc en permanence, et tout le
      // comportement accumulé côté profile_engine (vues, hésitation,
      // catégories consultées...) repartait de zéro à chaque fois. On ne
      // génère un nouvel UUID que si aucun n'existe encore dans ce
      // navigateur.
      const existing = localStorage.getItem("chat_session_id")
      const id = existing || crypto.randomUUID()
      if (!existing) {
        localStorage.setItem("chat_session_id", id)
      }
      setSessionId(id)
      setUserId(undefined)
    }
  }, [user]) // ← Se déclenche quand l'utilisateur change

  if (!sessionId) return null

  return <ChatbotWidget sessionId={sessionId} userId={userId} language="fr" />
}