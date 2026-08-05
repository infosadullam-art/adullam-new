// lib/admin/api-client.ts

// ✅ CORRIGÉ : Suppression de tous les fallbacks Railway
const API_BASE = process.env.NEXT_PUBLIC_API_URL
const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_URL || process.env.NEXT_PUBLIC_API_URL

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

// ✅ Vérification au démarrage
if (typeof window !== "undefined") {
  if (!API_BASE) {
    console.error("❌ NEXT_PUBLIC_API_URL n'est pas définie dans les variables d'environnement Vercel")
  }
  if (!PYTHON_API_BASE) {
    console.error("❌ NEXT_PUBLIC_PYTHON_API_URL n'est pas définie")
  }
}

// 🔹 Fonction de nettoyage du token
function cleanToken(token: string | null): string | null {
  if (!token) return null
  if (token === 'null' || token === 'undefined') return null
  return token.replace(/["'\s\r\n]/g, '').trim()
}

// 🔹 Fonctions pour gérer le token de façon persistante
export const getStoredToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adullam_token")
    console.log("🔵 [api-client] getStoredToken:", token ? "présent" : "absent")
    return cleanToken(token)
  }
  return null
}

export const setStoredToken = (token: string | null) => {
  if (typeof window !== "undefined") {
    if (token) {
      const cleanedToken = cleanToken(token)
      if (cleanedToken) {
        localStorage.setItem("adullam_token", cleanedToken)
        console.log("🟢 [api-client] Token sauvegardé")
      } else {
        localStorage.removeItem("adullam_token")
        console.log("🟡 [api-client] Token invalide, supprimé")
      }
    } else {
      localStorage.removeItem("adullam_token")
      console.log("🟡 [api-client] Token supprimé")
    }
  }
}

// 🔹 Initialiser le token depuis localStorage au démarrage
let inMemoryAccessToken: string | null = getStoredToken()
console.log("🔵 [api-client] Token initial:", inMemoryAccessToken ? "présent" : "absent")
console.log("🔵 [api-client] API_BASE configuré:", API_BASE)

// Fonction pour construire l'URL sans double /api
function buildUrl(base: string | undefined, endpoint: string): string {
  if (!base) {
    throw new Error("API_BASE non définie")
  }
  
  // Si base se termine par /api et endpoint commence par /api, supprimer le doublon
  if (base.endsWith('/api') && endpoint.startsWith('/api')) {
    return `${base}${endpoint.replace('/api', '')}`
  }
  
  // Si base ne se termine pas par /api mais endpoint commence par /api, c'est parfait
  return `${base}${endpoint}`
}

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
  retry = true
): Promise<T> {
  if (!API_BASE) {
    throw new Error("API_BASE non définie. Vérifie NEXT_PUBLIC_API_URL sur Vercel.")
  }

  const { params, headers = {}, ...fetchOptions } = options

  console.log('🔴 [api-client] ====================')
  console.log('🔴 [api-client] Endpoint demandé:', endpoint)
  console.log('🔴 [api-client] API_BASE utilisé:', API_BASE)
  console.log('🔴 [api-client] Token en mémoire:', !!inMemoryAccessToken)
  console.log('🔴 [api-client] Token localStorage:', !!getStoredToken())
  console.log('🔴 [api-client] Méthode:', fetchOptions.method || 'GET')

  let url = buildUrl(API_BASE, endpoint)
  console.log('🔴 [api-client] URL de base construite:', url)

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value))
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
      console.log('🔴 [api-client] Query params ajoutés:', queryString)
    }
  }

  console.log('🔴 [api-client] URL finale:', url)
  console.log('🔴 [api-client] ====================')

  const token = inMemoryAccessToken || getStoredToken()
  console.log(`🔵 [api-client] Token pour ${endpoint}:`, token ? "✅ présent" : "❌ absent")

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(url, {
    ...fetchOptions,
    mode: "cors",
    headers: requestHeaders,
    credentials: "include",
  })

  console.log(`🔵 [api-client] Statut réponse: ${response.status} pour ${url}`)

  const contentType = response.headers.get("content-type")
  const data =
    contentType?.includes("application/json") ? await response.json() : {}

  // 🔥 Gestion du 401 - NE PAS DÉCONNECTER AUTOMATIQUEMENT
  if (
    response.status === 401 &&
    retry &&
    endpoint !== "/api/auth/login" &&
    endpoint !== "/api/auth/refresh"
  ) {
    console.log('🔄 [api-client] 401 reçu, tentative de refresh...')
    try {
      const refreshData = await apiClient<{
        success: boolean
        accessToken?: string
      }>(
        "/api/auth/refresh",
        { method: "POST" },
        false
      )

      if (!refreshData.success || !refreshData.accessToken) {
        console.log('❌ [api-client] Refresh failed')
        throw new Error("Session expired")
      }

      console.log('✅ [api-client] Refresh réussi, nouvelle tentative...')
      inMemoryAccessToken = refreshData.accessToken
      setStoredToken(refreshData.accessToken)

      return await apiClient<T>(endpoint, options, false)
    } catch (error) {
      console.log('❌ [api-client] Refresh échoué')
      throw new Error("Session expired. Please login again.")
    }
  }

  if (!response.ok) {
    console.log(`❌ [api-client] Erreur ${response.status}:`, (data as any)?.message || "API request failed")
    throw new Error((data as any)?.message || "API request failed")
  }

  return data as T
}

// Fonction pour les appels Python (Dashboard metrics)
async function pythonApiClient<T>(endpoint: string): Promise<T> {
  if (!PYTHON_API_BASE) {
    console.warn("⚠️ PYTHON_API_BASE non définie")
    return {} as T
  }

  const url = buildUrl(PYTHON_API_BASE, endpoint)
  console.log(`🔵 [pythonApiClient] Appel à: ${url}`)

  const response = await fetch(url)
  if (!response.ok) {
    console.error(`❌ Python API error: ${response.status}`)
    return {} as T
  }

  return response.json()
}

// ------------------- Auth -------------------
export const authApi = {
  login: async (email: string, password: string) => {
    console.log('🟡 [authApi] Tentative de login pour:', email)
    const data = await apiClient<{
      success: boolean
      user: any
      accessToken: string
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (data.success && data.accessToken) {
      console.log("🟢 [authApi] Login réussi, token stocké")
      const cleanedToken = cleanToken(data.accessToken)
      if (cleanedToken) {
        inMemoryAccessToken = cleanedToken
        setStoredToken(cleanedToken)
      }
    }

    return data
  },

  logout: async () => {
    console.log("🟡 [authApi] Logout")
    inMemoryAccessToken = null
    setStoredToken(null)
    return apiClient<{ success: boolean }>("/api/auth/logout", { method: "POST" })
  },

  me: async () => {
    console.log("🟡 [authApi] Appel à me()")
    return apiClient<{ success: boolean; user?: any; accessToken?: string }>(
      "/api/auth/me"
    )
  },

  refresh: () => {
    console.log("🟡 [authApi] Appel à refresh()")
    return apiClient<{ success: boolean; accessToken: string }>("/api/auth/refresh", {
      method: "POST",
    })
  },

  register: (name: string, email: string, password: string, phone?: string) => {
    console.log("🟡 [authApi] Tentative d'inscription:", email)
    return apiClient<{ success: boolean; user?: any; accessToken?: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    })
  },

  verifyToken: (token: string) => {
    console.log("🟡 [authApi] Vérification de token")
    return apiClient<{ success: boolean; data: any }>(
      `/api/auth/verify?token=${token}`,
      { method: "GET" }
    )
  },
}

// ------------------- Dashboard (métriques) -------------------
export const dashboardApi = {
  getStats: (startDate?: string, endDate?: string) => {
    console.log("🟡 [dashboardApi] getStats")
    return apiClient<{ success: boolean; data: any }>("/api/admin/dashboard", {
      params: { startDate, endDate },
    })
  },
  getCycleMetrics: async () => {
    console.log("🟡 [dashboardApi] getCycleMetrics -> Next.js API")
    return apiClient<{ success: boolean; data: any }>("/api/admin/cycle/metrics")
  },
  getQualityMetrics: async () => {
    console.log("🟡 [dashboardApi] getQualityMetrics -> Next.js API")
    return apiClient<{ success: boolean; data: any }>("/api/admin/cycle/quality")
  },
  getColdStartMetrics: async () => {
    console.log("🟡 [dashboardApi] getColdStartMetrics -> Next.js API")
    return apiClient<{ success: boolean; data: any }>("/api/admin/cycle/coldstart")
  },
  getDiversityMetrics: async () => {
    console.log("🟡 [dashboardApi] getDiversityMetrics -> Next.js API")
    return apiClient<{ success: boolean; data: any }>("/api/admin/cycle/diversity")
  },
  getScrollMetrics: async () => {
    console.log("🟡 [dashboardApi] getScrollMetrics -> Next.js API")
    return apiClient<{ success: boolean; data: any }>("/api/admin/cycle/scroll")
  },
  getAlerts: async () => {
    console.log("🟡 [dashboardApi] getAlerts -> Next.js API")
    return apiClient<{ success: boolean; data: any }>("/api/admin/cycle/alerts")
  },
  getPerformanceMetrics: async () => {
    console.log("🟡 [dashboardApi] getPerformanceMetrics -> Next.js API")
    return apiClient<{ success: boolean; data: any }>("/api/admin/cycle/performance")
  },
}

// ------------------- Products -------------------
export const productsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [productsApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/products",
      { params }
    )
  },
  get: (id: string) => {
    console.log("🟡 [productsApi] get:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/products/${id}`)
  },
  create: (data: any) => {
    console.log("🟡 [productsApi] create")
    return apiClient<{ success: boolean; data: any }>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    console.log("🟡 [productsApi] update:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    console.log("🟡 [productsApi] delete:", id)
    return apiClient<{ success: boolean }>(`/api/products/${id}`, {
      method: "DELETE",
    })
  },
  stats: () => {
    console.log("🟡 [productsApi] stats")
    return apiClient<{ success: boolean; data: any }>("/api/products/stats")
  },
}

// ------------------- Categories -------------------
export const categoriesApi = {
  list: () => {
    console.log("🟡 [categoriesApi] list")
    return apiClient<{ success: boolean; data: any[] }>("/api/categories")
  },
  create: (data: any) => {
    console.log("🟡 [categoriesApi] create")
    return apiClient<{ success: boolean; data: any }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    console.log("🟡 [categoriesApi] update:", id)
    return apiClient<{ success: boolean; data: any }>(
      `/api/categories/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    )
  },
  delete: (id: string) => {
    console.log("🟡 [categoriesApi] delete:", id)
    return apiClient<{ success: boolean }>(`/api/categories/${id}`, {
      method: "DELETE",
    })
  },
}

// ------------------- Orders -------------------
export const ordersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [ordersApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/orders",
      { params }
    )
  },
  get: (id: string) => {
    console.log("🟡 [ordersApi] get:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/orders/${id}`)
  },
  updateStatus: (id: string, data: any) => {
    console.log("🟡 [ordersApi] updateStatus:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  stats: (startDate?: string, endDate?: string) => {
    console.log("🟡 [ordersApi] stats")
    return apiClient<{ success: boolean; data: any }>("/api/orders/stats", {
      params: { startDate, endDate },
    })
  },
}

// ------------------- Addresses -------------------
export interface Address {
  id: string
  type: string
  firstName: string
  lastName: string
  company?: string
  address: string
  complement?: string
  city: string
  postalCode?: string
  country: string
  phone: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export const addressesApi = {
  list: () => {
    console.log("🟡 [addressesApi] list")
    return apiClient<{ success: boolean; addresses: Address[] }>("/api/user/addresses")
  },
  get: (id: string) => {
    console.log("🟡 [addressesApi] get:", id)
    return apiClient<{ success: boolean; address: Address }>(`/api/user/addresses/${id}`)
  },
  create: (data: Partial<Address>) => {
    console.log("🟡 [addressesApi] create")
    return apiClient<{ success: boolean; address: Address; message: string }>("/api/user/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: Partial<Address>) => {
    console.log("🟡 [addressesApi] update:", id)
    return apiClient<{ success: boolean; address: Address; message: string }>(`/api/user/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    console.log("🟡 [addressesApi] delete:", id)
    return apiClient<{ success: boolean; message: string }>(`/api/user/addresses/${id}`, {
      method: "DELETE",
    })
  },
}

// ------------------- Wishlist -------------------
export const wishlistApi = {
  list: () => {
    console.log("🟡 [wishlistApi] list")
    return apiClient<{ success: boolean; data: any[] }>("/api/user/wishlist")
  },
  add: (productId: string) => {
    console.log("🟡 [wishlistApi] add:", productId)
    return apiClient<{ success: boolean; message: string }>("/api/user/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
  },
  remove: (productId: string) => {
    console.log("🟡 [wishlistApi] remove:", productId)
    return apiClient<{ success: boolean; message: string }>(`/api/user/wishlist?productId=${productId}`, {
      method: "DELETE",
    })
  },
}

// ------------------- Import -------------------
export const importApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [importApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/import",
      { params }
    )
  },
  get: (id: string) => {
    console.log("🟡 [importApi] get:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/import/${id}`)
  },
  create: (data: any) => {
    console.log("🟡 [importApi] create")
    return apiClient<{ success: boolean; data: any }>("/api/import", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  stats: () => {
    console.log("🟡 [importApi] stats")
    return apiClient<{ success: boolean; data: any }>("/api/import/stats")
  },
}

// ------------------- Jobs -------------------
export const jobsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [jobsApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/jobs",
      { params }
    )
  },
  trigger: (queue: string, job: string, payload?: any) => {
    console.log("🟡 [jobsApi] trigger:", queue, job)
    return apiClient<{ success: boolean; data: any }>("/api/jobs/trigger", {
      method: "POST",
      body: JSON.stringify({ queue, job, payload }),
    })
  },
  stats: () => {
    console.log("🟡 [jobsApi] stats")
    return apiClient<{ success: boolean; data: any }>("/api/jobs/stats")
  },
}

// ------------------- Notifications -------------------
export const notificationsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [notificationsApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/notifications",
      { params }
    )
  },
  stats: () => {
    console.log("🟡 [notificationsApi] stats")
    return apiClient<{ success: boolean; data: any }>("/api/notifications/stats")
  },
}

// ------------------- Ads -------------------
export const adsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [adsApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/ads",
      { params }
    )
  },
  performance: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [adsApi] performance")
    return apiClient<{ success: boolean; data: any }>("/api/ads/performance", {
      params,
    })
  },
}

// ------------------- Feed -------------------
export const feedApi = {
  stats: () => {
    console.log("🟡 [feedApi] stats")
    return apiClient<{ success: boolean; data: any }>("/api/feed/stats")
  },
}

// ------------------- For You / Recommendations -------------------
export const recommendationsApi = {
  getStats: (period?: string) => {
    console.log("🟡 [recommendationsApi] getStats")
    return apiClient<{ success: boolean; data: any }>("/api/admin/recommendations/stats", {
      params: { period }
    })
  },
  getTopProducts: (limit?: number) => {
    console.log("🟡 [recommendationsApi] getTopProducts")
    return apiClient<{ success: boolean; data: any }>("/api/admin/recommendations/top", {
      params: { limit: limit || 10 }
    })
  },
  getSegmentPerformance: () => {
    console.log("🟡 [recommendationsApi] getSegmentPerformance")
    return apiClient<{ success: boolean; data: any }>("/api/admin/recommendations/segments")
  },
  getRecentActivity: (limit?: number) => {
    console.log("🟡 [recommendationsApi] getRecentActivity")
    return apiClient<{ success: boolean; data: any }>("/api/admin/recommendations/activity", {
      params: { limit: limit || 20 }
    })
  },
  triggerScoring: () => {
    console.log("🟡 [recommendationsApi] triggerScoring")
    return apiClient<{ success: boolean; message: string }>("/api/admin/recommendations/score", {
      method: "POST"
    })
  }
}

// ------------------- Interactions -------------------
export const interactionsApi = {
  stats: (startDate?: string, endDate?: string) => {
    console.log("🟡 [interactionsApi] stats")
    return apiClient<{ success: boolean; data: any }>(
      "/api/interactions/stats",
      { params: { startDate, endDate } }
    )
  },
}

// ------------------- Videos -------------------
export const videosApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [videosApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/videos",
      { params }
    )
  },
  create: (data: any) => {
    console.log("🟡 [videosApi] create")
    return apiClient<{ success: boolean; data: any }>("/api/videos", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    console.log("🟡 [videosApi] update:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/videos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    console.log("🟡 [videosApi] delete:", id)
    return apiClient<{ success: boolean }>(`/api/videos/${id}`, {
      method: "DELETE",
    })
  },
}

// ------------------- Users -------------------
export const usersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [usersApi] list")
    return apiClient<{ success: boolean; data: any[]; meta?: any }>(
      "/api/admin/users",
      { params }
    )
  },
  get: (id: string) => {
    console.log("🟡 [usersApi] get:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/admin/users/${id}`)
  },
  ban: (id: string) => {
    console.log("🟡 [usersApi] ban:", id)
    return apiClient<{ success: boolean }>(`/api/admin/users/${id}/ban`, {
      method: "POST",
    })
  },
  activate: (id: string) => {
    console.log("🟡 [usersApi] activate:", id)
    return apiClient<{ success: boolean }>(`/api/admin/users/${id}/activate`, {
      method: "POST",
    })
  },
}

// ============================================================
// ✅ SOURCING API - Demandes des utilisateurs
// ============================================================

export interface SourcingRequest {
  id: string
  productName: string
  productType: string
  description: string
  quantity: number
  quantityUnit: string
  budgetMin: number | null
  budgetMax: number | null
  deadline: string | null
  fullName: string
  email: string
  phone: string | null
  company: string | null
  status: "PENDING" | "IN_REVIEW" | "QUOTED" | "RESPONDED" | "CLOSED" | "ARCHIVED"
  documents: any
  adminNotes: string | null
  response: string | null
  viewedAt: string | null
  respondedAt: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
}

export interface SourcingStats {
  total: number
  pending: number
  inReview: number
  quoted: number
  responded: number
  closed: number
  thisMonth: number
}

export interface SourcingFilters {
  page?: number
  limit?: number
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}

export const sourcingApi = {
  list: (params?: SourcingFilters): Promise<{ success: boolean; data: SourcingRequest[]; meta: any }> => {
    console.log("🟡 [sourcingApi] list", params)
    return apiClient("/api/sourcing", { params })
  },
  getStats: (): Promise<{ success: boolean; data: SourcingStats }> => {
    console.log("🟡 [sourcingApi] getStats")
    return apiClient("/api/sourcing", { params: { stats: "true" } })
  },
  getById: (id: string): Promise<{ success: boolean; data: SourcingRequest }> => {
    console.log("🟡 [sourcingApi] getById:", id)
    return apiClient(`/api/sourcing/${id}`)
  },
  update: (id: string, data: Partial<SourcingRequest>): Promise<{ success: boolean; data: SourcingRequest }> => {
    console.log("🟡 [sourcingApi] update:", id)
    return apiClient(`/api/sourcing/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    console.log("🟡 [sourcingApi] delete:", id)
    return apiClient(`/api/sourcing/${id}`, {
      method: "DELETE",
    })
  },
  markAsViewed: (id: string): Promise<{ success: boolean; data: SourcingRequest }> => {
    console.log("🟡 [sourcingApi] markAsViewed:", id)
    return apiClient(`/api/sourcing/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ markAsViewed: true }),
    })
  },
  create: async (data: any): Promise<{ success: boolean; data?: SourcingRequest; error?: string }> => {
    console.log("🟡 [sourcingApi] create (JSON)")
    try {
      const token = inMemoryAccessToken || getStoredToken()
      
      const response = await fetch(buildUrl(API_BASE, "/api/sourcing/needs"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data),
        credentials: "include"
      })

      const responseData = await response.json()
      
      console.log(`🟡 [sourcingApi] create réponse: ${response.status}`)
      
      return {
        success: response.ok,
        data: responseData.data,
        error: responseData.error || responseData.message
      }
    } catch (error) {
      console.error("❌ Erreur sourcingApi.create:", error)
      return { success: false, error: "Erreur de connexion" }
    }
  },
  createWithFiles: async (formData: FormData): Promise<{ success: boolean; data?: SourcingRequest; error?: string; progress?: number }> => {
    console.log("🟡 [sourcingApi] createWithFiles (FormData)")
    try {
      const token = inMemoryAccessToken || getStoredToken()
      
      const response = await fetch(buildUrl(API_BASE, "/api/sourcing/needs"), {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
        credentials: "include"
      })

      const responseData = await response.json()
      
      console.log(`🟡 [sourcingApi] createWithFiles réponse: ${response.status}`)
      
      return {
        success: response.ok,
        data: responseData.data,
        error: responseData.error || responseData.message
      }
    } catch (error) {
      console.error("❌ Erreur sourcingApi.createWithFiles:", error)
      return { success: false, error: "Erreur de connexion" }
    }
  },
  createRequest: async (data: any | FormData): Promise<{ success: boolean; data?: SourcingRequest; error?: string }> => {
    console.log("🟡 [sourcingApi] createRequest")
    if (data instanceof FormData) {
      return sourcingApi.createWithFiles(data)
    } else {
      return sourcingApi.create(data)
    }
  }
}

// ------------------- Reviews -------------------
export const reviewsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    console.log("🟡 [reviewsApi] list")
    return apiClient<{ success: boolean; data: any[]; meta: any }>(
      "/api/reviews",
      { params }
    )
  },
  get: (id: string) => {
    console.log("🟡 [reviewsApi] get:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/reviews/${id}`)
  },
  create: (data: any) => {
    console.log("🟡 [reviewsApi] create")
    return apiClient<{ success: boolean; data: any }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    console.log("🟡 [reviewsApi] update:", id)
    return apiClient<{ success: boolean; data: any }>(`/api/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    console.log("🟡 [reviewsApi] delete:", id)
    return apiClient<{ success: boolean }>(`/api/reviews/${id}`, {
      method: "DELETE",
    })
  },
  stats: () => {
    console.log("🟡 [reviewsApi] stats")
    return apiClient<{ success: boolean; data: any }>("/api/reviews/stats")
  },
}

// ============================================================
// ✅ EXPORT DES FONCTIONS DE TOKEN
// ============================================================
export { getStoredToken, setStoredToken }