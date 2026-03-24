"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/admin/api-client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await authApi.me()
        if (res.success) {
          setAuthorized(true)
        } else {
          router.replace("/admin/login")
        }
      } catch {
        router.replace("/admin/login")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) return <div>Loading...</div>
  if (!authorized) return null

  return <>{children}</>
}
