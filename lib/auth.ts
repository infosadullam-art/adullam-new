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

const API_BASE = "/api/auth"

// ===============================
// ACCESS TOKEN (persistant dans localStorage)
// ===============================

const TOKEN_KEY = 'adullam_token'

export function getAccessToken(): string | null {
  // ✅ Priorité au localStorage (persistant)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) return token
  }
  // Fallback vers la mémoire pour ne pas casser
  return accessTokenFallback
}

// Garder la variable mémoire comme fallback (ne casse rien)
let accessTokenFallback: string | null = null

export function setAccessToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
  accessTokenFallback = token
}

export function clearAccessToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
  accessTokenFallback = null
}

// ===============================
// AUTH API (inchangé)
// ===============================

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

  if (data?.accessToken) {
    setAccessToken(data.accessToken)
  }

  return data
}

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

export async function logout(): Promise<ApiResponse> {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  clearAccessToken()
  return { success: true }
}

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