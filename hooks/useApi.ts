// hooks/useApi.ts
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredToken, setStoredToken } from '@/lib/admin/api-client'

// ✅ CORRIGÉ : Plus de fallback Railway, uniquement la variable d'environnement
const API_BASE = process.env.NEXT_PUBLIC_API_URL

// ✅ Vérification au démarrage
if (!API_BASE && typeof window !== 'undefined') {
  console.error('❌ NEXT_PUBLIC_API_URL non définie dans les variables d\'environnement Vercel')
}

export function useApi() {
  const router = useRouter()

  const fetchWithAuth = useCallback(async (input: RequestInfo | URL, options: RequestInit = {}) => {
    let attempt = 0
    const maxAttempts = 2

    if (!API_BASE) {
      throw new Error('API_BASE non définie. Vérifie NEXT_PUBLIC_API_URL sur Vercel.')
    }

    // Récupérer le token
    let token = getStoredToken()

    // Construire l'URL
    let url: string
    if (typeof input === 'string') {
      if (input.startsWith('http')) {
        url = input
      } else if (input.startsWith('/api')) {
        url = `${API_BASE}${input}`
      } else {
        url = `${API_BASE}${input.startsWith('/') ? input : `/${input}`}`
      }
    } else {
      url = input.toString()
    }

    while (attempt < maxAttempts) {
      try {
        const res = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
          }
        })

        if (res.ok) {
          return res
        }

        // Token expiré
        if (res.status === 401) {
          if (attempt === 0) {
            try {
              const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
              })

              if (refreshRes.ok) {
                const data = await refreshRes.json()
                if (data.accessToken) {
                  setStoredToken(data.accessToken)
                  token = data.accessToken
                  attempt++
                  continue
                }
              }
            } catch (refreshError) {
              console.error('Refresh failed:', refreshError)
            }
          }
          
          // Redirection vers login
          router.push('/login?reason=session_expired')
          throw new Error('Session expirée')
        }

        throw new Error(`HTTP ${res.status}`)

      } catch (error) {
        if (attempt === maxAttempts - 1) {
          console.error('❌ API Error:', error)
          throw error
        }
        attempt++
      }
    }

    throw new Error('Max attempts reached')
  }, [router])

  return { fetchWithAuth }
}