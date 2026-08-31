"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { apiFetch } from "@/lib/api"

// ════════════════════════════════════════════════════════════
// État partagé au niveau du module — desktop (Header) et mobile
// (MobileNav) sont tous les deux montés en même temps dans le DOM
// (juste masqués en CSS via hidden/lg:hidden), donc si chacun avait
// son propre setInterval on interrogeait l'API deux fois en double
// en permanence. Ici un seul intervalle tourne réellement, partagé
// entre tous les composants qui utilisent ce hook.
// ════════════════════════════════════════════════════════════
let sharedCount = 0
let listeners: Array<(count: number) => void> = []
let intervalId: ReturnType<typeof setInterval> | null = null
let activeConsumers = 0

async function fetchUnreadCount(): Promise<number> {
  try {
    const token = localStorage.getItem("adullam_token")
    const res = await apiFetch("/api/notifications?unread=true&limit=1", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return data?.data?.stats?.unread ?? data?.stats?.unread ?? 0
  } catch (error) {
    console.error("Erreur chargement notifs:", error)
    return sharedCount
  }
}

function broadcast(count: number) {
  sharedCount = count
  listeners.forEach((listen) => listen(count))
}

/**
 * Compteur de notifications non lues, partagé entre tous les
 * composants (header desktop, nav mobile, etc). Peu importe combien
 * de fois ce hook est utilisé simultanément, une seule requête réseau
 * part réellement — les autres consommateurs reçoivent juste la
 * valeur déjà en mémoire.
 */
export function useUnreadNotifications(intervalMs = 15000) {
  const { user } = useAuth()
  const [count, setCount] = useState(sharedCount)

  useEffect(() => {
    if (!user) return

    listeners.push(setCount)
    activeConsumers += 1

    const refresh = async () => {
      const value = await fetchUnreadCount()
      broadcast(value)
    }

    // Un seul intervalle actif, créé par le premier composant monté.
    if (activeConsumers === 1) {
      refresh()
      intervalId = setInterval(refresh, intervalMs)
    }

    const handleNotificationUpdate = () => refresh()
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh()
    }

    window.addEventListener("notifications-updated", handleNotificationUpdate)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      listeners = listeners.filter((listen) => listen !== setCount)
      activeConsumers -= 1
      window.removeEventListener("notifications-updated", handleNotificationUpdate)
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      // Le dernier composant démonté coupe l'intervalle.
      if (activeConsumers === 0 && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }, [user, intervalMs])

  return count
}
