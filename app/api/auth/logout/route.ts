// frontend/app/api/auth/logout/route.ts
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
    if (!backendUrl) {
      return NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 })
    }

    const backendRes = await fetch(`${backendUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    const backendData = await backendRes.json()

    return NextResponse.json(
      { success: backendData.success, message: backendData.message || "Logged out" },
      { status: backendRes.status }
    )
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Logout failed" }, { status: 500 })
  }
}
