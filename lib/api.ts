import { getAccessToken, setAccessToken, clearAccessToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://outstanding-enchantment-production-109f.up.railway.app"

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken()
  
  // 🔥 LOGS DÉTAILLÉS
  console.log('🔍 [apiFetch] ====================')
  console.log('🔍 [apiFetch] URL appelée:', typeof input === 'string' ? input : input.url)
  console.log('🔍 [apiFetch] Token présent:', !!token)
  console.log('🔍 [apiFetch] Méthode:', init.method || 'GET')
  console.log('🔍 [apiFetch] API_URL depuis env:', process.env.NEXT_PUBLIC_API_URL)
  
  const fullUrl = `${API_URL}${input}`
  console.log('🔍 [apiFetch] URL complète:', fullUrl)
  console.log('🔍 [apiFetch] ====================')

  const res = await fetch(fullUrl, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include", // 🔥 pour refresh cookie
  })

  // Log du statut de la réponse
  console.log(`🔍 [apiFetch] Statut réponse: ${res.status} pour ${fullUrl}`)

  // Access token expiré
  if (res.status === 401) {
    console.log('🔄 [apiFetch] Token expiré, tentative de refresh...')
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      console.log('❌ [apiFetch] Refresh échoué, redirection...')
      clearAccessToken()
      window.location.href = "/login"
      throw new Error("Session expired")
    }

    console.log('✅ [apiFetch] Refresh réussi, nouvelle tentative...')
    // Retry original request
    return apiFetch(input, init)
  }

  return res
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    console.log('🔄 [refreshAccessToken] Tentative de refresh...')
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })

    if (!res.ok) {
      console.log(`❌ [refreshAccessToken] Échec: ${res.status}`)
      return false
    }

    const data = await res.json()
    if (!data.accessToken) {
      console.log('❌ [refreshAccessToken] Pas de token dans la réponse')
      return false
    }

    console.log('✅ [refreshAccessToken] Nouveau token reçu')
    setAccessToken(data.accessToken)
    return true
  } catch (error) {
    console.error('❌ [refreshAccessToken] Erreur:', error)
    return false
  }
}