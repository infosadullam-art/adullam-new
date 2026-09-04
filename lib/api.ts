import { getAccessToken, setAccessToken, clearAccessToken } from "./auth"

// ✅ CORRIGÉ : URL forcée vers ton VPS (sans dépendre des env vars)
const API_URL = 'https://api.adullamarket.com'

// 🔧 Logger conditionnel : actif seulement en dev, silencieux en production
const isDev = process.env.NODE_ENV !== "production"
function devLog(...args: any[]) {
  if (isDev) console.log(...args)
}

// Vérification
if (!API_URL) {
  console.error("❌ API_URL n'est pas définie")
}

devLog('🔴 [lib/api.ts] API_URL configurée:', API_URL)

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {},
  _isRetry = false // garde-fou interne : évite une boucle infinie de refresh
): Promise<Response> {
  const token = getAccessToken()
  
  // 🔥 LOGS DÉTAILLÉS
  devLog('🔍 [apiFetch] ====================')
  devLog('🔍 [apiFetch] URL appelée:', typeof input === 'string' ? input : input.url)
  devLog('🔍 [apiFetch] Token présent:', !!token)
  devLog('🔍 [apiFetch] Méthode:', init.method || 'GET')
  devLog('🔍 [apiFetch] API_URL:', API_URL)
  
  const fullUrl = `${API_URL}${input}`
  devLog('🔍 [apiFetch] URL complète:', fullUrl)
  devLog('🔍 [apiFetch] ====================')

  const res = await fetch(fullUrl, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  })

  devLog(`🔍 [apiFetch] Statut réponse: ${res.status} pour ${fullUrl}`)

  // Access token expiré ou refusé (le backend renvoie parfois 403
  // au lieu de 401 pour un token expiré — voir getAuthUser) :
  // on tente un refresh une seule fois via _isRetry.
  if ((res.status === 401 || res.status === 403) && !_isRetry) {
    devLog(`🔄 [apiFetch] ${res.status} reçu, tentative de refresh...`)
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      devLog('❌ [apiFetch] Refresh échoué, redirection...')
      clearAccessToken()
      if (typeof window !== 'undefined') {
        window.location.href = "/login"
      }
      throw new Error("Session expired")
    }

    devLog('✅ [apiFetch] Refresh réussi, nouvelle tentative...')
    return apiFetch(input, init, true) // _isRetry = true : plus jamais retenter après ça
  }

  return res
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    devLog('🔄 [refreshAccessToken] Tentative de refresh...')
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })

    if (!res.ok) {
      devLog(`❌ [refreshAccessToken] Échec: ${res.status}`)
      return false
    }

    const data = await res.json()
    if (!data.accessToken) {
      devLog('❌ [refreshAccessToken] Pas de token dans la réponse')
      return false
    }

    devLog('✅ [refreshAccessToken] Nouveau token reçu')
    setAccessToken(data.accessToken)
    return true
  } catch (error) {
    console.error('❌ [refreshAccessToken] Erreur:', error)
    return false
  }
}