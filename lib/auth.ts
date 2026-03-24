// frontend/lib/auth.ts

export type User = {
  id: string
  email: string
  name?: string
  role?: string
}

type ApiResponse<T = any> = {
  success: boolean
  data?: T
  message?: string
}

// 🔹 URL de base pour toutes les routes auth du frontend
const API_BASE = "/api/auth"

// ===============================
// ACCESS TOKEN (frontend memory)
// ===============================

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

// ===============================
// AUTH API
// ===============================

/**
 * Login
 */
export async function login(email: string, password: string): Promise<ApiResponse<User & { accessToken?: string }>> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    return { success: false, message: errorData.message || "Login failed" }
  }

  const data = await res.json()

  // 🔑 si le backend renvoie un accessToken
  if (data?.accessToken) {
    setAccessToken(data.accessToken)
  }

  return data
}

/**
 * Récupère l'utilisateur connecté
 */
export async function me(): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_BASE}/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    return { success: false, message: errorData.message || "Unauthorized" }
  }

  return res.json()
}

/**
 * Rafraîchit le token
 */
export async function refresh(): Promise<ApiResponse<{ accessToken?: string }>> {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (!res.ok) {
    clearAccessToken()
    return { success: false, message: "Refresh failed" }
  }

  const data = await res.json()

  if (data?.accessToken) {
    setAccessToken(data.accessToken)
  }

  return data
}

/**
 * Logout
 */
export async function logout(): Promise<ApiResponse> {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  clearAccessToken()
  return { success: true }
}

/**
 * Register
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
    credentials: "include",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    return { success: false, message: errorData.message || "Registration failed" }
  }

  return res.json()
}

/**
 * Vérifie un token
 */
export async function verify(token: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  })

  if (!res.ok) {
    return { success: false, message: "Token verification failed" }
  }

  return res.json()
}
