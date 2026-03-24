// frontend/app/api/auth/refresh/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 }
      )
    }

    // Appel backend pour refresh
    const backendRes = await fetch(`${backendUrl}/auth/refresh`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // envoie le refreshToken
    })

    const backendData = await backendRes.json().catch(() => ({}))

    // ⚠ Vérifier si le backend a renvoyé de nouveaux tokens
    if (!backendRes.ok || !backendData.tokens) {
      return NextResponse.json(
        {
          success: false,
          message: backendData.message || "Unable to refresh token",
        },
        { status: backendRes.status || 401 }
      )
    }

    // Mettre à jour les cookies côté front si besoin
    const res = NextResponse.json({
      success: true,
      data: backendData.user || null,
      message: backendData.message || "Token refreshed",
    })

    if (backendData.tokens.accessToken) {
      res.cookies.set({
        name: "accessToken",
        value: backendData.tokens.accessToken,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60,
      })
    }

    if (backendData.tokens.refreshToken) {
      res.cookies.set({
        name: "refreshToken",
        value: backendData.tokens.refreshToken,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
      })
    }

    return res
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Refresh failed" },
      { status: 500 }
    )
  }
}
