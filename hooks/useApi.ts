// hooks/useApi.ts
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredToken } from '@/lib/admin/api-client'  // ← IMPORT CORRECT

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://outstanding-enchantment-production-109f.up.railway.app/api'

export function useApi() {
  const router = useRouter()

  const fetchWithAuth = useCallback(async (input: RequestInfo | URL, options: RequestInit = {}) => {
    let attempt = 0
    const maxAttempts = 2

    // 🔥 Récupérer le token avec la BONNE fonction
    let token = getStoredToken()
    console.log('🔵 [useApi] Token récupéré:', token ? 'PRÉSENT' : 'ABSENT')

    let url: string
    if (typeof input === 'string') {
      url = input.startsWith('http') 
        ? input 
        : input.startsWith('/api')
          ? `${API_BASE}${input.replace('/api', '')}`
          : `${API_BASE}${input.startsWith('/') ? input : `/${input}`}`
    } else {
      url = input.toString()
    }

    console.log(`🔵 [useApi] Appel à: ${url}`)

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

        if (res.status === 401) {
          console.log(`🔄 Tentative ${attempt + 1}: Token expiré...`)
          
          if (attempt === 0) {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              credentials: 'include'
            })

            if (refreshRes.ok) {
              console.log('✅ Token rafraîchi')
              token = getStoredToken()
              attempt++
              continue
            }
          }
          
          console.log('❌ Session expirée')
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