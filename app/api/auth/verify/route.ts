// frontend/app/api/auth/verify/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL
    if (!backendUrl) {
      return NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 })
    }

    const backendRes = await fetch(`${backendUrl}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    })

    const backendData = await backendRes.json()

    return NextResponse.json(
      { success: backendData.success, message: backendData.message || "Token verified" },
      { status: backendRes.status }
    )
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Token verification failed" }, { status: 500 })
  }
}
