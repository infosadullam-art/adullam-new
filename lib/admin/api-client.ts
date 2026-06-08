// lib/admin/api-client.ts

// ✅ CORRIGÉ : Plus de fallback Railway, tout passe par les variables d'environnement
const API_BASE = process.env.NEXT_PUBLIC_API_URL
const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_URL

// ✅ Vérification au démarrage
if (typeof window !== "undefined") {
  if (!API_BASE) {
    console.error("❌ NEXT_PUBLIC_API_URL non définie dans les variables d'environnement Vercel")
  }
  if (!PYTHON_API_BASE) {
    console.error("❌ NEXT_PUBLIC_PYTHON_API_URL non définie dans les variables d'environnement Vercel")
  }
}

// Fonction de nettoyage du token
function cleanToken(token: string | null): string | null {
  if (!token) return null
  if (token === 'null' || token === 'undefined') return null
  return token.replace(/["'\s\r\n]/g, '').trim()
}

// Fonctions pour gérer le token
export const getStoredToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adullam_token")
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
      } else {
        localStorage.removeItem("adullam_token")
      }
    } else {
      localStorage.removeItem("adullam_token")
    }
  }
}

let inMemoryAccessToken: string | null = getStoredToken()

// API Client principal pour le backend Next.js
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  if (!API_BASE) {
    throw new Error("API_BASE non définie. Vérifie NEXT_PUBLIC_API_URL sur Vercel.")
  }

  const url = `${API_BASE}${endpoint}`

  const token = inMemoryAccessToken || getStoredToken()

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(url, {
    ...options,
    mode: "cors",
    headers: requestHeaders,
    credentials: "include",
  })

  const contentType = response.headers.get("content-type")
  const data = contentType?.includes("application/json") ? await response.json() : {}

  // Gestion du 401
  if (response.status === 401 && retry && endpoint !== "/auth/login" && endpoint !== "/auth/refresh") {
    try {
      const refreshData = await apiClient<{ success: boolean; accessToken?: string }>(
        "/auth/refresh",
        { method: "POST" },
        false
      )
      if (!refreshData.success || !refreshData.accessToken) {
        throw new Error("Session expired")
      }
      inMemoryAccessToken = refreshData.accessToken
      setStoredToken(refreshData.accessToken)
      return await apiClient<T>(endpoint, options, false)
    } catch (error) {
      throw new Error("Session expired. Please login again.")
    }
  }

  if (!response.ok) {
    throw new Error((data as any)?.message || "API request failed")
  }

  return data as T
}

// API Client pour le service Python (ALS, Realtime, métriques)
async function pythonApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!PYTHON_API_BASE) {
    console.warn("⚠️ PYTHON_API_BASE non définie, utilisation de API_BASE à la place")
    const fallbackUrl = `${API_BASE}${endpoint}`
    const response = await fetch(fallbackUrl, options)
    if (!response.ok) {
      throw new Error(`Python API error: ${response.status}`)
    }
    return response.json()
  }

  const url = `${PYTHON_API_BASE}${endpoint}`
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`Python API error: ${response.status}`)
  }

  return response.json()
}

// ============================================================
// AUTH API
// ============================================================
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiClient<{
      success: boolean
      user: any
      accessToken: string
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    if (data.success && data.accessToken) {
      const cleanedToken = cleanToken(data.accessToken)
      if (cleanedToken) {
        inMemoryAccessToken = cleanedToken
        setStoredToken(cleanedToken)
      }
    }
    return data
  },
  logout: async () => {
    inMemoryAccessToken = null
    setStoredToken(null)
    return apiClient<{ success: boolean }>("/auth/logout", { method: "POST" })
  },
  me: async () => {
    return apiClient<{ success: boolean; user?: any; accessToken?: string }>("/auth/me")
  },
  refresh: () => {
    return apiClient<{ success: boolean; accessToken: string }>("/auth/refresh", { method: "POST" })
  },
  register: (name: string, email: string, password: string, phone?: string) => {
    return apiClient<{ success: boolean; user?: any; accessToken?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    })
  },
  verifyToken: (token: string) => {
    return apiClient<{ success: boolean; data: any }>(`/auth/verify?token=${token}`, { method: "GET" })
  },
}

// ============================================================
// DASHBOARD API (métriques Python)
// ============================================================
export const dashboardApi = {
  getCycleMetrics: async () => {
    return pythonApiClient("/admin/cycle/metrics")
  },
  getQualityMetrics: async () => {
    return pythonApiClient("/admin/cycle/quality")
  },
  getColdStartMetrics: async () => {
    return pythonApiClient("/admin/cycle/coldstart")
  },
  getDiversityMetrics: async () => {
    return pythonApiClient("/admin/cycle/diversity")
  },
  getScrollMetrics: async () => {
    return pythonApiClient("/admin/cycle/scroll")
  },
  getAlerts: async () => {
    return pythonApiClient("/admin/cycle/alerts")
  },
  getStats: (startDate?: string, endDate?: string) => {
    return apiClient<{ success: boolean; data: any }>("/admin/dashboard", {
      method: "GET",
    })
  },
}

// ============================================================
// PRODUCTS API
// ============================================================
export const productsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/products?${queryString}` : "/products"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  get: (id: string) => {
    return apiClient<{ success: boolean; data: any }>(`/products/${id}`)
  },
  create: (data: any) => {
    return apiClient<{ success: boolean; data: any }>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    return apiClient<{ success: boolean; data: any }>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    return apiClient<{ success: boolean }>(`/products/${id}`, { method: "DELETE" })
  },
  stats: () => {
    return apiClient<{ success: boolean; data: any }>("/products/stats")
  },
}

// ============================================================
// CATEGORIES API
// ============================================================
export const categoriesApi = {
  list: () => {
    return apiClient<{ success: boolean; data: any[] }>("/categories")
  },
  create: (data: any) => {
    return apiClient<{ success: boolean; data: any }>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    return apiClient<{ success: boolean; data: any }>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    return apiClient<{ success: boolean }>(`/categories/${id}`, { method: "DELETE" })
  },
}

// ============================================================
// ORDERS API
// ============================================================
export const ordersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/orders?${queryString}` : "/orders"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  get: (id: string) => {
    return apiClient<{ success: boolean; data: any }>(`/orders/${id}`)
  },
  updateStatus: (id: string, data: any) => {
    return apiClient<{ success: boolean; data: any }>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  stats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    const queryString = params.toString()
    const url = queryString ? `/orders/stats?${queryString}` : "/orders/stats"
    return apiClient<{ success: boolean; data: any }>(url)
  },
}

// ============================================================
// ADDRESSES API
// ============================================================
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
    return apiClient<{ success: boolean; addresses: Address[] }>("/user/addresses")
  },
  get: (id: string) => {
    return apiClient<{ success: boolean; address: Address }>(`/user/addresses/${id}`)
  },
  create: (data: Partial<Address>) => {
    return apiClient<{ success: boolean; address: Address; message: string }>("/user/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: Partial<Address>) => {
    return apiClient<{ success: boolean; address: Address; message: string }>(`/user/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    return apiClient<{ success: boolean; message: string }>(`/user/addresses/${id}`, {
      method: "DELETE",
    })
  },
}

// ============================================================
// WISHLIST API
// ============================================================
export const wishlistApi = {
  list: () => {
    return apiClient<{ success: boolean; data: any[] }>("/user/wishlist")
  },
  add: (productId: string) => {
    return apiClient<{ success: boolean; message: string }>("/user/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
  },
  remove: (productId: string) => {
    return apiClient<{ success: boolean; message: string }>(`/user/wishlist?productId=${productId}`, {
      method: "DELETE",
    })
  },
}

// ============================================================
// IMPORT API
// ============================================================
export const importApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/import?${queryString}` : "/import"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  get: (id: string) => {
    return apiClient<{ success: boolean; data: any }>(`/import/${id}`)
  },
  create: (data: any) => {
    return apiClient<{ success: boolean; data: any }>("/import", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  stats: () => {
    return apiClient<{ success: boolean; data: any }>("/import/stats")
  },
}

// ============================================================
// JOBS API
// ============================================================
export const jobsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/jobs?${queryString}` : "/jobs"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  trigger: (queue: string, job: string, payload?: any) => {
    return apiClient<{ success: boolean; data: any }>("/jobs/trigger", {
      method: "POST",
      body: JSON.stringify({ queue, job, payload }),
    })
  },
  stats: () => {
    return apiClient<{ success: boolean; data: any }>("/jobs/stats")
  },
}

// ============================================================
// NOTIFICATIONS API
// ============================================================
export const notificationsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/notifications?${queryString}` : "/notifications"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  stats: () => {
    return apiClient<{ success: boolean; data: any }>("/notifications/stats")
  },
}

// ============================================================
// ADS API
// ============================================================
export const adsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/ads?${queryString}` : "/ads"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  performance: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/ads/performance?${queryString}` : "/ads/performance"
    return apiClient<{ success: boolean; data: any }>(url)
  },
}

// ============================================================
// FEED API
// ============================================================
export const feedApi = {
  stats: () => {
    return apiClient<{ success: boolean; data: any }>("/feed/stats")
  },
}

// ============================================================
// INTERACTIONS API
// ============================================================
export const interactionsApi = {
  stats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    const queryString = params.toString()
    const url = queryString ? `/interactions/stats?${queryString}` : "/interactions/stats"
    return apiClient<{ success: boolean; data: any }>(url)
  },
}

// ============================================================
// VIDEOS API
// ============================================================
export const videosApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/videos?${queryString}` : "/videos"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  create: (data: any) => {
    return apiClient<{ success: boolean; data: any }>("/videos", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    return apiClient<{ success: boolean; data: any }>(`/videos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    return apiClient<{ success: boolean }>(`/videos/${id}`, { method: "DELETE" })
  },
}

// ============================================================
// USERS API (Admin)
// ============================================================
export const usersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/admin/users?${queryString}` : "/admin/users"
    return apiClient<{ success: boolean; data: any[]; meta?: any }>(url)
  },
  get: (id: string) => {
    return apiClient<{ success: boolean; data: any }>(`/admin/users/${id}`)
  },
  ban: (id: string) => {
    return apiClient<{ success: boolean }>(`/admin/users/${id}/ban`, { method: "POST" })
  },
  activate: (id: string) => {
    return apiClient<{ success: boolean }>(`/admin/users/${id}/activate`, { method: "POST" })
  },
}

// ============================================================
// SOURCING API
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
    return apiClient("/sourcing", { params })
  },
  getStats: (): Promise<{ success: boolean; data: SourcingStats }> => {
    return apiClient("/sourcing", { params: { stats: "true" } })
  },
  getById: (id: string): Promise<{ success: boolean; data: SourcingRequest }> => {
    return apiClient(`/sourcing/${id}`)
  },
  update: (id: string, data: Partial<SourcingRequest>): Promise<{ success: boolean; data: SourcingRequest }> => {
    return apiClient(`/sourcing/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient(`/sourcing/${id}`, { method: "DELETE" })
  },
  markAsViewed: (id: string): Promise<{ success: boolean; data: SourcingRequest }> => {
    return apiClient(`/sourcing/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ markAsViewed: true }),
    })
  },
  create: async (data: any): Promise<{ success: boolean; data?: SourcingRequest; error?: string }> => {
    try {
      const token = inMemoryAccessToken || getStoredToken()
      const response = await fetch(`${API_BASE}/sourcing/needs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data),
        credentials: "include"
      })
      const responseData = await response.json()
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
  createWithFiles: async (formData: FormData): Promise<{ success: boolean; data?: SourcingRequest; error?: string }> => {
    try {
      const token = inMemoryAccessToken || getStoredToken()
      const response = await fetch(`${API_BASE}/sourcing/needs`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
        credentials: "include"
      })
      const responseData = await response.json()
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
    if (data instanceof FormData) {
      return sourcingApi.createWithFiles(data)
    } else {
      return sourcingApi.create(data)
    }
  }
}

// ============================================================
// REVIEWS API
// ============================================================
export const reviewsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    const url = queryString ? `/reviews?${queryString}` : "/reviews"
    return apiClient<{ success: boolean; data: any[]; meta: any }>(url)
  },
  get: (id: string) => {
    return apiClient<{ success: boolean; data: any }>(`/reviews/${id}`)
  },
  create: (data: any) => {
    return apiClient<{ success: boolean; data: any }>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: (id: string, data: any) => {
    return apiClient<{ success: boolean; data: any }>(`/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: (id: string) => {
    return apiClient<{ success: boolean }>(`/reviews/${id}`, { method: "DELETE" })
  },
  stats: () => {
    return apiClient<{ success: boolean; data: any }>("/reviews/stats")
  },
}

// Export des fonctions de token
export { getStoredToken, setStoredToken }